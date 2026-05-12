import asyncHandler from 'express-async-handler';
import FocusSession from '../models/FocusSession.js';
import User from '../models/User.js';
import mongoose from 'mongoose';
import { logActivity } from '../utils/telemetry.js';

/**
 * @desc    Start a new focus/break session
 * @route   POST /api/focus/start
 * @access  Private
 */
export const startFocus = asyncHandler(async (req, res) => {
  const { type, plannedDuration, resourceId } = req.body;
  const parsedPlannedDuration = Number(plannedDuration);

  if (!type || !Number.isFinite(parsedPlannedDuration) || parsedPlannedDuration <= 0 || parsedPlannedDuration > 24 * 60 * 60) {
    res.status(400);
    throw new Error('Type and a planned duration between 1 second and 24 hours are required');
  }

  const session = await FocusSession.create({
    userId: req.user._id,
    resourceId: resourceId || null,
    type,
    status: 'active',
    timing: {
      startTime: new Date(),
      plannedDuration: Math.round(parsedPlannedDuration),
    },
  });

  res.status(201).json({
    message: 'Session started',
    sessionId: session._id,
  });

  logActivity({
    userId: req.user._id,
    actionType: 'SESSION_STARTED',
    resourceId: resourceId || null,
    metadata: {
      sessionId: session._id,
      sessionType: type,
      plannedDuration: session.timing.plannedDuration,
    },
  });
});

/**
 * @desc    End an active focus/break session
 * @route   PATCH /api/focus/end/:id
 * @access  Private
 */
export const endFocus = asyncHandler(async (req, res) => {
  const { status, interruptionCount } = req.body;
  const { id } = req.params;

  const session = await FocusSession.findById(id);

  if (!session) {
    res.status(404);
    throw new Error('Session not found');
  }

  if (session.userId.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized');
  }

  if (session.status !== 'active') {
    return res.status(400).json({ message: 'Session already completed' });
  }

  if (status && !['completed', 'abandoned'].includes(status)) {
    res.status(400);
    throw new Error('Invalid focus session status');
  }

  const endTime = new Date();
  // Duration Drift Fix: Accept actualDuration from frontend but cap it at plannedDuration
  const rawDuration = req.body.actualDuration === undefined ? 0 : Number(req.body.actualDuration);
  if (!Number.isFinite(rawDuration) || rawDuration < 0) {
    res.status(400);
    throw new Error('Actual duration must be a non-negative number');
  }
  const actualDuration = Math.round(Math.min(rawDuration, session.timing.plannedDuration));
  const parsedInterruptions = interruptionCount === undefined ? 0 : Number(interruptionCount);
  if (!Number.isInteger(parsedInterruptions) || parsedInterruptions < 0 || parsedInterruptions > 1000) {
    res.status(400);
    throw new Error('Interruption count must be a non-negative integer');
  }

  session.status = status || 'completed';
  session.timing.endTime = endTime;
  session.timing.actualDuration = actualDuration;
  session.interruptionCount = parsedInterruptions;

  await session.save();

  // XP/Leveling is now handled globally via the Activity Heartbeat system
  // We only keep the focus session data here for specific focus analytics

  res.json({
    message: 'Session ended',
    actualDuration,
    xpEarned: session.type === 'focus' ? Math.round((actualDuration / 3600) * 50) : 0,
  });

  logActivity({
    userId: req.user._id,
    actionType: 'SESSION_ENDED',
    resourceId: session.resourceId || null,
    metadata: {
      sessionId: session._id,
      sessionType: session.type,
      status: session.status,
      timeSpentSeconds: actualDuration,
      interruptionCount: session.interruptionCount,
    },
  });
});

/**
 * @desc    Get focus analytics for the current user
 * @route   GET /api/focus/stats
 * @access  Private
 */
