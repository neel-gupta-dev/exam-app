import { coreConnection } from '../config/db.js';
import mongoose from 'mongoose';

const testSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: false, // Global/B2C tests don't have a specific tenant
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      enum: ['JEE Mains', 'JEE Advanced', 'NEET', 'BITSAT', 'CUET', 'Other', 'General'],
      required: true,
      index: true,
    },
    testType: {
      type: String,
      enum: ['full', 'part', 'pyp'],
      default: 'full',
    },
    totalMarks: {
      type: Number,
      required: true,
    },
    durationMinutes: {
      type: Number,
      required: true,
    },
    defaultPositiveMarks: {
      type: Number,
      default: 4,
    },
    defaultNegativeMarks: {
      type: Number,
      default: 1,
    },
    questionCount: {
      type: Number,
      default: 0,
    },
    sections: [
      {
        name: { type: String, required: true },
        subject: { type: String, enum: ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'General'], default: 'General' },
        type: { type: String, enum: ['single', 'multiple', 'integer', 'float', 'matrix', 'comprehension', 'mixed'], default: 'mixed' },
        questionCount: { type: Number, required: true },
        maxAttemptable: { type: Number },
        instructions: { type: String },
        markingScheme: {
          correct: { type: Number, default: 4 },
          incorrect: { type: Number, default: -1 },
          unattempted: { type: Number, default: 0 },
          partial: { type: Boolean, default: false },
          partialMarkPerOption: { type: Number, default: 1 },
          partialIncorrect: { type: Number, default: -1 },
        }
      }
    ],
    visibility: {
      type: String,
      enum: ['b2c_public', 'b2c_group', 'b2b_coaching', 'b2b_group'],
      default: 'b2c_public',
    },
    targetTenants: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
    }],
    targetGroups: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
    }],
    syllabus: [String],
    instructions: {
      general: [String],
      other: [String],
      declaration: String,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    scheduledStartAt: {
      type: Date,
      default: null,
    },
    scheduledEndAt: {
      type: Date,
      default: null,
    },
    allowedAttemptCount: {
      type: Number,
      default: 1,
    },
    solutionReleaseMode: {
      type: String,
      enum: ['immediate', 'after_end', 'manual', 'never'],
      default: 'immediate',
    },
    solutionsReleasedAt: {
      type: Date,
      default: null,
    },
    tags: [String],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// Method to strip sensitive info before sending to Redis/Client
testSchema.methods.toRedisPayload = function() {
  const obj = this.toObject();
  return {
    _id: obj._id,
    title: obj.title,
    category: obj.category,
    durationMinutes: obj.durationMinutes,
    totalMarks: obj.totalMarks,
    sections: obj.sections,
    instructions: obj.instructions,
    scheduledStartAt: obj.scheduledStartAt,
    scheduledEndAt: obj.scheduledEndAt,
    solutionReleaseMode: obj.solutionReleaseMode,
    solutionsReleasedAt: obj.solutionsReleasedAt,
  };
};

const Test = coreConnection.model('Test', testSchema);

export default Test;
