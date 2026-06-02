import { analyticsConnection } from '../config/db.js';
import mongoose from 'mongoose';

/**
 * ActivityLog — The Telemetry Engine
 *
 * A separate collection for event-sourcing. Every meaningful user action is
 * recorded here as an immutable, timestamped event. This decouples raw event
 * data from the User document (avoiding the 16MB BSON limit) and gives us a
 * proper time-series log for future ML-driven analytics.
 *
 * Design principles:
 * - Write-only (never mutate past events, only INSERT)
 * - Silently inserted (never block the main API response)
 * - Flexible metadata (Schema.Types.Mixed) for context-rich payloads
 */

const activityLogSchema = new mongoose.Schema(
  {
    // The user who performed the action
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // The type of event — use SCREAMING_SNAKE_CASE for consistency 
    // with ML feature engineering downstream
    actionType: {
      type: String,
      required: true,
      enum: [
        // Chapter Tracker events
        'CHAPTER_CHECKED',
        'CHAPTER_UNCHECKED',
        'CHAPTER_ADDED',
        'CHAPTER_DELETED',
        // Session events
        'SESSION_STARTED',
        'SESSION_ENDED',
        // Resource/Vault events
        'RESOURCE_SAVED',
        'RESOURCE_VIEWED',
        'RESOURCE_DELETED',
        // Notes events
        'NOTE_CREATED',
        'NOTE_DOWNLOADED',
        // Flashcard events
        'FLASHCARD_FLIPPED',
        'FLASHCARD_RATED',
        'DECK_CREATED',
        // Analytics/Search events
        'SEARCH_PERFORMED',
        'CONFIDENCE_RATED',
        // Implicit Tracking events
        'IMPLICIT_GUESS_DETECTED',
        'IMPLICIT_ENVIRONMENT_LOG',
        'IMPLICIT_RAGE_CLICK',
        // Exam Telemetry
        'TEST_STARTED',
        'TEST_SUBMITTED',
        'QUESTION_SKIPPED',
        'ANSWER_CHANGED',
      ],
      index: true, // Index for filtering by action type in analytics queries
    },

    // Optional reference to the specific resource involved (chapter, note, card, etc.)
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      index: true, // For efficient lookup of all events related to a specific item
    },

    /**
     * Flexible context payload — the "why" behind the "what".
     */
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    // createdAt is the primary time-series dimension — must be indexed
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Compound index for the most common analytics query pattern
activityLogSchema.index({ user: 1, actionType: 1, createdAt: -1 });

// TTL Index: Auto-expire after 180 days (15552000 seconds)
activityLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 15552000 });

// Register on analyticsConnection
const ActivityLog = analyticsConnection.model('ActivityLog', activityLogSchema);

export default ActivityLog;
