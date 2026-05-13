import asyncHandler from 'express-async-handler';
import Test from '../models/Test.js';
import Question from '../models/Question.js';
import TestAttempt from '../models/TestAttempt.js';
import { getRedis } from '../config/redis.js';
import { assertCanAttemptTest } from '../services/attemptService.js';

const VALID_ANSWER_STATUSES = new Set([
  'unanswered',
  'answered',
  'marked-for-review',
  'answered-and-marked',
]);

const getClientIp = (req) => {
  const forwarded = req.headers['x-forwarded-for'];
  const rawIp = Array.isArray(forwarded)
    ? forwarded[0]
    : forwarded?.split(',')[0] || req.ip || req.socket?.remoteAddress || '';
  return rawIp.replace(/^::ffff:/, '').trim();
};

const computeTimeLeft = (test, startTime) => {
  const startedAt = new Date(startTime).getTime();
  if (!Number.isFinite(startedAt)) return test.durationMinutes * 60;

  const elapsedSeconds = Math.max(0, Math.floor((Date.now() - startedAt) / 1000));
  return Math.max(0, (test.durationMinutes * 60) - elapsedSeconds);
};

const toSafeQuestions = (questions) => questions.map((q) => {
  const qObj = typeof q.toObject === 'function' ? q.toObject() : { ...q };
  delete qObj.correctAnswer;
  delete qObj.solution;
  delete qObj.solutionImageUrl;
  return qObj;
});

const normalizeSelectedAnswer = (answer = {}) => {
  const selected = answer.selectedOption ?? answer.selectedAnswer ?? [];
  if (Array.isArray(selected)) return selected.map(String);
  if (selected === null || selected === undefined || selected === '') return [];
  return [String(selected)];
};

const normalizeStatus = (status, selectedAnswer) => {
  if (VALID_ANSWER_STATUSES.has(status)) return status;
  return selectedAnswer.length ? 'answered' : 'unanswered';
};

const sessionAnswersToRows = (answers = {}) => Object.entries(answers).map(([questionId, answer]) => {
  const selectedAnswer = normalizeSelectedAnswer(answer);
  return {
    questionId,
    selectedAnswer,
    status: normalizeStatus(answer?.status, selectedAnswer),
    timeSpentSeconds: Number(answer?.timeSpentSeconds) || 0,
  };
});

const answerRowsToSessionMap = (rows = []) => rows.reduce((acc, row) => {
  acc[row.questionId.toString()] = {
    selectedOption: row.selectedAnswer || [],
    status: normalizeStatus(row.status, row.selectedAnswer || []),
    timeSpentSeconds: row.timeSpentSeconds || 0,
  };
  return acc;
}, {});

const buildCompleteAnswerRows = (questions, answers = {}) => questions.map((question) => {
  const answer = answers?.[question._id.toString()] || {};
  const selectedAnswer = normalizeSelectedAnswer(answer);
  return {
    questionId: question._id,
    selectedAnswer,
    status: normalizeStatus(answer.status, selectedAnswer),
    timeSpentSeconds: Number(answer.timeSpentSeconds) || 0,
  };
});

const gradeAttempt = (attempt, test, questions) => {
  const questionMap = new Map(questions.map((q) => [q._id.toString(), q]));
  let totalScore = 0;
  let maxPossibleScore = 0;
  const sectionScores = {};

  for (const answer of attempt.answers || []) {
    const question = questionMap.get(answer.questionId.toString());
    if (!question) continue;

    const pos = question.positiveMarks ?? test.defaultPositiveMarks;
    const neg = question.negativeMarks ?? test.defaultNegativeMarks;
    const section = question.section || 'General';
    maxPossibleScore += pos;

    if (!sectionScores[section]) {
      sectionScores[section] = { correct: 0, wrong: 0, unattempted: 0, score: 0 };
    }

    const selected = [...(answer.selectedAnswer || [])].sort();
    if (selected.length === 0) {
      sectionScores[section].unattempted += 1;
      continue;
    }

    const expected = [...(question.correctAnswer || [])].sort();
    const isCorrect =
      selected.length === expected.length &&
      selected.every((option, idx) => option === expected[idx]);

    if (isCorrect) {
      totalScore += pos;
      sectionScores[section].correct += 1;
      sectionScores[section].score += pos;
    } else {
      totalScore -= neg;
      sectionScores[section].wrong += 1;
      sectionScores[section].score -= neg;
    }
  }

  attempt.totalScore = totalScore;
  attempt.maxPossibleScore = maxPossibleScore;
  attempt.percentage = maxPossibleScore > 0
    ? Math.round((totalScore / maxPossibleScore) * 10000) / 100
    : 0;
  attempt.sectionScores = sectionScores;
  attempt.submittedAt = new Date();
  attempt.status = 'completed';
};

/**
 * Start Assessment / Resume Assessment
 * Validates access, fetches questions (stripping answers), initializes/retrieves Redis session.
 * @route GET /assessment/:testId/start
 */
