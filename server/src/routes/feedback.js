import express from 'express';
const router = express.Router();
import Feedback from '../models/Feedback.js';
import rateLimit from 'express-rate-limit';
import { FRONTEND_URL } from '../config/index.js';

// Rate limiter: 5 feedback submissions per IP per 15 minutes
const feedbackLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { message: 'Too many feedback submissions, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Route: GET /api/feedback/submit
router.get('/submit', feedbackLimiter, async (req, res) => {
  const { rating, email } = req.query;

  // Validate inputs
  const parsedRating = parseInt(rating, 10);
  if (!rating || !email || isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
    return res.redirect(`${FRONTEND_URL}/feedback-error`);
  }

  // Basic email format check & length limit
  const cleanEmail = String(email).slice(0, 254).toLowerCase().trim();
  if (!cleanEmail.includes('@')) {
    return res.redirect(`${FRONTEND_URL}/feedback-error`);
  }

  try {
    await Feedback.create({
      email: cleanEmail,
      rating: parsedRating
    });

    res.redirect(`${FRONTEND_URL}/`);

  } catch (error) {
    console.error("Feedback API error:", error);
    res.redirect(`${FRONTEND_URL}/feedback-error`);
  }
});

export default router;