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
let telemetryQueue = [];
const MAX_BATCH_SIZE = 50;
const BATCH_INTERVAL_MS = 5000;
let flushTimer = null;

const flushTelemetryQueue = async () => {
  if (telemetryQueue.length === 0) return;
  const batch = [...telemetryQueue];
  telemetryQueue = [];
  try {
    await ActivityLog.insertMany(batch, { ordered: false });
  } catch (err) {
    console.error(`[Telemetry] Failed to batch insert ${batch.length} events:`, err.message);
  }
};

export async function logActivity({ userId, actionType, resourceId = null, metadata = {} }) {
  if (!userId || !actionType) return;

  telemetryQueue.push({
    user: userId,
    actionType,
    resourceId,
    metadata,
  });

  if (telemetryQueue.length >= MAX_BATCH_SIZE) {
    if (flushTimer) clearTimeout(flushTimer);
    flushTimer = null;
    // Don't await, fire and forget
    flushTelemetryQueue();
  } else if (!flushTimer) {
    flushTimer = setTimeout(() => {
      flushTimer = null;
      flushTelemetryQueue();
    }, BATCH_INTERVAL_MS);
  }
}