export const startAssessment = asyncHandler(async (req, res) => {
  const { testId } = req.params;
  const userId = req.user._id.toString();
  const redis = getRedis();

  // Check if test exists
  const test = await Test.findById(testId);
  if (!test) {
    return res.status(404).json({ message: 'Test not found' });
  }
  await assertCanAttemptTest(test, req.user);

  const questions = await Question.find({ testId }).sort({ order: 1 });
  const safeQuestions = toSafeQuestions(questions);

  if (!redis) {
    let attempt = await TestAttempt.findOne({
      userId,
      testId,
      status: 'in-progress',
    }).sort({ createdAt: -1 });

    if (!attempt) {
      attempt = await TestAttempt.create({
        userId,
        testId,
        status: 'in-progress',
        ipAddress: getClientIp(req),
        answers: [],
      });
    } else if (!attempt.ipAddress) {
      attempt.ipAddress = getClientIp(req);
      await attempt.save();
    }

    return res.status(200).json({
      test: test.toRedisPayload(),
      questions: safeQuestions,
      session: {
        startTime: attempt.startedAt,
        timeLeft: computeTimeLeft(test, attempt.startedAt),
        publicIp: attempt.ipAddress || getClientIp(req),
        answers: answerRowsToSessionMap(attempt.answers),
      },
    });
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
      publicIp: getClientIp(req),
      answers: {}, // map of questionId -> { status: 'not_visited', selectedOption: null, markedForReview: false }
    };
    await redis.hSet(sessionKey, 'data', JSON.stringify(activeSession));
    // Set expiry for safety (duration + 1 hour buffer)
    await redis.expire(sessionKey, (test.durationMinutes * 60) + 3600);
  }
  activeSession.timeLeft = computeTimeLeft(test, activeSession.startTime);
  activeSession.publicIp = activeSession.publicIp || getClientIp(req);

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

  const { answers, timeLeft } = req.body;
  const sessionKey = `cbt_session:${userId}:${testId}`;
  const parsedTimeLeft = timeLeft === undefined ? null : Number(timeLeft);

  if (timeLeft !== undefined && (!Number.isFinite(parsedTimeLeft) || parsedTimeLeft < 0)) {
    return res.status(400).json({ message: 'timeLeft must be a non-negative number' });
  }

  if (answers !== undefined && (typeof answers !== 'object' || Array.isArray(answers) || answers === null)) {
    return res.status(400).json({ message: 'answers must be an object keyed by question ID' });
  }

  const test = await Test.findById(testId);
  if (!test) {
    return res.status(404).json({ message: 'Test not found' });
  }
  await assertCanAttemptTest(test, req.user);

  if (!redis) {
    const attempt = await TestAttempt.findOne({
      userId,
      testId,
      status: 'in-progress',
    }).sort({ createdAt: -1 });

    if (!attempt) {
      return res.status(404).json({ message: 'Active session not found or expired' });
    }

    if (answers !== undefined) {
      attempt.answers = sessionAnswersToRows(answers);
    }
    await attempt.save();
    return res.status(200).json({
      message: 'Synced',
      timeLeft: computeTimeLeft(test, attempt.startedAt),
    });
  }

  const activeSessionRaw = await redis.hGet(sessionKey, 'data');
  if (!activeSessionRaw) {
    return res.status(404).json({ message: 'Active session not found or expired' });
  }

  const activeSession = JSON.parse(activeSessionRaw);
  
  // Merge answers
  activeSession.timeLeft = computeTimeLeft(test, activeSession.startTime);
  activeSession.answers = { ...activeSession.answers, ...(answers || {}) };

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

  const sessionKey = `cbt_session:${userId}:${testId}`;
  const test = await Test.findById(testId);
  if (!test) {
    return res.status(404).json({ message: 'Test not found' });
  }
  await assertCanAttemptTest(test, req.user);

  if (!redis) {
    const attempt = await TestAttempt.findOne({
      userId,
      testId,
      status: 'in-progress',
    }).sort({ createdAt: -1 });

    if (!attempt) {
      return res.status(404).json({ message: 'Session expired or not found. Cannot evaluate.' });
    }

    const questions = await Question.find({ testId }).sort({ order: 1 }).lean();
    const answers = answerRowsToSessionMap(attempt.answers);
    attempt.durationUsedMinutes = Math.round((Date.now() - new Date(attempt.startedAt).getTime()) / 60000);
    attempt.ipAddress = attempt.ipAddress || getClientIp(req);
    attempt.answers = buildCompleteAnswerRows(questions, answers);
    gradeAttempt(attempt, test, questions);
    await attempt.save();

    return res.status(201).json({ message: 'Evaluation completed', attempt });
  }

  const activeSessionRaw = await redis.hGet(sessionKey, 'data');
  if (!activeSessionRaw) {
    return res.status(404).json({ message: 'Session expired or not found. Cannot evaluate.' });
  }

  const { answers, startTime, publicIp } = JSON.parse(activeSessionRaw);

  const endTime = new Date();
  const durationUsedMinutes = Math.round((endTime.getTime() - new Date(startTime).getTime()) / 60000);
  const questions = await Question.find({ testId }).sort({ order: 1 }).lean();
  const answerRows = buildCompleteAnswerRows(questions, answers);

  const attempt = new TestAttempt({
    userId,
    testId,
    status: 'completed',
    durationUsedMinutes,
    ipAddress: publicIp || getClientIp(req),
    answers: answerRows,
  });
  gradeAttempt(attempt, test, questions);
  await attempt.save();

  // Cleanup Redis
  await redis.del(sessionKey);

  res.status(201).json({ message: 'Evaluation completed', attempt });
});

