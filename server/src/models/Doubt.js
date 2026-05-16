import { coreConnection } from '../config/db.js';
import mongoose from 'mongoose';

const doubtSchema = new mongoose.Schema(
  {
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: true,
      index: true,
    },
    testId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Test',
      required: true,
      index: true,
    },
    attemptId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TestAttempt',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    message: {
      type: String,
      default: '',
      trim: true,
      maxlength: 500,
    },
    /**
     * Status for coaching admin workflow.
     */
    status: {
      type: String,
      enum: ['open', 'resolved'],
      default: 'open',
    },
  },
  { timestamps: true }
);

// Prevent duplicate doubts from the same user on the same question in the same attempt
doubtSchema.index({ userId: 1, questionId: 1, attemptId: 1 }, { unique: true });

const Doubt = coreConnection.model('Doubt', doubtSchema);
export default Doubt;
