import { Router } from 'express';
import { protectCoachingAdmin } from '../middlewares/adminMiddleware.js';
import {
  getCoachingResults,
  getTestSummary,
  getCoachingStudents,
} from '../controllers/coachingAdminController.js';

const router = Router();

// All coaching admin routes require auth + (admin OR coachingAdmin) role
router.use(protectCoachingAdmin);

router.get('/results', getCoachingResults);
router.get('/results/:testId/summary', getTestSummary);
router.get('/students', getCoachingStudents);

export default router;
