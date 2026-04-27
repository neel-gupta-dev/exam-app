import { Router } from 'express';
import { protectAdmin } from '../middlewares/adminMiddleware.js';
import User from '../models/User.js';
import Session from '../models/Session.js';
import Resource from '../models/Resource.js';
import Feedback from '../models/Feedback.js';
import Note from '../models/Note.js';
import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import { getDashboardStats, getUserAnalytics } from '../controllers/adminController.js';
import { sendFeedbackEmail } from '../utils/mailer.js';

/** Escape special regex characters in user input to prevent ReDoS */
const escapeRegex = (str) => String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const router = Router();

// ─── EMAIL BLAST (TEMPORARILY OPEN) ─────────────────────────────────────────

/**
 * GET /api/admin/trigger-feedback-blast
 * Sends a mass feedback request email to all users in the background.
 */
router.get('/trigger-feedback-blast', asyncHandler(async (req, res) => {
  res.json({ message: 'Feedback email blast started in the background. This may take several minutes.' });
  
  // Background execution to prevent Vercel/Railway HTTP timeouts
  setTimeout(async () => {
    try {
      // Find all users (including admins)
      const users = await User.find({ email: { $exists: true, $ne: '' } }).select('email name');
      
      console.log(`[Email Blast] Starting blast to ${users.length} users.`);
      let successCount = 0;
      
      for (const user of users) {
        const success = await sendFeedbackEmail(user.email, user.name);
        if (success) successCount++;
        // 1-second delay to respect Zoho/SMTP rate limits
        await new Promise(r => setTimeout(r, 1000));
      }
      
      console.log(`[Email Blast] Completed. Successfully sent ${successCount}/${users.length} emails.`);
    } catch (err) {
      console.error('[Email Blast] Failed:', err);
    }
  }, 0);
}));

// All admin routes require auth + admin role
router.use(protectAdmin);

// ─── DASHBOARD ────────────────────────────────────────────────────────────────

/**
 * GET /api/admin/stats
 * Returns aggregate counts for the dashboard overview.
 */
router.get('/stats', getDashboardStats);

// ─── USERS ────────────────────────────────────────────────────────────────────

/**
 * GET /api/admin/users
 * List all users with pagination and search.
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
 * GET /api/admin/users/:userId/analytics
 * Detailed deep-dive for a specific user
 */
router.get('/users/:userId/analytics', getUserAnalytics);

/**
 * GET /api/admin/users/:id
 * Full user detail (Legacy support - though we'll likely use analytics now)
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
 * Change user role
 */
router.patch('/users/:id/role', asyncHandler(async (req, res) => {
  const { role } = req.body;
  if (!['student', 'admin', 'coachingAdmin'].includes(role)) {
    res.status(400); throw new Error('Invalid role. Must be student, admin, or coachingAdmin.');
  }
  if (req.params.id === req.user._id.toString() && role !== 'admin') {
    res.status(400); throw new Error('You cannot demote yourself.');
  }
  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
  if (!user) { res.status(404); throw new Error('User not found'); }
  res.json({ message: `Role updated to ${role}`, user });
}));

/**
 * PATCH /api/admin/users/:id
 * Soft ban mechanism
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
 * Delete user data
 */
router.delete('/users/:id', asyncHandler(async (req, res) => {
  if (req.params.id === req.user._id.toString()) {
    res.status(400); throw new Error('You cannot delete your own account via admin panel.');
  }
  const user = await User.findById(req.params.id);
  if (!user) { res.status(404); throw new Error('User not found'); }

  await Promise.all([
    Session.deleteMany({ userId: user._id }),
    Resource.deleteMany({ userId: user._id }),
    Note.deleteMany({ userId: user._id }),
    User.deleteOne({ _id: user._id }),
  ]);

  res.json({ message: `User ${user.email} and all their data have been deleted.` });
}));

// ─── SESSIONS, RESOURCES, FEEDBACK ─────────────────────────────────────────────
// (Keep existing implementations or further refactor to adminController as needed)

router.get('/sessions', asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, parseInt(req.query.limit) || 25);
  const skip = (page - 1) * limit;
  const filter = {};
  if (req.query.active === 'true') filter.logoutAt = null;
  if (req.query.active === 'false') filter.logoutAt = { $ne: null };
  if (req.query.userId) filter.userId = req.query.userId;

  const [sessions, total] = await Promise.all([
    Session.find(filter).populate('userId', 'name email').sort({ loginAt: -1 }).skip(skip).limit(limit),
    Session.countDocuments(filter),
  ]);
  res.json({ sessions, total, page, pages: Math.ceil(total / limit) });
}));

router.delete('/sessions/:id', asyncHandler(async (req, res) => {
  const session = await Session.findById(req.params.id);
  if (!session) { res.status(404); throw new Error('Session not found'); }
  session.logoutAt = new Date();
  session.lastActiveAt = session.logoutAt;
  await session.save();
  res.json({ message: 'Session force-closed.' });
}));

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
    Resource.find(filter).populate('userId', 'name email').sort({ createdAt: -1 }).skip(skip).limit(limit),
    Resource.countDocuments(filter),
  ]);
  res.json({ resources, total, page, pages: Math.ceil(total / limit) });
}));

router.delete('/resources/:id', asyncHandler(async (req, res) => {
  const r = await Resource.findByIdAndDelete(req.params.id);
  if (!r) { res.status(404); throw new Error('Resource not found'); }
  res.json({ message: 'Resource deleted.' });
}));

router.get('/feedback', asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = parseInt(req.query.limit) || 25;
  const skip = (page - 1) * limit;
  const [feedback, total] = await Promise.all([
    Feedback.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
    Feedback.countDocuments(),
  ]);
  const agg = await Feedback.aggregate([{ $group: { _id: null, avg: { $avg: '$rating' } } }]);
  const avgRating = agg[0]?.avg?.toFixed(2) || 'N/A';
  res.json({ feedback, total, page, pages: Math.ceil(total / limit), avgRating });
}));

router.delete('/feedback/:id', asyncHandler(async (req, res) => {
  const f = await Feedback.findByIdAndDelete(req.params.id);
  if (!f) { res.status(404); throw new Error('Feedback not found'); }
  res.json({ message: 'Feedback deleted.' });
}));

export default router;
