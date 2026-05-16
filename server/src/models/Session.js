import { analyticsConnection } from '../config/db.js';
import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    loginAt: {
      type: Date,
      required: true,
    },
    logoutAt: {
      type: Date,
      default: null,
    },
    lastActiveAt: {
      type: Date,
      default: Date.now,
    },
    /**
     * Tracks whether the session's active duration has been credited
     * to user.totalActiveSeconds. Prevents duration loss if logoutUser
     * crashes after saving the session but before updating the user.
     */
    durationCredited: {
      type: Boolean,
      default: false,
    },
    ipAddress: {
      type: String,
    },
    location: {
      city: String,
      region: String,
      country: String,
    },
  },
  { timestamps: true }
);

// TTL Index: Auto-expire after 365 days
sessionSchema.index({ createdAt: 1 }, { expireAfterSeconds: 31536000 });

/**
 * Note on Architecture: 
 * Currently, heartbeat tracking updates the lastActiveAt field directly in MongoDB. 
 * This creates high write-throughput on the analytics DB during peak traffic.
 * FUTURE: Heartbeat tracking should be migrated to Redis with a flush-to-DB cron job.
 */

const Session = analyticsConnection.model('Session', sessionSchema);
export default Session;
