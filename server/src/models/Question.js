import { coreConnection } from '../config/db.js';
import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true,
    },
    testId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Test',
      required: true,
      index: true,
    },
    section: {
      type: String,
      required: true,
      index: true,
    },
    subject: {
      type: String,
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['scq', 'mcq', 'integer', 'float'],
      required: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    text: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
    },
    options: [
      {
        key: { type: String, required: true }, // e.g., "A"
        text: { type: String },
        imageUrl: { type: String },
      }
    ],
    correctAnswer: {
      type: [String], // ["A"] or ["A", "C"] or ["42"]
      required: true,
    },
    solution: {
      type: String,
    },
    solutionImageUrl: {
      type: String,
    },
    positiveMarks: {
      type: Number,
    },
    negativeMarks: {
      type: Number,
    },
    tags: [String],
  },
  { timestamps: true }
);

// Fast lookup for questions in a test within a tenant
questionSchema.index({ tenantId: 1, testId: 1, order: 1 });

const Question = coreConnection.model('Question', questionSchema);

export default Question;
