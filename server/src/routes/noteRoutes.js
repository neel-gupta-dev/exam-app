import { Router } from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import { createNote, getNotes, getWebClips } from '../controllers/noteController.js';

const router = Router();

router.use(protect);

router.post('/', createNote);
router.get('/web-clips/all', getWebClips);
router.get('/:resourceId', getNotes);

export default router;
