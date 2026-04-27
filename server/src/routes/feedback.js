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

  const errorHtml = `
    <html>
      <head><title>Feedback Error</title></head>
      <body style="text-align:center; padding: 50px; font-family: sans-serif; background: #0a0a0f; color: #fff;">
        <h2>Something went wrong processing your feedback.</h2>
        <p>Please close this tab and try again.</p>
        <script>setTimeout(() => window.close(), 3000);</script>
      </body>
    </html>
  `;

  // Validate inputs
  const parsedRating = parseInt(rating, 10);
  if (!rating || !email || isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
    return res.status(400).send(errorHtml);
  }

  // Basic email format check & length limit
  const cleanEmail = String(email).slice(0, 254).toLowerCase().trim();
  if (!cleanEmail.includes('@')) {
    return res.status(400).send(errorHtml);
  }

  try {
    await Feedback.create({
      email: cleanEmail,
      rating: parsedRating
    });

    res.send(`
      <html>
        <head><title>Feedback Received</title></head>
        <body style="text-align:center; padding: 50px; font-family: sans-serif; background: #0a0a0f; color: #fff;">
          <h1 style="color: #FFD700; font-size: 50px; margin-bottom: 20px;">★</h1>
          <h2>Thank you for your feedback!</h2>
          <p style="color: #999;">Your rating of ${parsedRating}/5 has been recorded.</p>
          <p>You can safely close this page.</p>
          <script>setTimeout(() => window.close(), 3000);</script>
        </body>
      </html>
    `);

  } catch (error) {
    console.error("Feedback API error:", error);
    res.status(500).send(errorHtml);
  }
});

export default router;