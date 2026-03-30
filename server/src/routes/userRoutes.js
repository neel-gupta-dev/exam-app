import { Router } from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import { updateProfile, updateConfidence, logSearch, updateHeartbeat } from '../controllers/userController.js';

const router = Router();

router.use(protect);

router.patch('/profile', updateProfile);
router.post('/confidence', updateConfidence);
router.post('/search-log', logSearch);
router.post('/heartbeat', updateHeartbeat);

export default router;
