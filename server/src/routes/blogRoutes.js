import { Router } from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import { protectWriterOrAdmin } from '../middlewares/adminMiddleware.js';
import {
  getBlogs,
  getBlogBySlug,
  createBlog,
  addComment,
  getAllBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
} from '../controllers/blogController.js';

const router = Router();

// Public routes
router.get('/', getBlogs);

// Writer/Admin routes (must be before /:slug so they don't get intercepted)
router.get('/all', protectWriterOrAdmin, getAllBlogs);
router.get('/id/:id', protectWriterOrAdmin, getBlogById);
router.put('/:id', protectWriterOrAdmin, updateBlog);
router.delete('/:id', protectWriterOrAdmin, deleteBlog);

// Public dynamic slug route
router.get('/:slug', getBlogBySlug);

// Writer or Admin: create blog post
router.post('/', protectWriterOrAdmin, createBlog);

// Authenticated: add comment
router.post('/:slug/comments', protect, addComment);

export default router;
