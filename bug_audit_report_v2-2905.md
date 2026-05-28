# 🔍 Vayl Test System — Deep Audit Report v2
**Date:** May 29, 2026  
**Audited by:** 4 parallel deep-dive agents (Frontend, Backend, Security, Scalability)  
**Scope:** Entire test system — client + server + auth + config  
**Files scanned:** ~65 files, ~800KB of source code

> [!CAUTION]
> This audit found **73 unique bugs** including **13 Critical** issues that must be fixed before any public launch. Several of these (NoSQL injection, scoring errors, race conditions) can be exploited by students or attackers to compromise exam integrity.

---

## Summary

| Tier | Severity | Count | Theme |
|:----:|:---------|:-----:|:------|
| 🔴 0 | **Critical** | 13 | Auth bypass, broken scoring, race conditions, crashes |
| 🟠 1 | **High** | 18 | Anti-cheat bypass, time manipulation, memory bombs, missing validation |
| 🟡 2 | **Medium** | 24 | Data leaks, dead code, performance waste, UX issues |
| 🟢 3 | **Low** | 18 | Edge cases, cosmetic, maintenance debt |

---

# 🔴 TIER 0 — CRITICAL (Fix Before Launch)

These bugs can cause **incorrect scores, auth bypass, server crashes, or data corruption**.

---

