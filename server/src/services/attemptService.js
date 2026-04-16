import Test from '../models/Test.js';
import Question from '../models/Question.js';
import TestAttempt from '../models/TestAttempt.js';
import Group from '../models/Group.js';
import { getRedis } from '../config/redis.js';

const QUESTION_CACHE_TTL = 60 * 60 * 24; // 24 hours

/**
 * Verifies the student is eligible to see this test based on
 * visibility rules (B2C public, B2B coaching, groups).
 */
const verifyEligibility = async (test, user) => {
  const { visibility, targetTenants, targetGroups } = test;

  if (visibility === 'b2c_public') return true;

  if (visibility === 'b2b_coaching') {
    if (!user.tenantId) return false;
    return targetTenants.some((t) => t.toString() === user.tenantId.toString());
  }

  if (visibility === 'b2c_group' || visibility === 'b2b_group') {
    const userGroups = await Group.find({ members: user._id }).distinct('_id');
    const userGroupStrings = userGroups.map((g) => g.toString());
    return targetGroups.some((g) => userGroupStrings.includes(g.toString()));
  }

  return false;
};

/**
 * Start or resume a test session.
 * - Validates eligibility.
 * - Fetches questions (from Redis cache or MongoDB).
 * - Creates or resumes a TestAttempt document.
 * - Returns sanitized questions (NO correctAnswer) + attempt state.
 */
export const startSession = async (testId, user) => {
  // 1. Fetch and validate test
  const test = await Test.findById(testId);
  if (!test) {
    const err = new Error('Test not found');
    err.statusCode = 404;
    throw err;
  }

  if (!test.isPublished) {
    const err = new Error('This test is not available');
    err.statusCode = 403;
    throw err;
  }

  // 2. Eligibility
  const eligible = await verifyEligibility(test, user);
  if (!eligible) {
    const err = new Error('You are not authorized to take this test');
    err.statusCode = 403;
    throw err;
  }

  // 3. Schedule window check
  const now = new Date();
  if (test.scheduledStartAt && now < test.scheduledStartAt) {
    const err = new Error('This test has not started yet');
    err.statusCode = 403;
    throw err;
  }
  if (test.scheduledEndAt && now > test.scheduledEndAt) {
    const err = new Error('This test window has expired');
    err.statusCode = 403;
    throw err;
  }

  // 4. Get questions — try Redis first, fallback to Mongo
  let questions;
  const redis = getRedis();
  const cacheKey = `test:${testId}:questions`;

  if (redis) {
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        questions = JSON.parse(cached);
      }
    } catch (e) {
      console.warn('[AttemptService] Redis read failed, falling back to Mongo:', e.message);
    }
  }

  if (!questions) {
    const rawQuestions = await Question.find({ testId }).sort({ order: 1 });
    questions = rawQuestions.map((q) => q.toStudentPayload());

    // Cache for future students
    if (redis) {
      try {
        await redis.setEx(cacheKey, QUESTION_CACHE_TTL, JSON.stringify(questions));
      } catch (e) {
        console.warn('[AttemptService] Redis write failed:', e.message);
      }
    }
  }

  // 5. Find or create the attempt
  let attempt = await TestAttempt.findOne({
    userId: user._id,
    testId,
  });

  if (attempt && attempt.status === 'completed') {
    const err = new Error('You have already submitted this test');
    err.statusCode = 400;
    throw err;
  }

  if (attempt && attempt.status === 'auto-submitted') {
    const err = new Error('This test was auto-submitted due to violations');
    err.statusCode = 400;
    throw err;
  }

  if (!attempt) {
    // Initialize a fresh attempt with all questions set to 'unanswered'
    const answers = questions.map((q) => ({
      questionId: q._id,
      selectedAnswer: [],
      status: 'unanswered',
      timeSpentSeconds: 0,
    }));

    attempt = await TestAttempt.create({
      userId: user._id,
      testId,
      status: 'in-progress',
      answers,
    });
  }

  // 6. Also try to restore answer state from Redis
  let redisAnswers = null;
  if (redis) {
    try {
      const cached = await redis.get(`attempt:${attempt._id}:state`);
      if (cached) redisAnswers = JSON.parse(cached);
    } catch (e) {
      // Fallback to Mongo answers
    }
  }

  // Build test metadata
  const testMeta = {
    _id: test._id,
    title: test.title,
    description: test.description,
    category: test.category,
    durationMinutes: test.durationMinutes,
    totalMarks: test.totalMarks,
    sections: test.sections,
    defaultPositiveMarks: test.defaultPositiveMarks,
    defaultNegativeMarks: test.defaultNegativeMarks,
  };

  return {
    test: testMeta,
    questions,
    attempt: {
      _id: attempt._id,
      status: attempt.status,
      startedAt: attempt.startedAt,
      answers: redisAnswers || attempt.answers,
      tabSwitchCount: attempt.tabSwitchCount,
    },
  };
};

/**
 * Sync student progress (called periodically or on each action).
 * Writes to Redis for speed, and periodically to Mongo for durability.
 */
