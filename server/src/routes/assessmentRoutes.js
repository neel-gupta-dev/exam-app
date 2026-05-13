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

const router = Router();

router.route('/results').get(protect, getMyAssessmentResults);
router.route('/attempts/:attemptId/review').get(protect, getAssessmentReview);
router.route('/:testId/leaderboard').get(protect, getTestLeaderboard);
router.route('/:testId/start').get(protect, startAssessment);
router.route('/:testId/sync').post(protect, syncAssessment);
router.route('/:testId/submit').post(protect, submitAssessment);

export default router;
