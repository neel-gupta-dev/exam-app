import asyncHandler from 'express-async-handler';
import CheatsheetSection from '../models/CheatsheetSection.js';

/**
 * @desc    Get all published sections (public)
 * @route   GET /api/cheatsheet
 * @access  Public
 */
export const getPublicSections = asyncHandler(async (req, res) => {
  const sections = await CheatsheetSection.find({ isPublished: true })
    .sort({ subject: 1, order: 1 })
    .lean();

  // Group by subject for the frontend
  const grouped = { chemistry: [], physics: [], mathematics: [] };
  for (const s of sections) {
    if (grouped[s.subject]) grouped[s.subject].push(s);
  }

  res.json(grouped);
});

/**
 * @desc    Get all sections (admin — includes unpublished)
 * @route   GET /api/cheatsheet/admin
 * @access  Admin
 */
export const getAdminSections = asyncHandler(async (req, res) => {
  const sections = await CheatsheetSection.find()
    .sort({ subject: 1, order: 1 });
  res.json(sections);
});

/**
 * @desc    Create a new section
 * @route   POST /api/cheatsheet
 * @access  Admin
 */
export const createSection = asyncHandler(async (req, res) => {
  const { subject, title, order, accentColor, blocks, isPublished } = req.body;

  const section = await CheatsheetSection.create({
    subject,
    title,
    order: order ?? 0,
    accentColor: accentColor || 'yellow',
    blocks: blocks || [],
    isPublished: isPublished !== false,
  });

  res.status(201).json(section);
});

/**
 * @desc    Update a section
 * @route   PATCH /api/cheatsheet/:id
 * @access  Admin
 */
export const updateSection = asyncHandler(async (req, res) => {
  const section = await CheatsheetSection.findById(req.params.id);
  if (!section) {
    res.status(404);
    throw new Error('Section not found');
  }

  const allowed = ['subject', 'title', 'order', 'accentColor', 'blocks', 'isPublished'];
  for (const key of allowed) {
    if (req.body[key] !== undefined) section[key] = req.body[key];
  }

  await section.save();
  res.json(section);
});

/**
 * @desc    Delete a section
 * @route   DELETE /api/cheatsheet/:id
 * @access  Admin
 */
export const deleteSection = asyncHandler(async (req, res) => {
  const section = await CheatsheetSection.findByIdAndDelete(req.params.id);
  if (!section) {
    res.status(404);
    throw new Error('Section not found');
  }
  res.json({ message: 'Section deleted' });
});
