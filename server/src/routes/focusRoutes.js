import express from 'express';
import { startFocus, endFocus, getFocusStats } from '../controllers/focusController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/start', startFocus);
router.patch('/end/:id', endFocus);
router.post('/end/:id', endFocus); // For navigator.sendBeacon
router.get('/stats', getFocusStats);

export default router;
