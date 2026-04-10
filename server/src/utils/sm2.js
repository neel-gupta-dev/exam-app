/**
 * SuperMemo-2 (SM-2) Algorithm for Spaced Repetition
 * 
 * Based on the classic algorithm by Piotr Wozniak.
 * 
 * Quality scale (0-5):
 * 0: Complete blackout.
 * 1: Incorrect response; the correct one remembered.
 * 2: Incorrect response; where the correct one seemed easy to recall.
 * 3: Correct response recalled with serious difficulty.
 * 4: Correct response after a hesitation.
 * 5: Perfect response.
 * 
 * @param {number} quality - User's rating (0-5)
 * @param {number} interval - Previous interval in days
 * @param {number} repetition - Number of consecutive correct reviews
 * @param {number} efactor - Current Easiness Factor (E-Factor)
 * @returns {Object} Updated interval, repetition, and efactor
 */
export function calculateSM2(quality, interval, repetition, efactor) {
  let newInterval;
  let newRepetition;
  let newEfactor;

  // Formula for new EF
  // EF' = f(EF, q) = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  newEfactor = efactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

  // If EF drops below 1.3, it is set back to 1.3
  if (newEfactor < 1.3) {
    newEfactor = 1.3;
  }

  if (quality >= 3) {
    // Correct response
    if (repetition === 0) {
      newInterval = 1;
    } else if (repetition === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(interval * newEfactor);
    }
    newRepetition = repetition + 1;
  } else {
    // Incorrect response
    newRepetition = 0;
    newInterval = 1;
  }

  return {
    interval: newInterval,
    repetition: newRepetition,
    efactor: newEfactor,
  };
}
