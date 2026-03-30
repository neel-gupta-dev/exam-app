import asyncHandler from 'express-async-handler';
import TestResult from '../models/TestResult.js';

/**
 * @desc    Add a performance test mark
 * @route   POST /api/performance/marks
 * @access  Private
 */
export const addTestMark = asyncHandler(async (req, res) => {
  const { subject, testName, score, total, date, comments } = req.body;

  if (!subject || !testName || score === undefined || !total) {
    res.status(400);
    throw new Error('Please provide all required fields');
  }

  const mark = await TestResult.create({
    userId: req.user._id,
    subject,
    testName,
    score,
    total,
    date: date || new Date(),
    comments
  });

  res.status(201).json(mark);
});

/**
 * @desc    Get all test marks for a user
 * @route   GET /api/performance/marks
 * @access  Private
 */
export const getTestMarks = asyncHandler(async (req, res) => {
  const marks = await TestResult.find({ userId: req.user._id })
    .sort({ date: -1 });
  res.json(marks);
});

/**
 * @desc    Delete a test mark
 * @route   DELETE /api/performance/marks/:id
 * @access  Private
 */
export const deleteTestMark = asyncHandler(async (req, res) => {
  const mark = await TestResult.findOne({ _id: req.params.id, userId: req.user._id });
  
  if (!mark) {
    res.status(404);
    throw new Error('Record not found');
  }

  await mark.deleteOne();
  res.json({ message: 'Record removed' });
});
