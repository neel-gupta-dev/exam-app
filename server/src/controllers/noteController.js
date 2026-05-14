import asyncHandler from 'express-async-handler';
import * as noteService from '../services/noteService.js';

// @desc    Create a new note
// @route   POST /api/notes
// @access  Private
export const createNote = asyncHandler(async (req, res) => {
  const { resourceId, content, videoTimestamp, sourceUrl, isWebClip } = req.body;

  if (!content) {
    res.status(400);
    throw new Error('Please provide content');
  }

  if (!isWebClip && !resourceId) {
    res.status(400);
    throw new Error('Please provide resourceId for standard notes');
  }

  const note = await noteService.createNote({
    userId: req.user._id,
    resourceId: resourceId || undefined,
    content,
    videoTimestamp,
    sourceUrl,
    isWebClip: !!isWebClip,
  });

  res.status(201).json(note);
});

// @desc    Get notes for a resource (paginated)
// @route   GET /api/notes/:resourceId
// @access  Private
export const getNotes = asyncHandler(async (req, res) => {
  const { resourceId } = req.params;
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;

  const data = await noteService.getNotesByResource({
    userId: req.user._id,
    resourceId,
    page,
    limit,
  });

  res.json(data);
});

// @desc    Get web clips
// @route   GET /api/notes/web-clips/all
// @access  Private
export const getWebClips = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;

  const data = await noteService.getWebClips({
    userId: req.user._id,
    page,
    limit,
  });

  res.json(data);
});