### C-01: NoSQL Injection via OTP Code — Full Authentication Bypass
**File:** [authService.js](file:///d:/P/exam-app/server/src/services/authService.js) lines 357, 429  
**Category:** Security

The OTP `code` from `req.body` is passed directly into MongoDB queries. An attacker can send `{"code": {"$ne": ""}}` to match ANY OTP record, bypassing email verification entirely.

```js
// authService.js:357
const otpRecord = await OtpCode.findOne({ email: cleanEmail, code, type: 'student_verify' });
```

**Attack:** `POST /api/auth/verify-signup-otp` with `{"email":"victim@test.com","code":{"$ne":""}}`  
**Impact:** Attacker can verify any email and create accounts for any address.  
**Fix:** Add `const safeCode = String(code);` before queries, AND install `express-mongo-sanitize` globally.

---

### C-02: No `express-mongo-sanitize` Middleware — Systemic NoSQL Injection
**File:** [api/index.js](file:///d:/P/exam-app/server/api/index.js)  
**Category:** Security

The server does NOT use `express-mongo-sanitize`. **Every endpoint** that passes `req.body`, `req.query`, or `req.params` into MongoDB is potentially vulnerable to operator injection (`$gt`, `$ne`, `$regex`, `$where`).

**Fix:** `npm install express-mongo-sanitize` → `app.use(mongoSanitize())` right after `express.json()`.

---

### C-03: Section Marking `incorrect: -1` Default — Wrong Answers ADD Marks
**File:** [Test.js](file:///d:/P/exam-app/server/src/models/Test.js) line 70 + [assessmentController.js](file:///d:/P/exam-app/server/src/controllers/assessmentController.js) line 309, 349  
**Category:** Scoring

The schema default for `markingScheme.incorrect` is `-1`. The grading code does `totalScore -= incorrectMarks`, so `totalScore -= (-1)` = `totalScore += 1`. **Students GAIN +1 for every wrong answer** when section marking schemes use the default.

```js
// Test.js:70 — schema default
incorrect: { type: Number, default: -1 },

// assessmentController.js:349 — grading
totalScore -= incorrectMarks;  // -= (-1) = += 1  ← BUG
```

**Impact:** Completely broken scoring for tests using section-level marking schemes.  
**Fix:** Change schema default to `1` (positive, representing deduction amount), or use `Math.abs()` in grading.

---

### C-04: `$or` Overwrites Audience Filter — ALL Tests Visible to ALL Students
**File:** [testController.js](file:///d:/P/exam-app/server/src/controllers/testController.js) lines 262-269  
**Category:** Logic

`audienceFilter` contains a `$or` key. Spreading it then adding another `$or` overwrites the first. The visibility filter is completely ignored.

```js
const rawTests = await Test.find({
    isPublished: true,
    ...audienceFilter,  // ← contains $or: [...]
    $or: [              // ← OVERWRITES the first $or!
      { scheduledEndAt: null },
      { scheduledEndAt: { $exists: false } },
      { scheduledEndAt: { $gte: now } },
    ],
});
```

**Impact:** B2B students see B2C tests. Group-restricted tests visible to everyone.  
**Fix:** Wrap in `$and: [ audienceFilter, { $or: [...scheduledEnd...] } ]`.

---

### C-05: Race Condition — Duplicate Submissions Grade Twice
**File:** [assessmentController.js](file:///d:/P/exam-app/server/src/controllers/assessmentController.js) lines 719-845  
**Category:** Concurrency

Two simultaneous submit requests both read status as `'in-progress'`, both pass the guard, both grade and save. No atomic locking.

**Fix:** Use `findOneAndUpdate({ status: 'in-progress' }, { $set: { status: 'evaluating' } })` as an atomic lock before grading.

---

### C-06: `toStudentPayload()` Method Doesn't Exist — Runtime Crash
**File:** [attemptService.js](file:///d:/P/exam-app/server/src/services/attemptService.js) line 96  
**Category:** Crash

```js
questions = rawQuestions.map((q) => q.toStudentPayload()); // ← method doesn't exist
```

The `Question` model has no `toStudentPayload()` method. This throws `TypeError`, crashing the entire `startSession` flow.  
**Fix:** Use `toSafeQuestions()` (which exists in `assessmentController.js`), or add the method to the schema.

---

### C-07: No Time Expiry Check on Submission — Students Can Submit After Deadline
**File:** [assessmentController.js](file:///d:/P/exam-app/server/src/controllers/assessmentController.js) lines 719-845  
**Category:** Cheating

The submit endpoint NEVER checks if the test duration has been exceeded. A student can keep submitting via direct API calls long after time expires.

**Fix:** Add `const timeLeft = computeTimeLeft(test, attempt.startedAt); if (timeLeft <= 0) { /* reject new answers, auto-submit with last saved */ }`.

---

### C-08: Sync Accepts Answers After Time Expires — Answer Manipulation
**File:** [assessmentController.js](file:///d:/P/exam-app/server/src/controllers/assessmentController.js) lines 574-712  
**Category:** Cheating

`syncAssessment` computes `timeLeft` and returns it but **never blocks syncing** when `timeLeft <= 0`. Students can modify answers via `/sync` after time expires, then submit.

**Fix:** Add `if (computeTimeLeft(test, startTime) <= 0) return res.status(403).json(...)`.

---

### C-09: No `express.json()` Body Size Limit — Memory DoS
**File:** [api/index.js](file:///d:/P/exam-app/server/api/index.js) line 128  
**Category:** DoS

```js
app.use(express.json());  // ← No `limit` option
```

An attacker can send a 500MB JSON payload, consuming all server memory.  
**Fix:** `app.use(express.json({ limit: '2mb' }));`

---

### C-10: No `unhandledRejection` Handler — Silent Server Crashes
**File:** [api/index.js](file:///d:/P/exam-app/server/api/index.js) (missing entirely)  
**Category:** Reliability

Any unhandled promise rejection crashes the Node process with no recovery. Node 20+ defaults to `--unhandled-rejections=throw`.

**Fix:** Add `process.on('unhandledRejection', ...)` and `process.on('uncaughtException', ...)` at startup.

---

### C-11: `syncAssessment` Fires DB Query on EVERY Sync Call (Hot Path Bottleneck)
**File:** [assessmentController.js](file:///d:/P/exam-app/server/src/controllers/assessmentController.js) line 616  
**Category:** Scalability

```js
const validQuestionIds = await Question.find({ testId }).distinct('_id');
```

Called every ~5-10 seconds per student. 500 students = **50-100 DB queries/second** just for answer whitelisting. Question IDs don't change during an exam.  
**Fix:** Cache valid question IDs per test in Redis with a TTL.

---

### C-12: Redis `KEYS` Command in Production Hot Path — Blocks Redis
**File:** [testController.js](file:///d:/P/exam-app/server/src/controllers/testController.js) line 310  
**Category:** Scalability

```js
patternMulti.keys(`cbt_session:${userId}:${t._id}:*`);
```

`KEYS` is O(N) scanning the ENTIRE Redis keyspace. Called in `getStudentTests` which loads on every student page view. With 10,000 sessions, each page load triggers multiple O(N) scans.  
**Fix:** Use `SCAN` or maintain a Redis SET per user for active sessions.

---

### C-13: No Banned User Mechanism — No Way to Revoke Access
**File:** [authMiddleware.js](file:///d:/P/exam-app/server/src/middlewares/authMiddleware.js) lines 20-28, [User.js](file:///d:/P/exam-app/server/src/models/User.js)  
**Category:** Security

There is no `isBanned` or `isActive` field. No mechanism to revoke JWTs (valid for 7 days). The only option to block a user is full deletion.

**Fix:** Add `isBanned: Boolean` to User schema, check it in auth middleware.

---

# 🟠 TIER 1 — HIGH (Fix Before Scaling)

These bugs cause **anti-cheat bypasses, performance bottlenecks, or data integrity issues under load**.

---

### H-01: Timer Uses `setInterval` — Drift Over Long Exams
**File:** [TestEngine.jsx](file:///d:/P/exam-app/client/test-dashboard/src/pages/TestEngine.jsx) lines 377-386  
**Category:** Frontend/Timer

`setInterval(1000)` drifts 30-60+ seconds over a 3-hour exam. System sleep/hibernate pauses the interval entirely — timer resumes with wrong time.

**Fix:** Anchor to `Date.now()`: `timeLeft = initialTimeLeft - Math.floor((Date.now() - startTime) / 1000)`.

---

### H-02: Tab Switch Counter Resets on Page Reload — Anti-Cheat Bypass
**File:** [TestEngine.jsx](file:///d:/P/exam-app/client/test-dashboard/src/pages/TestEngine.jsx) line 106  
**Category:** Anti-Cheat

```js
sessionStorage.setItem('cbt_tab_switch_count', '0');  // Resets on every mount
```

Student can: switch tabs 3 times → reload page → get 3 more free switches → repeat infinitely.  
**Fix:** Initialize from server session data instead of resetting to 0.

---

### H-03: No Fullscreen Exit Monitoring
**File:** [TestEngine.jsx](file:///d:/P/exam-app/client/test-dashboard/src/pages/TestEngine.jsx) (entire file)  
**Category:** Anti-Cheat

No `fullscreenchange` event listener anywhere. Student presses `Esc` to exit fullscreen — exam continues without warning.  
**Fix:** Add `fullscreenchange` listener that re-requests fullscreen or counts as a violation.

---

### H-04: Section Cap Validation Uses Stale Closure — Cap Bypass via Rapid Clicks
**File:** [TestEngine.jsx](file:///d:/P/exam-app/client/test-dashboard/src/pages/TestEngine.jsx) lines 549-583  
**Category:** Logic

`updateAnswer` reads from stale `answers` closure. Rapid double-click lets student exceed `maxAttemptable` by 1 (NEET-style cap).  
**Fix:** Move cap validation inside the `setAnswers` updater function.

---

### H-05: No `beforeunload` Handler — Silent Data Loss on Tab Close
**File:** [TestEngine.jsx](file:///d:/P/exam-app/client/test-dashboard/src/pages/TestEngine.jsx)  
**Category:** UX/Data Integrity

Student can close browser tab during exam with no warning. Unsaved answers since last sync (up to 10s) are lost.  
**Fix:** Add `window.addEventListener('beforeunload', handler)` during active exam.

---

### H-06: Section Click Handler Missing `|| 'General'` Fallback
**File:** [TestEngine.jsx](file:///d:/P/exam-app/client/test-dashboard/src/pages/TestEngine.jsx) line 1042  
**Category:** Logic

```js
const firstQ = questions.find((q) => q.section === s.name);  // Missing || 'General'
```

Clicking the 'General' section tab won't navigate to any question if questions lack the `section` field.  
**Fix:** `questions.find((q) => (q.section || 'General') === s.name)`.

---

### H-07: `parsedAnswers` Mutated After `setAnswers` — First Question Marker Missed
**File:** [TestEngine.jsx](file:///d:/P/exam-app/client/test-dashboard/src/pages/TestEngine.jsx) lines 148-172  
**Category:** React State

Array passed to `setAnswers()` is mutated *after* the call. The pushed item won't trigger a re-render.  
**Fix:** Move the push before `setAnswers()`, or call `setAnswers` again.

---

### H-08: Submit Dialog Calls Stale `handleSubmit` Closure
**File:** [TestEngine.jsx](file:///d:/P/exam-app/client/test-dashboard/src/pages/TestEngine.jsx) line 1460  
**Category:** React State

```jsx
<button onClick={() => { setShowSubmitConfirm(false); handleSubmit(); }}>
```

Captures `handleSubmit` from the render when dialog opened. Could use stale telemetry/answer data.  
**Fix:** Call `handleSubmitRef.current?.()` instead.

---

### H-09: Auto-Submit 60s Retry Loop — No Cancel or Feedback
**File:** [TestEngine.jsx](file:///d:/P/exam-app/client/test-dashboard/src/pages/TestEngine.jsx) lines 712-741  
**Category:** UX

20 retries × 3s = 60 seconds of "Submitting..." with no cancel button. Student is frozen if server is down.  
**Fix:** Show retry count and a "Try Again" button after N failures.

---

### H-10: Evaluation Worker Uses Wrong Status Constants — Dead Code
**File:** [evaluationWorker.js](file:///d:/P/exam-app/server/src/workers/evaluationWorker.js) lines 20, 162  
**Category:** Logic

Worker polls for `'SUBMITTED'` (uppercase). App sets `'completed'` (lowercase). Worker never finds any attempts.  
**Fix:** Align status values across the codebase.

---

### H-11: Unbounded Warnings Array — MongoDB 16MB BSON Bomb
**File:** [assessmentController.js](file:///d:/P/exam-app/server/src/controllers/assessmentController.js) line 649, [attemptService.js](file:///d:/P/exam-app/server/src/services/attemptService.js) line 227  
**Category:** DoS

Malicious student sends thousands of warnings per sync. No size cap on the MongoDB path. Can hit the 16MB BSON document limit.  
**Fix:** Cap `.warnings` array to max 200 entries.

---

### H-12: OTP Verification Rate Limit Too Generous for Distributed Attacks
**File:** [authRoutes.js](file:///d:/P/exam-app/server/src/routes/authRoutes.js) lines 139-146  
**Category:** Security

10 attempts per IP per 15 minutes. With 1000 IPs × 10 attempts = 10,000 attempts → ~1.1% chance of guessing a 6-digit OTP.  
**Fix:** Add per-email rate limiting (max 5 per email), delete OTP after 3 failed attempts.

---

### H-13: OTP Stored in Plaintext in Database
**File:** [OtpCode.js](file:///d:/P/exam-app/server/src/models/OtpCode.js), [authService.js](file:///d:/P/exam-app/server/src/services/authService.js) lines 336, 409  
**Category:** Security

OTP codes stored as plaintext. Database breach exposes all active OTPs.  
**Fix:** Hash OTP with bcrypt before storing. Use `bcrypt.compare()` on verification.

---

### H-14: Email Change Without Re-Verification
**File:** [authService.js](file:///d:/P/exam-app/server/src/services/authService.js) lines 512-520  
**Category:** Security

User can change email to any unregistered address without OTP verification.  
**Fix:** Require OTP on new email before committing.

---

### H-15: `getStudentTests` — Unbounded Test List + N+1 Redis Sessions
**File:** [testController.js](file:///d:/P/exam-app/server/src/controllers/testController.js) lines 262-322  
**Category:** Scalability

Fetches ALL published tests with no `.limit()`, then checks Redis sessions for EACH. 200 tests = 200+ Redis commands per page load.  
**Fix:** Add `.limit(50)`, add pagination.

---

### H-16: MongoDB Connection Pool Too Small (maxPoolSize: 10)
**File:** [db.js](file:///d:/P/exam-app/server/src/config/db.js) line 5  
**Category:** Scalability

500 concurrent students syncing = connection starvation.  
**Fix:** `maxPoolSize: 50`, `minPoolSize: 5`.

---

### H-17: `syncAssessment` Also Fetches Test from DB on Every Sync
**File:** [assessmentController.js](file:///d:/P/exam-app/server/src/controllers/assessmentController.js) line 595  
**Category:** Scalability

`Test.findById(testId)` called every 5-10 seconds per student. Test metadata doesn't change during exam.  
**Fix:** Cache test metadata in Redis.

---

### H-18: `fetch()` Calls in Mailer Have No Timeout — Can Hang Forever
**File:** [mailer.js](file:///d:/P/exam-app/server/src/utils/mailer.js) lines 59-72, 146-159  
**Category:** Reliability

If ZeptoMail API hangs, OTP/login flow hangs forever.  
**Fix:** `signal: AbortSignal.timeout(10000)`.

---

# 🟡 TIER 2 — MEDIUM

| # | File | Bug |
|---|------|-----|
| M-01 | [assessmentController.js](file:///d:/P/exam-app/server/src/controllers/assessmentController.js):824 | `startedAt` overwritten from Redis (untrusted source) |
| M-02 | [testController.js](file:///d:/P/exam-app/server/src/controllers/testController.js):511 | Test deletion orphans TestAttempts and Redis sessions |
| M-03 | [assessmentController.js](file:///d:/P/exam-app/server/src/controllers/assessmentController.js):1006 | DB fetches before ownership check (timing leak) |
| M-04 | [TestAttempt.js](file:///d:/P/exam-app/server/src/models/TestAttempt.js):177 | `partial` field missing in sectionScores schema — silently stripped on save |
| M-05 | [assessmentController.js](file:///d:/P/exam-app/server/src/controllers/assessmentController.js):341 | Float questions use exact string match, no numeric tolerance |
| M-06 | [testController.js](file:///d:/P/exam-app/server/src/controllers/testController.js):407 | Admin can set arbitrary slug → collision/redirect attack |
| M-07 | [assessmentController.js](file:///d:/P/exam-app/server/src/controllers/assessmentController.js):951 | Leaderboard shows first attempt, not best |
| M-08 | [assessmentController.js](file:///d:/P/exam-app/server/src/controllers/assessmentController.js):932 | Leaderboard loads 5000 attempts into memory per request |
| M-09 | [adminRoutes.js](file:///d:/P/exam-app/server/src/routes/adminRoutes.js):72 | Email blast fetches ALL users — request times out |
| M-10 | [adminRoutes.js](file:///d:/P/exam-app/server/src/routes/adminRoutes.js):360 | Battle questions GET — unbounded, no limit |
| M-11 | [User.js](file:///d:/P/exam-app/server/src/models/User.js):252 | `bcryptjs` (pure JS) with 12 rounds — 300ms/hash, blocks event loop |
| M-12 | [telemetry.js](file:///d:/P/exam-app/server/src/utils/telemetry.js):34 | `logActivity` creates individual DB write per action — no batching |
| M-13 | [analyticsController.js](file:///d:/P/exam-app/server/src/controllers/analyticsController.js):27-191 | Heatmap/monthly-stats run 3-4 aggregate queries per page load |
| M-14 | [api/index.js](file:///d:/P/exam-app/server/api/index.js):116 | CORS allows `*` wildcard if `ALLOWED_ORIGINS=*` is set |
| M-15 | [b2bController.js](file:///d:/P/exam-app/server/src/controllers/b2bController.js):122 | Inconsistent bcrypt rounds (10 vs 12) for B2B users |
| M-16 | [User.js](file:///d:/P/exam-app/server/src/models/User.js):248 | Pre-save hook skips hashing for bcrypt-like strings — bypass risk |
| M-17 | [authService.js](file:///d:/P/exam-app/server/src/services/authService.js):55,397 | User enumeration via registration/OTP error messages |
| M-18 | [errorMiddleware.js](file:///d:/P/exam-app/server/src/middlewares/errorMiddleware.js):2 | NotFound middleware reflects URL in response — info leak |
| M-19 | [pdfParserService.js](file:///d:/P/exam-app/server/src/services/pdfParserService.js):514 | PDF parsing loads entire buffer — 15MB PDF → 50-100MB in memory |
| M-20 | [TestEngine.jsx](file:///d:/P/exam-app/client/test-dashboard/src/pages/TestEngine.jsx):335-521 | Duplicate event listeners — second `useEffect` is dead code |
| M-21 | [TestEngine.jsx](file:///d:/P/exam-app/client/test-dashboard/src/pages/TestEngine.jsx):627-645 | No numerical input validation (length, format) |
| M-22 | [TestEngine.jsx](file:///d:/P/exam-app/client/test-dashboard/src/pages/TestEngine.jsx):594-617 | Rapid multi-select clicks produce incorrect toggle |
| M-23 | [TestEngine.jsx](file:///d:/P/exam-app/client/test-dashboard/src/pages/TestEngine.jsx):1099 | 200 watermark DOM nodes — performance on mobile |
| M-24 | [App.jsx](file:///d:/P/exam-app/client/test-dashboard/src/App.jsx):363 | Token extraction truncates on `=` chars: `split('=')[1]` |

---

# 🟢 TIER 3 — LOW

| # | File | Bug |
|---|------|-----|
| L-01 | [testController.js](file:///d:/P/exam-app/server/src/controllers/testController.js):171 | Missing `category` validation on create |
| L-02 | [testRoutes.js](file:///d:/P/exam-app/server/src/routes/testRoutes.js):37 | Share route param name mismatch (`slugOrId` vs `testId`) |
| L-03 | [testController.js](file:///d:/P/exam-app/server/src/controllers/testController.js):147 | `durationMinutes`/`totalMarks` accept 0/negative |
| L-04 | [scoringService.js](file:///d:/P/exam-app/server/src/services/scoringService.js):1 | JEE answer keys hardcoded — requires code deploy to update |
| L-05 | [healthController.js](file:///d:/P/exam-app/server/src/controllers/healthController.js):29 | Health check queries DB on every poll |
| L-06 | [Question.js](file:///d:/P/exam-app/server/src/models/Question.js):33 | Redundant individual index on `testId` |
| L-07 | [battleRoutes.js](file:///d:/P/exam-app/server/src/routes/battleRoutes.js):70 | `/online-count` writes to MongoDB on every poll |
| L-08 | [config/index.js](file:///d:/P/exam-app/server/src/config/index.js):60 | `ANALYTICS_MONGO_URI` not validated in production |
| L-09 | [mailer.js](file:///d:/P/exam-app/server/src/utils/mailer.js):4 | Unused `zohoTransporter` created at module load |
| L-10 | [authService.js](file:///d:/P/exam-app/server/src/services/authService.js):346 | OTP logged to console if NODE_ENV ≠ production |
| L-11 | [ReviewPage.jsx](file:///d:/P/exam-app/client/test-dashboard/src/pages/ReviewPage.jsx):49 | `raiseDoubt` doesn't check HTTP response status |
| L-12 | [TestEngine.jsx](file:///d:/P/exam-app/client/test-dashboard/src/pages/TestEngine.jsx):302 | `window.close()` fails for non-popup windows |
| L-13 | [TestEngine.jsx](file:///d:/P/exam-app/client/test-dashboard/src/pages/TestEngine.jsx):77 | `attemptQuery` fragile URL construction |
| L-14 | [TestEngine.jsx](file:///d:/P/exam-app/client/test-dashboard/src/pages/TestEngine.jsx):674 | Empty sections cause silent nav failure |
| L-15 | [App.jsx](file:///d:/P/exam-app/client/test-dashboard/src/App.jsx):278 | Shared test loading has no timeout |
| L-16 | [ForcePasswordChange.jsx](file:///d:/P/exam-app/client/test-dashboard/src/ForcePasswordChange.jsx):13 | No re-submission guard |
| L-17 | [App.jsx](file:///d:/P/exam-app/client/test-dashboard/src/App.jsx):389 | No double-click guard on test start — duplicate attempts |
| L-18 | [adminRoutes.js](file:///d:/P/exam-app/server/src/routes/adminRoutes.js):466 | `admin/exams` GET returns ALL exams with no pagination |

---

# ✅ Things Done Well

| Area | Assessment |
|:-----|:-----------|
| Password Hashing | bcrypt with 12 salt rounds ✅ |
| JWT Secret | Not hardcoded, crashes in prod if missing ✅ |
| JWT Expiry | 7-day expiry ✅ |
| Password Strength | Min 8 chars, requires letter + number ✅ |
| Password in Response | `select: false` + `toJSON` transform ✅ |
| Admin Routes | All use `router.use(protectAdmin)` (router-level) ✅ |
| B2B Routes | All use `router.use(protectAdmin)` ✅ |
| Coaching Routes | All use `router.use(protectCoachingAdmin)` ✅ |
| SSRF Protection | `safeFetch` validates DNS, blocks private IPs ✅ |
| Rate Limiting | Login (10/hr), Register (3/hr), OTP (3/15min) ✅ |
| Helmet | Configured with appropriate overrides ✅ |
| CORS | Whitelist-based ✅ |
| ReDoS Prevention | `escapeRegex()` used in search ✅ |
| OTP Generation | `crypto.randomInt()` (cryptographically secure) ✅ |
| Self-Delete Prevention | Admin cannot delete themselves ✅ |

---

# 🎯 Recommended Fix Order

> [!IMPORTANT]
> Fix these in this exact order for maximum impact with minimum risk:

### Phase 1 — Security (1-2 hours)
1. **C-01 + C-02**: Install `express-mongo-sanitize` + sanitize OTP code → blocks the most dangerous attack vector
2. **C-09**: Add `express.json({ limit: '2mb' })` → 1-line fix prevents memory DoS
3. **C-10**: Add `unhandledRejection` handler → prevents silent crashes
4. **C-13**: Add `isBanned` field + check in middleware

### Phase 2 — Scoring & Submissions (2-3 hours)
5. **C-03**: Fix `incorrect` default from `-1` to `1` → scoring integrity
6. **C-04**: Fix `$or` overwrite with `$and` wrapper → test visibility
7. **C-05**: Add atomic status lock for submissions → prevents duplicates
8. **C-07 + C-08**: Add time expiry checks in sync + submit → blocks post-deadline cheating
9. **C-06**: Fix `toStudentPayload` → prevents crash in attempt flow

### Phase 3 — Frontend Anti-Cheat (1-2 hours)
10. **H-02**: Initialize tab switch count from server
11. **H-03**: Add fullscreen monitoring
12. **H-05**: Add `beforeunload` handler
13. **H-01**: Fix timer to use `Date.now()` anchoring
14. **H-06**: Add `|| 'General'` fallback to section click
15. **H-08**: Use `handleSubmitRef.current` in dialog

### Phase 4 — Scalability (1-2 hours)
16. **C-11**: Cache question IDs in Redis for sync
17. **C-12**: Replace `KEYS` with `SCAN` or Redis SET
18. **H-16**: Increase MongoDB pool to 50
19. **H-17**: Cache test metadata in Redis
20. **H-18**: Add timeout to mailer fetch calls
