import express from 'express';
import {
  getChapterList,
  updateChapterList
} from '../controllers/chapterListController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/:subject')
  .get(getChapterList)
  .put(updateChapterList);

export default router;
