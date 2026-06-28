import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { protectAdmin, superAdminOnly } from '../middlewares/adminMiddleware.js';
import User from '../models/User.js';
import Session from '../models/Session.js';
import Resource from '../models/Resource.js';
import Feedback from '../models/Feedback.js';
import Note from '../models/Note.js';
import Blog from '../models/Blog.js';
import ActivityLog from '../models/ActivityLog.js';
import Battle from '../models/Battle.js';
import BattleLeaderboard from '../models/BattleLeaderboard.js';
import ChapterList from '../models/ChapterList.js';
import Deck from '../models/Deck.js';
import Flashcard from '../models/Flashcard.js';
import FocusSession from '../models/FocusSession.js';
import Follow from '../models/Follow.js';
import Group from '../models/Group.js';
import Notification from '../models/Notification.js';
import TestAttempt from '../models/TestAttempt.js';
import UserCardProgress from '../models/UserCardProgress.js';
import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import { getDashboardStats, getUserAnalytics, getTestTelemetry, getTestQuestionAnalytics } from '../controllers/adminController.js';
import { sendFeedbackEmail } from '../utils/mailer.js';
import multer from 'multer';
import Cutoff from '../models/Cutoff.js';
import BattleQuestion from '../models/BattleQuestion.js';
import UpcomingExam from '../models/UpcomingExam.js';
import { parseExcelBuffer } from '../utils/excelParser.js';
import * as shortLinkController from '../controllers/shortLinkController.js';

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 16 * 1024 * 1024 } // 16 MB limit
});

/** Escape special regex characters in user input to prevent ReDoS */
const escapeRegex = (str) => String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const router = Router();

// All admin routes require auth + admin role
router.use(protectAdmin);

// ─── DASHBOARD ────────────────────────────────────────────────────────────────

/**
 * GET /api/admin/live-exams
 * Returns all active (in-progress) test attempts with their current time left.
 */
router.get('/live-exams', asyncHandler(async (req, res) => {
  const attempts = await TestAttempt.find({ status: 'in-progress' })
    .populate('userId', 'name email')
    .populate('testId', 'title durationMinutes')
    .sort({ startedAt: -1 })
    .lean();

  const liveAttempts = attempts.map(attempt => {
    let timeLeft = 0;
    if (attempt.startedAt && attempt.testId && attempt.testId.durationMinutes) {
      const elapsedSeconds = Math.floor((Date.now() - new Date(attempt.startedAt).getTime()) / 1000);
      timeLeft = Math.max(0, (attempt.testId.durationMinutes * 60) - elapsedSeconds);
    }
    return { ...attempt, timeLeft };
  });
    
  res.json({ liveAttempts });
}));

/**
 * GET /api/admin/stats
 * Returns aggregate counts for the dashboard overview.
 */
router.get('/stats', getDashboardStats);
router.get('/test-telemetry', getTestTelemetry);
router.get('/tests/:testId/question-analytics', getTestQuestionAnalytics);

// ── Link Shortener Management ────────────────────────────────────────────────
router.post('/short-links', shortLinkController.createShortLink);
router.get('/short-links', shortLinkController.getAllShortLinks);
router.delete('/short-links/:id', shortLinkController.deleteShortLink);

import { getUrlMetadata } from '../controllers/publicController.js';
router.get('/metadata-proxy', getUrlMetadata);

// ─── EMAIL BLAST ─────────────────────────────────────────────────────────────

/**
 * GET /api/admin/trigger-feedback-blast
 * Sends a mass feedback request email to all users.
 */
