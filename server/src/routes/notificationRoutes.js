import { Router } from 'express';
import { getUnreadNotifications, markAsRead, markAllAsRead } from '../controllers/notificationController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/', protect, getUnreadNotifications);
router.post('/read', protect, markAsRead);
router.post('/read-all', protect, markAllAsRead);

export default router;
