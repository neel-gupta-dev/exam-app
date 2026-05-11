/**
 * Bot Engine — Pure functions for JEE Battle bot opponent.
 *
 * The bot is invisible to the user. Answers are pre-computed at battle
 * creation and stored in the Battle document. The GET polling route
 * reveals them lazily based on elapsed time.
 */

/** Pool of bot display names — edit these to taste */
const BOT_NAMES = [
  'Aarav', 'Ishaan', 'Aditya', 'Rohan', 'Kabir',
  'Ananya', 'Meera', 'Priya', 'Diya', 'Sneha',
  'Vikram', 'Arjun', 'Karthik', 'Rahul', 'Nikhil',
  'Sanya', 'Riya', 'Kavya', 'Neha', 'Tanvi',
  'Arnav', 'Dhruv', 'Yash', 'Varun', 'Shaurya',
  'Simran', 'Pooja', 'Divya', 'Aisha', 'Nandini',
];

/** Pick a random bot name */
export function getRandomBotName() {
  return BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)];
}

/** Random integer between min and max (inclusive) */
function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Pre-compute all bot answers and their reveal timestamps.
 *
 * @param {Array} questions - Full BattleQuestion documents (with correct answers)
 * @returns {{ botAnswers: Array, botTimestamps: number[] }}
 *
 * Bot accuracy: 50% correct, 35% wrong, 15% skip
 * Response time: 8–45 seconds per question
 */
export function computeBotAnswers(questions) {
  const botAnswers = [];
  const botTimestamps = [];
  let cumulativeMs = 0;

  for (const question of questions) {
    // Random delay for this question (8-45 seconds)
    const delaySec = randomBetween(8, 45);
    cumulativeMs += delaySec * 1000;
    botTimestamps.push(cumulativeMs);

    // Decide outcome: 50% correct, 35% wrong, 15% skip
    const roll = Math.random();
    const outcome = roll < 0.50 ? 'correct' : roll < 0.85 ? 'wrong' : 'skip';

    const answer = buildAnswerRecord(question, outcome, delaySec);
    botAnswers.push(answer);
  }

  return { botAnswers, botTimestamps };
}

/**
 * Build a single answer record for the bot.
 *
 * Uses the exact same scoring formulas as POST /battle/submit
 * to ensure consistency.
 */
function buildAnswerRecord(question, outcome, timeTakenSeconds) {
  const qType = question.type || 'single';

  if (outcome === 'skip') {
    return {
      questionId: question._id,
      selectedOptionIndex: -1111,
      selectedOptionIndices: [],
      submittedInteger: qType === 'integer' ? -1111 : undefined,
      isCorrect: false,
      lbPoints: 0,
      timeTakenSeconds,
      points: 0,
    };
  }

  if (qType === 'single') {
    return buildSingleAnswer(question, outcome, timeTakenSeconds);
  } else if (qType === 'integer') {
    return buildIntegerAnswer(question, outcome, timeTakenSeconds);
  } else if (qType === 'multi') {
    return buildMultiAnswer(question, outcome, timeTakenSeconds);
  }

  // Fallback — treat as single
  return buildSingleAnswer(question, outcome, timeTakenSeconds);
}

function buildSingleAnswer(question, outcome, timeTakenSeconds) {
  const options = question.options || [];
  const correctIndex = options.findIndex(opt => opt?.isCorrect);

  if (outcome === 'correct' && correctIndex >= 0) {
    const timeBonus = Math.max(0, Math.floor((120 - timeTakenSeconds) * (50 / 120)));
    return {
      questionId: question._id,
      selectedOptionIndex: correctIndex,
      selectedOptionIndices: [],
      isCorrect: true,
      lbPoints: 4,
      timeTakenSeconds,
      points: 100 + timeBonus,
    };
  }

  // Wrong answer — pick a random incorrect option
  const wrongIndices = options
    .map((_, idx) => idx)
    .filter(idx => idx !== correctIndex);
  const pickedIndex = wrongIndices.length > 0
    ? wrongIndices[Math.floor(Math.random() * wrongIndices.length)]
    : 0;

  return {
    questionId: question._id,
    selectedOptionIndex: pickedIndex,
    selectedOptionIndices: [],
    isCorrect: false,
    lbPoints: -1,
    timeTakenSeconds,
    points: 0,
  };
}

function buildIntegerAnswer(question, outcome, timeTakenSeconds) {
  if (outcome === 'correct' && question.correctInteger !== undefined) {
    const timeBonus = Math.max(0, Math.floor((120 - timeTakenSeconds) * (50 / 120)));
    return {
      questionId: question._id,
      selectedOptionIndex: -3,
      selectedOptionIndices: [],
      submittedInteger: question.correctInteger,
      isCorrect: true,
      lbPoints: 4,
      timeTakenSeconds,
      points: 100 + timeBonus,
    };
  }

  // Wrong answer — offset the correct answer by a random amount
  const correctVal = question.correctInteger ?? 0;
  let wrongVal = correctVal + randomBetween(1, 10) * (Math.random() < 0.5 ? 1 : -1);
  if (wrongVal === correctVal) wrongVal += 1; // Ensure it's actually wrong

  return {
    questionId: question._id,
    selectedOptionIndex: -3,
    selectedOptionIndices: [],
    submittedInteger: wrongVal,
    isCorrect: false,
    lbPoints: -1,
    timeTakenSeconds,
    points: 0,
  };
}

function buildMultiAnswer(question, outcome, timeTakenSeconds) {
  const options = question.options || [];
  const correctIndices = options
    .map((opt, idx) => (opt.isCorrect ? idx : -1))
    .filter(idx => idx !== -1);

  if (outcome === 'correct' && correctIndices.length > 0) {
    const timeBonus = Math.max(0, Math.floor((120 - timeTakenSeconds) * (50 / 120)));
    return {
      questionId: question._id,
      selectedOptionIndex: -2,
      selectedOptionIndices: correctIndices,
      isCorrect: true,
      lbPoints: 4,
      timeTakenSeconds,
      points: 100 + timeBonus,
    };
  }

  // Wrong answer — include one incorrect option
  const wrongIndices = options
    .map((_, idx) => idx)
    .filter(idx => !correctIndices.includes(idx));

  let selected;
  if (wrongIndices.length > 0) {
    // Pick one correct + one wrong to make it clearly incorrect
    const oneCorrect = correctIndices.length > 0 ? [correctIndices[0]] : [];
    const oneWrong = [wrongIndices[Math.floor(Math.random() * wrongIndices.length)]];
    selected = [...oneCorrect, ...oneWrong];
  } else {
    // All options are correct (edge case) — just pick the first one
    selected = [0];
  }

  return {
    questionId: question._id,
    selectedOptionIndex: -2,
    selectedOptionIndices: selected,
    isCorrect: false,
    lbPoints: -2,
    timeTakenSeconds,
    points: 0,
  };
}
