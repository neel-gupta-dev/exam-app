import Note from '../models/Note.js';
import { logActivity } from '../utils/telemetry.js';

/**
 * Create a new note
 */
export const createNote = async ({ userId, resourceId, content, videoTimestamp }) => {
  const note = await Note.create({ userId, resourceId, content, videoTimestamp });
  logActivity({
    userId,
    actionType: 'NOTE_CREATED',
    resourceId,
    metadata: {
      noteId: note._id,
      videoTimestamp: videoTimestamp ?? null,
      contentLength: String(content || '').length,
    },
  });
  return note;
};

/**
 * Get notes for a specific resource (paginated)
 */
export const getNotesByResource = async ({ userId, resourceId, page = 1, limit = 20 }) => {
  const skip = (page - 1) * limit;

  const filter = { userId, resourceId };

  const [notes, total] = await Promise.all([
    Note.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Note.countDocuments(filter),
  ]);

  return {
    notes,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
};
