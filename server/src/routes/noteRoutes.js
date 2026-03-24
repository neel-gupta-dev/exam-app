import { Router } from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import { createNote, getNotes } from '../controllers/noteController.js';

const router = Router();

router.use(protect);

router.post('/', createNote);
router.get('/:resourceId', getNotes);

export default router;
