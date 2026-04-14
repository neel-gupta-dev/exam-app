import asyncHandler from 'express-async-handler';
import TestAttempt from '../models/TestAttempt.js';
import Test from '../models/Test.js';
import User from '../models/User.js';

/**
 * @desc    Get all test results for the coaching admin's tenant
 * @route   GET /api/coaching/results
 * @access  CoachingAdmin
 */
export const getCoachingResults = asyncHandler(async (req, res) => {
  const { tenantId, role } = req.user;

  if (role === 'admin') {
    // Superadmin can see everything — no tenant filter
  } else if (!tenantId) {
    res.status(403);
    throw new Error('No coaching assigned to this account.');
  }

  // Find all students in this coaching
  const studentFilter = role === 'admin' ? {} : { tenantId, role: 'student' };
  const students = await User.find(studentFilter).select('_id name username');
  const studentIds = students.map((s) => s._id);

  // Optionally filter by test
  const attemptFilter = { userId: { $in: studentIds }, status: 'completed' };
  if (req.query.testId) attemptFilter.testId = req.query.testId;

  const attempts = await TestAttempt.find(attemptFilter)
    .populate('testId', 'title category totalMarks durationMinutes')
    .populate('userId', 'name username')
    .sort({ submittedAt: -1 });

  res.json(attempts);
});

/**
 * @desc    Get summary stats for a specific test across the coaching
 * @route   GET /api/coaching/results/:testId/summary
 * @access  CoachingAdmin
 */
export const getTestSummary = asyncHandler(async (req, res) => {
  const { tenantId, role } = req.user;

  const studentFilter = role === 'admin' ? {} : { tenantId, role: 'student' };
  const students = await User.find(studentFilter).select('_id');
  const studentIds = students.map((s) => s._id);

  const attempts = await TestAttempt.find({
    testId: req.params.testId,
    userId: { $in: studentIds },
    status: 'completed',
  })
    .populate('userId', 'name username')
    .sort({ totalScore: -1 }); // Sorted by rank

  const test = await Test.findById(req.params.testId).select('title totalMarks');

  const totalAttempts = attempts.length;
  const avgScore = totalAttempts > 0
    ? Math.round(attempts.reduce((sum, a) => sum + (a.totalScore || 0), 0) / totalAttempts)
    : 0;
  const highestScore = totalAttempts > 0 ? attempts[0]?.totalScore || 0 : 0;

  // Build leaderboard
  const leaderboard = attempts.map((a, idx) => ({
    rank: idx + 1,
    name: a.userId?.name,
    username: a.userId?.username,
    score: a.totalScore,
    percentage: a.percentage,
    timeTaken: a.submittedAt && a.startedAt
      ? Math.round((new Date(a.submittedAt) - new Date(a.startedAt)) / 60000)
      : null,
  }));

  res.json({
    test,
    totalAttempts,
    avgScore,
    highestScore,
    leaderboard,
  });
});

/**
 * @desc    List all students in the coaching
 * @route   GET /api/coaching/students
 * @access  CoachingAdmin
 */
export const getCoachingStudents = asyncHandler(async (req, res) => {
  const { tenantId, role } = req.user;

  const filter = role === 'admin' ? { role: 'student' } : { tenantId, role: 'student' };
  const students = await User.find(filter)
    .select('name username email createdAt lastActiveAt')
    .sort({ createdAt: -1 });

  res.json(students);
});
