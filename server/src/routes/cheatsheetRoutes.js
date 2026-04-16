import { Router } from 'express';
import { protectAdmin } from '../middlewares/adminMiddleware.js';
import {
  getPublicSections,
  getAdminSections,
  createSection,
  updateSection,
  deleteSection,
} from '../controllers/cheatsheetController.js';

const router = Router();

// Public
router.get('/', getPublicSections);

// Admin
router.get('/admin', protectAdmin, getAdminSections);
router.post('/', protectAdmin, createSection);
router.patch('/:id', protectAdmin, updateSection);
router.delete('/:id', protectAdmin, deleteSection);

export default router;