router.get('/trigger-feedback-blast', superAdminOnly, asyncHandler(async (req, res) => {
  try {
    // Find all users (including admins)
    const users = await User.find({ email: { $exists: true, $ne: '' } }).select('email name');
    
    console.log(`[Email Blast] Starting blast to ${users.length} users.`);
    let successCount = 0;
    
    for (const user of users) {
      const success = await sendFeedbackEmail(user.email, user.name);
      if (success) successCount++;
      // 100ms delay to prevent overwhelming ZeptoMail
      await new Promise(r => setTimeout(r, 100));
    }
    
    console.log(`[Email Blast] Completed. Successfully sent ${successCount}/${users.length} emails.`);
    res.json({ message: `Blast completed! Sent ${successCount} out of ${users.length} emails.` });
  } catch (err) {
    console.error('[Email Blast] Failed:', err);
    res.status(500).json({ message: 'Failed to send blast', error: err.message });
  }
}));

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
  if (req.query.role) filter.role = String(req.query.role);
  if (req.query.authMethod) filter.authMethod = String(req.query.authMethod);
  if (req.query.isOnboarded) filter.isOnboarded = req.query.isOnboarded === 'true';
  if (req.query.targetExam) filter.targetExam = { $in: [String(req.query.targetExam)] };

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
 * GET /api/admin/writers
 * List all users with the 'writer' or 'admin' role along with their post counts.
 */
