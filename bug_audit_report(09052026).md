# 🔴 JEE Battle — Deep Code Audit Report

**Auditor**: Senior Full-Stack Architect & Security Auditor  
**Scope**: `/server` (Node/Express/MongoDB) + `client/jee-battle`  
**Date**: 2026-05-09  

---

## Critical Severity

### BUG-01: Auth Middleware — Double Response on Missing Token
**[Location]**: [authMiddleware.js:16-46](file:///d:/P/exam-app/server/src/middlewares/authMiddleware.js#L16-L46)  
**[Severity]**: Critical  
**[Issue]**: When a valid token is present but `jwt.verify` throws, the catch block sets `res.status(401)` and throws. But execution then falls through to the `if (!token)` block at L43 which *also* sets status and throws — a double-throw. More critically, when the token IS present and valid, `next()` is called at L35, but execution continues past the `if (token)` block and hits the `if (!token)` check at L43. Since `token` is truthy, this is a no-op — but only by luck. The control flow is fragile.

**[Fix]**: Add `return` after `next()` and restructure:
```js
if (!token) {
  res.status(401);
  throw new Error('Not authorized, no token');
}
try {
  const decoded = jwt.verify(token, JWT_SECRET);
  req.user = await User.findById(decoded.id).select('-password');
  if (!req.user) { res.status(401); throw new Error('User not found'); }
  User.updateOne({ _id: req.user._id }, { $set: { lastActiveAt: new Date() } }).catch(() => {});
  return next();
} catch (error) {
  res.status(401);
  throw new Error('Not authorized, token failed');
}
```

---

### BUG-02: Battle Submit — Non-Atomic Read-Modify-Write Race Condition
**[Location]**: [battleRoutes.js:528-714](file:///d:/P/exam-app/server/src/routes/battleRoutes.js#L528-L714) (`POST /battle/submit`)  
**[Severity]**: Critical  
**[Issue]**: The submit endpoint does `findOne` → mutate in-memory → `save()`. Two concurrent requests from the same player (double-click, network retry) can both pass the duplicate-answer check at L546 because neither has saved yet, resulting in **duplicate answers pushed to the array** and **double points**. The `save()` at L677 will silently overwrite the other's changes (last-write-wins).

**[Fix]**: Use `findOneAndUpdate` with `$push` and a condition that the questionId doesn't already exist in the answers array:
```js
const result = await Battle.findOneAndUpdate(
  {
    roomCode: roomCode.toUpperCase(),
    status: 'active',
    [isPlayer1 ? 'player1' : 'player2']: userId,
    [`${answerField}.questionId`]: { $ne: questionId } // atomic duplicate guard
  },
  {
    $push: { [answerField]: answerRecord },
    $inc: { [scoreField]: points },
    $set: { [lastAnswerField]: new Date() }
  },
  { new: true }
);
if (!result) return res.status(400).json({ error: 'Already answered' });
```

---

### BUG-03: OAuth Token Leaked in URL Query String
**[Location]**: [authRoutes.js:65](file:///d:/P/exam-app/server/src/routes/authRoutes.js#L65)  
**[Severity]**: Critical  
**[Issue]**: After Google OAuth, the JWT is passed via `?token=...` in the redirect URL. This token appears in browser history, server access logs, Referer headers to third-party resources, and potentially in analytics. The JEE Battle client stores it in localStorage on arrival but the URL exposure window is significant.

**[Fix]**: Use a short-lived, single-use authorization code pattern instead. Store a random code in the DB/Redis mapped to the userId, redirect with `?code=...`, then have the frontend exchange it for the JWT via a POST request. Alternatively, set the token as an `httpOnly` cookie.

---

## High Severity

### BUG-04: Battle Polling Route — Unguarded `battle.save()` After Auto-Submit
**[Location]**: [battleRoutes.js:448-499](file:///d:/P/exam-app/server/src/routes/battleRoutes.js#L448-L499) (`GET /battle/:roomCode`)  
**[Severity]**: High  
**[Issue]**: The GET polling route performs *writes* (auto-submitting blank answers for disconnected players, changing status to `finished`, setting `winner`). A GET route should be idempotent. Worse, if two clients poll simultaneously while the other player is disconnected, both can trigger the auto-submit logic concurrently, causing duplicate blank answers and corrupted state via the same read-modify-write pattern as BUG-02.

**[Fix]**: Move auto-submit logic to a dedicated background timer or a `POST /battle/auto-submit` endpoint. At minimum, use `findOneAndUpdate` with array-length guards.

---

### BUG-05: `cleanupStaleRooms()` Called On Every Request — Performance Bottleneck
**[Location]**: [battleRoutes.js:36-49](file:///d:/P/exam-app/server/src/routes/battleRoutes.js#L36-L49)  
**[Severity]**: High  
**[Issue]**: `cleanupStaleRooms()` runs an `updateMany` with `$or` on every `/queue`, `/create`, and `/join` request. Under load (N concurrent players), this means N full collection scans per matchmaking wave. There's no index on `(status, createdAt)` or `(status, startedAt)`.

**[Fix]**: 
1. Add compound index: `BattleSchema.index({ status: 1, createdAt: 1 })`
2. Throttle cleanup to once per 60 seconds using a module-level timestamp:
```js
let lastCleanup = 0;
async function maybeCleanup() {
  if (Date.now() - lastCleanup < 60_000) return;
  lastCleanup = Date.now();
  await cleanupStaleRooms();
}
```

---

### BUG-06: Leaderboard Update Not Atomic with Battle Save
**[Location]**: [battleRoutes.js:679-700](file:///d:/P/exam-app/server/src/routes/battleRoutes.js#L679-L700)  
**[Severity]**: High  
**[Issue]**: `battle.save()` succeeds at L677, then the leaderboard update at L695 can fail (network blip, timeout). The player's answer is recorded but their leaderboard points are lost permanently with no retry mechanism. This creates a silent data inconsistency.

**[Fix]**: Wrap both operations in a MongoDB transaction, or implement a retry queue for failed leaderboard updates. At minimum, catch the error and log it for manual reconciliation.

---

### BUG-07: `getMe` — Infinite Retry Loop on VaultID Collision
**[Location]**: [authController.js:116-125](file:///d:/P/exam-app/server/src/controllers/authController.js#L116-L125)  
**[Severity]**: High  
**[Issue]**: If `generateVaultId` produces a collision, the catch block calls `generateVaultId` again with the **same input** — likely producing the **same collision** and throwing again. This bubbles up as a 500 to the user on every `/me` call, effectively locking them out.

**[Fix]**: Add randomness/suffix to the retry, or use a counter:
```js
for (let attempt = 0; attempt < 3; attempt++) {
  try {
    user.vaultId = generateVaultId(user, attempt);
    await user.save();
    break;
  } catch (e) {
    if (attempt === 2) console.error('VaultID generation failed after 3 attempts');
  }
}
```

---

### BUG-08: SSRF Bypass via DNS Rebinding / IPv6
**[Location]**: [publicController.js:127-143](file:///d:/P/exam-app/server/src/controllers/publicController.js#L127-L143)  
**[Severity]**: High  
**[Issue]**: The SSRF check only blocks string-based hostname patterns. An attacker can bypass with:
- IPv6 loopback: `http://[::1]/`
- Decimal IP: `http://2130706433/` (= 127.0.0.1)
- DNS rebinding: domain resolves to internal IP after the check
- `0.0.0.0`, `[::]`

**[Fix]**: Resolve the hostname to IP via `dns.lookup()` *before* fetching, then check the resolved IP. Use a library like `ssrf-req-filter` for comprehensive protection.

---

### BUG-09: Mass Email Blast — Unbounded Concurrent Fetch (DDoS on ZeptoMail)
**[Location]**: [publicRoutes.js:178-213](file:///d:/P/exam-app/server/src/routes/publicRoutes.js#L178-L213)  
**[Severity]**: High  
**[Issue]**: `Promise.all(users.map(...))` fires ALL email requests simultaneously. With 10,000 users, that's 10,000 concurrent HTTP requests — likely to exhaust memory, file descriptors, and get rate-limited/banned by ZeptoMail. The admin route at L55 does this correctly with sequential + delay, but this one doesn't.

**[Fix]**: Use batched concurrency (e.g., `p-limit` with concurrency of 5-10) or the sequential pattern already used in the admin blast.

---

## Medium Severity

### BUG-10: `uniqueRoomCode()` Defined But Never Called
**[Location]**: [battleRoutes.js:26-33](file:///d:/P/exam-app/server/src/routes/battleRoutes.js#L26-L33)  
**[Severity]**: Medium  
**[Issue]**: The `uniqueRoomCode()` function does a `findOne` check before creating, but all actual room creation uses the inline retry-on-11000 pattern instead. This function is dead code that adds confusion.

**[Fix]**: Delete `uniqueRoomCode()` entirely.

---

### BUG-11: Battle Model — No Index on `status` for Matchmaking Queries
**[Location]**: [Battle.js](file:///d:/P/exam-app/server/src/models/Battle.js)  
**[Severity]**: Medium  
**[Issue]**: Matchmaking queries filter by `{ status: 'waiting', player1: { $ne: userId } }`, and cleanup queries filter by `status + createdAt`. There's a unique index on `roomCode` but no index on `status`, forcing full collection scans that degrade as battles accumulate.

**[Fix]**:
```js
BattleSchema.index({ status: 1, createdAt: -1 });
BattleSchema.index({ player1: 1, status: 1 });
BattleSchema.index({ player2: 1, status: 1 });
```

---

### BUG-12: JWT Secret Falls Back to Hardcoded String in Dev
**[Location]**: [config/index.js:29](file:///d:/P/exam-app/server/src/config/index.js#L29)  
**[Severity]**: Medium  
**[Issue]**: `JWT_SECRET` defaults to `'your_jwt_secret_here'` in non-production. If `.env` is misconfigured and the app accidentally runs without `NODE_ENV=production`, tokens signed with this secret are trivially forgeable by anyone who reads the source code (which is on GitHub).

**[Fix]**: Remove the fallback entirely. Crash on startup if `JWT_SECRET` is not set:
```js
export const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('FATAL: JWT_SECRET is not configured');
```

---

### BUG-13: `cutoffs/trend` — Synchronous File Read on Every Request
**[Location]**: [publicRoutes.js:82-95](file:///d:/P/exam-app/server/src/routes/publicRoutes.js#L82-L95)  
**[Severity]**: Medium  
**[Issue]**: `fs.readFileSync` blocks the event loop on every `/cutoffs/trend` request, reading and parsing a potentially multi-MB JSON file. Under concurrent load, this serializes all requests through the synchronous read.

**[Fix]**: Read and cache the file once at startup, or use `fs.promises.readFile` with an in-memory cache:
```js
let cachedCutoffs = null;
// Load once at module init
import { readFileSync } from 'fs';
cachedCutoffs = JSON.parse(readFileSync(jsonPath, 'utf8'));
```

---

### BUG-14: Feedback Route — Reflected XSS via `parsedRating`
**[Location]**: [feedback.js:55](file:///d:/P/exam-app/server/src/routes/feedback.js#L55)  
**[Severity]**: Medium  
**[Issue]**: `parsedRating` is interpolated directly into an HTML response: `Your rating of ${parsedRating}/5`. While `parseInt` limits this to integers, the pattern is dangerous if the sanitization logic changes. The email parameter could also be reflected if validation is weakened.

**[Fix]**: Use a templating engine with auto-escaping, or explicitly escape:
```js
const safeRating = Number(parsedRating); // already int, but defensive
```

---

### BUG-15: Redis Connection Spam in Dev
**[Location]**: Server logs (observed), [redis.js:16-18](file:///d:/P/exam-app/server/src/config/redis.js#L16-L18)  
**[Severity]**: Medium  
**[Issue]**: When Redis is unavailable (common in local dev), the `error` event fires continuously — hundreds of times per minute, flooding logs with `[Redis] Connection error:` and making real errors invisible.

**[Fix]**: Add exponential backoff or suppress repeated errors:
```js
let lastRedisError = 0;
redisClient.on('error', (err) => {
  if (Date.now() - lastRedisError > 30000) {
    console.error('[Redis] Connection error:', err.message);
    lastRedisError = Date.now();
  }
  isRedisReady = false;
});
```

---

### BUG-16: Battle Question Code Generation — N+1 Query Loop
**[Location]**: [adminRoutes.js:358-369](file:///d:/P/exam-app/server/src/routes/adminRoutes.js#L358-L369)  
**[Severity]**: Medium  
**[Issue]**: Question code generation does `countDocuments` then loops with `findOne` to check for collisions — each iteration is a DB round-trip. With many deleted questions, this loop can run many times.

**[Fix]**: Use a UUID or nanoid-based code, or use `findOneAndUpdate` with `$inc` on a counter collection for guaranteed uniqueness in a single operation.

---

### BUG-17: `connectDB` Race Condition Under Concurrent Cold Starts
**[Location]**: [db.js:4-26](file:///d:/P/exam-app/server/src/config/db.js#L4-L26)  
**[Severity]**: Medium  
**[Issue]**: `isConnected` is a simple boolean with no mutex. On Vercel, multiple concurrent requests during a cold start can all see `isConnected === false` and call `mongoose.connect()` simultaneously. Mongoose handles this internally (it queues), but the multiple log messages and redundant awaits waste time.

**[Fix]**: Store the connection promise and reuse it:
```js
let connectionPromise = null;
const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  if (!connectionPromise) {
    connectionPromise = mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
  }
  return connectionPromise;
};
```

---

### BUG-18: Client — `fetchState` Dependency Creates Infinite Re-render Loop Risk
**[Location]**: [client/jee-battle/src/app/[roomCode]/page.tsx:133-153](file:///d:/P/exam-app/client/jee-battle/src/app/%5BroomCode%5D/page.tsx#L133-L153)  
**[Severity]**: Medium  
**[Issue]**: `fetchState` depends on `countdownMs` (L133). `fetchState` sets `countdownMs` (L124). This creates a dependency cycle: fetch → set countdownMs → fetchState reference changes → useEffect re-runs → new interval → fetch again. The `countdownMs === 0` guard at L123 prevents infinite loops in practice, but one extra fetch cycle fires unnecessarily on every countdown start.

**[Fix]**: Remove `countdownMs` from `fetchState`'s dependency array. Use a ref for the countdown guard:
```js
const countdownStartedRef = useRef(false);
// Inside fetchState:
if (deltaMs > 0 && !countdownStartedRef.current) {
  countdownStartedRef.current = true;
  setCountdownMs(deltaMs);
}
```

---

## Summary Table

| ID | Severity | Category | Location | One-Line Summary |
|---|---|---|---|---|
| BUG-01 | 🔴 Critical | Auth | authMiddleware.js | Double-throw on missing/bad token, fragile control flow |
| BUG-02 | 🔴 Critical | Race Condition | battleRoutes.js /submit | Non-atomic R-M-W allows duplicate answers & double points |
| BUG-03 | 🔴 Critical | Security | authRoutes.js | JWT leaked in OAuth redirect URL |
| BUG-04 | 🟠 High | Race Condition | battleRoutes.js GET /:roomCode | GET route performs writes; concurrent auto-submit corruption |
| BUG-05 | 🟠 High | Performance | battleRoutes.js cleanupStaleRooms | Full-scan updateMany on every matchmaking request |
| BUG-06 | 🟠 High | Data Integrity | battleRoutes.js /submit | Leaderboard update not atomic with battle save |
| BUG-07 | 🟠 High | Logic | authController.js getMe | Infinite collision retry with same input |
| BUG-08 | 🟠 High | Security | publicController.js | SSRF bypass via IPv6/decimal IP/DNS rebinding |
| BUG-09 | 🟠 High | Performance | publicRoutes.js | Unbounded concurrent email blast (10k+ simultaneous fetches) |
| BUG-10 | 🟡 Medium | Dead Code | battleRoutes.js | `uniqueRoomCode()` never called |
| BUG-11 | 🟡 Medium | Performance | Battle.js | Missing indexes on `status` for matchmaking queries |
| BUG-12 | 🟡 Medium | Security | config/index.js | Hardcoded JWT fallback secret in dev |
| BUG-13 | 🟡 Medium | Performance | publicRoutes.js | Synchronous file read blocks event loop |
| BUG-14 | 🟡 Medium | Security | feedback.js | Potential reflected XSS in HTML response |
| BUG-15 | 🟡 Medium | DX/Ops | redis.js | Redis error spam floods logs in dev |
| BUG-16 | 🟡 Medium | Performance | adminRoutes.js | N+1 query loop for question code generation |
| BUG-17 | 🟡 Medium | Race Condition | db.js | Concurrent cold-start connection race |
| BUG-18 | 🟡 Medium | Client Bug | [roomCode]/page.tsx | fetchState/countdownMs dependency cycle |

---

> **Recommendation**: Fix BUG-02 first — it's the most exploitable in production (a player can double-submit answers for 2x points with a simple network replay). BUG-01 and BUG-03 are close seconds.
