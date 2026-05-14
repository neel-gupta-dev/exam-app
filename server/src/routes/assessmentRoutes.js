import { Router } from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import {
  startAssessment,
  syncAssessment,
  submitAssessment,
  getMyAssessmentResults,
  getTestLeaderboard,
  getAssessmentReview,
} from '../controllers/assessmentController.js';
import asyncHandler from 'express-async-handler';
import Doubt from '../models/Doubt.js';

const router = Router();

router.route('/results').get(protect, getMyAssessmentResults);
router.route('/attempts/:attemptId/review').get(protect, getAssessmentReview);
router.route('/:testId/leaderboard').get(protect, getTestLeaderboard);
router.route('/:testId/start').get(protect, startAssessment);
router.route('/:testId/sync').post(protect, syncAssessment);
router.route('/:testId/submit').post(protect, submitAssessment);

/**
 * @route   POST /assessment/doubts
 * @desc    Raise a doubt on a specific question from the review screen
 * @access  Private
 */
router.post('/doubts', protect, asyncHandler(async (req, res) => {
  const { questionId, testId, attemptId, message } = req.body;
  if (!questionId || !testId || !attemptId) {
    res.status(400);
    throw new Error('questionId, testId, and attemptId are required');
  }

  const doubt = await Doubt.findOneAndUpdate(
    { userId: req.user._id, questionId, attemptId },
    { userId: req.user._id, questionId, testId, attemptId, message: message || '' },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  res.status(201).json(doubt);
}));

export default router;

