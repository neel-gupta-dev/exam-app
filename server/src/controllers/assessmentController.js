import asyncHandler from 'express-async-handler';
import Test from '../models/Test.js';
import Question from '../models/Question.js';
import TestAttempt from '../models/TestAttempt.js';
import { getRedis } from '../config/redis.js';

/**
 * Start Assessment / Resume Assessment
 * Validates access, fetches questions (stripping answers), initializes/retrieves Redis session.
 * @route GET /assessment/:testId/start
 */
export const startAssessment = asyncHandler(async (req, res) => {
  const { testId } = req.params;
  const userId = req.user._id.toString();
  const redis = getRedis();

  if (!redis) {
    return res.status(503).json({ message: "Assessment engine unavailable (Redis down)" });
  }

  // Check if test exists
  const test = await Test.findById(testId);
  if (!test) {
    return res.status(404).json({ message: 'Test not found' });
  }

  // Removed the block so students can attempt the test again (retakes).
  const sessionKey = `cbt_session:${userId}:${testId}`;

  // Check if an active session exists in Redis
  const activeSessionRaw = await redis.hGet(sessionKey, 'data');
  let activeSession;

  if (activeSessionRaw) {
    activeSession = JSON.parse(activeSessionRaw);
  } else {
    // Initialize a new session
    activeSession = {
      startTime: new Date().toISOString(),
      timeLeft: test.durationMinutes * 60, // in seconds
      answers: {}, // map of questionId -> { status: 'not_visited', selectedOption: null, markedForReview: false }
    };
    await redis.hSet(sessionKey, 'data', JSON.stringify(activeSession));
    // Set expiry for safety (duration + 1 hour buffer)
    await redis.expire(sessionKey, (test.durationMinutes * 60) + 3600);
  }

  // Fetch Questions
  // Depending on indexing, we sort by order
  const questions = await Question.find({ testId }).sort({ order: 1 });

  // Map to safe payload (strip correctAnswer and solution)
  const safeQuestions = questions.map((q) => {
    const qObj = q.toObject();
    delete qObj.correctAnswer;
    delete qObj.solution;
    delete qObj.solutionImageUrl;
    return qObj;
  });

  res.status(200).json({
    test: test.toRedisPayload(),
    questions: safeQuestions,
    session: activeSession
  });
});

/**
 * Sync Assessment State
 * Extremely fast endpoint that just overrides the Redis 'data' JSON string.
 * @route POST /assessment/:testId/sync
 */
export const syncAssessment = asyncHandler(async (req, res) => {
  const { testId } = req.params;
  const userId = req.user._id.toString();
  const redis = getRedis();

  if (!redis) {
    return res.status(503).json({ message: "Assessment engine unavailable" });
  }

  const { answers, timeLeft } = req.body;
  const sessionKey = `cbt_session:${userId}:${testId}`;

  const activeSessionRaw = await redis.hGet(sessionKey, 'data');
  if (!activeSessionRaw) {
    return res.status(404).json({ message: 'Active session not found or expired' });
  }

  const activeSession = JSON.parse(activeSessionRaw);
  
  // Merge answers
  activeSession.timeLeft = timeLeft;
  activeSession.answers = { ...activeSession.answers, ...answers };

  // Update Redis
  await redis.hSet(sessionKey, 'data', JSON.stringify(activeSession));

  res.status(200).json({ message: 'Synced' });
});

/**
 * Submit Assessment
 * Reads the final state from Redis, grades against DB, creates TestAttempt, deletes Redis key.
 * @route POST /assessment/:testId/submit
 */
export const submitAssessment = asyncHandler(async (req, res) => {
  const { testId } = req.params;
  const userId = req.user._id.toString();
  const redis = getRedis();

  if (!redis) {
    return res.status(503).json({ message: "Assessment engine unavailable" });
  }

  const sessionKey = `cbt_session:${userId}:${testId}`;

  const activeSessionRaw = await redis.hGet(sessionKey, 'data');
  if (!activeSessionRaw) {
    return res.status(404).json({ message: 'Session expired or not found. Cannot evaluate.' });
  }

  const { answers, startTime } = JSON.parse(activeSessionRaw);

  const endTime = new Date();
  const durationUsedMinutes = Math.round((endTime.getTime() - new Date(startTime).getTime()) / 60000);
  const questions = await Question.find({ testId }).select('_id').lean();
  const answerRows = questions.map((question) => {
    const answer = answers?.[question._id.toString()] || {};
    const selected = answer.selectedOption || answer.selectedAnswer || [];
    const selectedAnswer = Array.isArray(selected)
      ? selected
      : selected === null || selected === undefined || selected === ''
      ? []
      : [String(selected)];
    return {
      questionId: question._id,
      selectedAnswer,
      status: answer.status || (selectedAnswer.length ? 'answered' : 'unanswered'),
      timeSpentSeconds: answer.timeSpentSeconds || 0,
    };
  });

  // Store raw result for background evaluation queue
  const attempt = await TestAttempt.create({
    userId,
    testId,
    status: 'evaluating', // Pushed to queue
    durationUsedMinutes,
    answers: answerRows,
  });

  // Cleanup Redis
  await redis.del(sessionKey);

  res.status(201).json({ message: 'Evaluation pending', attempt });
});
