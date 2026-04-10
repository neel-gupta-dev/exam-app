import ActivityLog from '../models/ActivityLog.js';

/**
 * logActivity — Telemetry Utility (Fire-and-Forget)
 *
 * Silently writes an event to the ActivityLog collection without blocking
 * the main API response. Any error is swallowed and logged to stderr so
 * a telemetry failure never disrupts user-facing functionality.
 *
 * Usage pattern in any controller:
 *
 *   import { logActivity } from '../utils/telemetry.js';
 *
 *   // Fire-and-forget at any point in a controller — do NOT await
 *   logActivity({
 *     userId: req.user._id,
 *     actionType: 'CHAPTER_CHECKED',
 *     resourceId: chapterId,         // optional
 *     metadata: {
 *       columnId: 'col-2',
 *       previousState: false,
 *       newState: true,
 *     },
 *   });
 *
 * @param {Object} params
 * @param {import('mongoose').Types.ObjectId|string} params.userId    - The user performing the action
 * @param {string}  params.actionType   - Must match the ActivityLog enum
 * @param {import('mongoose').Types.ObjectId|string} [params.resourceId] - Related resource (optional)
 * @param {Object}  [params.metadata]   - Free-form context payload
 */
export async function logActivity({ userId, actionType, resourceId = null, metadata = {} }) {
  try {
    await ActivityLog.create({
      user: userId,
      actionType,
      resourceId,
      metadata,
    });
  } catch (err) {
    // Telemetry must never break core functionality.
    // Log to stderr for observability (can pipe to Datadog, Sentry, etc. later).
    console.error(`[Telemetry] Failed to log activity "${actionType}" for user ${userId}:`, err.message);
  }
}
