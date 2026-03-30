import express from 'express';
import { addTestMark, getTestMarks, deleteTestMark } from '../controllers/performanceController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Private routes protected by authMiddleware
router.route('/marks')
  .get(protect, getTestMarks)
  .post(protect, addTestMark);

router.route('/marks/:id')
  .delete(protect, deleteTestMark);

export default router;
