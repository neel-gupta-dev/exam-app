import { Router } from 'express';
import { protectAdmin } from '../middlewares/adminMiddleware.js';
import User from '../models/User.js';
import Session from '../models/Session.js';
import Resource from '../models/Resource.js';
import Feedback from '../models/Feedback.js';
import Note from '../models/Note.js';
import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';

/** Escape special regex characters in user input to prevent ReDoS */
const escapeRegex = (str) => String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const router = Router();

// All admin routes require auth + admin role
router.use(protectAdmin);

// ─── DASHBOARD ────────────────────────────────────────────────────────────────

/**
 * GET /api/admin/stats
 * Returns aggregate counts for the dashboard overview.
 */
router.get('/stats', asyncHandler(async (req, res) => {
  const [totalUsers, totalSessions, activeSessions, totalResources, totalFeedback, adminCount, googleUsers, localUsers] = await Promise.all([
    User.countDocuments(),
    Session.countDocuments(),
    Session.countDocuments({ logoutAt: null }),
    Resource.countDocuments(),
    Feedback.countDocuments(),
    User.countDocuments({ role: 'admin' }),
    User.countDocuments({ authMethod: 'google' }),
    User.countDocuments({ authMethod: 'local' }),
  ]);

  // Top 5 users by totalActiveSeconds
  const topUsers = await User.find()
    .sort({ totalActiveSeconds: -1 })
    .limit(5)
    .select('name email totalActiveSeconds currentStreak level');

  // Recent registrations (last 7 days)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recentSignups = await User.countDocuments({ createdAt: { $gte: sevenDaysAgo } });

  res.json({
    totalUsers,
    totalSessions,
    activeSessions,
    totalResources,
    totalFeedback,
    adminCount,
    googleUsers,
    localUsers,
    recentSignups,
    topUsers,
  });
}));

// ─── USERS ────────────────────────────────────────────────────────────────────

/**
 * GET /api/admin/users
 * List all users with pagination and search.
 * Query params: page, limit, search, role, authMethod
 */
router.get('/users', asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, parseInt(req.query.limit) || 25);
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.search) {
    const re = new RegExp(escapeRegex(req.query.search), 'i');
    filter.$or = [{ name: re }, { email: re }, { vaultId: re }];
  }
  if (req.query.role) filter.role = req.query.role;
  if (req.query.authMethod) filter.authMethod = req.query.authMethod;

  const [users, total] = await Promise.all([
    User.find(filter)
      .select('-password -googleAccessToken -googleRefreshToken')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments(filter),
  ]);

  res.json({ users, total, page, pages: Math.ceil(total / limit) });
}));

/**
 * GET /api/admin/users/:id
 * Full user detail including sessions and resource count.
 */
router.get('/users/:id', asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400); throw new Error('Invalid user ID');
  }
  const user = await User.findById(req.params.id).select('-password -googleAccessToken -googleRefreshToken');
  if (!user) { res.status(404); throw new Error('User not found'); }

  const [sessions, resourceCount, noteCount] = await Promise.all([
    Session.find({ userId: user._id }).sort({ loginAt: -1 }).limit(20),
    Resource.countDocuments({ userId: user._id }),
    Note.countDocuments({ userId: user._id }),
  ]);

  res.json({ user, sessions, resourceCount, noteCount });
}));

/**
 * PATCH /api/admin/users/:id/role
 * Change user role between 'student' and 'admin'.
 */
router.patch('/users/:id/role', asyncHandler(async (req, res) => {
  const { role } = req.body;
  if (!['student', 'admin'].includes(role)) {
    res.status(400); throw new Error('Invalid role. Must be student or admin.');
  }
  // Prevent self-demotion
  if (req.params.id === req.user._id.toString() && role !== 'admin') {
    res.status(400); throw new Error('You cannot demote yourself.');
  }
  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
  if (!user) { res.status(404); throw new Error('User not found'); }
  res.json({ message: `Role updated to ${role}`, user });
}));

/**
 * PATCH /api/admin/users/:id/ban
 * Toggle isOnboarded flag as a soft "ban" mechanism (blocks access to main app).
 * A more robust ban field can be added to the User model later.
 */
