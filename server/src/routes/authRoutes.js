import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { register, login, sendOtp, verifyOtp, onboard } from '../controllers/authController.js';
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
router.post('/send-otp', otpLimiter, sendOtp);
router.post('/verify-otp', verifyOtp);
router.patch('/onboard', protect, onboard);

export default router;
