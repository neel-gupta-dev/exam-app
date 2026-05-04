import { Router } from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import { protectWriterOrAdmin } from '../middlewares/adminMiddleware.js';
import {
  getBlogs,
  getBlogBySlug,
  createBlog,
  addComment,
} from '../controllers/blogController.js';

const router = Router();

// Public routes
router.get('/', getBlogs);
router.get('/:slug', getBlogBySlug);

// Writer or Admin: create blog post
router.post('/', protectWriterOrAdmin, createBlog);

// Authenticated: add comment
router.post('/:slug/comments', protect, addComment);

export default router;
