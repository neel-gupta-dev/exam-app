import ChapterList from '../models/ChapterList.js';
import asyncHandler from 'express-async-handler';

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

  let chapterList = await ChapterList.findOne({
    user: req.user._id,
    subject
  });

  if (!chapterList) {
    chapterList = await ChapterList.create({
      user: req.user._id,
      subject,
      columns: columns || [],
      chapters: chapters || []
    });
  } else {
    // Update existing
    if (columns !== undefined) chapterList.columns = columns;
    if (chapters !== undefined) chapterList.chapters = chapters;
    await chapterList.save();
  }

  res.status(200).json({
    success: true,
    data: chapterList
  });
});
