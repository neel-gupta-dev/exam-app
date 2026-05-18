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
import Test from '../models/Test.js';
import Question from '../models/Question.js';

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

export const getTestTelemetry = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, parseInt(req.query.limit) || 25);
  const skip = (page - 1) * limit;
  const filter = {};

  if (req.query.userId && mongoose.Types.ObjectId.isValid(req.query.userId)) {
    filter.userId = new mongoose.Types.ObjectId(req.query.userId);
  }
  if (req.query.testId && mongoose.Types.ObjectId.isValid(req.query.testId)) {
    filter.testId = new mongoose.Types.ObjectId(req.query.testId);
  }
  if (req.query.status) {
    filter.status = String(req.query.status);
  }

  const [attempts, total] = await Promise.all([
    TestAttempt.find(filter)
      .populate('userId', 'name username email')
      .populate('testId', 'title category totalMarks durationMinutes')
      .sort({ submittedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    TestAttempt.countDocuments(filter),
  ]);

  const rows = attempts.map((attempt) => {
    const questionTelemetry = (attempt.answers || []).map((answer, index) => ({
      questionNumber: index + 1,
      questionId: answer.questionId,
      status: answer.status,
      answered: Boolean(answer.selectedAnswer?.length),
      selectedAnswer: answer.selectedAnswer || [],
      timeSpentSeconds: Math.max(0, Math.round(Number(answer.timeSpentSeconds) || 0)),
      visitCount: Math.max(0, Math.round(Number(answer.visitCount) || 0)),
      firstVisitedAt: answer.firstVisitedAt || null,
      lastVisitedAt: answer.lastVisitedAt || null,
      visitLog: answer.visitLog || [],
      answerChangeCount: Math.max(0, Math.round(Number(answer.answerChangeCount) || 0)),
      idleSeconds: Math.max(0, Math.round(Number(answer.idleSeconds) || 0)),
      effectiveTimeSeconds: Math.max(
        0,
        Math.round(Number(answer.timeSpentSeconds) || 0) - Math.round(Number(answer.idleSeconds) || 0)
      ),
    }));
    const totalTimeSpentSeconds = questionTelemetry.reduce((sum, item) => sum + item.timeSpentSeconds, 0);
    const totalEffectiveTimeSeconds = questionTelemetry.reduce((sum, item) => sum + item.effectiveTimeSeconds, 0);
    const totalVisits = questionTelemetry.reduce((sum, item) => sum + item.visitCount, 0);
    const totalAnswerChanges = questionTelemetry.reduce((sum, item) => sum + item.answerChangeCount, 0);
    const totalIdleSeconds = questionTelemetry.reduce((sum, item) => sum + item.idleSeconds, 0);
    const slowestQuestion = questionTelemetry.reduce((max, item) => (
      item.timeSpentSeconds > (max?.timeSpentSeconds || 0) ? item : max
    ), null);
    const mostVisitedQuestion = questionTelemetry.reduce((max, item) => (
      item.visitCount > (max?.visitCount || 0) ? item : max
    ), null);

    return {
      _id: attempt._id,
      user: attempt.userId,
      test: attempt.testId,
      status: attempt.status,
      startedAt: attempt.startedAt,
      submittedAt: attempt.submittedAt,
      durationUsedMinutes: attempt.durationUsedMinutes,
      ipAddress: attempt.ipAddress || '',
      deviceInfo: attempt.deviceInfo || {},
      score: {
        totalScore: attempt.totalScore,
        maxPossibleScore: attempt.maxPossibleScore,
        percentage: attempt.percentage,
        sectionScores: attempt.sectionScores instanceof Map ? Object.fromEntries(attempt.sectionScores) : attempt.sectionScores || {},
      },
      integrity: {
        tabSwitchCount: attempt.tabSwitchCount || 0,
        warnings: attempt.warnings || [],
      },
      telemetry: {
        totalTimeSpentSeconds,
        totalEffectiveTimeSeconds,
        averageQuestionTimeSeconds: questionTelemetry.length ? Math.round(totalTimeSpentSeconds / questionTelemetry.length) : 0,
        totalVisits,
        totalAnswerChanges,
        totalIdleSeconds,
        answeredQuestions: questionTelemetry.filter((item) => item.answered).length,
        totalQuestions: questionTelemetry.length,
        slowestQuestion,
        mostVisitedQuestion,
        questions: questionTelemetry,
      },
    };
  });

  const summary = rows.reduce((acc, row) => {
    acc.totalTrackedSeconds += row.telemetry.totalTimeSpentSeconds;
    acc.totalVisits += row.telemetry.totalVisits;
    acc.totalTabSwitches += row.integrity.tabSwitchCount;
    return acc;
  }, { totalTrackedSeconds: 0, totalVisits: 0, totalTabSwitches: 0 });

  res.json({
    rows,
    summary: {
      attempts: total,
      pageAttempts: rows.length,
      totalTrackedSeconds: summary.totalTrackedSeconds,
      totalVisits: summary.totalVisits,
      totalTabSwitches: summary.totalTabSwitches,
    },
    total,
    page,
    pages: Math.ceil(total / limit),
  });
});

