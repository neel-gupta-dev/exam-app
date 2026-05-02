import TestAttempt from '../models/TestAttempt.js';
import Test from '../models/Test.js';
import Question from '../models/Question.js';

/**
 * Background Evaluation Worker
 * Periodically polls the DB for TestAttempts with status: 'evaluating'.
 * Grades them asynchronously to prevent HTTP/Redis bottlenecks during D-Day.
 */

let isRunning = false;

const processQueue = async () => {
  if (isRunning) return;
  isRunning = true;

  try {
    // Fetch a batch of un-evaluated attempts (protects from massive RAM spikes)
    const pendingAttempts = await TestAttempt.find({ status: 'evaluating' }).limit(10);

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

          const selectedAnswer = answer.selectedAnswer || [];
          if (selectedAnswer.length === 0) {
            sectionScores[section].unattempted += 1;
            continue;
          }

          const expected = [...(question.correctAnswer || [])].sort();
          const selected = [...selectedAnswer].sort();
          const isCorrect =
            selected.length === expected.length &&
            selected.every((opt, idx) => opt === expected[idx]);

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

        const percentage = maxPossibleScore > 0
          ? Math.round((totalScore / maxPossibleScore) * 10000) / 100
          : 0;

        // Commit grade
        attempt.totalScore = totalScore;
        attempt.maxPossibleScore = maxPossibleScore;
        attempt.percentage = percentage;
        attempt.sectionScores = sectionScores;
        attempt.submittedAt = attempt.submittedAt || new Date();
        attempt.status = 'completed';

        await attempt.save();
        console.log(`[EvaluationWorker] Successfully graded Attempt ${attempt._id}. Score: ${totalScore}/${maxPossibleScore}`);
      } catch (err) {
        console.error(`[EvaluationWorker] Error processing attempt ${attempt._id}:`, err);
        // It remains 'evaluating', will try again next batch
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
