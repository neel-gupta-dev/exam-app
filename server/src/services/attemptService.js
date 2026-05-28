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
export const verifyEligibility = async (test, user) => {
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

export const assertCanAttemptTest = async (test, user) => {
  if (!test.isPublished) {
    const err = new Error('This test is not available');
    err.statusCode = 403;
    throw err;
  }

  const eligible = await verifyEligibility(test, user);
  if (!eligible) {
    const err = new Error('You are not authorized to take this test');
    err.statusCode = 403;
    throw err;
  }

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

  // 2. Eligibility and schedule window
  await assertCanAttemptTest(test, user);

  // 3. Get questions — try Redis first, fallback to Mongo
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
    // BUGFIX (C-06): Question model has no toStudentPayload() method.
    // Inline the logic to strip sensitive fields (correctAnswer, solution)
    // before sending to the student client.
    questions = rawQuestions.map((q) => {
      const qObj = q.toObject();
      delete qObj.correctAnswer;
      delete qObj.solution;
      delete qObj.solutionImageUrl;
      return qObj;
    });

    // Cache for future students
    if (redis) {
      try {
        await redis.setEx(cacheKey, QUESTION_CACHE_TTL, JSON.stringify(questions));
      } catch (e) {
        console.warn('[AttemptService] Redis write failed:', e.message);
      }
    }
  }

  // 4. Find or create the attempt
  let attempt = await TestAttempt.findOne({
    userId: user._id,
    testId,
    status: 'in-progress',
  });

  if (!attempt) {
    const completedCount = await TestAttempt.countDocuments({ 
      userId: user._id, 
      testId, 
      status: { $in: ['completed', 'auto-submitted'] } 
    });
    
    const allowed = Math.max(1, Number(test.allowedAttemptCount) || 1);
    if (completedCount >= allowed) {
      const err = new Error(`You have used all ${allowed} allowed attempt${allowed === 1 ? '' : 's'} for this test.`);
      err.statusCode = 403;
      throw err;
    }

    // Initialize a fresh attempt with all questions set to 'unanswered'
    const answers = questions.map((q) => ({
      questionId: q._id,
      selectedAnswer: [],
      status: 'unanswered',
      timeSpentSeconds: 0,
    }));

    attempt = await TestAttempt.findOneAndUpdate(
      { userId: user._id, testId, status: 'in-progress' },
      {
        $setOnInsert: {
          userId: user._id,
          testId,
          status: 'in-progress',
          answers,
        }
      },
      { new: true, upsert: true }
    );
  }

  // 5. Also try to restore answer state from Redis
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
export const submitSession = async (attemptId, userId, finalStatus = 'completed') => {
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

  // Build a sectionScheme lookup map: sectionName -> markingScheme
  const sectionSchemeMap = {};
  if (test.sections && test.sections.length > 0) {
    for (const sec of test.sections) {
      sectionSchemeMap[sec.name] = sec.markingScheme || null;
    }
  }

  for (const ans of attempt.answers) {
    const question = questionMap.get(ans.questionId.toString());
    if (!question) continue;

    // Skip comprehension parent — it carries no marks itself
    if (question.type === 'comprehension_parent') continue;

    // Resolve the effective marking scheme for this question:
    // Priority: question.markingSchemeOverride > section.markingScheme > test defaults
    const secScheme = sectionSchemeMap[question.section] || null;
    const override = question.markingSchemeOverride || {};

    const correctMarks  = override.correct    ?? secScheme?.correct    ?? question.positiveMarks ?? test.defaultPositiveMarks;
    // SECURITY: Use Math.abs() to ensure incorrectMarks is always positive for deduction.
    const incorrectMarks = Math.abs(override.incorrect  ?? secScheme?.incorrect  ?? question.negativeMarks ?? test.defaultNegativeMarks);
    const isPartial     = override.partial     ?? secScheme?.partial    ?? false;
    const partialPerOpt = override.partialMarkPerOption ?? secScheme?.partialMarkPerOption ?? 1;
    const partialIncorr = Math.abs(override.partialIncorrect     ?? secScheme?.partialIncorrect     ?? incorrectMarks);

    maxPossible += correctMarks;

    // Initialize section score tracker
    const section = question.section || 'General';
    if (!sectionScores[section]) {
      sectionScores[section] = { correct: 0, wrong: 0, unattempted: 0, partial: 0, score: 0 };
    }

    // Unattempted
    if (!ans.selectedAnswer || ans.selectedAnswer.length === 0) {
      sectionScores[section].unattempted++;
      const unattemptedMark = override.unattempted ?? secScheme?.unattempted ?? 0;
      totalScore += unattemptedMark;
      sectionScores[section].score += unattemptedMark;
      continue;
    }

    const correctSet = new Set((question.correctAnswer || []).map(String));
    const selected   = (ans.selectedAnswer || []).map(String);

    // ── GRADING STRATEGIES ────────────────────────────────────────────────────

    if (question.type === 'single' || question.type === 'integer' || question.type === 'float' || question.type === 'matrix') {
      // Exact match required
      const exactCorrect = arraysEqual(selected.sort(), [...correctSet].sort());
      if (exactCorrect) {
        totalScore += correctMarks;
        sectionScores[section].correct++;
        sectionScores[section].score += correctMarks;
      } else {
        totalScore -= incorrectMarks;
        sectionScores[section].wrong++;
        sectionScores[section].score -= incorrectMarks;
      }

    } else if (question.type === 'multiple') {
      // Multi-correct: check if the student selected ANY wrong option first
      const hasWrongSelected = selected.some(s => !correctSet.has(s));

      if (hasWrongSelected) {
        // Any wrong option selected → negative marks (no partial credit)
        totalScore -= incorrectMarks;
        sectionScores[section].wrong++;
        sectionScores[section].score -= incorrectMarks;
      } else if (arraysEqual(selected.sort(), [...correctSet].sort())) {
        // All correct options selected → full marks
        totalScore += correctMarks;
        sectionScores[section].correct++;
        sectionScores[section].score += correctMarks;
      } else if (isPartial && selected.length > 0) {
        // Only correct options selected but not all → partial credit
        const partialScore = Math.min(selected.length * partialPerOpt, correctMarks);
        totalScore += partialScore;
        sectionScores[section].partial++;
        sectionScores[section].score += partialScore;
      } else {
        // Partial marking disabled, subset of correct selected → treat as wrong
        totalScore -= partialIncorr;
        sectionScores[section].wrong++;
        sectionScores[section].score -= partialIncorr;
      }
    }

  } // end for (const ans of attempt.answers)

  // Finalize
  attempt.totalScore = totalScore;
  attempt.maxPossibleScore = maxPossible;
  attempt.percentage = maxPossible > 0 ? Math.round((totalScore / maxPossible) * 10000) / 100 : 0;
  attempt.sectionScores = sectionScores;
  attempt.submittedAt = new Date();
  attempt.status = finalStatus;

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

  attempt.warnings.push({ type: 'auto-submit-cheat', timestamp: new Date() });
  await attempt.save();

  // Grade it same as normal submit
  return submitSession(attemptId, userId, 'auto-submitted');
};

// ─── Helpers ──────────────────────────────────────────────────────

function arraysEqual(a, b) {
  if (a.length !== b.length) return false;
  return a.every((val, idx) => val === b[idx]);
}
