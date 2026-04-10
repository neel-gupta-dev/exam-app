import ChapterList from '../models/ChapterList.js';
import asyncHandler from 'express-async-handler';
import { logActivity } from '../utils/telemetry.js';

// @desc    Get user's chapter list for a specific subject
// @route   GET /api/chapter-list/:subject
// @access  Private
export const getChapterList = asyncHandler(async (req, res, next) => {
  const { subject } = req.params;

  if (!['Physics', 'Chemistry', 'Mathematics'].includes(subject)) {
    res.status(400);
    throw new Error(`Invalid subject: ${subject}`);
  }

  let chapterList = await ChapterList.findOne({
    user: req.user._id,
    subject
  });

  if (!chapterList) {
    // If it doesn't exist, seed with default columns
    const defaultColumns = [
      { id: 'col-1', name: 'Lectures' },
      { id: 'col-2', name: 'Notes' },
      { id: 'col-3', name: 'Module/DPP' },
      { id: 'col-4', name: 'PYQs' }
    ];

    chapterList = await ChapterList.create({
      user: req.user._id,
      subject,
      columns: defaultColumns,
      chapters: []
    });
  }

  res.status(200).json({
    success: true,
    data: chapterList
  });
});

// @desc    Update user's chapter list for a specific subject (upsert list of columns and chapters)
// @route   PUT /api/chapter-list/:subject
// @access  Private
export const updateChapterList = asyncHandler(async (req, res, next) => {
  const { subject } = req.params;
  const { columns, chapters } = req.body;

  if (!['Physics', 'Chemistry', 'Mathematics'].includes(subject)) {
    res.status(400);
    throw new Error(`Invalid subject: ${subject}`);
  }

  // Validate columns length
  if (columns && columns.length > 8) {
    res.status(400);
    throw new Error('Maximum of 8 dynamic columns allowed');
  }

  // ── Schema Migration: Boolean → Object ────────────────────────────────────
  // The frontend may still send `progress: { 'col-1': true }` (old flat boolean format).
  // We transparently normalise this to the new `{ completed, completedAt }` shape 
  // so existing clients don't break while we roll out the frontend update.
  //
  // Also detects which chapters changed state so we can emit telemetry events.
  let normalizedChapters = chapters;
  const telemetryEvents = []; // Collect events to fire after save (non-blocking)

  if (chapters) {
    // Fetch existing state for diff (needed to detect actual state changes)
    const existing = await ChapterList.findOne({ user: req.user._id, subject });

    normalizedChapters = chapters.map((chapter) => {
      if (!chapter.progress) return chapter;

      const normalizedProgress = {};

      for (const [columnId, value] of Object.entries(chapter.progress)) {
        if (typeof value === 'boolean') {
          // ── Old boolean format — migrate on the fly ──────────────────────
          // Find the previous state for this (chapter, column) pair
          const existingChapter = existing?.chapters?.find(c => c.id === chapter.id);
          const previousEntry = existingChapter?.progress?.get?.(columnId);
          const previousState = typeof previousEntry === 'boolean'
            ? previousEntry
            : (previousEntry?.completed ?? false);

          normalizedProgress[columnId] = {
            completed: value,
            completedAt: value ? new Date() : null,
          };

          // Queue a telemetry event only when state actually changed
          if (previousState !== value) {
            telemetryEvents.push({
              userId: req.user._id,
              actionType: value ? 'CHAPTER_CHECKED' : 'CHAPTER_UNCHECKED',
              metadata: {
                subject,
                chapterId: chapter.id,
                chapterName: chapter.name,
                columnId,
                previousState,
                newState: value,
              },
            });
          }
        } else if (typeof value === 'object' && value !== null) {
          // ── New object format — already correct, just ensure completedAt ──
          const existingChapter = existing?.chapters?.find(c => c.id === chapter.id);
          const previousEntry = existingChapter?.progress?.get?.(columnId);
          const previousState = typeof previousEntry === 'boolean'
            ? previousEntry
            : (previousEntry?.completed ?? false);
          const newState = value.completed ?? false;

          normalizedProgress[columnId] = {
            completed: newState,
            // Set completedAt when newly completed; clear when unchecked
            completedAt: newState
              ? (value.completedAt || previousEntry?.completedAt || new Date())
              : null,
          };

          if (previousState !== newState) {
            telemetryEvents.push({
              userId: req.user._id,
              actionType: newState ? 'CHAPTER_CHECKED' : 'CHAPTER_UNCHECKED',
              metadata: {
                subject,
                chapterId: chapter.id,
                chapterName: chapter.name,
                columnId,
                previousState,
                newState,
              },
            });
          }
        } else {
          // Passthrough for null or unknown — safe default
          normalizedProgress[columnId] = { completed: false, completedAt: null };
        }
      }

      return { ...chapter, progress: normalizedProgress };
    });
  }

  // ── Upsert ────────────────────────────────────────────────────────────────
  let chapterList = await ChapterList.findOne({ user: req.user._id, subject });

  if (!chapterList) {
    chapterList = await ChapterList.create({
      user: req.user._id,
      subject,
      columns: columns || [],
      chapters: normalizedChapters || []
    });
  } else {
    if (columns !== undefined) chapterList.columns = columns;
    if (normalizedChapters !== undefined) chapterList.chapters = normalizedChapters;
    await chapterList.save();
  }

  // ── Respond immediately, then fire telemetry ─────────────────────────────
  res.status(200).json({
    success: true,
    data: chapterList
  });

  // Fire-and-forget: do NOT await — these should never block the response.
  for (const event of telemetryEvents) {
    logActivity(event);
  }
});

