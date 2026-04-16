import asyncHandler from 'express-async-handler';
import * as attemptService from '../services/attemptService.js';

/**
 * @desc    Start or resume a test session
 * @route   POST /api/attempts/:testId/start
 * @access  Protected (students)
 */
export const startAttempt = asyncHandler(async (req, res) => {
  const { testId } = req.params;
  const result = await attemptService.startSession(testId, req.user);
  res.json(result);
});

/**
 * @desc    Sync progress (auto-save answers, track tab switches)
 * @route   PATCH /api/attempts/:attemptId/sync
 * @access  Protected (students)
 */
export const syncAttempt = asyncHandler(async (req, res) => {
  const { attemptId } = req.params;
  const { answers, tabSwitchCount, warnings } = req.body;
  const result = await attemptService.syncSession(attemptId, req.user._id, {
    answers,
    tabSwitchCount,
    warnings,
  });
  res.json(result);
});

/**
 * @desc    Submit test and calculate score
 * @route   POST /api/attempts/:attemptId/submit
 * @access  Protected (students)
 */
export const submitAttempt = asyncHandler(async (req, res) => {
  const { attemptId } = req.params;
  const result = await attemptService.submitSession(attemptId, req.user._id);
  res.json(result);
});

/**
 * @desc    Force-submit due to anti-cheat violation (4th tab switch)
 * @route   POST /api/attempts/:attemptId/force-submit
 * @access  Protected (students)
 */
export const forceSubmitAttempt = asyncHandler(async (req, res) => {
  const { attemptId } = req.params;
  const result = await attemptService.forceSubmit(attemptId, req.user._id);
  if (!result) {
    res.status(400);
    throw new Error('Attempt not found or already submitted');
  }
  res.json(result);
});
