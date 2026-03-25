import asyncHandler from 'express-async-handler';
import * as userService from '../services/userService.js';

// @desc    Update user academic profile
// @route   PATCH /api/users/profile
// @access  Private
export const updateProfile = asyncHandler(async (req, res) => {
  const { dreamColleges, currentCoaching, academicLevel } = req.body;
  const user = await userService.updateUserProfile({
    userId: req.user._id,
    dreamColleges,
    currentCoaching,
    academicLevel,
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
