import { coreConnection } from '../config/db.js';
import mongoose from 'mongoose';

const testSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
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
      enum: ['JEE Mains', 'JEE Advanced', 'NEET', 'BITSAT', 'CUET', 'Other'],
      required: true,
      index: true,
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
    sections: [
      {
        name: { type: String, required: true },
        questionCount: { type: Number, required: true },
        maxAttemptable: { type: Number },
      }
    ],
    isPublished: {
      type: Boolean,
      default: false,
    },
    startDate: {
      type: Date,
      default: null,
    },
    endDate: {
      type: Date,
      default: null,
    },
    allowedAttemptCount: {
      type: Number,
      default: 1,
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
  };
};

const Test = coreConnection.model('Test', testSchema);

export default Test;
