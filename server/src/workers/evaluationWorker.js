import { coreConnection } from '../config/db.js';
import TestAttempt from '../models/TestAttempt.js';
import Test from '../models/Test.js';
import Question from '../models/Question.js';

/**
 * Background Evaluation Worker
 * Periodically polls the DB for TestAttempts with status: 'SUBMITTED'.
 * Grades them asynchronously and updates status to 'EVALUATED' to prevent HTTP bottlenecks.
 */

let isRunning = false;

const processQueue = async () => {
  if (isRunning) return;
  isRunning = true;

  try {
    // Fetch a batch of un-evaluated attempts
    const pendingAttempts = await TestAttempt.find({ status: 'SUBMITTED', isManual: false }).limit(10);

    if (pendingAttempts.length === 0) {
      isRunning = false;
      return;
    }

    for (const attempt of pendingAttempts) {
      try {
        const testId = attempt.testId;
        const test = await Test.findById(testId).lean();
        const questions = await Question.find({ testId }).lean();

        if (!test || !questions) {
           console.log(`[EvaluationWorker] Missing Test/Questions for attempt ${attempt._id}`);
           continue; // Skip, don't crash
        }

        const questionMap = new Map(questions.map((q) => [q._id.toString(), q]));
        let totalScore = 0;
        let maxPossibleScore = 0;
        const sectionScores = {};
        const topicPerformance = {};

        // Build section scheme map
        const sectionSchemeMap = {};
        for (const sec of test.sections || []) {
          sectionSchemeMap[sec.name] = sec.markingScheme || null;
        }

        const arraysEqual = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);

        for (const answer of attempt.answers || []) {
          const question = questionMap.get(answer.questionId.toString());
          if (!question) continue;
          if (question.type === 'comprehension_parent') continue;

          const secScheme = sectionSchemeMap[question.section] || null;
          const override = question.markingSchemeOverride || {};

          const correctMarks  = override.correct    ?? secScheme?.correct    ?? question.positiveMarks ?? test.defaultPositiveMarks;
          const incorrectMarks = override.incorrect  ?? secScheme?.incorrect  ?? question.negativeMarks ?? test.defaultNegativeMarks;
          const isPartial     = override.partial     ?? secScheme?.partial    ?? false;
          const partialPerOpt = override.partialMarkPerOption ?? secScheme?.partialMarkPerOption ?? 1;
          const partialIncorr = override.partialIncorrect     ?? secScheme?.partialIncorrect     ?? incorrectMarks;

          const section = question.section || 'General';
          maxPossibleScore += correctMarks;

          if (!sectionScores[section]) {
            sectionScores[section] = { correct: 0, wrong: 0, unattempted: 0, partial: 0, score: 0, timeSpentSeconds: 0 };
          }
          sectionScores[section].timeSpentSeconds += (answer.timeSpentSeconds || 0);

          const tags = question.tags || [];
          for (const topic of tags) {
            if (!topicPerformance[topic]) {
              topicPerformance[topic] = { correct: 0, wrong: 0, skipped: 0, timeSpentSeconds: 0 };
            }
            topicPerformance[topic].timeSpentSeconds += (answer.timeSpentSeconds || 0);
          }

          const selectedAnswer = answer.selectedAnswer || [];
          if (selectedAnswer.length === 0) {
            sectionScores[section].unattempted++;
            const unattemptedMark = override.unattempted ?? secScheme?.unattempted ?? 0;
            totalScore += unattemptedMark;
            sectionScores[section].score += unattemptedMark;
            for (const topic of tags) topicPerformance[topic].skipped++;
            continue;
          }

          const correctSet = new Set((question.correctAnswer || []).map(String));
          const selected   = selectedAnswer.map(String);

          if (question.type === 'single' || question.type === 'integer' || question.type === 'float' || question.type === 'matrix') {
            const exactCorrect = arraysEqual(selected.sort(), [...correctSet].sort());
            if (exactCorrect) {
              totalScore += correctMarks;
              sectionScores[section].correct++;
              sectionScores[section].score += correctMarks;
              for (const topic of tags) topicPerformance[topic].correct++;
            } else {
              totalScore -= incorrectMarks;
              sectionScores[section].wrong++;
              sectionScores[section].score -= incorrectMarks;
              for (const topic of tags) topicPerformance[topic].wrong++;
            }

          } else if (question.type === 'multiple') {
            const hasWrongSelected = selected.some(s => !correctSet.has(s));
            if (hasWrongSelected) {
              totalScore -= incorrectMarks;
              sectionScores[section].wrong++;
              sectionScores[section].score -= incorrectMarks;
              for (const topic of tags) topicPerformance[topic].wrong++;
            } else if (arraysEqual(selected.sort(), [...correctSet].sort())) {
              totalScore += correctMarks;
              sectionScores[section].correct++;
              sectionScores[section].score += correctMarks;
              for (const topic of tags) topicPerformance[topic].correct++;
            } else if (isPartial && selected.length > 0) {
              const partialScore = Math.min(selected.length * partialPerOpt, correctMarks);
              totalScore += partialScore;
              sectionScores[section].partial++;
              sectionScores[section].score += partialScore;
              for (const topic of tags) topicPerformance[topic].correct++; // treat partial as correct for topic stats
            } else {
              totalScore -= partialIncorr;
              sectionScores[section].wrong++;
              sectionScores[section].score -= partialIncorr;
              for (const topic of tags) topicPerformance[topic].wrong++;
            }
          }
        } // end for answers

        const percentage = maxPossibleScore > 0
          ? Math.round((totalScore / maxPossibleScore) * 10000) / 100
          : 0;

        // Commit grade directly to TestAttempt
        attempt.score = totalScore;
        attempt.totalScore = totalScore; // Legacy compat
        attempt.maxPossibleScore = maxPossibleScore;
        attempt.percentage = percentage;
        attempt.sectionScores = sectionScores;
        attempt.topicPerformance = topicPerformance;
        attempt.evaluatedAt = new Date();
        attempt.status = 'EVALUATED';

        await attempt.save();
        console.log(`[EvaluationWorker] Successfully graded Attempt ${attempt._id}. Score: ${totalScore}/${maxPossibleScore}`);
      } catch (err) {
        console.error(`[EvaluationWorker] Error processing attempt ${attempt._id}:`, err);
        // Remains 'SUBMITTED', will retry
      }
    }
  } catch (err) {
    console.error('[EvaluationWorker] Core polling error:', err);
  } finally {
    isRunning = false;
  }
};

// Start the daemon loop
export const startEvaluationWorker = () => {
  console.log('[EvaluationWorker] Background grading queue started.');
  setInterval(processQueue, 5000); // 5 sec interval polling
};