router.patch('/users/:id', asyncHandler(async (req, res) => {
  const allowed = ['name', 'email', 'role', 'isVerifiedStudent', 'isOnboarded', 'targetExam', 'targetYear'];
  const updates = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }
  const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-password');
  if (!user) { res.status(404); throw new Error('User not found'); }
  res.json(user);
}));

/**
 * DELETE /api/admin/users/:id
 * Permanently delete a user and all their data.
 */
router.delete('/users/:id', asyncHandler(async (req, res) => {
  if (req.params.id === req.user._id.toString()) {
    res.status(400); throw new Error('You cannot delete your own account via admin panel.');
  }
  const user = await User.findById(req.params.id);
  if (!user) { res.status(404); throw new Error('User not found'); }

  // Cascade delete user data
  await Promise.all([
    Session.deleteMany({ userId: user._id }),
    Resource.deleteMany({ userId: user._id }),
    Note.deleteMany({ userId: user._id }),
    User.deleteOne({ _id: user._id }),
  ]);

  res.json({ message: `User ${user.email} and all their data have been deleted.` });
}));

// ─── SESSIONS ─────────────────────────────────────────────────────────────────

/**
 * GET /api/admin/sessions
 * All sessions paginated. Query: page, limit, active (true/false), userId
 */
router.get('/sessions', asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, parseInt(req.query.limit) || 25);
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.active === 'true') filter.logoutAt = null;
  if (req.query.active === 'false') filter.logoutAt = { $ne: null };
  if (req.query.userId) filter.userId = req.query.userId;

  const [sessions, total] = await Promise.all([
    Session.find(filter)
      .populate('userId', 'name email')
      .sort({ loginAt: -1 })
      .skip(skip)
      .limit(limit),
    Session.countDocuments(filter),
  ]);

  res.json({ sessions, total, page, pages: Math.ceil(total / limit) });
}));

/**
 * DELETE /api/admin/sessions/:id
 * Force-close (end) an active session.
 */
router.delete('/sessions/:id', asyncHandler(async (req, res) => {
  const session = await Session.findById(req.params.id);
  if (!session) { res.status(404); throw new Error('Session not found'); }
  session.logoutAt = new Date();
  session.lastActiveAt = session.logoutAt;
  await session.save();
  res.json({ message: 'Session force-closed.' });
}));

// ─── RESOURCES ────────────────────────────────────────────────────────────────

/**
 * GET /api/admin/resources
 * All resources across all users. Query: page, limit, type, search
 */
router.get('/resources', asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, parseInt(req.query.limit) || 25);
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.type) filter.type = req.query.type;
  if (req.query.search) {
    const re = new RegExp(escapeRegex(req.query.search), 'i');
    filter.$or = [{ title: re }, { folderName: re }];
  }

  const [resources, total] = await Promise.all([
    Resource.find(filter)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Resource.countDocuments(filter),
  ]);

  res.json({ resources, total, page, pages: Math.ceil(total / limit) });
}));

/**
 * DELETE /api/admin/resources/:id
 */
router.delete('/resources/:id', asyncHandler(async (req, res) => {
  const r = await Resource.findByIdAndDelete(req.params.id);
  if (!r) { res.status(404); throw new Error('Resource not found'); }
  res.json({ message: 'Resource deleted.' });
}));

// ─── FEEDBACK ─────────────────────────────────────────────────────────────────

/**
 * GET /api/admin/feedback
 */
router.get('/feedback', asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = parseInt(req.query.limit) || 25;
  const skip = (page - 1) * limit;

  const [feedback, total] = await Promise.all([
    Feedback.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
    Feedback.countDocuments(),
  ]);

  // Avg rating
  const agg = await Feedback.aggregate([{ $group: { _id: null, avg: { $avg: '$rating' } } }]);
  const avgRating = agg[0]?.avg?.toFixed(2) || 'N/A';

  res.json({ feedback, total, page, pages: Math.ceil(total / limit), avgRating });
}));

/**
 * DELETE /api/admin/feedback/:id
 */
router.delete('/feedback/:id', asyncHandler(async (req, res) => {
  const f = await Feedback.findByIdAndDelete(req.params.id);
  if (!f) { res.status(404); throw new Error('Feedback not found'); }
  res.json({ message: 'Feedback deleted.' });
}));

export default router;