export const getFocusStats = asyncHandler(async (req, res) => {
  // 1. Start of today in IST (00:00 IST = UTC-5:30)
  // This matches the IST-aware convention used across the analytics system.
  const now = new Date();
  const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
  const nowIST = new Date(now.getTime() + IST_OFFSET_MS);
  const todayMidnightIST = new Date(nowIST);
  todayMidnightIST.setUTCHours(0, 0, 0, 0);
  const startOfToday = new Date(todayMidnightIST.getTime() - IST_OFFSET_MS);

  // 2. Today's focus time (only completed focus sessions)
  const todayAgg = await FocusSession.aggregate([
    {
      $match: {
        userId: req.user._id,
        type: 'focus',
        status: 'completed',
        createdAt: { $gte: startOfToday },
      },
    },
    { $group: { _id: null, totalSeconds: { $sum: '$timing.actualDuration' } } },
  ]);
  const todayFocusSeconds = todayAgg[0]?.totalSeconds ?? 0;
  const dailyGoalMinutes = req.user.dailyGoalMinutes ?? 0;
  const goalAchievedToday = dailyGoalMinutes > 0 && todayFocusSeconds >= dailyGoalMinutes * 60;

  // 1. General Stats Aggregation
  const generalStats = await FocusSession.aggregate([
    { $match: { userId: req.user._id } },
    {
      $group: {
        _id: null,
        totalFocusTime: {
          $sum: { $cond: [{ $eq: ['$type', 'focus'] }, '$timing.actualDuration', 0] }
        },
        totalBreakTime: {
          $sum: { $cond: [{ $in: ['$type', ['short-break', 'long-break']] }, '$timing.actualDuration', 0] }
        },
        completedSessions: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        abandonedSessions: {
          $sum: { $cond: [{ $eq: ['$status', 'abandoned'] }, 1, 0] }
        },
        totalSessions: { $sum: 1 },
      }
    }
  ]);

  // 2. Subject-Specific Focus Distribution
  const subjectStats = await FocusSession.aggregate([
    { $match: { userId: req.user._id, type: 'focus', resourceId: { $ne: null } } },
    {
      $lookup: {
        from: 'resources',
        localField: 'resourceId',
        foreignField: '_id',
        as: 'resource'
      }
    },
    { $unwind: '$resource' },
    {
      $group: {
        _id: '$resource.folderName',
        avgDuration: { $avg: '$timing.actualDuration' },
        totalTime: { $sum: '$timing.actualDuration' },
        sessionCount: { $sum: 1 }
      }
    },
    { $sort: { totalTime: -1 } }
  ]);

  if (generalStats.length === 0) {
    return res.json({
      focusToBreakRatio: "0:0",
      averageFocusDuration: 0,
      abandonmentRate: "0%",
      subjectFocus: []
    });
  }

  const s = generalStats[0];
  const ratio = s.totalBreakTime === 0 ? `${Math.round(s.totalFocusTime / 60)}:0` : `${(s.totalFocusTime / s.totalBreakTime).toFixed(1)}:1`;
  const abandonRate = ((s.abandonedSessions / s.totalSessions) * 100).toFixed(1) + '%';

  res.json({
    focusToBreakRatio: ratio,
    totalFocusMinutes: Math.round(s.totalFocusTime / 60),
    completedCount: s.completedSessions,
    abandonmentRate: abandonRate,
    subjectFocus: subjectStats.map(stat => ({
      subject: stat._id || 'Uncategorized',
      avgMinutes: Math.round(stat.avgDuration / 60),
      totalMinutes: Math.round(stat.totalTime / 60),
      sessions: stat.sessionCount
    })),
    // Daily goal fields
    todayFocusSeconds,
    dailyGoalMinutes,
    goalAchievedToday,
  });
});

/**
 * @desc    Set or update the user's daily study time goal
 * @route   PATCH /api/focus/goal
 * @access  Private
 */
export const setDailyGoal = asyncHandler(async (req, res) => {
  const { minutes } = req.body;
  const parsed = parseInt(minutes, 10);

  if (isNaN(parsed) || parsed < 0 || parsed > 1440) {
    res.status(400);
    throw new Error('Goal must be between 0 and 1440 minutes (24h)');
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { dailyGoalMinutes: parsed },
    { new: true, select: 'dailyGoalMinutes' }
  );

  res.json({ dailyGoalMinutes: user.dailyGoalMinutes });
});
