import express from 'express';
import { getActivityHeatmap, getMonthlyStats } from '../controllers/analyticsController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/heatmap', getActivityHeatmap);
router.get('/monthly-stats', getMonthlyStats);

export default router;