export const syncSession = async (attemptId, userId, { answers, tabSwitchCount, warnings }) => {
  const attempt = await TestAttempt.findOne({ _id: attemptId, userId });
  if (!attempt) {
    const err = new Error('Attempt not found');
    err.statusCode = 404;
    throw err;
  }

  if (attempt.status !== 'in-progress') {
    const err = new Error('This test has already been submitted');
    err.statusCode = 400;
    throw err;
  }

  // Update Redis (fast path)
  const redis = getRedis();
  if (redis && answers) {
    try {
      await redis.setEx(
        `attempt:${attemptId}:state`,
        60 * 60 * 4, // 4 hour TTL
        JSON.stringify(answers)
      );
    } catch (e) {
      console.warn('[AttemptService] Redis sync failed:', e.message);
    }
  }

  // Update Mongo (durable path)
  if (answers) {
    attempt.answers = answers;
  }
  if (typeof tabSwitchCount === 'number') {
    attempt.tabSwitchCount = tabSwitchCount;
  }
  if (Array.isArray(warnings) && warnings.length > 0) {
    attempt.warnings.push(...warnings);
  }

  await attempt.save();

  return { synced: true, tabSwitchCount: attempt.tabSwitchCount };
};

/**
 * Submit and grade the test.
 * Fetches the REAL answers from MongoDB (with correctAnswer),
 * compares against the student's selections, and calculates scores.
 */
export const submitSession = async (attemptId, userId) => {
  const attempt = await TestAttempt.findOne({ _id: attemptId, userId });
  if (!attempt) {
    const err = new Error('Attempt not found');
    err.statusCode = 404;
    throw err;
  }

  if (attempt.status === 'completed' || attempt.status === 'auto-submitted') {
    const err = new Error('This test has already been submitted');
    err.statusCode = 400;
    throw err;
  }

  // Try to get latest answers from Redis
  const redis = getRedis();
  if (redis) {
    try {
      const cached = await redis.get(`attempt:${attempt._id}:state`);
      if (cached) {
        attempt.answers = JSON.parse(cached);
      }
    } catch (e) {
      // Use Mongo answers as fallback
    }
  }

  // Fetch the test for marking scheme defaults
  const test = await Test.findById(attempt.testId);
  if (!test) {
    const err = new Error('Test not found');
    err.statusCode = 404;
    throw err;
  }

  // Fetch ALL questions WITH correctAnswer for grading
  const questions = await Question.find({ testId: attempt.testId }).sort({ order: 1 });
  const questionMap = new Map(questions.map((q) => [q._id.toString(), q]));

  let totalScore = 0;
  let maxPossible = 0;
  const sectionScores = {};

  for (const ans of attempt.answers) {
    const question = questionMap.get(ans.questionId.toString());
    if (!question) continue;

    const posMarks = question.positiveMarks ?? test.defaultPositiveMarks;
    const negMarks = question.negativeMarks ?? test.defaultNegativeMarks;
    maxPossible += posMarks;

    // Initialize section score
    const section = question.section || 'General';
    if (!sectionScores[section]) {
      sectionScores[section] = { correct: 0, wrong: 0, unattempted: 0, score: 0 };
    }

    // Grade
    if (!ans.selectedAnswer || ans.selectedAnswer.length === 0) {
      sectionScores[section].unattempted++;
      continue;
    }

    const isCorrect = arraysEqual(
      ans.selectedAnswer.sort(),
      question.correctAnswer.sort()
    );

    if (isCorrect) {
      totalScore += posMarks;
      sectionScores[section].correct++;
      sectionScores[section].score += posMarks;
    } else {
      totalScore -= negMarks;
      sectionScores[section].wrong++;
      sectionScores[section].score -= negMarks;
    }
  }

  // Finalize
  attempt.totalScore = totalScore;
  attempt.maxPossibleScore = maxPossible;
  attempt.percentage = maxPossible > 0 ? Math.round((totalScore / maxPossible) * 10000) / 100 : 0;
  attempt.sectionScores = sectionScores;
  attempt.submittedAt = new Date();
  attempt.status = 'completed';

  await attempt.save();

  // Clean up Redis
  if (redis) {
    try {
      await redis.del(`attempt:${attempt._id}:state`);
    } catch (e) { /* non-critical */ }
  }

  return {
    totalScore: attempt.totalScore,
    maxPossibleScore: attempt.maxPossibleScore,
    percentage: attempt.percentage,
    sectionScores: attempt.sectionScores,
    submittedAt: attempt.submittedAt,
  };
};

/**
 * Force-submit for anti-cheat (called when tab switch count >= 4).
 */
export const forceSubmit = async (attemptId, userId) => {
  const attempt = await TestAttempt.findOne({ _id: attemptId, userId });
  if (!attempt || attempt.status !== 'in-progress') return null;

  attempt.status = 'auto-submitted';
  attempt.warnings.push({ type: 'auto-submit-cheat', timestamp: new Date() });
  attempt.submittedAt = new Date();

  // Grade it same as normal submit
  const result = await submitSession(attemptId, userId);

  // Override status back to auto-submitted
  await TestAttempt.updateOne({ _id: attemptId }, { status: 'auto-submitted' });

  return result;
};

// ─── Helpers ──────────────────────────────────────────────────────

function arraysEqual(a, b) {
  if (a.length !== b.length) return false;
  return a.every((val, idx) => val === b[idx]);
}