export const getMyAssessmentResults = asyncHandler(async (req, res) => {
  const attempts = await TestAttempt.find({
    userId: req.user._id,
    status: { $in: ['completed', 'auto-submitted', 'evaluating'] },
  })
    .populate('testId', 'title category totalMarks durationMinutes sections')
    .sort({ submittedAt: -1, createdAt: -1 })
    .limit(50)
    .lean();

  res.json(attempts.map((attempt) => {
    const sectionScores = attempt.sectionScores instanceof Map
      ? Object.fromEntries(attempt.sectionScores)
      : attempt.sectionScores || {};

    return {
      _id: attempt._id,
      status: attempt.status,
      test: attempt.testId,
      startedAt: attempt.startedAt,
      submittedAt: attempt.submittedAt,
      durationUsedMinutes: attempt.durationUsedMinutes,
      totalScore: attempt.totalScore,
      maxPossibleScore: attempt.maxPossibleScore,
      percentage: attempt.percentage,
      sectionScores,
      answered: attempt.answers?.filter((answer) => answer.selectedAnswer?.length > 0).length || 0,
      totalQuestions: attempt.answers?.length || 0,
      ipAddress: attempt.ipAddress || '',
    };
  }));
});

export const getTestLeaderboard = asyncHandler(async (req, res) => {
  const { testId } = req.params;
  const userId = req.user._id.toString();

  const test = await Test.findById(testId).select('title totalMarks sections');
  if (!test) {
    return res.status(404).json({ message: 'Test not found' });
  }

  const attempts = await TestAttempt.find({
    testId,
    status: { $in: ['completed', 'auto-submitted'] }
  })
    .populate('userId', 'name username')
    .sort({ totalScore: -1, submittedAt: 1 });

  let myAttempt = null;
  const mappedLeaderboard = attempts.map((attempt, index) => {
    const isMe = attempt.userId?._id?.toString() === userId;
    
    const sectionScores = attempt.sectionScores instanceof Map
      ? Object.fromEntries(attempt.sectionScores)
      : attempt.sectionScores || {};

    const entry = {
      rank: index + 1,
      name: isMe ? 'You' : (attempt.userId?.name || 'Anonymous Student'),
      username: attempt.userId?.username || 'anonymous',
      totalScore: attempt.totalScore,
      maxPossibleScore: attempt.maxPossibleScore,
      percentage: attempt.percentage,
      sectionScores,
      isMe,
    };

    if (isMe) {
      myAttempt = entry;
    }

    return entry;
  });

  res.json({
    test,
    myRank: myAttempt ? myAttempt.rank : null,
    leaderboard: mappedLeaderboard
  });
});

export const getAssessmentReview = asyncHandler(async (req, res) => {
  const { attemptId } = req.params;
  const userId = req.user._id.toString();

  const attempt = await TestAttempt.findById(attemptId)
    .populate('testId', 'title category durationMinutes totalMarks');

  if (!attempt) {
    return res.status(404).json({ message: 'Attempt not found.' });
  }

  if (attempt.userId.toString() !== userId) {
    return res.status(403).json({ message: 'Access denied.' });
  }

  if (attempt.status !== 'completed' && attempt.status !== 'auto-submitted') {
    return res.status(400).json({ message: 'Attempt must be completed to review answers.' });
  }

  const questions = await Question.find({ testId: attempt.testId._id }).sort({ order: 1 }).lean();

  const userAnswersMap = new Map();
  for (const ans of attempt.answers || []) {
    userAnswersMap.set(ans.questionId.toString(), ans);
  }

  const reviewedQuestions = questions.map((q) => {
    const userAns = userAnswersMap.get(q._id.toString()) || {
      selectedAnswer: [],
      status: 'unanswered',
      timeSpentSeconds: 0,
    };

    const expected = [...(q.correctAnswer || [])].sort();
    const selected = [...(userAns.selectedAnswer || [])].sort();
    
    const isUnanswered = selected.length === 0;
    const isCorrect = !isUnanswered && 
      selected.length === expected.length && 
      selected.every((val, idx) => val === expected[idx]);

    return {
      ...q,
      userAnswer: selected,
      status: userAns.status,
      timeSpentSeconds: userAns.timeSpentSeconds,
      resultStatus: isUnanswered ? 'skipped' : (isCorrect ? 'correct' : 'wrong'),
    };
  });

  res.json({
    attemptSummary: {
      testTitle: attempt.testId.title,
      totalScore: attempt.totalScore,
      maxPossibleScore: attempt.maxPossibleScore,
      percentage: attempt.percentage,
      submittedAt: attempt.submittedAt,
      sectionScores: attempt.sectionScores instanceof Map ? Object.fromEntries(attempt.sectionScores) : attempt.sectionScores || {},
    },
    questions: reviewedQuestions,
  });
});
