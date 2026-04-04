import asyncHandler from 'express-async-handler';
import { protect } from './authMiddleware.js';

/**
 * Admin guard — must be used AFTER protect middleware.
 * Rejects non-admin users with 403.
 */
export const adminOnly = asyncHandler(async (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Access denied: Admins only');
  }
  next();
});

// Convenience combo: protect + adminOnly
export const protectAdmin = [protect, adminOnly];
