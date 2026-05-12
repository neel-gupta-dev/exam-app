import asyncHandler from 'express-async-handler';
import FocusSession from '../models/FocusSession.js';
import Resource from '../models/Resource.js';
import UserCardProgress from '../models/UserCardProgress.js';

/** Convert a JS Date to an IST date string "YYYY-MM-DD" */
function toISTDateString(date) {
  return date.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
}

/**
 * @desc    Get activity heatmap data for the last 21 days
 * @route   GET /api/analytics/heatmap
 * @access  Private
 */
export const getActivityHeatmap = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const daysToFetch = 21;
  
  // Calculate the start date (21 days ago from today in IST)
  // We go back far enough in UTC to cover any IST day boundary offset
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysToFetch);
  startDate.setUTCHours(0, 0, 0, 0);

  // 1. Fetch Focus Sessions in range
  const focusSessions = await FocusSession.find({
    userId,
    status: 'completed',
    createdAt: { $gte: startDate }
  }).select('createdAt type').lean();

  // 2. Fetch Resources in range
  const resources = await Resource.find({
    userId,
    createdAt: { $gte: startDate }
  }).select('createdAt').lean();

  // 3. Initialize heatmap structure using IST dates
  const todayIST = toISTDateString(new Date());
  const heatmap = [];
  const heatmapMap = {};
  for (let i = daysToFetch - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = toISTDateString(d);
    // Avoid duplicates (DST edge case guard)
    if (heatmapMap[dateStr]) continue;
    const entry = {
      date: dateStr,
      displayDay: parseInt(dateStr.split('-')[2], 10),
      units: 0,
      level: 0
    };
    heatmap.push(entry);
    heatmapMap[dateStr] = entry;
  }

  // Aggregate Focus Sessions (bucket by IST date)
  focusSessions.forEach(session => {
    const dateStr = toISTDateString(session.createdAt);
    const dayObj = heatmapMap[dateStr];
    if (dayObj) {
      dayObj.units += 2; // Focus session is high value
    }
  });

  // Aggregate Resources (bucket by IST date)
  resources.forEach(resource => {
    const dateStr = toISTDateString(resource.createdAt);
    const dayObj = heatmapMap[dateStr];
    if (dayObj) {
      dayObj.units += 1;
    }
  });

  // Calculate Levels based on units
  heatmap.forEach(day => {
    if (day.units === 0) day.level = 0;
    else if (day.units <= 2) day.level = 1;
    else if (day.units <= 5) day.level = 2;
    else if (day.units <= 10) day.level = 3;
    else if (day.units <= 15) day.level = 4;
    else day.level = 5;
  });

  res.json(heatmap);
});

/**
 * @desc    Get monthly goal progress and milestones
 * @route   GET /api/analytics/monthly-stats
 * @access  Private
 */
export const getMonthlyStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // 1. Calculate Monthly Focus Time
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  const focusStats = await FocusSession.aggregate([
    { 
      $match: { 
        userId, 
        type: 'focus', 
        status: 'completed',
        createdAt: { $gte: startOfMonth }
      } 
    },
    {
      $group: {
        _id: null,
        totalSeconds: { $sum: '$timing.actualDuration' }
      }
    }
  ]);

  const focusMinutes = focusStats.length > 0 ? Math.round(focusStats[0].totalSeconds / 60) : 0;
  const focusTargetMinutes = 120 * 60; // 120 hours target

  // 2. Check Milestones
  const user = await req.user; // already populated by protect middleware
  const resourceCount = await Resource.countDocuments({ userId });
  const focusSessionCount = await FocusSession.countDocuments({ userId, status: 'completed' });

  const milestones = [
    {
      id: 'profile-verification',
      label: 'Profile Verification',
      isCompleted: user.isVerifiedStudent
    },
    {
      id: 'setup-complete',
      label: 'Vault Setup',
      isCompleted: user.isOnboarded
    },
    {
      id: 'resource-pioneer',
      label: 'Resource Pioneer',
      isCompleted: resourceCount > 0
    },
    {
      id: 'focus-apprentice',
      label: 'Focus Apprentice',
      isCompleted: focusSessionCount > 0
    }
  ];

  // 3. Calculate Today's Focus Time (resets at 5 AM IST)
  // 5 AM IST = 23:30 UTC (previous day)
  const nowUtcTime = now.getTime();
  const offsetIST = 5.5 * 60 * 60 * 1000;
  const nowIST = new Date(nowUtcTime + offsetIST);
  
  const today5AmIST = new Date(nowIST);
  if (nowIST.getUTCHours() < 5) {
    today5AmIST.setUTCDate(today5AmIST.getUTCDate() - 1);
  }
  today5AmIST.setUTCHours(5, 0, 0, 0);
  
  const today5AmUTC = new Date(today5AmIST.getTime() - offsetIST);

  const todayFocusStats = await FocusSession.aggregate([
    { 
      $match: { 
        userId, 
        type: 'focus', 
        status: 'completed',
        createdAt: { $gte: today5AmUTC }
      } 
    },
    {
      $group: {
        _id: null,
        totalSeconds: { $sum: '$timing.actualDuration' }
      }
    }
  ]);

  const todayFocusSeconds = todayFocusStats.length > 0 ? todayFocusStats[0].totalSeconds : 0;

  res.json({
    focusProgress: {
      current: focusMinutes,
      target: focusTargetMinutes,
      percent: Math.min(Math.round((focusMinutes / focusTargetMinutes) * 100), 100)
    },
    todayFocusSeconds,
    milestones
  });
});

