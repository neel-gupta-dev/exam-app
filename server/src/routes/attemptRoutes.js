import { Router } from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import {
  startAttempt,
  syncAttempt,
  submitAttempt,
  forceSubmitAttempt,
} from '../controllers/attemptController.js';

const router = Router();

// Start or resume an attempt
router.post('/:testId/start', protect, startAttempt);

// Auto-save progress
router.patch('/:attemptId/sync', protect, syncAttempt);

// Submit and grade
router.post('/:attemptId/submit', protect, submitAttempt);

// Force-submit (anti-cheat: 4th tab switch)
router.post('/:attemptId/force-submit', protect, forceSubmitAttempt);

export default router;
