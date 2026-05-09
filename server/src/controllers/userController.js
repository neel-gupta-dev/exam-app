import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import * as userService from '../services/userService.js';

const DEFAULT_HEARTBEAT_SECONDS = 30;
const MAX_HEARTBEAT_SECONDS = 120;

// @desc    Update user academic profile
// @route   PATCH /api/users/profile
// @access  Private
export const updateProfile = asyncHandler(async (req, res) => {
  const { dreamColleges, currentCoaching, academicLevel, targetYear } = req.body;
  const user = await userService.updateUserProfile({
    userId: req.user._id,
    dreamColleges,
    currentCoaching,
    academicLevel,
    targetYear,
  });
  res.json(user);
});

// @desc    Update study confidence
// @route   POST /api/users/confidence
// @access  Private
export const updateConfidence = asyncHandler(async (req, res) => {
  const { rating } = req.body;
  if (!rating || rating < 1 || rating > 5) {
    res.status(400);
    throw new Error('Please provide a rating between 1 and 5');
  }
  const user = await userService.updateStudyConfidence({
    userId: req.user._id,
    rating,
  });
  res.json(user);
});

// @desc    Log search history
// @route   POST /api/users/search-log
// @access  Private
export const logSearch = asyncHandler(async (req, res) => {
  const { term } = req.body;
  if (!term) {
    res.status(400);
    throw new Error('Please provide a search term');
  }
  const user = await userService.logSearch({
    userId: req.user._id,
    term,
  });
  res.status(201).json({ message: 'Search logged' });
});
// @desc    Update user active time (Heartbeat)
// @route   POST /api/users/heartbeat
// @access  Private
export const updateHeartbeat = asyncHandler(async (req, res) => {
  const { duration } = req.body; // seconds to add
  const userId = req.user._id;
  const parsedDuration = duration === undefined ? DEFAULT_HEARTBEAT_SECONDS : Number(duration);

  if (!Number.isFinite(parsedDuration) || parsedDuration <= 0 || parsedDuration > MAX_HEARTBEAT_SECONDS) {
    res.status(400);
    throw new Error(`Heartbeat duration must be between 1 and ${MAX_HEARTBEAT_SECONDS} seconds`);
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { $inc: { totalActiveSeconds: Math.round(parsedDuration) } },
    { new: true }
  ).select('totalActiveSeconds levelData');

  res.json({
    totalActiveSeconds: user.totalActiveSeconds,
    levelData: user.levelData
  });
});
