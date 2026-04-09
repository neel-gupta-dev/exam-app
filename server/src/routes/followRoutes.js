import { Router } from 'express';
import { toggleFollow, getFollowStatus } from '../controllers/followController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = Router();

// Both routes require the user to be logged in
router.post('/toggle', protect, toggleFollow);
router.get('/status/:vaultId', protect, getFollowStatus);

export default router;
