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

        let totalScore = 0;
        let correctCount = 0;
        let incorrectCount = 0;
        let skippedCount = 0;
        let maxPossibleScore = 0;

        // Grade map using rawAnswers
        questions.forEach(q => {
          maxPossibleScore += (q.positiveMarks ?? test.defaultPositiveMarks);
          
          const rawAnswerObj = attempt.rawAnswers && attempt.rawAnswers[q._id.toString()];
          // Check if answered or not
          if (!rawAnswerObj || !rawAnswerObj.selectedOption || rawAnswerObj.selectedOption.length === 0) {
            skippedCount++;
            return;
          }

          const pos = q.positiveMarks ?? test.defaultPositiveMarks;
          const neg = q.negativeMarks ?? test.defaultNegativeMarks;

          // Validate exact array match (Multi/Single/Integer safely)
          const isCorrect = 
            rawAnswerObj.selectedOption.length === q.correctAnswer.length &&
            rawAnswerObj.selectedOption.every(opt => q.correctAnswer.includes(opt));

          if (isCorrect) {
            totalScore += pos;
            correctCount++;
          } else {
            totalScore -= neg;
            incorrectCount++;
          }
        });

        const percentage = Math.max(0, (totalScore / maxPossibleScore) * 100);

        // Commit grade
        attempt.score = totalScore;
        attempt.maxPossibleScore = maxPossibleScore;
        attempt.percentage = percentage;
        attempt.correctCount = correctCount;
        attempt.incorrectCount = incorrectCount;
        attempt.skippedCount = skippedCount;
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
