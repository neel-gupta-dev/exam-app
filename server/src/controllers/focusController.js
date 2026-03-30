import asyncHandler from 'express-async-handler';
import FocusSession from '../models/FocusSession.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

/**
 * @desc    Start a new focus/break session
 * @route   POST /api/focus/start
 * @access  Private
 */
export const startFocus = asyncHandler(async (req, res) => {
  const { type, plannedDuration, resourceId } = req.body;

  if (!type || !plannedDuration) {
    res.status(400);
    throw new Error('Type and planned duration are required');
  }

  const session = await FocusSession.create({
    userId: req.user._id,
    resourceId: resourceId || null,
    type,
    status: 'active',
    timing: {
      startTime: new Date(),
      plannedDuration,
    },
  });

  res.status(201).json({
    message: 'Session started',
    sessionId: session._id,
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

  const endTime = new Date();
  // Duration Drift Fix: Accept actualDuration from frontend but cap it at plannedDuration
  const rawDuration = req.body.actualDuration || 0;
  const actualDuration = Math.min(rawDuration, session.timing.plannedDuration);

  session.status = status || 'completed';
  session.timing.endTime = endTime;
  session.timing.actualDuration = actualDuration;
  session.interruptionCount = interruptionCount || 0;

  await session.save();

  // XP/Leveling is now handled globally via the Activity Heartbeat system
  // We only keep the focus session data here for specific focus analytics

  res.json({
    message: 'Session ended',
    actualDuration,
    xpEarned: session.type === 'focus' ? Math.round((actualDuration / 3600) * 50) : 0,
  });
});

/**
 * @desc    Get focus analytics for the current user
 * @route   GET /api/focus/stats
 * @access  Private
 */
export const getFocusStats = asyncHandler(async (req, res) => {
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
    }))
  });
});
