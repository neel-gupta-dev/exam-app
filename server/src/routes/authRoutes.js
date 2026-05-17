import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { register, login, ping, logout, sendOtp, verifyOtp, onboard, getMe, updateProfile, updatePassword, sendSignupOtp, verifySignupOtp } from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';
import passport from 'passport';
import generateToken from '../utils/generateToken.js';

const router = Router();

// --- Google OAuth ---
router.get('/google', (req, res, next) => {
  const scope = ['profile', 'email'];
  
  // Conditionally add classroom or calendar scopes if requested via query param
  if (req.query.classroom === 'true') {
    scope.push(
      'https://www.googleapis.com/auth/classroom.courses.readonly',
      'https://www.googleapis.com/auth/classroom.coursework.me.readonly',
      'https://www.googleapis.com/auth/classroom.announcements.readonly',
      'https://www.googleapis.com/auth/classroom.courseworkmaterials.readonly'
    );
  }

  if (req.query.calendar === 'true') {
    scope.push(
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events'
    );
  }

  // Store the origin in a short-lived cookie so the callback knows where to redirect.
  // We cannot use Google's `state` param because Passport consumes it for CSRF.
  const origin = req.query.origin || 'main';
  res.cookie('oauth_origin', origin, {
    httpOnly: true,
    maxAge: 5 * 60 * 1000, 
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });

  const sharedTestId = req.query.shared_test_id;
  if (sharedTestId) {
    res.cookie('oauth_shared_test_id', sharedTestId, {
      httpOnly: true,
      maxAge: 5 * 60 * 1000,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });
  }

  passport.authenticate('google', { 
    scope,
    accessType: 'offline',
    prompt: req.query.classroom === 'true' ? 'consent' : undefined,
  })(req, res, next);
});

import { FRONTEND_URL } from '../config/index.js';

const BATTLE_FRONTEND_URL = process.env.BATTLE_FRONTEND_URL || 
  (process.env.NODE_ENV === 'production' ? 'https://battle.vayl.in' : 'http://localhost:3001');

const TESTS_FRONTEND_URL = process.env.TESTS_FRONTEND_URL || 
  (process.env.NODE_ENV === 'production' ? 'https://tests.vayl.in' : 'http://localhost:5173');

router.get('/google/callback', 
  passport.authenticate('google', { session: false, failureRedirect: FRONTEND_URL }),
  (req, res) => {
    const token = generateToken(req.user._id);

    // Read origin from the cookie we set before the redirect
    const origin = req.cookies?.oauth_origin;

    // Clear the cookie immediately — single use
    res.clearCookie('oauth_origin');

    // SECURITY: Use hash fragments (#token=) instead of query params (?token=).
    // Hash fragments are never sent to the server in HTTP requests, so they
    // won't appear in CDN/proxy access logs, Referer headers, or server logs.
    if (origin === 'battle') {
      return res.redirect(`${BATTLE_FRONTEND_URL}/#token=${token}`);
    }

    if (origin === 'test') {
      const sharedTestId = req.cookies?.oauth_shared_test_id;
      res.clearCookie('oauth_shared_test_id');
      
      let url = `${TESTS_FRONTEND_URL}/`;
      // SECURITY: Validate sharedTestId is a valid MongoDB ObjectId (24 hex chars)
      // before injecting into URL — prevents query string injection / open redirect
      if (sharedTestId && /^[a-f0-9]{24}$/i.test(sharedTestId)) {
        url += `?shared_test_id=${sharedTestId}`;
      }
      return res.redirect(`${url}#token=${token}`);
    }

    // Default: redirect to main frontend
    res.redirect(`${FRONTEND_URL}/login#token=${token}`);
  }
);


// Rate limiter for OTP send: 3 requests per IP per 15 minutes
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  message: { message: 'Too many OTP requests, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for login: 10 attempts per IP per 1 hour
const loginLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { message: 'Too many login attempts, please try again after 1 hour' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for registration: 3 accounts per IP per 1 hour
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: { message: 'Too many accounts created, please try again after 1 hour' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for OTP verification: 10 attempts per IP per 15 minutes
const otpVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Too many verification attempts, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/register', registerLimiter, register);
router.post('/login', loginLimiter, login);
router.post('/ping', protect, ping);
router.post('/logout', protect, logout);
router.post('/send-otp', otpLimiter, sendOtp);
router.post('/verify-otp', otpVerifyLimiter, verifyOtp);
router.post('/send-signup-otp', otpLimiter, sendSignupOtp);
router.post('/verify-signup-otp', otpVerifyLimiter, verifySignupOtp);
router.patch('/onboard', protect, onboard);
router.get('/me', protect, getMe);
router.patch('/profile', protect, updateProfile);
router.patch('/password', protect, updatePassword);


export default router;
