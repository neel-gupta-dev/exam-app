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

const toValidDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const normalizeVisitLog = (visitLog = []) => {
  if (!Array.isArray(visitLog)) return [];
  return visitLog.slice(-500).map((visit) => ({
    enteredAt: toValidDate(visit?.enteredAt),
    leftAt: toValidDate(visit?.leftAt),
    durationSeconds: Math.max(0, Math.round(Number(visit?.durationSeconds) || 0)),
  }));
};

const normalizeTelemetry = (answer = {}) => {
  const visitLog = normalizeVisitLog(answer.visitLog);
  const visitCount = Math.max(Number(answer.visitCount) || 0, visitLog.length);
  const timeFromVisits = visitLog.reduce((sum, visit) => sum + (visit.durationSeconds || 0), 0);
  const timeSpentSeconds = Math.max(
    Math.round(Number(answer.timeSpentSeconds) || 0),
    Math.round(timeFromVisits)
  );

  return {
    timeSpentSeconds,
    visitCount,
    firstVisitedAt: toValidDate(answer.firstVisitedAt) || visitLog[0]?.enteredAt || null,
    lastVisitedAt: toValidDate(answer.lastVisitedAt) || visitLog[visitLog.length - 1]?.enteredAt || null,
    visitLog,
    answerChangeCount: Math.max(0, Math.round(Number(answer.answerChangeCount) || 0)),
    idleSeconds: Math.max(0, Math.round(Number(answer.idleSeconds) || 0)),
  };
};

const normalizeDeviceInfo = (deviceInfo = {}) => {
  if (!deviceInfo || typeof deviceInfo !== 'object' || Array.isArray(deviceInfo)) {
    return {};
  }

  return {
    userAgent: String(deviceInfo.userAgent || '').slice(0, 500),
    screenResolution: String(deviceInfo.screenResolution || '').slice(0, 50),
    deviceMemory: Number.isFinite(Number(deviceInfo.deviceMemory)) ? Number(deviceInfo.deviceMemory) : null,
    connectionType: String(deviceInfo.connectionType || '').slice(0, 50),
    isMobile: Boolean(deviceInfo.isMobile),
    timezone: String(deviceInfo.timezone || '').slice(0, 100),
  };
};

const sessionAnswersToRows = (answers = {}) => Object.entries(answers).map(([questionId, answer]) => {
  const selectedAnswer = normalizeSelectedAnswer(answer);
  const telemetry = normalizeTelemetry(answer);
  return {
    questionId,
    selectedAnswer,
    status: normalizeStatus(answer?.status, selectedAnswer),
    ...telemetry,
  };
});

const answerRowsToSessionMap = (rows = []) => rows.reduce((acc, row) => {
  acc[row.questionId.toString()] = {
    selectedOption: row.selectedAnswer || [],
    status: normalizeStatus(row.status, row.selectedAnswer || []),
    timeSpentSeconds: row.timeSpentSeconds || 0,
    visitCount: row.visitCount || 0,
    firstVisitedAt: row.firstVisitedAt || null,
    lastVisitedAt: row.lastVisitedAt || null,
    visitLog: row.visitLog || [],
    answerChangeCount: row.answerChangeCount || 0,
    idleSeconds: row.idleSeconds || 0,
  };
  return acc;
}, {});

const buildCompleteAnswerRows = (questions, answers = {}) => questions.map((question) => {
  const answer = answers?.[question._id.toString()] || {};
  const selectedAnswer = normalizeSelectedAnswer(answer);
  const telemetry = normalizeTelemetry(answer);
  return {
    questionId: question._id,
    selectedAnswer,
    status: normalizeStatus(answer.status, selectedAnswer),
    ...telemetry,
  };
});

