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
     * Examples per actionType:
     *
     * CHAPTER_CHECKED:
     *   { columnId: 'col-2', chapterId: 'ch-01', previousState: false, newState: true }
     *
     * SESSION_ENDED:
     *   { timeSpentMs: 3600000, sessionType: 'focus', targetSubject: 'Physics' }
     *
     * FLASHCARD_RATED:
     *   { deckId: '...', difficulty: 'again', timeToAnswerMs: 4500 }
     *
     * CONFIDENCE_RATED:
     *   { subject: 'Chemistry', score: 7, previousScore: 5 }
     */
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    // createdAt is the primary time-series dimension — must be indexed
    // updatedAt is intentionally omitted (events are immutable)
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Compound index for the most common analytics query pattern:
// "Give me all CHAPTER_CHECKED events for user X in the last 30 days"
activityLogSchema.index({ user: 1, actionType: 1, createdAt: -1 });

// TTL Index (Optional, commented out): Auto-delete raw events after 2 years
// to manage storage. Uncomment if needed.
// activityLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 63072000 });

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

export default ActivityLog;
