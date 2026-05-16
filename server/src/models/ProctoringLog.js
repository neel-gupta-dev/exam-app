import { analyticsConnection } from '../config/db.js';
import mongoose from 'mongoose';

const proctoringLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    testAttemptId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TestAttempt',
      required: true,
      index: true,
    },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['TAB_SWITCH', 'COPY_ATTEMPT', 'FULLSCREEN_EXIT', 'EYE_TRACKING'],
      required: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    
    // Detailed Event Tracking
    tabSwitches: [
      {
        timestamp: { type: Date, default: Date.now },
        durationAway: { type: Number, default: 0 }, // in ms
        switchCount: { type: Number, default: 1 },
      }
    ],
    flags: [
      {
        type: { type: String },
        timestamp: { type: Date, default: Date.now },
        severity: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
      }
    ],
    
    // Real-time Summary for Dashboards (prevents array scans)
    summary: {
      totalTabSwitches: { type: Number, default: 0 },
      totalTimeAway: { type: Number, default: 0 }, // in ms
      riskScore: { type: Number, default: 0 }, // 0-100 scale
    },
    
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// High-performance indexes
proctoringLogSchema.index({ testAttemptId: 1, userId: 1 }, { unique: true });
proctoringLogSchema.index({ tenantId: 1, testId: 1 }); // testId can be added if needed, but attemptId is primary

// TTL Index: Auto-expire after 365 days
proctoringLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 31536000 });

const ProctoringLog = analyticsConnection.model('ProctoringLog', proctoringLogSchema);

export default ProctoringLog;