export const getTestQuestionAnalytics = asyncHandler(async (req, res) => {
  const { testId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(testId)) {
    res.status(400);
    throw new Error('Invalid test ID');
  }

  const [test, questions, attempts] = await Promise.all([
    Test.findById(testId).select('title totalMarks sections').lean(),
    Question.find({ testId }).sort({ order: 1 }).lean(),
    TestAttempt.find({ testId, status: { $in: ['completed', 'auto-submitted'] } }).lean(),
  ]);

  if (!test) {
    res.status(404);
    throw new Error('Test not found');
  }

  const questionMap = new Map(questions.map((question, index) => [question._id.toString(), { ...question, questionNumber: index + 1 }]));
  const stats = questions.map((question, index) => ({
    questionId: question._id,
    questionNumber: index + 1,
    section: question.section || 'General',
    type: question.type,
    tags: question.tags || [],
    difficulty: question.difficulty || 'medium',
    attempts: 0,
    correct: 0,
    wrong: 0,
    skipped: 0,
    totalTimeSeconds: 0,
    totalVisits: 0,
    totalAnswerChanges: 0,
    optionDistribution: {},
  }));
  const statMap = new Map(stats.map((stat) => [stat.questionId.toString(), stat]));

  attempts.forEach((attempt) => {
    (attempt.answers || []).forEach((answer) => {
      const stat = statMap.get(answer.questionId?.toString());
      const question = questionMap.get(answer.questionId?.toString());
      if (!stat || !question) return;

      const selected = (answer.selectedAnswer || []).map(String).sort();
      const expected = (question.correctAnswer || []).map(String).sort();
      const answered = selected.length > 0;
      const correct = answered && selected.length === expected.length && selected.every((value, idx) => value === expected[idx]);

      stat.attempts += 1;
      if (!answered) stat.skipped += 1;
      else if (correct) stat.correct += 1;
      else stat.wrong += 1;

      stat.totalTimeSeconds += Math.max(0, Math.round(Number(answer.timeSpentSeconds) || 0));
      stat.totalVisits += Math.max(0, Math.round(Number(answer.visitCount) || 0));
      stat.totalAnswerChanges += Math.max(0, Math.round(Number(answer.answerChangeCount) || 0));
      selected.forEach((option) => {
        stat.optionDistribution[option] = (stat.optionDistribution[option] || 0) + 1;
      });
    });
  });

  res.json({
    test,
    attempts: attempts.length,
    questions: stats.map((stat) => ({
      ...stat,
      accuracy: stat.attempts ? Math.round((stat.correct / stat.attempts) * 10000) / 100 : 0,
      skipRate: stat.attempts ? Math.round((stat.skipped / stat.attempts) * 10000) / 100 : 0,
      wrongRate: stat.attempts ? Math.round((stat.wrong / stat.attempts) * 10000) / 100 : 0,
      averageTimeSeconds: stat.attempts ? Math.round(stat.totalTimeSeconds / stat.attempts) : 0,
      averageVisits: stat.attempts ? Math.round((stat.totalVisits / stat.attempts) * 100) / 100 : 0,
      averageAnswerChanges: stat.attempts ? Math.round((stat.totalAnswerChanges / stat.attempts) * 100) / 100 : 0,
    })),
  });
});
