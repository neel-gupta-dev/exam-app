# Exam Platform Architecture Plan

This document outlines the architecture for a highly scalable, multi-tenant (B2B + B2C) exam delivery platform. It addresses data modeling, caching strategies for high concurrency, UI presentation logic, and B2B coaching onboarding.

## User Review Required

> [!IMPORTANT]
> **Data Isolation (B2B vs B2C):** We propose using a `tenantId` model. If a test has no `tenantId`, it is a "Global" test (your own B2C series). If it has a specific `tenantId`, it is exclusive to that Coaching institute. Does this strict isolation match your vision?
> 
> **Redis Batching:** To handle 10,000+ students taking a test simultaneously, we propose caching live answers in Redis and auto-saving to MongoDB every 2-3 minutes. This will prevent your database from crashing under heavy write loads.

## Proposed Changes

---

### Data Storage Strategy (MongoDB Data Models)

We will implement three primary collections to separate metadata, raw content, and user state. Separating `Test` metadata from `Questions` ensures massive tests don't break MongoDB document size limits and keeps array queries fast.

#### [NEW] `server/src/models/Test.js`
- **Fields:** `title`, `description`, `durationMinutes`, `totalMarks`, `category` (e.g., JEE Advance).
- **Multi-Tenancy:** `tenantId` (ObjectId ref to `Tenant`). If `null`, it belongs to your global B2C test series.
- **Publishing Logic:** `isPublished`, `scheduledStartTime`, `scheduledEndTime` (allows "Live" tests).

#### [NEW] `server/src/models/Question.js`
- **Fields:** `testId` (ref), `section` (e.g., Physics), `type` (Single Choice, Multiple Choice, Integer), `content` (HTML/Markdown + image URLs), `options` (Array), `correctAnswer`, `positiveMarks`, `negativeMarks`, `solution` (Explanation text).
- **Indexing:** Indexed on `testId` to fetch all questions for a specific test instantly.

#### [MODIFY] `server/src/models/TestResult.js` (or `TestAttempt`)
- Track realtime student state.
- **Fields:** `userId`, `testId`, `status` (`in-progress`, `completed`), `startTime`, `submittedAt`.
- **Answers Array:** `[{ questionId, selectedOption, status: 'answered' | 'marked-for-review' | 'skipped', timeSpentSeconds }]`.
- **Scores:** `totalScore`, `sectionScores`.

---

### High Concurrency & Fetching Logic (Redis Implementation)

When 5,000 students log in to start a Live Test at 10:00 AM, MongoDB will crash if all of them request 100 questions simultaneously. We will use Redis to act as a hyper-fast buffer.

1. **Test Payload Caching:** 
   - When an Admin "Publishes" a test, the backend combines the `Test` document and all associated `Question` documents into a single JSON payload and caches it in Redis (`SETEX test_payload:12345 {payload}`).
   - When students request the test, Node.js serves it directly from Redis RAM (0.5ms response time) completely bypassing MongoDB.
2. **Answer Syncing (Write-Behind Cache):** 
   - When a student clicks "Save & Next", the answer is stored in a Redis Hash (`HSET attempt:userId:testId QID Answer`).
   - A background CRON job or BullMQ worker synchronizes these Redis answers to MongoDB `TestResult` every 60 seconds. This turns 5,000 requests/second into 1 bulk write operation, saving massive server costs.
3. **Leaderboard:**
   - Use Redis Sorted Sets (`ZADD leaderboard:testId score userId`) to provide live, instant ranking calculations.

---

### Presentation Layer (React Architecture)

1. **Test Payload:** Once fetched, the React app stores the entire test JSON in Context/Redux.
2. **Pagination:** We will NOT render 100 questions on one page. The UI will render exactly 1 question component at a time, instantly swapping content from the local React Context when they click "Next".
3. **State Grid:** A sidebar grid showing identical states to standard exams (Green = Answered, Red = Unanswered, Purple = Marked for Review).
4. **Anti-Cheat:** 
   - Fullscreen mode enforcement.
   - Visibility tracking (`document.hidden`). If the user switches tabs, submit an automatic "Warning" to the backend.

---

### B2B Architecture (Coaching Institute Management)

Your Superadmin dashboard will have a dedicated "B2B Coaching" portal.

1. **Tenant Creation:** You create a `Tenant` representing the Coaching Institute (e.g., "Resonance Batch A").
2. **Bulk Upload Students:** 
   - You upload a CSV with `[Name, Email, Phone]`.
   - The backend bulk creates `User` accounts, assigns them the specific `tenantId`, and assigns a default password (e.g., `Exam@123`). 
   - These credentials are given to the Coaching Admin to distribute.
3. **Bulk Test Upload:**
   - You upload an Excel sheet containing questions/images for a custom test.
   - You attach the `tenantId` to this specific test.
4. **Data Isolation Rules (Express Middleware):**
   - If a student logs in, the `GET /api/tests` route checks their `req.user.tenantId`.
   - It executes `Test.find({ tenantId: { $in: [null, req.user.tenantId] } })`.
   - This ensures the coaching student sees YOUR global tests + THEIR coaching's custom tests, while standard students only see YOUR global tests.

## Open Questions

1. **User Authentication:** When bulk uploading B2B students, do you want to force them to change their password on first login?
2. **Images in Questions:** The bulk Excel upload for questions requires images. Do you want to process images via an AWS S3 pre-signed URL system, or handle them via direct File Upload in the Admin dashboard?

## Verification Plan

### Backend Isolation Tests
- **Unit Test:** Create a Global User and a B2B User. Ensure a B2B custom test strictly returns `403 Forbidden` if accessed by the Global User.
- **Load Test:** Use `autocannon` or `k6` to simulate 10,000 concurrent GET requests to the Redis test endpoint to verify zero-latency payload delivery.

### Admin Tools Verification
- Manually test parsing a 100-question dummy Excel sheet in the dashboard, ensuring Question types and answer keys correctly seed the database mappings.