const gradeAttempt = (attempt, test, questions) => {
  const questionMap = new Map(questions.map((q) => [q._id.toString(), q]));
  let totalScore = 0;
  let maxPossibleScore = 0;
  const sectionScores = {};

  // Map section definitions for easy lookup
  const sectionConfigs = {};
  test.sections?.forEach(s => {
    sectionConfigs[s.name] = s;
  });

  // Track attempts for capped sections
  const sectionAttempts = {};

  // Sort answers by original question order to ensure "first N" rule is consistent
  const sortedAnswers = (attempt.answers || []).sort((a, b) => {
    const qA = questionMap.get(a.questionId.toString());
    const qB = questionMap.get(b.questionId.toString());
    return (qA?.order || 0) - (qB?.order || 0);
  });

  for (const answer of sortedAnswers) {
    const question = questionMap.get(answer.questionId.toString());
    if (!question) continue;

    const section = question.section || 'General';
    const config = sectionConfigs[section];
    const pos = question.positiveMarks ?? test.defaultPositiveMarks;
    const neg = question.negativeMarks ?? test.defaultNegativeMarks;

    if (!sectionScores[section]) {
      sectionScores[section] = { correct: 0, wrong: 0, unattempted: 0, score: 0, ignored: 0 };
    }

    const selected = [...(answer.selectedAnswer || [])].sort();
    const isAttempted = selected.length > 0;

    // NEET/Capped Logic: Check if we've exceeded the maxAttemptable for this section
    if (config?.maxAttemptable && isAttempted) {
      if (!sectionAttempts[section]) sectionAttempts[section] = 0;
      
      if (sectionAttempts[section] >= config.maxAttemptable) {
        // This question is beyond the limit. Ignore it for scoring.
        sectionScores[section].ignored += 1;
        continue;
      }
      sectionAttempts[section] += 1;
    }

    // Update maxPossibleScore: 
    // If section is capped, maxPossibleScore for that section should ideally be cap * pos.
    // However, questions might have different pos marks. 
    // Simplified: we add 'pos' to maxPossibleScore only if we haven't reached the count of questions that SHOULD be scored.
    // In NEET, it's usually 35 (Sec A) + 10 (Sec B) = 45 questions * 4 = 180 marks per subject.
    
    // For now, we sum 'pos' for every question, but we need to adjust for capped sections.
    // A better way: calculate maxPossibleScore separately based on test structure.
    maxPossibleScore += pos; 

    if (!isAttempted) {
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

  // Final adjustment for maxPossibleScore if there were capped sections
  // This is a complex area because if a section has 15 Qs and cap is 10, 
  // maxPossibleScore should subtract the positive marks of the 5 questions that WEREN'T scored.
  // We'll calculate the 'real' maxPossibleScore by iterating through sections.
  let adjustedMaxPossibleScore = 0;
  const questionsBySection = {};
  questions.forEach(q => {
    const s = q.section || 'General';
    if (!questionsBySection[s]) questionsBySection[s] = [];
    questionsBySection[s].push(q);
  });

  Object.keys(questionsBySection).forEach(sName => {
    const sQs = questionsBySection[sName];
    const config = sectionConfigs[sName];
    const sortedQs = [...sQs].sort((a, b) => a.order - b.order);
    
    if (config?.maxAttemptable) {
      // Sum the top N positive marks
      const topN = sortedQs.slice(0, config.maxAttemptable);
      topN.forEach(q => { adjustedMaxPossibleScore += (q.positiveMarks ?? test.defaultPositiveMarks); });
    } else {
      sQs.forEach(q => { adjustedMaxPossibleScore += (q.positiveMarks ?? test.defaultPositiveMarks); });
    }
  });

  attempt.totalScore = totalScore;
  attempt.maxPossibleScore = adjustedMaxPossibleScore;
  attempt.percentage = adjustedMaxPossibleScore > 0
    ? Math.round((totalScore / adjustedMaxPossibleScore) * 10000) / 100
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

  const { answers, timeLeft, deviceInfo } = req.body;
  const sessionKey = `cbt_session:${userId}:${testId}`;
  const parsedTimeLeft = timeLeft === undefined ? null : Number(timeLeft);

  if (timeLeft !== undefined && (!Number.isFinite(parsedTimeLeft) || parsedTimeLeft < 0)) {
    return res.status(400).json({ message: 'timeLeft must be a non-negative number' });
  }

  if (answers !== undefined && (typeof answers !== 'object' || Array.isArray(answers) || answers === null)) {
    return res.status(400).json({ message: 'answers must be an object keyed by question ID' });
  }

  if (deviceInfo !== undefined && (typeof deviceInfo !== 'object' || Array.isArray(deviceInfo) || deviceInfo === null)) {
    return res.status(400).json({ message: 'deviceInfo must be an object' });
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
    if (deviceInfo !== undefined) {
      attempt.deviceInfo = {
        ...(attempt.deviceInfo?.toObject?.() || attempt.deviceInfo || {}),
        ...normalizeDeviceInfo(deviceInfo),
      };
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
  if (deviceInfo !== undefined) {
    activeSession.deviceInfo = {
      ...(activeSession.deviceInfo || {}),
      ...normalizeDeviceInfo(deviceInfo),
    };
  }

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

  const { answers, startTime, publicIp, deviceInfo } = JSON.parse(activeSessionRaw);

  const endTime = new Date();
  const durationUsedMinutes = Math.round((endTime.getTime() - new Date(startTime).getTime()) / 60000);
  const questions = await Question.find({ testId }).sort({ order: 1 }).lean();
  const answerRows = buildCompleteAnswerRows(questions, answers);

  const attempt = new TestAttempt({
    userId,
    testId,
    status: 'completed',
    startedAt: startTime ? new Date(startTime) : undefined,
    durationUsedMinutes,
    ipAddress: publicIp || getClientIp(req),
    deviceInfo: normalizeDeviceInfo(deviceInfo),
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
    status: { $in: ['SUBMITTED', 'EVALUATED'] },
  })
    .sort({ submittedAt: -1, createdAt: -1 })
    .limit(50)
    .lean();

  const testIds = [...new Set(attempts.map(a => a.testId))];
  const tests = await Test.find({ _id: { $in: testIds } })
    .select('title category totalMarks durationMinutes sections')
    .lean();
  const testMap = Object.fromEntries(tests.map(t => [t._id.toString(), t]));

  res.json(attempts.map((attempt) => {
    const test = testMap[attempt.testId?.toString()] || attempt.testId;
    const sectionScores = attempt.sectionScores instanceof Map
      ? Object.fromEntries(attempt.sectionScores)
      : attempt.sectionScores || {};
    const questionTelemetry = (attempt.answers || []).map((answer) => ({
      questionId: answer.questionId,
      timeSpentSeconds: Math.max(0, Math.round(Number(answer.timeSpentSeconds) || 0)),
      visitCount: Math.max(0, Math.round(Number(answer.visitCount) || 0)),
      firstVisitedAt: answer.firstVisitedAt || null,
      lastVisitedAt: answer.lastVisitedAt || null,
      visitLog: answer.visitLog || [],
      answerChangeCount: Math.max(0, Math.round(Number(answer.answerChangeCount) || 0)),
      idleSeconds: Math.max(0, Math.round(Number(answer.idleSeconds) || 0)),
      effectiveTimeSeconds: Math.max(
        0,
        Math.round(Number(answer.timeSpentSeconds) || 0) - Math.round(Number(answer.idleSeconds) || 0)
      ),
      status: answer.status,
      answered: Boolean(answer.selectedAnswer?.length),
    }));
    const totalTimeSpentSeconds = questionTelemetry.reduce((sum, item) => sum + item.timeSpentSeconds, 0);
    const mostTimeSpentQuestion = questionTelemetry.reduce((max, item) => (
      item.timeSpentSeconds > (max?.timeSpentSeconds || 0) ? item : max
    ), null);

    return {
      _id: attempt._id,
      status: attempt.status,
      test: test,
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
      deviceInfo: attempt.deviceInfo || {},
      telemetry: {
        totalTimeSpentSeconds,
        totalEffectiveTimeSeconds: questionTelemetry.reduce((sum, item) => sum + item.effectiveTimeSeconds, 0),
        averageQuestionTimeSeconds: questionTelemetry.length
          ? Math.round(totalTimeSpentSeconds / questionTelemetry.length)
          : 0,
        totalVisits: questionTelemetry.reduce((sum, item) => sum + item.visitCount, 0),
        totalAnswerChanges: questionTelemetry.reduce((sum, item) => sum + item.answerChangeCount, 0),
        totalIdleSeconds: questionTelemetry.reduce((sum, item) => sum + item.idleSeconds, 0),
        mostTimeSpentQuestion,
        questions: questionTelemetry,
      },
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
    status: { $in: ['SUBMITTED', 'EVALUATED'] }
  })
    .sort({ submittedAt: 1 })
    .lean();

  import User from '../models/User.js'; // Needed for batch-fetch
  const userIds = [...new Set(attempts.map(a => a.userId))];
  // Batch fetch users in chunks of 500
  import chunk from 'lodash/chunk.js';
  const userChunks = chunk(userIds, 500);
  const users = [];
  for (const c of userChunks) {
    const fetched = await User.find({ _id: { $in: c } }).select('name username').lean();
    users.push(...fetched);
  }
  const userMap = Object.fromEntries(users.map(u => [u._id.toString(), u]));

  const seenUsers = new Set();
  const uniqueAttempts = [];
  for (const attempt of attempts) {
    const uid = attempt.userId?.toString();
    if (uid && !seenUsers.has(uid)) {
      seenUsers.add(uid);
      attempt.user = userMap[uid] || { name: 'Anonymous Student', username: 'anonymous' };
      uniqueAttempts.push(attempt);
    }
  }

  uniqueAttempts.sort((a, b) => {
    if (b.score !== a.score) return (b.score || 0) - (a.score || 0);
    return new Date(a.submittedAt) - new Date(b.submittedAt);
  });

  let myAttempt = null;
  const mappedLeaderboard = uniqueAttempts.map((attempt, index) => {
    const isMe = attempt.userId?.toString() === userId;
    
    const sectionScores = attempt.sectionScores instanceof Map
      ? Object.fromEntries(attempt.sectionScores)
      : attempt.sectionScores || {};

    const entry = {
      rank: index + 1,
      name: isMe ? 'You' : attempt.user.name,
      username: attempt.user.username,
      totalScore: attempt.score || attempt.totalScore,
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

  const attempt = await TestAttempt.findById(attemptId).lean();

  if (!attempt) {
    return res.status(404).json({ message: 'Attempt not found.' });
  }

  const test = await Test.findById(attempt.testId).select('title category durationMinutes totalMarks').lean();
  attempt.test = test;

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
      visitCount: userAns.visitCount || 0,
      firstVisitedAt: userAns.firstVisitedAt || null,
      lastVisitedAt: userAns.lastVisitedAt || null,
      visitLog: userAns.visitLog || [],
      answerChangeCount: userAns.answerChangeCount || 0,
      idleSeconds: userAns.idleSeconds || 0,
      effectiveTimeSeconds: Math.max(0, (userAns.timeSpentSeconds || 0) - (userAns.idleSeconds || 0)),
      resultStatus: isUnanswered ? 'skipped' : (isCorrect ? 'correct' : 'wrong'),
    };
  });

  res.json({
    attemptSummary: {
      testId: test?._id,
      testTitle: test?.title,
      totalScore: attempt.score || attempt.totalScore,
      maxPossibleScore: attempt.maxPossibleScore,
      percentage: attempt.percentage,
      submittedAt: attempt.submittedAt,
      sectionScores: attempt.sectionScores instanceof Map ? Object.fromEntries(attempt.sectionScores) : attempt.sectionScores || {},
    },
    questions: reviewedQuestions,
  });
});
