import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema(
  {
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: true,
    },
    selectedAnswer: {
      type: [String], // ["A"] for single, ["A","C"] for multiple, ["42"] for integer
      default: [],
    },
    status: {
      type: String,
      enum: ['unanswered', 'answered', 'marked-for-review', 'answered-and-marked'],
      default: 'unanswered',
    },
    timeSpentSeconds: {
      type: Number,
      default: 0,
    },
    visitCount: {
      type: Number,
      default: 0,
    },
    firstVisitedAt: {
      type: Date,
      default: null,
    },
    lastVisitedAt: {
      type: Date,
      default: null,
    },
    visitLog: [
      {
        enteredAt: { type: Date, default: null },
        leftAt: { type: Date, default: null },
        durationSeconds: { type: Number, default: 0 },
      },
    ],
  },
  { _id: false }
);

const testAttemptSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    testId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Test',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['in-progress', 'completed', 'auto-submitted', 'evaluating'],
      default: 'in-progress',
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    submittedAt: {
      type: Date,
      default: null,
    },
    durationUsedMinutes: {
      type: Number,
      default: null,
    },
    ipAddress: {
      type: String,
      default: '',
    },
    /**
     * Per-question answer state.
     * During live test, this is synced from Redis periodically.
     * On submission, final state is written here permanently.
     */
    answers: [answerSchema],
    // --- Computed on submission ---
    totalScore: {
      type: Number,
      default: null,
    },
    maxPossibleScore: {
      type: Number,
      default: null,
    },
    percentage: {
      type: Number,
      default: null,
    },
    /**
     * Per-section score breakdown.
     * e.g., { "Physics": { correct: 10, wrong: 2, score: 38 }, ... }
     */
    sectionScores: {
      type: Map,
      of: new mongoose.Schema(
        {
          correct: { type: Number, default: 0 },
          wrong: { type: Number, default: 0 },
          unattempted: { type: Number, default: 0 },
          score: { type: Number, default: 0 },
        },
        { _id: false }
      ),
      default: {},
    },
    /**
     * Anti-cheat metadata
     */
    tabSwitchCount: {
      type: Number,
      default: 0,
    },
    warnings: [
      {
        type: { type: String }, // 'tab-switch', 'copy-paste', 'resize'
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// Compound index for fast lookup (no longer unique as retakes are allowed)
testAttemptSchema.index({ userId: 1, testId: 1 });
// For coaching admin: list all attempts for a test
testAttemptSchema.index({ testId: 1, status: 1 });

const TestAttempt = mongoose.model('TestAttempt', testAttemptSchema);
export default TestAttempt;
