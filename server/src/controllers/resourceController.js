import asyncHandler from 'express-async-handler';
import * as resourceService from '../services/resourceService.js';

// @desc    Create a new resource
// @route   POST /api/resources
// @access  Private
export const createResource = asyncHandler(async (req, res) => {
  const { type, url, title, folderName } = req.body;

  if (!type || !url || !title) {
    res.status(400);
    throw new Error('Please provide type, url, and title');
  }

  const resource = await resourceService.createResource({
    userId: req.user._id,
    type,
    url,
    title,
    folderName,
  });

  res.status(201).json(resource);
});

// @desc    Get user resources (paginated)
// @route   GET /api/resources
// @access  Private
export const getResources = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;

  const data = await resourceService.getUserResources({
    userId: req.user._id,
    page,
    limit,
  });

  res.json(data);
});
