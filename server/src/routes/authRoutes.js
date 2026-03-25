import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { register, login, ping, logout, sendOtp, verifyOtp, onboard, getMe, updateProfile, updatePassword } from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = Router();

// Rate limiter for OTP endpoint: 3 requests per IP per 15 minutes
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  message: { message: 'Too many OTP requests, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/register', register);
router.post('/login', login);
router.post('/ping', protect, ping);
router.post('/logout', protect, logout);
router.post('/send-otp', otpLimiter, sendOtp);
router.post('/verify-otp', verifyOtp);
router.patch('/onboard', protect, onboard);
router.get('/me', protect, getMe);
router.patch('/profile', protect, updateProfile);
router.patch('/password', protect, updatePassword);

export default router;
