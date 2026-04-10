import { calculateSM2 } from '../utils/sm2.js';

function runTest() {
  console.log('--- Starting SM-2 Algorithm Test ---');

  // Test Case 1: Perfect response on a new card
  let stats = { interval: 0, repetition: 0, efactor: 2.5 };
  console.log('\nInitial Stats:', stats);
  
  stats = calculateSM2(5, stats.interval, stats.repetition, stats.efactor);
  console.log('After Perfect (5) - Review 1:', stats);
  // Expected: interval: 1, repetition: 1, efactor: 2.6 (2.5 + (0.1 - (0)*...))
  
  stats = calculateSM2(5, stats.interval, stats.repetition, stats.efactor);
  console.log('After Perfect (5) - Review 2:', stats);
  // Expected: interval: 6, repetition: 2, efactor: 2.7
  
  stats = calculateSM2(5, stats.interval, stats.repetition, stats.efactor);
  console.log('After Perfect (5) - Review 3:', stats);
  // Expected: interval: 16 (6 * 2.7 = 16.2), repetition: 3, efactor: 2.8

  // Test Case 2: Complete blackout (0)
  console.log('\n--- Hard Reset Test ---');
  stats = calculateSM2(0, stats.interval, stats.repetition, stats.efactor);
  console.log('After Blackout (0):', stats);
  // Expected: interval: 1, repetition: 0, efactor: drops significantly

  // Test Case 3: Hard response (3)
  console.log('\n--- Hard Recall Test ---');
  stats = { interval: 6, repetition: 2, efactor: 2.5 };
  stats = calculateSM2(3, stats.interval, stats.repetition, stats.efactor);
  console.log('After Hard (3):', stats);
  // Expected: interval: 15 (6 * EF), but EF should decrease

  console.log('\n--- End of SM-2 Algorithm Test ---');
}

runTest();
