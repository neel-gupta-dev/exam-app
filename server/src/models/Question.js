import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    testId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Test',
      required: true,
      index: true, // Critical: allows fast "get all questions for test X"
    },
    section: {
      type: String,
      trim: true,
      default: 'General', // "Physics", "Chemistry", "Maths"
    },
    /**
     * Question ordering within the test.
     * Set automatically on bulk upload (row number).
     */
    order: {
      type: Number,
      default: 0,
    },
    type: {
      type: String,
      enum: ['single', 'multiple', 'integer', 'subjective'],
      default: 'single',
      // single   = Single correct MCQ (radio)
      // multiple = Multiple correct MCQ (checkbox)
      // integer  = Numeric answer (integer type)
      // subjective = Open-ended (future)
    },
    /**
     * Question content. Supports Markdown/HTML for rich text.
     * Images should be stored as URLs (S3 or upload endpoint).
     */
    content: {
      type: String,
      required: [true, 'Question content is required'],
    },
    /**
     * Image URL for the question (optional diagram/figure).
     */
    imageUrl: {
      type: String,
      default: null,
    },
    /**
     * Options for MCQ-type questions.
     * Each option has a label (A/B/C/D) and content text.
     */
    options: [
      {
        label: { type: String, trim: true },   // "A", "B", "C", "D"
        content: { type: String, trim: true },  // The option text
        imageUrl: { type: String, default: null }, // Optional image per option
      },
    ],
    /**
     * Correct answer(s).
     * - Single MCQ: ["A"]
     * - Multiple MCQ: ["A", "C"]
     * - Integer: ["42"]
     */
    correctAnswer: {
      type: [String],
      required: [true, 'Correct answer is required'],
    },
    // --- Marking (overrides test defaults if set) ---
    positiveMarks: {
      type: Number,
      default: null, // null = use test.defaultPositiveMarks
    },
    negativeMarks: {
      type: Number,
      default: null, // null = use test.defaultNegativeMarks
    },
    /**
     * Solution / explanation shown after test submission.
     * Supports Markdown/HTML.
     */
    solution: {
      type: String,
      default: '',
    },
    solutionImageUrl: {
      type: String,
      default: null,
    },
    /**
     * Topic tags for granular analytics.
     * e.g., ["Kinematics", "Projectile Motion"] or ["Electrochemistry"]
     */
    tags: {
      type: [String],
      default: [],
    },
    /**
     * Difficulty level for performance breakdown.
     */
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
  },
  { timestamps: true }
);

// Compound index for fetching test questions in order
questionSchema.index({ testId: 1, order: 1 });

/**
 * Serializes to a Redis-safe format.
 * Strips solution data for the live test payload (answers hidden).
 * Solution is only served post-submission via a separate endpoint.
 */
questionSchema.methods.toStudentPayload = function () {
  return {
    _id: this._id.toString(),
    section: this.section,
    order: this.order,
    type: this.type,
    content: this.content,
    imageUrl: this.imageUrl,
    options: this.options.map((o) => ({
      label: o.label,
      content: o.content,
      imageUrl: o.imageUrl,
    })),
    positiveMarks: this.positiveMarks,
    negativeMarks: this.negativeMarks,
    // NOTE: correctAnswer and solution are intentionally omitted
  };
};

const Question = mongoose.model('Question', questionSchema);
export default Question;
