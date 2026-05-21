import asyncHandler from 'express-async-handler';
import Test from '../models/Test.js';
import Question from '../models/Question.js';
import TestAttempt from '../models/TestAttempt.js';
import User from '../models/User.js';
import { getRedis } from '../config/redis.js';
import { assertCanAttemptTest } from '../services/attemptService.js';
import crypto from 'crypto';

/** Split an array into chunks of `size` */
const chunkArray = (arr, size) => {
  const result = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
};

const VALID_ANSWER_STATUSES = new Set([
  'unanswered',
  'answered',
  'marked-for-review',
  'answered-and-marked',
]);

const normalizeQuestionType = (value) => {
  const raw = String(value || 'single').trim().toLowerCase();
  if (raw === 'scq') return 'single';
  if (raw === 'mcq' || raw === 'multi') return 'multiple';
  if (raw === 'numerical' || raw === 'numeric') return 'integer';
  if (raw === 'decimal') return 'float';
  return raw;
};

const getClientIp = (req) => {
  const forwarded = req.headers['x-forwarded-for'];
  const rawIp = Array.isArray(forwarded)
    ? forwarded[0]
    : forwarded?.split(',')[0] || req.ip || req.socket?.remoteAddress || '';
  return rawIp.replace(/^::ffff:/, '').trim();
};

const createSessionToken = () => crypto.randomBytes(32).toString('hex');
const hashSessionToken = (token = '') => crypto.createHash('sha256').update(String(token)).digest('hex');

const getAttemptSessionToken = (req) => (
  req.query.attemptToken ||
  req.headers['x-attempt-token'] ||
  req.body?.attemptToken ||
  ''
);

const assertAttemptLock = (attempt, req) => {
  if (!attempt) return;
  const expected = attempt.sessionTokenHash;
  if (!expected) return;
  const token = getAttemptSessionToken(req);
  if (!token || hashSessionToken(token) !== expected) {
    const err = new Error('This attempt is open in another active test window. Please close this window and resume from the dashboard.');
    err.statusCode = 423;
    throw err;
  }
};

const computeTimeLeft = (test, startTime) => {
  const startedAt = new Date(startTime).getTime();
  if (!Number.isFinite(startedAt)) return test.durationMinutes * 60;

  const elapsedSeconds = Math.max(0, Math.floor((Date.now() - startedAt) / 1000));
  return Math.max(0, (test.durationMinutes * 60) - elapsedSeconds);
};

