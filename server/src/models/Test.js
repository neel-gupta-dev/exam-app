import mongoose from 'mongoose';

const testSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Test title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    category: {
      type: String,
      trim: true,
      default: 'General', // "JEE Advance", "NEET", "CUET", etc.
    },
    testType: {
      type: String,
      enum: ['full', 'part', 'pyp'],
      default: 'full',
    },
    durationMinutes: {
      type: Number,
      required: [true, 'Duration is required'],
      min: 1,
    },
    totalMarks: {
      type: Number,
      required: [true, 'Total marks is required'],
      min: 1,
    },
    sections: [
      {
        name: { type: String, trim: true },         // "Physics", "Chemistry"
        questionCount: { type: Number, default: 0 }, // Denormalized for display
      },
    ],
    syllabus: {
      type: [String],
      default: [],
    },
    instructions: {
      general: {
        type: [String],
        default: [
          'The countdown timer shows the remaining time available to complete the test.',
          'The test will be submitted automatically when the timer reaches zero.',
          'Use the question palette to navigate between questions and review answer status.',
        ],
      },
      other: {
        type: [String],
        default: [
          'Do not refresh, close, or switch away from the test window unless instructed.',
          'Ensure your internet connection remains stable for the duration of the test.',
        ],
      },
      declaration: {
        type: String,
        default: 'I have read and understood the instructions. I agree to follow the test rules and understand that violations may lead to submission or disqualification.',
      },
    },
    // --- Audience Targeting ---
    visibility: {
      type: String,
      enum: ['b2c_public', 'b2c_group', 'b2b_coaching', 'b2b_group'],
      default: 'b2c_public',
    },
    targetGroups: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
      },
    ],
    targetTenants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tenant',
      },
    ],
    // --- Publishing ---
    isPublished: {
      type: Boolean,
      default: false,
    },
    scheduledStartAt: {
      type: Date,
      default: null, // null = available immediately on publish
    },
    scheduledEndAt: {
      type: Date,
      default: null, // null = no expiry
    },
    // --- Metadata ---
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    questionCount: {
      type: Number,
      default: 0, // Denormalized for fast listing (avoid counting questions)
    },
    // --- Marking Scheme (global defaults, overridable per question) ---
    defaultPositiveMarks: {
      type: Number,
      default: 4,
    },
    defaultNegativeMarks: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
);

// Index for the core student-facing query
testSchema.index({ isPublished: 1, visibility: 1 });
testSchema.index({ targetTenants: 1 });
testSchema.index({ targetGroups: 1 });

/**
 * Serializes the test metadata into a Redis-cacheable JSON payload.
 * Call this when publishing to build the cached version.
 * Questions are fetched separately and attached before caching.
 */
testSchema.methods.toRedisPayload = function () {
  return {
    _id: this._id.toString(),
    title: this.title,
    description: this.description,
    category: this.category,
    durationMinutes: this.durationMinutes,
    totalMarks: this.totalMarks,
    sections: this.sections,
    syllabus: this.syllabus,
    instructions: this.instructions,
    questionCount: this.questionCount,
    defaultPositiveMarks: this.defaultPositiveMarks,
    defaultNegativeMarks: this.defaultNegativeMarks,
    // Questions will be attached by the controller before SET
  };
};

const Test = mongoose.model('Test', testSchema);
export default Test;
