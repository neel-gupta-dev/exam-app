import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Session from '../models/Session.js';
import Resource from '../models/Resource.js';
import Feedback from '../models/Feedback.js';
import Note from '../models/Note.js';
import ActivityLog from '../models/ActivityLog.js';
import FocusSession from '../models/FocusSession.js';
import Flashcard from '../models/Flashcard.js';
import TestAttempt from '../models/TestAttempt.js';

/**
 * @desc    Individual User Analytics (God Mode)
 * @route   GET /api/admin/users/:userId/analytics
 * @access  Private/Admin
 */
export const getUserAnalytics = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    res.status(400);
    throw new Error('Invalid user ID');
  }

  const userObjectId = new mongoose.Types.ObjectId(userId);

  // 1. Fetch Core User Document
  const user = await User.findById(userId).select('-password -googleAccessToken -googleRefreshToken');
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // 2. Fetch Vital Stats & Activity Timeline in parallel
  const [
    focusSessionsCount,
    flashcardsCount,
    activityTimeline,
    heatmapData,
    testAttempts
  ] = await Promise.all([
    FocusSession.countDocuments({ userId: userObjectId }),
    Flashcard.countDocuments({ userId: userObjectId }),
    // Last 50 entries from ActivityLog
    ActivityLog.find({ user: userObjectId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean(),
    // Heatmap Aggregation (Last 30 days)
    ActivityLog.aggregate([
      {
        $match: {
          user: userObjectId,
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } },
      { $project: { _id: 0, date: "$_id", count: 1 } }
    ]),
    // New feature: CBT Test Attempts
    TestAttempt.find({ userId: userObjectId })
      .populate('testId', 'title category totalMarks durationMinutes')
      .sort({ createdAt: -1 })
      .lean()
  ]);

  // 3. Construct the response object
  res.json({
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      targetExam: user.targetExam,
      isOnboarded: user.isOnboarded,
      lastLoginDate: user.lastLoginDate,
      lastActiveAt: user.lastActiveAt,
      createdAt: user.createdAt,
    },
    vitals: {
      totalHours: (user.totalActiveSeconds / 3600).toFixed(2),
      currentStreak: user.currentStreak || 0,
      totalFocusSessions: focusSessionsCount,
      totalFlashcards: flashcardsCount,
      totalTestsTaken: testAttempts.length,
    },
    timeline: activityTimeline,
    heatmap: heatmapData,
    testAttempts: testAttempts,
  });
});


/**
 * Note: Keeping existing admin logic refactored here for consistency
 */

export const getDashboardStats = asyncHandler(async (req, res) => {
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

  const topUsers = await User.find()
    .sort({ totalActiveSeconds: -1 })
    .limit(5)
    .select('name email totalActiveSeconds currentStreak level');

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recentSignups = await User.countDocuments({ createdAt: { $gte: sevenDaysAgo } });

  res.json({
    totalUsers, totalSessions, activeSessions, totalResources, totalFeedback, adminCount, googleUsers, localUsers, recentSignups, topUsers,
  });
});
