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

  passport.authenticate('google', { 
    scope,
    accessType: 'offline',
    prompt: req.query.classroom === 'true' ? 'consent' : undefined
  })(req, res, next);
});

import { FRONTEND_URL } from '../config/index.js';

router.get('/google/callback', 
  passport.authenticate('google', { session: false, failureRedirect: FRONTEND_URL }),
  (req, res) => {
    const token = generateToken(req.user._id);
    res.redirect(`${FRONTEND_URL}/login?token=${token}`);
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