router.get('/writers', asyncHandler(async (req, res) => {
  // Find users who have either writer or admin roles
  const writers = await User.find({ role: { $in: ['writer', 'admin'] } })
    .select('name email role createdAt lastActiveAt');

  // For each writer, fetch their total published blog count.
  // We match based on author name for now, as Blog uses `author` string.
  // Ideally, Blog model should have a `userId` reference, but since it has `author` (String):
  const writerStats = await Promise.all(
    writers.map(async (writer) => {
      const postCount = await Blog.countDocuments({ author: writer.name });
      return {
        ...writer.toObject(),
        postCount
      };
    })
  );

  res.json(writerStats);
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
router.patch('/users/:id/role', superAdminOnly, asyncHandler(async (req, res) => {
  const { role } = req.body;
  if (!['student', 'writer', 'admin', 'subAdmin', 'coachingAdmin'].includes(role)) {
    res.status(400); throw new Error('Invalid role. Must be student, writer, admin, subAdmin, or coachingAdmin.');
  }
  if (req.params.id === req.user._id.toString() && role !== 'admin') {
    res.status(400); throw new Error('You cannot demote yourself.');
  }
  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password -googleAccessToken -googleRefreshToken');
  if (!user) { res.status(404); throw new Error('User not found'); }
  res.json({ message: `Role updated to ${role}`, user });
}));

/**
 * POST /api/admin/users/:id/set-password
 * Set password for Google-only users so they can log into the admin panel
 */
router.post('/users/:id/set-password', superAdminOnly, asyncHandler(async (req, res) => {
  const { password } = req.body;
  if (!password || password.length < 8) {
    res.status(400); throw new Error('Password must be at least 8 characters long');
  }
  const user = await User.findById(req.params.id);
  if (!user) { res.status(404); throw new Error('User not found'); }
  
  user.password = password; // pre-save hook will hash it
  await user.save();
  
  res.json({ message: 'Password set successfully for user' });
}));

/**
 * PATCH /api/admin/users/:id
 * Soft ban mechanism
 */
router.patch('/users/:id', superAdminOnly, asyncHandler(async (req, res) => {
  const allowed = ['name', 'email', 'role', 'isVerifiedStudent', 'isOnboarded', 'targetExam', 'targetYear'];
  const updates = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }
  const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-password -googleAccessToken -googleRefreshToken');
  if (!user) { res.status(404); throw new Error('User not found'); }
  res.json(user);
}));

/**
 * DELETE /api/admin/users/:id
 * Delete user data
 */
router.delete('/users/:id', superAdminOnly, asyncHandler(async (req, res) => {
  if (req.params.id === req.user._id.toString()) {
    res.status(400); throw new Error('You cannot delete your own account via admin panel.');
  }
  const user = await User.findById(req.params.id);
  if (!user) { res.status(404); throw new Error('User not found'); }

  await Promise.all([
    Session.deleteMany({ userId: user._id }),
    Resource.deleteMany({ userId: user._id }),
    Note.deleteMany({ userId: user._id }),
    FocusSession.deleteMany({ userId: user._id }),
    TestAttempt.deleteMany({ userId: user._id }),
    ChapterList.deleteMany({ user: user._id }),
    ActivityLog.deleteMany({ user: user._id }),
    Deck.deleteMany({ userId: user._id }),
    Flashcard.deleteMany({ userId: user._id }),
    UserCardProgress.deleteMany({ userId: user._id }),
    Follow.deleteMany({ $or: [{ followerId: user._id }, { followingId: user._id }] }),
    Notification.deleteMany({ $or: [{ recipient: user._id }, { sender: user._id }] }),
    Battle.deleteMany({ $or: [{ player1: user._id }, { player2: user._id }] }),
    BattleLeaderboard.deleteMany({ userId: user._id }),
    Group.updateMany({ members: user._id }, { $pull: { members: user._id } }),
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
  if (req.query.userId) filter.userId = String(req.query.userId);

  const [sessions, total] = await Promise.all([
    Session.find(filter).populate('userId', 'name email').sort({ loginAt: -1 }).skip(skip).limit(limit),
    Session.countDocuments(filter),
  ]);
  res.json({ sessions, total, page, pages: Math.ceil(total / limit) });
}));

router.delete('/sessions/:id', superAdminOnly, asyncHandler(async (req, res) => {
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
  if (req.query.type) filter.type = String(req.query.type);
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

router.delete('/resources/:id', superAdminOnly, asyncHandler(async (req, res) => {
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

router.delete('/feedback/:id', superAdminOnly, asyncHandler(async (req, res) => {
  const f = await Feedback.findByIdAndDelete(req.params.id);
  if (!f) { res.status(404); throw new Error('Feedback not found'); }
  res.json({ message: 'Feedback deleted.' });
}));

// ─── CUTOFFS UPLOAD ──────────────────────────────────────────────────────────

/**
 * POST /api/admin/cutoffs/upload
 * Upload an excel file of cutoffs
 */
router.post('/cutoffs/upload', upload.single('file'), asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400); throw new Error('No file provided');
  }

  const { year, counseling, round, instituteType } = req.body;
  
  if (!year || !counseling || !round || !instituteType) {
    res.status(400); throw new Error('Missing year, counseling, round, or instituteType');
  }

  const numYear = Number(year);
  const numRound = Number(round);

  // Check for duplicates
  const existing = await Cutoff.findOne({ year: numYear, counseling, round: numRound });
  if (existing) {
    res.status(400); throw new Error('Overlapping Data: Data for this year, counseling, and round already exists.');
  }

  try {
    const entries = parseExcelBuffer(req.file.buffer, instituteType, numRound, counseling, numYear);
    
    if (entries.length === 0) {
      res.status(400); throw new Error('No valid entries found in the Excel file.');
    }

    await Cutoff.insertMany(entries);
    
    res.json({ message: `Successfully uploaded ${entries.length} cutoff entries.` });
  } catch (error) {
    console.error('Error processing excel file:', error);
    res.status(500); throw new Error('Failed to parse and save excel data');
  }
}));

// ─── BATTLE QUESTIONS ────────────────────────────────────────────────────────

/**
 * GET /api/admin/battle-questions
 * List all battle questions.
 */
router.get('/battle-questions', asyncHandler(async (req, res) => {
  const questions = await BattleQuestion.find().sort({ createdAt: -1 });
  res.json(questions);
}));

/**
 * POST /api/admin/battle-questions
 * Create a new battle question.
 */
router.post('/battle-questions', asyncHandler(async (req, res) => {
  const { subject, questionText, options, difficulty, explanation, imageUrl, type, correctInteger } = req.body;
  
  if (!subject || !questionText) {
    res.status(400); throw new Error('Subject and question text are required.');
  }

  if (type !== 'integer' && (!options || options.length < 2)) {
    res.status(400); throw new Error('Options are required for non-integer questions.');
  }

  if (type === 'integer' && (correctInteger === undefined || correctInteger === null)) {
    res.status(400); throw new Error('Correct integer answer is required.');
  }

  // Generate unique question code
  const subjectPrefix = subject.substring(0, 3).toUpperCase();
  const count = await BattleQuestion.countDocuments({ subject });
  let questionCode = `${subjectPrefix}-${(count + 1).toString().padStart(3, '0')}`;
  
  // Handle potential collision if questions were deleted
  let collision = await BattleQuestion.findOne({ questionCode });
  let suffix = 1;
  while (collision) {
    questionCode = `${subjectPrefix}-${(count + 1 + suffix).toString().padStart(3, '0')}`;
    collision = await BattleQuestion.findOne({ questionCode });
    suffix++;
  }

  const question = await BattleQuestion.create({
    subject,
    questionCode,
    questionText,
    options,
    difficulty,
    explanation,
    imageUrl,
    type: type || 'single',
    correctInteger: type === 'integer' ? correctInteger : undefined
  });

  res.status(201).json(question);
}));

/**
 * PATCH /api/admin/battle-questions/:id
 * Update a battle question.
 */
router.patch('/battle-questions/:id', asyncHandler(async (req, res) => {
  const { subject, questionText, options, difficulty, explanation, imageUrl, type, correctInteger } = req.body;
  
  const question = await BattleQuestion.findById(req.params.id);
  if (!question) {
    res.status(404); throw new Error('Question not found');
  }

  if (subject) question.subject = subject;
  if (questionText) question.questionText = questionText;
  if (options) question.options = options;
  if (difficulty) question.difficulty = difficulty;
  if (explanation) question.explanation = explanation;
  if (imageUrl !== undefined) question.imageUrl = imageUrl;
  if (type) question.type = type;
  if (correctInteger !== undefined) question.correctInteger = correctInteger;
  if (req.body.questionCode) {
    // Check for uniqueness if code is changed
    if (req.body.questionCode !== question.questionCode) {
      const existing = await BattleQuestion.findOne({ questionCode: req.body.questionCode });
      if (existing) {
        res.status(400); throw new Error('Question code already exists');
      }
      question.questionCode = req.body.questionCode;
    }
  }

  await question.save();
  res.json(question);
}));

/**
 * DELETE /api/admin/battle-questions/:id
 * Delete a battle question.
 */
router.delete('/battle-questions/:id', asyncHandler(async (req, res) => {
  const question = await BattleQuestion.findByIdAndDelete(req.params.id);
  if (!question) {
    res.status(404); throw new Error('Question not found');
  }
  res.json({ message: 'Question deleted successfully' });
}));

// ─── UPCOMING EXAMS ──────────────────────────────────────────────────────────

/**
 * GET /api/admin/exams
 * List all upcoming exams.
 */
router.get('/exams', asyncHandler(async (req, res) => {
  const exams = await UpcomingExam.find().sort({ date: 1 });
  res.json(exams);
}));

/**
 * POST /api/admin/exams
 * Create or update an exam.
 */
router.post('/exams', asyncHandler(async (req, res) => {
  const { id, name, date, description, registrationLink, category, icon } = req.body;
  
  if (!name || !date) {
    res.status(400); throw new Error('Name and date are required.');
  }

  if (id) {
    const exam = await UpcomingExam.findByIdAndUpdate(id, {
      name, date, description, registrationLink, category, icon
    }, { new: true });
    return res.json(exam);
  }

  const exam = await UpcomingExam.create({
    name, date, description, registrationLink, category, icon
  });

  res.status(201).json(exam);
}));

/**
 * DELETE /api/admin/exams/:id
 * Delete an exam.
 */
router.delete('/exams/:id', asyncHandler(async (req, res) => {
  const exam = await UpcomingExam.findByIdAndDelete(req.params.id);
  if (!exam) {
    res.status(404); throw new Error('Exam not found');
  }
  res.json({ message: 'Exam deleted successfully' });
}));

export default router;
