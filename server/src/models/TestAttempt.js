import { coreConnection } from '../config/db.js';
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
    /**
     * Number of times the student changed their answer for this question.
     * High values indicate hesitation / weak understanding.
     */
    answerChangeCount: {
      type: Number,
      default: 0,
    },
    /**
     * Seconds the student was idle (no mouse/touch) while on this question.
     * Effective time = timeSpentSeconds - idleSeconds
     */
    idleSeconds: {
      type: Number,
      default: 0,
    },
    timeToFirstActionSeconds: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const testAttemptSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: false,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    testId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Test',
      required: function() { return !this.isManual; },
      index: true,
    },
    status: {
      type: String,
      enum: ['IN_PROGRESS', 'SUBMITTED', 'EVALUATED', 'in-progress', 'completed', 'evaluating', 'auto-submitted'],
      default: 'in-progress',
      index: true,
    },
    isManual: {
      type: Boolean,
      default: false,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    submittedAt: {
      type: Date,
      default: null,
    },
    evaluatedAt: {
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
    sessionTokenHash: {
      type: String,
      default: '',
      select: false,
    },
    sessionStartedAt: {
      type: Date,
      default: null,
    },
    lastSyncAt: {
      type: Date,
      default: null,
    },
    lockReleasedAt: {
      type: Date,
      default: null,
    },
    /**
     * Per-question answer state.
     * During live test, this is synced from Redis periodically.
     * On submission, final state is written here permanently.
     */
    answers: [answerSchema],
    
    // --- Scoring & Results (Merged from TestResult) ---
    score: {
      type: Number,
      default: 0,
    },
    totalScore: { // Legacy field, keeping for worker compatibility during migration
      type: Number,
      default: 0,
    },
    maxPossibleScore: {
      type: Number,
      default: 0,
    },
    percentage: {
      type: Number,
      default: 0,
    },
    subject: {
      type: String,
      trim: true,
    },
    testName: {
      type: String,
      trim: true,
    },
    comments: {
      type: String,
      trim: true,
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
          partial: { type: Number, default: 0 },
          score: { type: Number, default: 0 },
          timeSpentSeconds: { type: Number, default: 0 },
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
    /**
     * Device & environment snapshot captured at test start.
     */
    deviceInfo: {
      userAgent:        { type: String, default: '' },
      screenResolution: { type: String, default: '' },
      deviceMemory:     { type: Number, default: null },
      connectionType:   { type: String, default: '' },
      isMobile:         { type: Boolean, default: false },
      timezone:         { type: String, default: '' },
    },
    /**
     * Per-topic performance breakdown, computed on submission.
     * Depends on Question.tags being populated.
     * e.g., { "Kinematics": { correct: 2, wrong: 3, skipped: 1 } }
     */
    topicPerformance: {
      type: Map,
      of: new mongoose.Schema(
        {
          correct: { type: Number, default: 0 },
          wrong: { type: Number, default: 0 },
          skipped: { type: Number, default: 0 },
          timeSpentSeconds: { type: Number, default: 0 },
        },
        { _id: false }
      ),
      default: {},
    },
  },
  { timestamps: true }
);

// Compound indexes for high-performance dashboarding
testAttemptSchema.index({ tenantId: 1, testId: 1 });
testAttemptSchema.index({ userId: 1, status: 1 });
testAttemptSchema.index({ userId: 1, testId: 1, status: 1 });
testAttemptSchema.index({ status: 1, isManual: 1 }); // Required for evaluationWorker polling

const TestAttempt = coreConnection.model('TestAttempt', testAttemptSchema);

export default TestAttempt;
