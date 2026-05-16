import asyncHandler from 'express-async-handler';
import TestAttempt from '../models/TestAttempt.js';

/**
 * @desc    Add a performance test mark (manual entry)
 * @route   POST /api/performance/marks
 * @access  Private
 */
export const addTestMark = asyncHandler(async (req, res) => {
  const { subject, testName, score, total, date, comments } = req.body;

  if (!subject || !testName || score === undefined || !total) {
    res.status(400);
    throw new Error('Please provide all required fields');
  }

  const mark = await TestAttempt.create({
    tenantId: req.user.tenantId, // Ensure tenant isolation
    userId: req.user._id,
    isManual: true,
    status: 'EVALUATED', // Manual marks are pre-evaluated
    subject,
    testName,
    score,
    totalScore: score, // Legacy compatibility
    maxPossibleScore: total,
    percentage: Math.round((score / total) * 10000) / 100,
    startedAt: date || new Date(),
    submittedAt: date || new Date(),
    evaluatedAt: new Date(),
    comments
  });

  res.status(201).json(mark);
});

/**
 * @desc    Get all manual test marks for a user
 * @route   GET /api/performance/marks
 * @access  Private
 */
export const getTestMarks = asyncHandler(async (req, res) => {
  const marks = await TestAttempt.find({ userId: req.user._id, isManual: true })
    .sort({ startedAt: -1 })
    .lean();
  res.json(marks);
});

/**
 * @desc    Delete a manual test mark
 * @route   DELETE /api/performance/marks/:id
 * @access  Private
 */
export const deleteTestMark = asyncHandler(async (req, res) => {
  const mark = await TestAttempt.findOne({ _id: req.params.id, userId: req.user._id, isManual: true });
  
  if (!mark) {
    res.status(404);
    throw new Error('Record not found');
  }

  await mark.deleteOne();
  res.json({ message: 'Record removed' });
});
