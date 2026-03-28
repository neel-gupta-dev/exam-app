import express from 'express';
const router = express.Router();
import Feedback from '../models/Feedback.js';

// Route: GET /api/feedback/submit
router.get('/submit', async (req, res) => {
  const { rating, email } = req.query;

  // 1. Check if data is missing
  if (!rating || !email) {
    return res.redirect('https://vayl-app.vercel.app/feedback-error');
  }

  try {
    // 2. Save the rating to MongoDB
    await Feedback.create({
      email: email,
      rating: parseInt(rating, 10)
    });

    // 3. Redirect to your Vercel frontend Success Page
    res.redirect('https://vayl-app.vercel.app/');

  } catch (error) {
    console.error("Feedback API error:", error);
    res.redirect('https://vayl-app.vercel.app/feedback-error');
  }
});

export default router;