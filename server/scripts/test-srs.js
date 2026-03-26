import { calculateNextReview } from '../src/utils/srs.js';

const testSRS = () => {
  console.log('--- SRS Algorithm Test ---');

  let state = {
    interval: 0,
    repetition: 0,
    easeFactor: 2.5
  };

  const simulateReview = (grade, label) => {
    console.log(`\nReview: ${label} (Grade: ${grade})`);
    const result = calculateNextReview(grade, state.interval, state.repetition, state.easeFactor);
    state = {
      interval: result.interval,
      repetition: result.repetition,
      easeFactor: result.easeFactor
    };
    console.log(`Updated State: Interval=${state.interval}d, Reps=${state.repetition}, EF=${state.easeFactor.toFixed(2)}`);
    console.log(`Next Review: ${result.nextReviewDate.toDateString()}`);
  };

  // Scenario 1: Consistent "Good" reviews
  console.log('\nSCENARIO 1: Consistent "Good" reviews (Grade 2)');
  simulateReview(2, 'First Review');
  simulateReview(2, 'Second Review');
  simulateReview(2, 'Third Review');
  simulateReview(2, 'Fourth Review');

  // Scenario 2: "Again" reset
  console.log('\nSCENARIO 2: A lapse after success');
  state = { interval: 15, repetition: 4, easeFactor: 2.5 }; // Starting from some progress
  console.log(`Initial State: Interval=${state.interval}d, Reps=${state.repetition}, EF=${state.easeFactor.toFixed(2)}`);
  simulateReview(0, 'Forgot everything');

  // Scenario 3: "Easy" reviews
  console.log('\nSCENARIO 3: "Easy" reviews (Grade 3)');
  state = { interval: 0, repetition: 0, easeFactor: 2.5 };
  simulateReview(3, 'Super easy');
  simulateReview(3, 'Super easy again');

  // Scenario 4: "Hard" reviews
  console.log('\nSCENARIO 4: "Hard" reviews (Grade 1)');
  state = { interval: 0, repetition: 0, easeFactor: 2.5 };
  simulateReview(1, 'Kind of hard');
  simulateReview(1, 'Still hard');
};

testSRS();
