import { analyticsConnection } from '../config/db.js';
import mongoose from 'mongoose';

const focusSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resource',
      default: null,
    },
    type: {
      type: String,
      enum: ['focus', 'short-break', 'long-break'],
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'abandoned'],
      default: 'active',
    },
    timing: {
      startTime: {
        type: Date,
        default: Date.now,
      },
      endTime: {
        type: Date,
      },
      plannedDuration: {
        type: Number, // in seconds
        required: true,
      },
      actualDuration: {
        type: Number, // in seconds
        default: 0,
      },
    },
    interruptionCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Index for aggregation performance
focusSessionSchema.index({ userId: 1, createdAt: -1 });

// TTL Index: Auto-expire after 180 days
focusSessionSchema.index({ createdAt: 1 }, { expireAfterSeconds: 15552000 });

const FocusSession = analyticsConnection.model('FocusSession', focusSessionSchema);
export default FocusSession;
