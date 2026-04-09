# 🔒 Vayl Platform — Complete Security Audit

**Audit Date:** April 9, 2026  
**Scope:** Full codebase — `server/` (backend) + `client/frontend/` (frontend)  
**Files Reviewed:** 50+  
**Findings:** 26 vulnerabilities

---

## Summary by Severity

| Severity | Count | Description |
|----------|-------|-------------|
| 🔴 **CRITICAL** | 5 | Immediate exploitation risk — data breach, account takeover |
| 🟠 **HIGH** | 8 | Significant risk — privilege escalation, data leaks |
| 🟡 **MEDIUM** | 8 | Moderate risk — abuse vectors, logic flaws |
| 🔵 **LOW** | 5 | Minor issues — best-practice violations, hardening gaps |

---

## 🔴 CRITICAL Findings

### C1 — Hardcoded Secrets in `.env` (Committed to Disk)

**File:** [server/.env](file:///d:/P/vault/exam-app/server/.env)

While `.env` is in `.gitignore` and NOT tracked in git history (verified), the file exists on disk with **real production-grade secrets**:

```
JWT_SECRET=45tergt534rg4er3fersgfrtertg4trerg35t4wyj67i8tuiyj
GOOGLE_CLIENT_SECRET=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
ADMIN_BASIC_PASS=ctrl#9f3k!vayl
ZEPTOMAIL_PASS="PHtE6r1eROjqg296+hcGtKPsEcClZ4MqqOpiJQEU5Y4RXvRVHE1..."
EMAIL_PASS=Neel1!2@3#4$
```

> [!CAUTION]
> If this machine is ever compromised, shared, or a backup is leaked, **every secret is exposed in plaintext**. The JWT secret would allow forging auth tokens for any user. The Google Client Secret allows OAuth impersonation. The ZeptoMail key allows sending emails as `noreply@vayl.in`.

**Impact:** Full account takeover, email impersonation, admin panel access.

---

### C2 — JWT Has No Revocation Mechanism

**Files:**
- [generateToken.js](file:///d:/P/vault/exam-app/server/src/utils/generateToken.js#L4-L7)
- [authMiddleware.js](file:///d:/P/vault/exam-app/server/src/middlewares/authMiddleware.js#L16-L25)

```js
// generateToken.js — Token lives for 7 days, no way to revoke it
return jwt.sign({ id }, JWT_SECRET, { expiresIn: '7d' });

// authMiddleware.js — Only checks signature, never checks DB for revocation
const decoded = jwt.verify(token, JWT_SECRET);
req.user = await User.findById(decoded.id).select('-password');
```

> [!CAUTION]
> If a user's token is stolen (XSS, shoulder surfing, shared device), it remains valid for **7 full days** with absolutely no way to invalidate it. Logging out only closes the `Session` record — the JWT itself continues working. An attacker with a stolen token can operate as the victim even after the victim "logs out."

**Impact:** Stolen tokens cannot be revoked. Password changes don't invalidate existing tokens.

---

### C3 — Auth Middleware Race Condition — Request Proceeds Without Token Check

**File:** [authMiddleware.js](file:///d:/P/vault/exam-app/server/src/middlewares/authMiddleware.js#L6-L31)

```js
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      next();            // ← calls next() here
    } catch (error) {
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  if (!token) {          // ← BUT this also runs even if token was valid
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});
```

> [!WARNING]
> When a valid token is provided, `next()` is called on line 20, but execution **continues** to the `if (!token)` block on line 28. This means after `next()` fires and downstream handlers run, the middleware then throws an error and tries to set status 401. In Express, `next()` doesn't stop function execution. This causes "headers already sent" errors intermittently and is architecturally broken. It should use `return next()` or `else` branching.

**Impact:** Intermittent 401 errors for valid users. Potential for bypassing auth in edge cases with error swallowing.

---

### C4 — Client-Supplied IP Address Trusted for Session Records

**File:** [authController.js](file:///d:/P/vault/exam-app/server/src/controllers/authController.js#L16-L17)

```js
// Register endpoint
const { name, email, password, publicIp } = req.body;
let ipAddress = publicIp || req.ip || req.headers['x-forwarded-for'] || ...;
```

> [!WARNING]
> The `publicIp` field is sent from the client's request body and is **trusted as the primary IP source**. An attacker can spoof any IP address by sending `{ "publicIp": "1.2.3.4" }` in the request body, completely bypassing the server's own IP detection. This IP is stored in `Session.ipAddress` and could be used for future security decisions (geo-blocking, abuse detection).

**Impact:** IP-based audit trails are worthless. Attackers can impersonate any IP.

---

### C5 — Heartbeat Endpoint Allows Arbitrary Active-Time Inflation

**File:** [userController.js](file:///d:/P/vault/exam-app/server/src/controllers/userController.js#L54-L68)

```js
export const updateHeartbeat = asyncHandler(async (req, res) => {
  const { duration } = req.body; // seconds to add
  const user = await User.findByIdAndUpdate(
    userId,
    { $inc: { totalActiveSeconds: duration || 30 } },
    { new: true }
  );
});
```

> [!CAUTION]
> Any authenticated user can send `{ "duration": 999999999 }` to instantly inflate their `totalActiveSeconds` to any value. This directly affects:
> - **Level/XP system** (levelData virtual is computed from `totalActiveSeconds`)
> - **Public profile badges** (displayed on `/p/[rollNo]`)
> - **Leaderboard rankings** (admin panel top users)
>
> There is **zero validation** on the `duration` field — no minimum, no maximum, no rate limiting.

**Impact:** Gamification system is completely exploitable. Users can fake any level/XP.

---

## 🟠 HIGH Findings

### H1 — Google OAuth Access/Refresh Tokens Stored in User Document

**File:** [User.js](file:///d:/P/vault/exam-app/server/src/models/User.js#L128-L135)

```js
googleAccessToken: { type: String, default: null },
googleRefreshToken: { type: String, default: null },
```

Google OAuth tokens are stored as **plaintext** directly in the User document. Although admin routes exclude these fields via `.select('-googleAccessToken -googleRefreshToken')`, the `getMe` endpoint returns the **full user object** including these tokens:

```js
// authController.js line 121
res.json(user);  // Returns EVERYTHING — including Google tokens
```

> [!WARNING]
> Any authenticated user can call `GET /auth/me` and see their own Google access/refresh tokens in the response. If an XSS vulnerability is ever found, an attacker could steal these tokens to access the victim's Google Classroom, Calendar, and email.

**Impact:** Google account compromise via token exposure.

---

### H2 — No `express.json()` Body Size Limit

**File:** [api/index.js](file:///d:/P/vault/exam-app/server/api/index.js#L103)

```js
app.use(express.json());  // No limit option specified
```

Express defaults to a 100KB body limit, but this should be explicitly set lower. More critically, there is **no limit on `express.urlencoded()`** either:

```js
app.use(express.urlencoded({ extended: true }));  // No limit
```

**Impact:** Denial of Service via large payload attacks. An attacker can send multi-megabyte JSON bodies to exhaust server memory.

---

### H3 — CORS Allows ALL `.vercel.app` Subdomains

**File:** [api/index.js](file:///d:/P/vault/exam-app/server/api/index.js#L86-L88)

```js
if (origin.endsWith('.vercel.app')) {
  return callback(null, true);
}
```

> [!WARNING]
> This allows **any** `*.vercel.app` deployment — not just yours — to make authenticated requests to your API. Anyone can deploy a malicious site to Vercel (e.g., `evil-site.vercel.app`) and it will be accepted by CORS. Combined with `credentials: true`, this is a full CSRF/data-exfiltration vector.

**Impact:** Cross-site data theft from any Vercel-hosted attacker site.

---

### H4 — CORS Allows ALL `chrome-extension://` Origins

**File:** [api/index.js](file:///d:/P/vault/exam-app/server/api/index.js#L76-L78)

```js
if (origin.startsWith('chrome-extension://')) {
  return callback(null, true);
}
```

Any Chrome extension — malicious or otherwise — can make authenticated requests to the Vayl backend. This should be restricted to specific known extension IDs.

**Impact:** Malicious browser extensions can silently access/modify user data.

---

### H5 — CORS Subdomain Check is Bypassable

**File:** [api/index.js](file:///d:/P/vault/exam-app/server/api/index.js#L81)

```js
if (origin === 'https://vayl.in' || origin.endsWith('.vayl.in')) {
  return callback(null, true);
}
```

The check `origin.endsWith('.vayl.in')` would also match `https://evil.vayl.in` or even `https://notvayl.in` (if someone registers that domain). It should check for `.vayl.in` preceded by `https://` specifically.

**Impact:** Domain spoofing if an attacker registers a domain ending in `vayl.in`.

---

### H6 — OTP Codes Stored in Plaintext

**File:** [OtpCode.js](file:///d:/P/vault/exam-app/server/src/models/OtpCode.js#L10-L12)

```js
code: { type: String, required: true }  // Stored as plaintext "123456"
```

OTP codes are stored as raw strings in MongoDB. If the database is ever breached, all pending OTPs are immediately usable. OTPs should be hashed (like passwords) and compared via `bcrypt.compare()`.

**Impact:** Database breach exposes all pending verification codes.

---

### H7 — Logout Does Not Verify Session Ownership

**File:** [authService.js](file:///d:/P/vault/exam-app/server/src/services/authService.js#L169-L186)

```js
export const logoutUser = async ({ sessionId, userId }) => {
  const session = await Session.findById(sessionId);  // ← No userId check!
  if (!session || session.logoutAt) return { success: false };
  
  session.logoutAt = new Date();
  // ...
  const user = await User.findById(userId);
  if (user) {
    user.totalActiveSeconds += duration;  // ← Adds time to the CALLER's account
  }
```

> [!WARNING]
> The function finds the session by ID only — it does not verify that `session.userId === userId`. An authenticated user can logout **someone else's session** by guessing/enumerating session IDs (MongoDB ObjectIds are sequential and predictable). Worse, the `duration` from that foreign session gets added to the **caller's** `totalActiveSeconds`.

**Impact:** Session hijacking, active-time manipulation, denial of service to other users.

---

### H8 — `updatePassword` Does Not Select Password Field

**File:** [authService.js](file:///d:/P/vault/exam-app/server/src/services/authService.js#L431-L448)

```js
export const updateUserPassword = async ({ userId, oldPassword, newPassword }) => {
  const user = await User.findById(userId);  // ← Missing .select('+password')
  // ...
  if (!(await user.matchPassword(oldPassword))) { ... }
```

The User model has `password: { select: false }`. When `findById` is called without `.select('+password')`, `user.password` is `undefined`. The `matchPassword` method returns `false` for `!this.password`, so **password changes always fail silently** — or worse, the `save()` may proceed with a `null` password depending on the pre-save hook logic.

**Impact:** Password change feature is broken. Users cannot update their passwords.

---

## 🟡 MEDIUM Findings

### M1 — No Input Sanitization on Resource URLs

**File:** [resourceController.js](file:///d:/P/vault/exam-app/server/src/controllers/resourceController.js#L7-L23)

```js
const { type, url, title, folderName } = req.body;
// url is stored directly — no validation it's actually a URL
const resource = await resourceService.createResource({ userId, type, url, title, folderName });
```

Users can store `javascript:alert(1)` or `data:text/html,...` as resource URLs. When these are rendered as `<a href>` links on the frontend, they execute JavaScript.

**Impact:** Stored XSS via malicious resource URLs.

---

### M2 — `trust proxy` Set to `true` (Most Permissive)

**File:** [api/index.js](file:///d:/P/vault/exam-app/server/api/index.js#L54)

```js
app.set('trust proxy', true);
```

Setting `trust proxy` to `true` means Express trusts the **leftmost** `X-Forwarded-For` header value. An attacker can prepend arbitrary IPs to this header. This breaks all rate limiting (since `express-rate-limit` uses `req.ip`). Should be set to a specific number (e.g., `1`) matching your reverse proxy depth.

**Impact:** All rate limiters can be bypassed by spoofing `X-Forwarded-For`.

---

### M3 — Health Endpoint Leaks Server Internals

**File:** [healthController.js](file:///d:/P/vault/exam-app/server/src/controllers/healthController.js#L39-L63)

```js
const healthData = {
  services: {
    server: {
      uptime: formatUptime(uptime),
      memoryUsage: { heapTotal, heapUsed, rss },
      loadAverage: os.loadavg(),
      platform: process.platform,
      nodeVersion: process.version,
      pid: process.pid               // ← Process ID
    }
  },
  environment: process.env.NODE_ENV
};
```

This endpoint is **public** (no auth) and exposes exact Node.js version, OS platform, process ID, memory usage, and uptime. This information helps attackers fingerprint the server and find known vulnerabilities for the exact Node version.

**Impact:** Server fingerprinting and reconnaissance.

---

### M4 — Feedback Endpoint Accepts Unsanitized `email` From Query String

**File:** [feedback.js](file:///d:/P/vault/exam-app/server/src/routes/feedback.js#L16-L34)

```js
router.get('/submit', feedbackLimiter, async (req, res) => {
  const { rating, email } = req.query;
  const cleanEmail = String(email).slice(0, 254).toLowerCase().trim();
  await Feedback.create({ email: cleanEmail, rating: parsedRating });
```

The email comes from a **GET query parameter** (designed to be clicked from an email link). This creates several issues:
1. Email is logged in server access logs, proxy logs, and browser history
2. No CSRF protection — anyone can submit feedback on behalf of any email
3. The endpoint is GET but performs a **write operation** (creates a DB document)

**Impact:** Feedback spam, false attribution, log exposure.

---

### M5 — No Pagination Limit Enforcement on Some Endpoints

**File:** [resourceController.js](file:///d:/P/vault/exam-app/server/src/controllers/resourceController.js#L30-L31)

```js
const page = parseInt(req.query.page, 10) || 1;
const limit = parseInt(req.query.limit, 10) || 20;
// No Math.min() cap — user can request limit=999999
```

Unlike admin routes (which cap at 100), user-facing resource/note endpoints have **no upper bound** on `limit`. An attacker can request `?limit=1000000` to dump entire collections in a single request, causing memory exhaustion.

**Impact:** Denial of service, data enumeration.

---

### M6 — Email Change Has No Re-verification

**File:** [authService.js](file:///d:/P/vault/exam-app/server/src/services/authService.js#L406-L413)

```js
if (email && email !== user.email) {
  const existing = await User.findOne({ email });
  if (existing) { throw ... }
  user.email = email;  // ← Changed immediately, no OTP verification
}
```

A user can change their email to **any address** without proving they own it. This breaks the email-verified registration flow and allows account takeover if combined with password reset features.

**Impact:** Account email can be changed to attacker-controlled address.

---

### M7 — OTP Verification Allows Unlimited Attempts Per Email

**File:** [authRoutes.js](file:///d:/P/vault/exam-app/server/src/routes/authRoutes.js#L77-L82)

```js
const otpVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,  // Per IP — not per email
});
```

Rate limiting is per-IP, not per-email. An attacker using multiple IPs (proxies, cloud functions) can brute-force a 6-digit OTP (1,000,000 combinations) across distributed IPs with ~10 attempts per IP per 15 minutes.

**Impact:** OTP brute-force from distributed IPs.

---

### M8 — `getMe` Returns Full User Object Including Sensitive Fields

**File:** [authController.js](file:///d:/P/vault/exam-app/server/src/controllers/authController.js#L106-L122)

```js
export const getMe = asyncHandler(async (req, res) => {
  const user = req.user;
  // ... vaultId generation logic ...
  res.json(user);  // Returns EVERYTHING
});
```

The response includes `googleAccessToken`, `googleRefreshToken`, `googleTokenExpiresAt`, `analytics.searchHistory` (privacy concern), and internal fields like `__v`. Should use explicit field selection.

**Impact:** Over-exposure of sensitive internal data.

---

## 🔵 LOW Findings

### L1 — Weak JWT Secret in Development Config

**File:** [config/index.js](file:///d:/P/vault/exam-app/server/src/config/index.js#L29)

```js
export const JWT_SECRET = process.env.JWT_SECRET || (isProd ? undefined : 'your_jwt_secret_here');
```

The development fallback `'your_jwt_secret_here'` is a commonly known default. If production env vars ever fail to load, the server would silently start with this guessable secret.

**Impact:** Token forgery if production misconfigures env vars.

---

### L2 — `password` Pre-Save Hook Has a Bypass Heuristic

**File:** [User.js](file:///d:/P/vault/exam-app/server/src/models/User.js#L157-L168)

```js
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  
  // If password already looks like bcrypt hash, skip
  if (this.password?.startsWith('$2b$') || this.password?.startsWith('$2a$')) {
    return;
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});
```

If a user somehow submits a password starting with `$2b$` or `$2a$`, it will be stored **without hashing**, and the attacker knows the exact stored value. This is an edge case but the check is a code smell — it suggests the double-hashing bug existed and was "fixed" with a heuristic rather than proper state tracking.

**Impact:** Edge-case password storage bypass.

---

### L3 — Admin Panel Path in `.env.example` Would Expose Secret URL

**File:** [server/.env](file:///d:/P/vault/exam-app/server/.env#L15)

```
ADMIN_PATH=/sys-9f3k-ctrl
```

The admin panel is security-through-obscurity (secret URL path). If this path ever leaks (logs, screenshots, `.env.example`), attackers know where to target brute-force attacks against the HTTP Basic Auth.

**Impact:** Reduced security of admin panel if path leaks.

---

### L4 — No HTTPS Enforcement / HSTS Header

**File:** [api/index.js](file:///d:/P/vault/exam-app/server/api/index.js#L43)

```js
app.use(helmet());
```

While `helmet()` is used, the default Helmet config does **not** enable `Strict-Transport-Security` (HSTS). Railway/Vercel handle TLS termination, but without HSTS, a man-in-the-middle could downgrade connections on first visit.

**Impact:** First-visit MITM risk without HSTS preloading.

---

### L5 — `Permissions-Policy` Missing Key Directives

**File:** [api/index.js](file:///d:/P/vault/exam-app/server/api/index.js#L44-L50)

```js
res.setHeader(
  'Permissions-Policy',
  'camera=(), microphone=(), geolocation=(), browsing-topics=()'
);
```

Missing restrictions for: `payment`, `usb`, `serial`, `hid`, `bluetooth`. While not immediately exploitable, this is a defense-in-depth hardening gap.

**Impact:** Minor — defense-in-depth gap.

---

## Priority Remediation Order

| Priority | Finding | Effort |
|----------|---------|--------|
| 1 | **C3** — Fix auth middleware `return next()` | 5 min |
| 2 | **C5** — Add duration validation to heartbeat | 10 min |
| 3 | **C4** — Remove client `publicIp` trust | 10 min |
| 4 | **H3** — Restrict CORS `.vercel.app` to your project | 15 min |
| 5 | **H7** — Add userId check to logout/session | 10 min |
| 6 | **H8** — Fix `updatePassword` to select password | 5 min |
| 7 | **H1** — Filter sensitive fields from `getMe` response | 15 min |
| 8 | **C2** — Add token blacklist (Redis or DB) | 2-4 hrs |
| 9 | **M2** — Set `trust proxy` to specific depth | 5 min |
| 10 | **M1** — Validate resource URLs | 20 min |
| 11 | **M5** — Cap pagination limits | 10 min |
| 12 | **M6** — Require OTP for email changes | 1 hr |
| 13 | **H2** — Set body size limits | 5 min |
| 14 | **M3** — Restrict health endpoint data | 10 min |
| 15 | **H6** — Hash OTP codes | 30 min |
| 16 | **C1** — Rotate all exposed secrets | 1 hr |

> [!IMPORTANT]
> Items 1-6 are quick wins that can be fixed in under an hour total and eliminate the most dangerous attack vectors. Item 16 (rotating secrets) should be done **after** all code fixes are deployed, as rotating before fixing the code would just expose new secrets to the same vulnerabilities.
