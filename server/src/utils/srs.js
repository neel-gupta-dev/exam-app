/**
 * Calculates the next review date and parameters based on a simplified SM-2 algorithm.
 * 
 * Grades:
 * 0 - Again: Total blackout.
 * 1 - Hard: Correct response recalled with serious difficulty.
 * 2 - Good: Correct response after a hesitation.
 * 3 - Easy: Perfect response.
 * 
 * @param {number} grade - User performance grade (0-3)
 * @param {number} currentInterval - Current interval in days
 * @param {number} currentRepetition - Consecutive successful reviews
 * @param {number} currentEaseFactor - E-Factor (multiplier)
 * @returns {Object} Updated SRS parameters
 */
export const calculateNextReview = (grade, currentInterval, currentRepetition, currentEaseFactor) => {
  let interval = currentInterval;
  let repetition = currentRepetition;
  let easeFactor = currentEaseFactor;

  if (grade === 0) {
    // Again: reset progress
    repetition = 0;
    interval = 1;
    easeFactor = Math.max(1.3, easeFactor - 0.2);
  } else {
    // Correct response (Hard, Good, Easy)
    repetition += 1;

    if (repetition === 1) {
      interval = 1;
    } else if (repetition === 2) {
      interval = 6;
    } else {
      interval = Math.round(currentInterval * easeFactor);
    }

    // Adjust ease factor based on specific grades (Hard or Easy)
    if (grade === 3) {
      // Easy
      easeFactor += 0.15;
    } else if (grade === 1) {
      // Hard
      easeFactor = Math.max(1.3, easeFactor - 0.15);
    }
    // Grade 2 (Good) doesn't change the ease factor in this simplified version
  }

  // Calculate next review date
  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + interval);
  // Set time to start of day for easier comparison if needed, 
  // though typically SRS uses full timestamps.
  
  return {
    interval,
    repetition,
    easeFactor,
    nextReviewDate
  };
};
