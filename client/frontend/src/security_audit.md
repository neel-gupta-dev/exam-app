# 🔒 Vayl Platform — Security Vulnerability Audit

**Audit Date:** April 9, 2026  
**Scope:** Full-stack review — Server API, Authentication, Authorization, Input Handling, Data Exposure, Frontend Client

---

## Severity Legend
| Level | Meaning |
|-------|---------|
| 🔴 **CRITICAL** | Immediate exploitation risk. Can compromise the entire system or all user data. |
| 🟠 **HIGH** | Significant risk. Can compromise individual accounts or escalate privileges. |
| 🟡 **MEDIUM** | Moderate risk. Can leak data or abuse functionality at scale. |
| 🔵 **LOW** | Minor risk. Defense-in-depth gap or information disclosure. |

---

## 🔴 CRITICAL-1: Public Admin Account Takeover Endpoint

**File:** [authService.js](file:///d:/P/vault/exam-app/server/src/services/authService.js#L413-L449)  
**Route:** [authRoutes.js](file:///d:/P/vault/exam-app/server/src/routes/authRoutes.js#L68) — `GET /api/auth/restore-9f3k-admin`

**The Problem:**  
There is a **completely unauthenticated, public GET endpoint** that resets the admin account password to a hardcoded value (`admin_9f3k_vayl`) and **returns the password in the HTTP response body**.

```js
// Anyone can hit this URL in a browser:
// https://api.vayl.in/auth/restore-9f3k-admin

return { 
  message: 'SUCCESS: Admin account restored.',
  tempPassword: defaultPass,  // ← PASSWORD RETURNED TO ATTACKER
  nextStep: 'LOGIN IMMEDIATELY...'
};
```

**Exploit Scenario:**
1. Attacker visits `https://api.vayl.in/auth/restore-9f3k-admin` in any browser.
2. Server resets admin password to `admin_9f3k_vayl` and **sends it back in JSON**.
3. Attacker logs in as `guptaneelhome@gmail.com` / `admin_9f3k_vayl`.
4. Attacker now has **full admin access** — can delete all users, view all data, export resources, modify roles.

> [!CAUTION]
> This is the single most dangerous vulnerability. One HTTP request gives an attacker full admin control over your entire platform and all user data. It can be triggered by a bot, a crawler, or even a search engine pre-fetching links.

---

## 🔴 CRITICAL-2: Admin Bypass Secret in Login Flow

**File:** [authService.js](file:///d:/P/vault/exam-app/server/src/services/authService.js#L90-L100)

**The Problem:**  
The login function has an emergency bypass that lets anyone login as any admin user by providing a special password stored in `ADMIN_BYPASS_SECRET` env var.

```js
if (bypassSecret && cleanPassword === bypassSecret && user.role === 'admin') {
  isMatch = true; // Skips password verification entirely
}
```

**Exploit Scenario:**
- If the bypass secret is weak, guessable, or leaked (via logs, env dumps, GitHub), an attacker can login as any admin without knowing their actual password.
- The secret is also logged in console via `console.warn`, making it visible in Railway logs that may be shared or exposed.

---

## 🔴 CRITICAL-3: Hardcoded Admin Credentials in Source Code

**Files:**
- [authService.js L414-415](file:///d:/P/vault/exam-app/server/src/services/authService.js#L414-L415) — Hardcoded email & password
- [index.js L60-62](file:///d:/P/vault/exam-app/server/api/index.js#L60-L62) — Hardcoded admin panel credentials

```js
// authService.js
const email = 'guptaneelhome@gmail.com';
const defaultPass = 'admin_9f3k_vayl';

// api/index.js
const ADMIN_PATH = '/sys-9f3k-ctrl';
const ADMIN_USER = 'vayl_ops';
const ADMIN_PASS = 'ctrl#9f3k!vayl';
```

**Exploit Scenario:**
- Anyone who reads this Git repository (if public, or via any leak) instantly knows:
  - The admin's email address
  - The admin recovery password
  - The secret admin panel URL
  - The HTTP Basic Auth credentials for the admin panel
- Combined with CRITICAL-1, the attacker doesn't even need to read the code — the endpoint hands them the password.

---

## 🟠 HIGH-1: No Rate Limiting on Login & Registration

**File:** [authRoutes.js](file:///d:/P/vault/exam-app/server/src/routes/authRoutes.js#L58-L59)

**The Problem:**  
Only the `/send-otp` endpoint has rate limiting. The `/login` and `/register` endpoints have **zero rate limiting**.

```js
router.post('/register', register);  // ← No rate limiter
router.post('/login', login);        // ← No rate limiter
router.post('/send-otp', otpLimiter, sendOtp); // ← Only this one is protected
```

**Exploit Scenario:**
1. **Brute-Force Attack:** Attacker runs a script trying thousands of passwords against a known email. No throttling or lockout.
2. **Credential Stuffing:** Attacker uses leaked email/password combos from other breaches.
3. **Registration Spam:** Attacker creates thousands of fake accounts, polluting the database and inflating metrics.

---

## 🟠 HIGH-2: Google Access Token Leaked to Client

**File:** [authService.js](file:///d:/P/vault/exam-app/server/src/services/authService.js#L59-L63)

**The Problem:**  
On login and registration, the response includes `googleAccessToken` — a **live Google OAuth access token** — sent directly to the browser.

```js
return {
  _id: user._id,
  googleAccessToken: user.googleAccessToken, // ← Sent to frontend!
  token: generateToken(user._id),
};
```

**Exploit Scenario:**
1. Attacker intercepts the login response (via XSS, browser extension, shared computer, or network sniffing).
2. Uses the Google access token to access the user's Google Classroom data, Google Calendar, and potentially other Google services — **completely outside your application**.
3. The token persists for up to 1 hour and can read/write to the user's Google account.

> [!WARNING]
> Google OAuth tokens should **never** be sent to the client. They should only be stored and used server-side.

---

## 🟠 HIGH-3: ReDoS (Regular Expression Denial of Service)

**Files:**
- [resourceService.js L29](file:///d:/P/vault/exam-app/server/src/services/resourceService.js#L29) — `folder` param injected into regex
- [resourceService.js L33](file:///d:/P/vault/exam-app/server/src/services/resourceService.js#L33) — `search` param injected into regex
- [adminRoutes.js L72](file:///d:/P/vault/exam-app/server/src/routes/adminRoutes.js#L72) — `search` query injected into regex
- [publicController.js L13](file:///d:/P/vault/exam-app/server/src/controllers/publicController.js#L13) — `rollNo` param injected into regex

**The Problem:**  
User-supplied strings are directly injected into `new RegExp()` without escaping special regex characters.

```js
// User can send: folder = "((((((((((a])*)*)*)*)*)*)*)*)*)*"
query.folderName = { $regex: new RegExp(`^${folder}$`, 'i') };

// User can send any regex pattern as search:
query.title = { $regex: search, $options: 'i' };
```

**Exploit Scenario:**
1. Attacker sends a request like `GET /api/resources?search=(((((.*)*)*)*)*)aaaa`
2. The regex engine enters catastrophic backtracking, freezing the Node.js event loop.
3. **Your entire server becomes unresponsive** for all users for seconds or minutes per malicious request.
4. A sustained attack can cause a complete Denial of Service.

---

## 🟠 HIGH-4: MongoDB Operator Injection via Query String

**File:** [resourceService.js L33](file:///d:/P/vault/exam-app/server/src/services/resourceService.js#L33)

**The Problem:**  
The `search` query parameter is passed directly into a MongoDB query without sanitization. Express can parse query strings as objects:

```js
// Attacker sends: GET /api/resources?search[$gt]=
// Express parses this as: search = { $gt: "" }
query.title = { $regex: search, $options: 'i' };
// This becomes: { title: { $regex: { $gt: "" }, $options: 'i' } }
```

**Exploit Scenario:**  
While immediate exploitation depends on Express query parser settings, this pattern is a known MongoDB injection vector. An attacker could potentially craft queries that return all documents, bypass filters, or cause errors that leak schema information.

---

## 🟡 MEDIUM-1: JWT Token Accepted via Query Parameter

**File:** [authMiddleware.js L14-15](file:///d:/P/vault/exam-app/server/src/middlewares/authMiddleware.js#L14-L16)

**The Problem:**  
The auth middleware accepts JWT tokens in the URL query string:

```js
} else if (req.query.token) {
  token = req.query.token;
}
```

**Exploit Scenario:**
1. JWT tokens in URLs get logged in:
   - Server access logs / Railway logs
   - Browser history
   - Proxy/CDN logs (Cloudflare, nginx)
   - Referer headers when navigating to external sites
2. An attacker with access to **any** of these logs can steal active sessions.
3. URLs with tokens can be accidentally shared (pasted in chat, screenshots, bookmarks).

---

## 🟡 MEDIUM-2: OTP Verification Has No Rate Limit

**File:** [authRoutes.js L63](file:///d:/P/vault/exam-app/server/src/routes/authRoutes.js#L63)

**The Problem:**  
While OTP *sending* is rate-limited (3 per 15 mins), OTP *verification* has **no rate limit**:

```js
router.post('/send-otp', otpLimiter, sendOtp);   // ← Rate limited
router.post('/verify-otp', verifyOtp);            // ← UNPROTECTED
```

**Exploit Scenario:**
1. Attacker triggers one OTP send (within the 3-attempt limit).
2. The OTP is 6 digits (100,000–999,999) — only 900,000 possibilities.
3. Attacker brute-forces `/verify-otp` with all 900,000 codes at high speed.
4. At 1000 requests/second, the entire keyspace is exhausted in **15 minutes** — well within the 10-minute OTP expiry.
5. Attacker gains `isVerifiedStudent = true` for any student email they control the domain of.

---

## 🟡 MEDIUM-3: Session Ping Has No Ownership Check

**File:** [authService.js L170-174](file:///d:/P/vault/exam-app/server/src/services/authService.js#L170-L174)

**The Problem:**  
The ping endpoint updates **any** session's `lastActiveAt` without verifying the authenticated user owns that session:

```js
export const pingUser = async ({ sessionId }) => {
  if (!sessionId) return { success: false };
  await Session.findByIdAndUpdate(sessionId, { lastActiveAt: new Date() });
  return { success: true };
};
```

**Exploit Scenario:**
1. Attacker (User A) discovers or guesses a valid sessionId belonging to User B.
2. Attacker repeatedly sends pings to keep User B's session artificially alive.
3. This prevents the janitor from closing User B's session, inflating their `totalActiveSeconds` and XP/level data.
4. Conversely, if session IDs are MongoDB ObjectIDs (predictable), an attacker could enumerate and manipulate many sessions.

---

## 🟡 MEDIUM-4: Feedback Endpoint Is Fully Unauthenticated & Abusable

**File:** [feedback.js](file:///d:/P/vault/exam-app/server/src/routes/feedback.js#L6-L28)

**The Problem:**  
The feedback submission endpoint requires **no authentication and no rate limiting**:

```js
router.get('/submit', async (req, res) => {
  const { rating, email } = req.query;
  await Feedback.create({ email, rating: parseInt(rating, 10) });
  res.redirect('https://vayl.in/');
});
```

**Exploit Scenario:**
1. Attacker sends thousands of requests: `GET /api/feedback/submit?rating=1&email=fake@x.com`
2. Database fills with fake feedback, destroying your average rating metric.
3. No input validation — `rating` could be NaN, negative, or 999999.
4. `email` is unsanitized — could contain scripts or very long strings.

---

## 🟡 MEDIUM-5: `folderName` Allows MongoDB Key Injection

**File:** [resourceService.js L11-16](file:///d:/P/vault/exam-app/server/src/services/resourceService.js#L11-L16)

**The Problem:**  
The `folderName` from user input is directly interpolated into a MongoDB update path:

```js
await User.findByIdAndUpdate(userId, {
  $inc: { 
    [`analytics.subjectDistribution.${folderName || 'Uncategorized'}`]: 1,
  }
});
```

**Exploit Scenario:**
1. Attacker creates a resource with: `folderName = "x.$inc.role"`
2. The MongoDB `$inc` path becomes `analytics.subjectDistribution.x.$inc.role`
3. While MongoDB rejects most path injection attempts, variations like `folderName = "__proto__"` or deeply nested keys could cause unexpected behavior or prototype pollution in serialized responses.

---

## 🔵 LOW-1: JWT Tokens Never Expire Practically (30-Day Lifespan)

**File:** [generateToken.js](file:///d:/P/vault/exam-app/server/src/utils/generateToken.js#L5-L7)

```js
return jwt.sign({ id }, JWT_SECRET, { expiresIn: '30d' });
```

**Risk:** If a token is stolen (via XSS, logs, shared computer), the attacker has 30 days of access. There is no mechanism to invalidate/revoke tokens server-side (no token blacklist).

---

## 🔵 LOW-2: Verbose Error Logging Leaks Sensitive Info

**Files:**
- [authService.js L75-76](file:///d:/P/vault/exam-app/server/src/services/authService.js#L75-L76) — Logs email fingerprint + password length on every login
- [authService.js L88](file:///d:/P/vault/exam-app/server/src/services/authService.js#L88) — Logs auth method, role, and whether password exists
- [authService.js L250](file:///d:/P/vault/exam-app/server/src/services/authService.js#L250) — Logs OTP codes in production

```js
console.log(`[Auth] Debug: Received password length: ${cleanPassword?.length || 0}`);
console.log(`[DEV] OTP for ${email}: ${code}`);
```

**Risk:** Railway logs are accessible to anyone with dashboard access. Password lengths help narrow brute-force attempts. OTP codes shouldn't be in production logs at all.

---

## 🔵 LOW-3: Google OAuth Callback Token Exposed in URL

**File:** [authRoutes.js L44](file:///d:/P/vault/exam-app/server/src/routes/authRoutes.js#L44)

```js
res.redirect(`${FRONTEND_URL}/login?token=${token}`);
```

**Risk:** After Google OAuth, the JWT is placed in the URL query string. This token appears in browser history, can be cached, and is visible in Referer headers if the login page loads external resources.

---

## Summary Table

| # | Severity | Title | Exploitability |
|---|----------|-------|---------------|
| C-1 | 🔴 CRITICAL | Public admin account takeover endpoint | Trivial — one GET request |
| C-2 | 🔴 CRITICAL | Admin bypass secret in login | Requires leaked env var |
| C-3 | 🔴 CRITICAL | Hardcoded credentials in source code | Requires code access |
| H-1 | 🟠 HIGH | No rate limiting on login/register | Trivial — automated tools |
| H-2 | 🟠 HIGH | Google access token leaked to client | Requires response interception |
| H-3 | 🟠 HIGH | ReDoS via unescaped regex | Trivial — crafted search query |
| H-4 | 🟠 HIGH | MongoDB operator injection | Moderate — depends on parser config |
| M-1 | 🟡 MEDIUM | JWT accepted via query param | Requires log/history access |
| M-2 | 🟡 MEDIUM | OTP verification has no rate limit | Trivial — brute-force 6-digit code |
| M-3 | 🟡 MEDIUM | Session ping has no ownership check | Requires valid session ID guess |
| M-4 | 🟡 MEDIUM | Unauthenticated feedback spam | Trivial — one curl command |
| M-5 | 🟡 MEDIUM | folderName allows key injection | Moderate — path traversal in keys |
| L-1 | 🔵 LOW | 30-day JWT with no revocation | Requires initial token theft |
| L-2 | 🔵 LOW | Verbose logging leaks sensitive info | Requires log access |
| L-3 | 🔵 LOW | OAuth token in URL redirect | Requires browser/log access |

---

> [!IMPORTANT]
> **Priority Action:** CRITICAL-1 (the public restore endpoint) should be disabled or removed **immediately**. It can be exploited by anyone with a web browser in under 5 seconds.
