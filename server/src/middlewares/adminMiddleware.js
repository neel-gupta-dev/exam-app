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

/**
 * Writer or Admin guard — must be used AFTER protect middleware.
 * Allows both 'writer' and 'admin' roles (e.g. for blog creation).
 */
export const writerOrAdminOnly = asyncHandler(async (req, res, next) => {
  if (!req.user || !['admin', 'writer'].includes(req.user.role)) {
    res.status(403);
    throw new Error('Access denied: Writers and Admins only');
  }
  next();
});

/**
 * Coaching Admin guard — must be used AFTER protect middleware.
 * Allows both full admins and coaching admins.
 */
export const coachingAdminOnly = asyncHandler(async (req, res, next) => {
  if (!req.user || !['admin', 'coachingAdmin'].includes(req.user.role)) {
    res.status(403);
    throw new Error('Access denied: Coaching Admins only');
  }
  next();
});

// Convenience combos
export const protectAdmin = [protect, adminOnly];
export const protectWriterOrAdmin = [protect, writerOrAdminOnly];
export const protectCoachingAdmin = [protect, coachingAdminOnly];