const toSafeQuestions = (questions) => questions.map((q) => {
  const qObj = typeof q.toObject === 'function' ? q.toObject() : { ...q };
  qObj.type = normalizeQuestionType(qObj.type);

  // Normalize fields between text/content and key/label for frontend/LaTeX renderer compatibility
  if (qObj.text && !qObj.content) {
    qObj.content = qObj.text;
  }
  if (qObj.options && Array.isArray(qObj.options)) {
    qObj.options = qObj.options.map(opt => {
      const optObj = typeof opt.toObject === 'function' ? opt.toObject() : { ...opt };
      if (optObj.text && !optObj.content) {
        optObj.content = optObj.text;
      }
      if (optObj.key && !optObj.label) {
        optObj.label = optObj.key;
      }
      return optObj;
    });
  }

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

const areSolutionsUnlocked = (test = {}) => {
  const mode = test.solutionReleaseMode || 'immediate';
  const now = Date.now();
  if (mode === 'immediate') return true;
  if (mode === 'never') return false;
  if (mode === 'manual') {
    return Boolean(test.solutionsReleasedAt && new Date(test.solutionsReleasedAt).getTime() <= now);
  }
  if (mode === 'after_end') {
    return Boolean(test.scheduledEndAt && new Date(test.scheduledEndAt).getTime() <= now);
  }
  return true;
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

export const createAssessmentAttempt = asyncHandler(async (req, res) => {
  const { testId } = req.params;
  const userId = req.user._id.toString();
  const test = await Test.findById(testId);

  if (!test) {
    return res.status(404).json({ message: 'Test not found' });
  }

  await assertCanAttemptTest(test, req.user);

  let attempt = await TestAttempt.findOne({
    userId,
    testId,
    status: 'in-progress',
  }).select('+sessionTokenHash').sort({ createdAt: -1 });

  if (!attempt) {
    const completedAttemptCount = await TestAttempt.countDocuments({
      userId,
      testId,
      status: { $in: ['completed', 'auto-submitted'] },
    });
    const allowedAttemptCount = Math.max(1, Number(test.allowedAttemptCount) || 1);
    if (completedAttemptCount >= allowedAttemptCount) {
      return res.status(403).json({
        message: `You have used all ${allowedAttemptCount} allowed attempt${allowedAttemptCount === 1 ? '' : 's'} for this test.`,
      });
    }

    attempt = await TestAttempt.findOneAndUpdate(
      { userId, testId, status: 'in-progress' },
      {
        $setOnInsert: {
          userId,
          testId,
          tenantId: req.user.tenantId || test.tenantId || undefined,
          status: 'in-progress',
          ipAddress: getClientIp(req),
          answers: [],
        }
      },
      { new: true, upsert: true }
    );
    // Fetch again to ensure we get +sessionTokenHash if it was already existing but just matched by findOneAndUpdate
    attempt = await TestAttempt.findById(attempt._id).select('+sessionTokenHash');
  }

  const sessionToken = createSessionToken();
  attempt.sessionTokenHash = hashSessionToken(sessionToken);
  attempt.sessionStartedAt = new Date();
  attempt.lastSyncAt = new Date();
  attempt.lockReleasedAt = null;
  attempt.ipAddress = attempt.ipAddress || getClientIp(req);
  await attempt.save();

  res.status(201).json({
    attemptId: attempt._id,
    attemptToken: sessionToken,
    publicIp: attempt.ipAddress,
    test: test.toRedisPayload(),
  });
});

const gradeAttempt = (attempt, test, questions) => {
  const questionMap = new Map(questions.map((q) => [q._id.toString(), q]));
  let totalScore = 0;
  let maxPossible = 0;
  const sectionScores = {};
  const topicPerformance = {};

  const sectionSchemeMap = {};
  if (test.sections && test.sections.length > 0) {
    for (const sec of test.sections) {
      sectionSchemeMap[sec.name] = sec.markingScheme || null;
    }
  }

  // Helper for array equality
  const arraysEqual = (a, b) => {
    if (a.length !== b.length) return false;
    return a.every((val, idx) => val === b[idx]);
  };

  for (const ans of attempt.answers || []) {
    const question = questionMap.get(ans.questionId.toString());
    if (!question) continue;

    if (question.type === 'comprehension_parent') continue;

    const section = question.section || 'General';
    const secScheme = sectionSchemeMap[section] || null;
    const override = question.markingSchemeOverride || {};

    const correctMarks  = override.correct    ?? secScheme?.correct    ?? question.positiveMarks ?? test.defaultPositiveMarks;
    const incorrectMarks = override.incorrect  ?? secScheme?.incorrect  ?? question.negativeMarks ?? test.defaultNegativeMarks;
    const isPartial     = override.partial     ?? secScheme?.partial    ?? false;
    const partialPerOpt = override.partialMarkPerOption ?? secScheme?.partialMarkPerOption ?? 1;
    const partialIncorr = override.partialIncorrect     ?? secScheme?.partialIncorrect     ?? incorrectMarks;

    maxPossible += correctMarks;

    if (!sectionScores[section]) {
      sectionScores[section] = { correct: 0, wrong: 0, unattempted: 0, partial: 0, score: 0 };
    }

    const recordTopics = (bucket) => {
      const tags = Array.isArray(question.tags) && question.tags.length ? question.tags : [section];
      tags.forEach((tag) => {
        const key = String(tag || 'General').trim() || 'General';
        if (!topicPerformance[key]) topicPerformance[key] = { correct: 0, wrong: 0, skipped: 0 };
        topicPerformance[key][bucket] += 1;
      });
    };

    if (!ans.selectedAnswer || ans.selectedAnswer.length === 0) {
      sectionScores[section].unattempted++;
      const unattemptedMark = override.unattempted ?? secScheme?.unattempted ?? 0;
      totalScore += unattemptedMark;
      sectionScores[section].score += unattemptedMark;
      recordTopics('skipped');
      continue;
    }

    const correctSet = new Set((question.correctAnswer || []).map(String));
    const selected   = (ans.selectedAnswer || []).map(String);

    if (question.type === 'single' || question.type === 'integer' || question.type === 'float' || question.type === 'matrix') {
      const exactCorrect = arraysEqual(selected.sort(), [...correctSet].sort());
      if (exactCorrect) {
        totalScore += correctMarks;
        sectionScores[section].correct++;
        sectionScores[section].score += correctMarks;
        recordTopics('correct');
      } else {
        totalScore -= incorrectMarks;
        sectionScores[section].wrong++;
        sectionScores[section].score -= incorrectMarks;
        recordTopics('wrong');
      }
    } else if (question.type === 'multiple') {
      const hasWrongSelected = selected.some(s => !correctSet.has(s));

      if (hasWrongSelected) {
        totalScore -= incorrectMarks;
        sectionScores[section].wrong++;
        sectionScores[section].score -= incorrectMarks;
        recordTopics('wrong');
      } else if (arraysEqual(selected.sort(), [...correctSet].sort())) {
        totalScore += correctMarks;
        sectionScores[section].correct++;
        sectionScores[section].score += correctMarks;
        recordTopics('correct');
      } else if (isPartial && selected.length > 0) {
        const partialScore = Math.min(selected.length * partialPerOpt, correctMarks);
        totalScore += partialScore;
        sectionScores[section].partial++;
        sectionScores[section].score += partialScore;
        recordTopics('correct');
      } else {
        totalScore -= partialIncorr;
        sectionScores[section].wrong++;
        sectionScores[section].score -= partialIncorr;
        recordTopics('wrong');
      }
    }
  }

  attempt.score = totalScore;
  attempt.totalScore = totalScore;
  attempt.maxPossibleScore = maxPossible;
  attempt.percentage = maxPossible > 0 ? Math.round((totalScore / maxPossible) * 10000) / 100 : 0;
  attempt.sectionScores = sectionScores;
  attempt.topicPerformance = topicPerformance;
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
  const attemptId = req.query.attemptId;
  const userId = req.user._id.toString();
  const redis = getRedis();

  // Check if test exists
  const test = await Test.findById(testId);
  if (!test) {
    return res.status(404).json({ message: 'Test not found' });
  }
  await assertCanAttemptTest(test, req.user);

  if (!attemptId) {
    const [activeAttempt, completedAttemptCount] = await Promise.all([
      TestAttempt.findOne({ userId, testId, status: 'in-progress' }).select('_id'),
      TestAttempt.countDocuments({ userId, testId, status: { $in: ['completed', 'auto-submitted'] } }),
    ]);
    const allowedAttemptCount = Math.max(1, Number(test.allowedAttemptCount) || 1);
    if (!activeAttempt && completedAttemptCount >= allowedAttemptCount) {
      return res.status(403).json({
        message: `You have used all ${allowedAttemptCount} allowed attempt${allowedAttemptCount === 1 ? '' : 's'} for this test.`,
      });
    }
  }

  const questions = await Question.find({ testId }).sort({ order: 1 });
  const safeQuestions = toSafeQuestions(questions);
  let lockedAttempt = null;
  if (attemptId) {
    lockedAttempt = await TestAttempt.findOne({ _id: attemptId, userId, testId }).select('+sessionTokenHash');
    if (!lockedAttempt) {
      return res.status(404).json({ message: 'Attempt not found for this test.' });
    }
    if (lockedAttempt.status !== 'in-progress') {
      return res.status(400).json({ message: 'This attempt has already been submitted.' });
    }
    assertAttemptLock(lockedAttempt, req);
    if (!lockedAttempt.ipAddress) {
      lockedAttempt.ipAddress = getClientIp(req);
      await lockedAttempt.save();
    }
  }

  if (!redis) {
    let attempt;
    if (attemptId) {
      attempt = lockedAttempt;
    } else {
      attempt = await TestAttempt.findOne({
        userId,
        testId,
        status: 'in-progress',
      }).sort({ createdAt: -1 });
    }

    if (!attempt) {
      attempt = await TestAttempt.create({
        _id: attemptId || undefined,
        userId,
        testId,
        tenantId: req.user.tenantId || test.tenantId || undefined,
        status: 'in-progress',
        ipAddress: getClientIp(req),
        answers: [],
      });
      attempt = await TestAttempt.findById(attempt._id).select('+sessionTokenHash');
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
  const sessionKey = attemptId 
    ? `cbt_session:${userId}:${testId}:${attemptId}` 
    : `cbt_session:${userId}:${testId}`;

  // Check if an active session exists in Redis
  const activeSessionRaw = await redis.hGet(sessionKey, 'data');
  let activeSession;

  if (activeSessionRaw) {
    activeSession = JSON.parse(activeSessionRaw);
  } else {
    // Check if an in-progress attempt exists in MongoDB
    let attempt;
    if (attemptId) {
      attempt = lockedAttempt;
    } else {
      attempt = await TestAttempt.findOne({
        userId,
        testId,
        status: 'in-progress',
      }).sort({ createdAt: -1 });
    }

    if (attempt) {
      activeSession = {
        startTime: attempt.startedAt.toISOString(),
        timeLeft: computeTimeLeft(test, attempt.startedAt),
        publicIp: attempt.ipAddress || getClientIp(req),
        answers: answerRowsToSessionMap(attempt.answers),
      };
    } else {
      // Initialize a new session
      activeSession = {
        startTime: new Date().toISOString(),
        timeLeft: test.durationMinutes * 60, // in seconds
        publicIp: getClientIp(req),
        answers: {}, // map of questionId -> { status: 'not_visited', selectedOption: null, markedForReview: false }
      };
    }
    await redis.hSet(sessionKey, 'data', JSON.stringify(activeSession));
    // Set expiry for safety (duration + 1 hour buffer)
    await redis.expire(sessionKey, (test.durationMinutes * 60) + 3600);
  }
  activeSession.timeLeft = computeTimeLeft(test, activeSession.startTime);
  activeSession.publicIp = lockedAttempt?.ipAddress || activeSession.publicIp || getClientIp(req);

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
  const attemptId = req.query.attemptId;
  const userId = req.user._id.toString();
  const redis = getRedis();

  // SECURITY: Accept answers and deviceInfo from client, but IGNORE timeLeft —
  // the server always computes remaining time from the authoritative startTime.
  const { answers, deviceInfo, tabSwitchCount, warnings } = req.body;
  const sessionKey = attemptId 
    ? `cbt_session:${userId}:${testId}:${attemptId}` 
    : `cbt_session:${userId}:${testId}`;

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

  let lockedAttempt = null;
  if (attemptId) {
    lockedAttempt = await TestAttempt.findOne({ _id: attemptId, userId, testId }).select('+sessionTokenHash');
    if (!lockedAttempt) {
      return res.status(404).json({ message: 'Attempt not found for this test.' });
    }
    if (lockedAttempt.status !== 'in-progress') {
      return res.status(400).json({ message: 'This attempt has already been submitted.' });
    }
    assertAttemptLock(lockedAttempt, req);
  }

  // SECURITY: Whitelist question IDs — only allow answers for questions
  // that actually belong to this test. Prevents injecting foreign question IDs.
  let sanitizedAnswers = answers;
  if (answers !== undefined) {
    const validQuestionIds = await Question.find({ testId }).distinct('_id');
    const validIdSet = new Set(validQuestionIds.map(id => id.toString()));
    sanitizedAnswers = {};
    for (const [qId, answer] of Object.entries(answers)) {
      if (validIdSet.has(qId)) {
        sanitizedAnswers[qId] = answer;
      }
    }
  }

  if (!redis) {
    const attempt = lockedAttempt || await TestAttempt.findOne({
      userId,
      testId,
      status: 'in-progress',
    }).sort({ createdAt: -1 });

    if (!attempt) {
      return res.status(404).json({ message: 'Active session not found or expired' });
    }

    if (sanitizedAnswers !== undefined) {
      attempt.answers = sessionAnswersToRows(sanitizedAnswers);
    }
    if (deviceInfo !== undefined) {
      attempt.deviceInfo = {
        ...(attempt.deviceInfo?.toObject?.() || attempt.deviceInfo || {}),
        ...normalizeDeviceInfo(deviceInfo),
      };
    }
    if (typeof tabSwitchCount === 'number') {
      attempt.tabSwitchCount = Math.max(attempt.tabSwitchCount || 0, Math.round(tabSwitchCount));
    }
    if (Array.isArray(warnings) && warnings.length) {
      attempt.warnings.push(...warnings.map((warning) => ({
        type: String(warning?.type || warning || 'warning').slice(0, 80),
        timestamp: warning?.timestamp ? new Date(warning.timestamp) : new Date(),
      })));
    }
    attempt.lastSyncAt = new Date();
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
  
  // SECURITY: timeLeft is always computed server-side from the authoritative startTime
  activeSession.timeLeft = computeTimeLeft(test, activeSession.startTime);
  // Merge only whitelisted answers
  activeSession.answers = { ...activeSession.answers, ...(sanitizedAnswers || {}) };
  if (deviceInfo !== undefined) {
    activeSession.deviceInfo = {
      ...(activeSession.deviceInfo || {}),
      ...normalizeDeviceInfo(deviceInfo),
    };
  }
  if (typeof tabSwitchCount === 'number') {
    activeSession.tabSwitchCount = Math.max(activeSession.tabSwitchCount || 0, Math.round(tabSwitchCount));
  }
  if (Array.isArray(warnings) && warnings.length) {
    activeSession.warnings = [
      ...(activeSession.warnings || []),
      ...warnings.map((warning) => ({
        type: String(warning?.type || warning || 'warning').slice(0, 80),
        timestamp: warning?.timestamp || new Date().toISOString(),
      })),
    ].slice(-100);
  }
  activeSession.lastSyncAt = new Date().toISOString();

  if (lockedAttempt) {
    lockedAttempt.lastSyncAt = new Date();
    if (typeof tabSwitchCount === 'number') {
      lockedAttempt.tabSwitchCount = Math.max(lockedAttempt.tabSwitchCount || 0, Math.round(tabSwitchCount));
    }
    if (Array.isArray(warnings) && warnings.length) {
      lockedAttempt.warnings.push(...warnings.map((warning) => ({
        type: String(warning?.type || warning || 'warning').slice(0, 80),
        timestamp: warning?.timestamp ? new Date(warning.timestamp) : new Date(),
      })));
    }
    await lockedAttempt.save();
  }

  // Update Redis
  await redis.hSet(sessionKey, 'data', JSON.stringify(activeSession));

  res.status(200).json({ message: 'Synced', timeLeft: activeSession.timeLeft });
});

/**
 * Submit Assessment
 * Reads the final state from Redis, grades against DB, creates TestAttempt, deletes Redis key.
 * @route POST /assessment/:testId/submit
 */
export const submitAssessment = asyncHandler(async (req, res) => {
  const { testId } = req.params;
  const attemptId = req.query.attemptId;
  const userId = req.user._id.toString();
  const redis = getRedis();

  const sessionKey = attemptId 
    ? `cbt_session:${userId}:${testId}:${attemptId}` 
    : `cbt_session:${userId}:${testId}`;
  const test = await Test.findById(testId);
  if (!test) {
    return res.status(404).json({ message: 'Test not found' });
  }
  let lockedAttempt = null;
  if (attemptId) {
    lockedAttempt = await TestAttempt.findOne({ _id: attemptId, userId, testId }).select('+sessionTokenHash');
    if (!lockedAttempt) {
      return res.status(404).json({ message: 'Attempt not found for this test.' });
    }
    if (lockedAttempt.status !== 'in-progress') {
      return res.status(400).json({ message: 'This attempt has already been submitted.' });
    }
    assertAttemptLock(lockedAttempt, req);
  }

  if (!redis) {
    let attempt;
    if (attemptId) {
      attempt = lockedAttempt;
    } else {
      attempt = await TestAttempt.findOne({
        userId,
        testId,
        status: 'in-progress',
      }).sort({ createdAt: -1 });
    }

    if (!attempt) {
      return res.status(404).json({ message: 'Session expired or not found. Cannot evaluate.' });
    }

    const questions = await Question.find({ testId }).sort({ order: 1 }).lean();
    const answers = answerRowsToSessionMap(attempt.answers);
    attempt.status = 'completed';
    attempt.durationUsedMinutes = Math.round((Date.now() - new Date(attempt.startedAt).getTime()) / 60000);
    attempt.ipAddress = attempt.ipAddress || getClientIp(req);
    attempt.answers = buildCompleteAnswerRows(questions, answers);
    attempt.lockReleasedAt = new Date();
    attempt.sessionTokenHash = '';
    gradeAttempt(attempt, test, questions);
    await attempt.save();

    return res.status(201).json({ message: 'Evaluation completed', attempt });
  }

  const activeSessionRaw = await redis.hGet(sessionKey, 'data');
  if (!activeSessionRaw) {
    // FALLBACK TO MONGO: Check if an in-progress attempt exists in MongoDB
    let attempt;
    if (attemptId) {
      attempt = lockedAttempt;
    } else {
      attempt = await TestAttempt.findOne({
        userId,
        testId,
        status: 'in-progress',
      }).sort({ createdAt: -1 });
    }

    if (!attempt) {
      return res.status(404).json({ message: 'Session expired or not found. Cannot evaluate.' });
    }

    const questions = await Question.find({ testId }).sort({ order: 1 }).lean();
    const answers = answerRowsToSessionMap(attempt.answers);
    attempt.status = 'completed';
    attempt.durationUsedMinutes = Math.round((Date.now() - new Date(attempt.startedAt).getTime()) / 60000);
    attempt.ipAddress = attempt.ipAddress || getClientIp(req);
    attempt.answers = buildCompleteAnswerRows(questions, answers);
    attempt.lockReleasedAt = new Date();
    attempt.sessionTokenHash = '';
    gradeAttempt(attempt, test, questions);
    await attempt.save();

    return res.status(201).json({ message: 'Evaluation completed', attempt });
  }

  const { answers, startTime, publicIp, deviceInfo, tabSwitchCount, warnings } = JSON.parse(activeSessionRaw);

  const endTime = new Date();
  const durationUsedMinutes = Math.round((endTime.getTime() - new Date(startTime).getTime()) / 60000);
  const questions = await Question.find({ testId }).sort({ order: 1 }).lean();
  const answerRows = buildCompleteAnswerRows(questions, answers);

  if (lockedAttempt) {
    lockedAttempt.status = 'completed';
    lockedAttempt.startedAt = startTime ? new Date(startTime) : lockedAttempt.startedAt;
    lockedAttempt.durationUsedMinutes = durationUsedMinutes;
    lockedAttempt.ipAddress = publicIp || lockedAttempt.ipAddress || getClientIp(req);
    lockedAttempt.deviceInfo = normalizeDeviceInfo(deviceInfo);
    lockedAttempt.tabSwitchCount = Math.max(lockedAttempt.tabSwitchCount || 0, Math.round(Number(tabSwitchCount) || 0));
    lockedAttempt.warnings = Array.isArray(warnings) ? warnings.map((warning) => ({
      type: String(warning?.type || warning || 'warning').slice(0, 80),
      timestamp: warning?.timestamp ? new Date(warning.timestamp) : new Date(),
    })) : lockedAttempt.warnings;
    lockedAttempt.answers = answerRows;
    lockedAttempt.lockReleasedAt = new Date();
    lockedAttempt.sessionTokenHash = '';
  }
  const attempt = lockedAttempt || new TestAttempt({
    userId,
    testId,
    status: 'completed',
    startedAt: startTime ? new Date(startTime) : undefined,
    durationUsedMinutes,
    ipAddress: publicIp || getClientIp(req),
    deviceInfo: normalizeDeviceInfo(deviceInfo),
    tabSwitchCount: Math.max(0, Math.round(Number(tabSwitchCount) || 0)),
    warnings: Array.isArray(warnings) ? warnings.map((warning) => ({
      type: String(warning?.type || warning || 'warning').slice(0, 80),
      timestamp: warning?.timestamp ? new Date(warning.timestamp) : new Date(),
    })) : [],
    answers: answerRows,
  });
  if (lockedAttempt) {
    attempt.tenantId = lockedAttempt.tenantId || req.user.tenantId || test.tenantId || undefined;
  }
  gradeAttempt(attempt, test, questions);
  await attempt.save();

  // Cleanup Redis
  await redis.del(sessionKey);

  res.status(201).json({ message: 'Evaluation completed', attempt });
});

export const getMyAssessmentResults = asyncHandler(async (req, res) => {
  const attempts = await TestAttempt.find({
    userId: req.user._id,
    status: { $in: ['completed', 'auto-submitted'] },
  })
    .sort({ submittedAt: -1, createdAt: -1 })
    .limit(50)
    .lean();

  const testIds = [...new Set(attempts.map(a => a.testId))];
  const tests = await Test.find({ _id: { $in: testIds } })
    .select('title category totalMarks durationMinutes sections solutionReleaseMode solutionsReleasedAt scheduledEndAt')
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
      timeToFirstActionSeconds: Math.max(0, Math.round(Number(answer.timeToFirstActionSeconds) || 0)),
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
      topicPerformance: attempt.topicPerformance instanceof Map ? Object.fromEntries(attempt.topicPerformance) : attempt.topicPerformance || {},
      solutionsUnlocked: areSolutionsUnlocked(test || {}),
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
    status: { $in: ['completed', 'auto-submitted'] }
  })
    .sort({ submittedAt: 1 })
    .lean();

  const userIds = [...new Set(attempts.map(a => a.userId))];
  // Batch fetch users in chunks of 500
  const userChunks = chunkArray(userIds, 500);
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
    const scoreA = a.totalScore ?? a.score ?? 0;
    const scoreB = b.totalScore ?? b.score ?? 0;
    if (scoreB !== scoreA) return scoreB - scoreA;
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
      totalScore: attempt.totalScore ?? attempt.score ?? 0,
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

  const test = await Test.findById(attempt.testId)
    .select('title category durationMinutes totalMarks solutionReleaseMode solutionsReleasedAt scheduledEndAt')
    .lean();
  attempt.test = test;
  const solutionsUnlocked = areSolutionsUnlocked(test || {});

  if (attempt.userId.toString() !== userId) {
    return res.status(403).json({ message: 'Access denied.' });
  }

  if (attempt.status !== 'completed' && attempt.status !== 'auto-submitted') {
    return res.status(400).json({ message: 'Attempt must be completed to review answers.' });
  }

  const questions = await Question.find({ testId: attempt.testId }).sort({ order: 1 }).lean();

  const userAnswersMap = new Map();
  for (const ans of attempt.answers || []) {
    userAnswersMap.set(ans.questionId.toString(), ans);
  }

  const reviewedQuestions = questions.map((q) => {
    const questionContent = q.content || q.text || '';
    const normalizedOptions = Array.isArray(q.options)
      ? q.options.map((option, index) => {
          const label = option.label || option.key || String.fromCharCode(65 + index);
          const optionContent = option.content || option.text || '';
          return {
            ...option,
            label,
            key: option.key || label,
            content: optionContent,
            text: option.text || optionContent,
          };
        })
      : [];
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
      type: normalizeQuestionType(q.type),
      content: questionContent,
      text: q.text || questionContent,
      options: normalizedOptions,
      correctAnswer: solutionsUnlocked ? q.correctAnswer : [],
      solution: solutionsUnlocked ? q.solution : '',
      solutionImageUrl: solutionsUnlocked ? q.solutionImageUrl : '',
      userAnswer: selected,
      status: userAns.status,
      timeSpentSeconds: userAns.timeSpentSeconds,
      visitCount: userAns.visitCount || 0,
      firstVisitedAt: userAns.firstVisitedAt || null,
      lastVisitedAt: userAns.lastVisitedAt || null,
      visitLog: userAns.visitLog || [],
      answerChangeCount: userAns.answerChangeCount || 0,
      idleSeconds: userAns.idleSeconds || 0,
      timeToFirstActionSeconds: userAns.timeToFirstActionSeconds || 0,
      effectiveTimeSeconds: Math.max(0, (userAns.timeSpentSeconds || 0) - (userAns.idleSeconds || 0)),
      resultStatus: isUnanswered ? 'skipped' : (isCorrect ? 'correct' : 'wrong'),
    };
  });

  res.json({
    attemptSummary: {
      testId: test?._id,
      testTitle: test?.title,
      totalScore: attempt.totalScore ?? attempt.score ?? 0,
      maxPossibleScore: attempt.maxPossibleScore,
      percentage: attempt.percentage,
      submittedAt: attempt.submittedAt,
      sectionScores: attempt.sectionScores instanceof Map ? Object.fromEntries(attempt.sectionScores) : attempt.sectionScores || {},
      topicPerformance: attempt.topicPerformance instanceof Map ? Object.fromEntries(attempt.topicPerformance) : attempt.topicPerformance || {},
      solutionsUnlocked,
    },
    questions: reviewedQuestions,
  });
});
