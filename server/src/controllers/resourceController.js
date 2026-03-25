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
  const folder = req.query.folder;

  const data = await resourceService.getUserResources({
    userId: req.user._id,
    page,
    limit,
    folder,
  });

  res.json(data);
});
// @desc    Get a single resource
// @route   GET /api/resources/:id
// @access  Private
export const getResourceById = asyncHandler(async (req, res) => {
  const resource = await resourceService.getResourceById({
    id: req.params.id,
    userId: req.user._id,
  });

  if (resource) {
    res.json(resource);
  } else {
    res.status(404);
    throw new Error('Resource not found');
  }
});

// @desc    Delete a resource
// @route   DELETE /api/resources/:id
// @access  Private
export const deleteResource = asyncHandler(async (req, res) => {
  const resource = await resourceService.deleteResource({
    id: req.params.id,
    userId: req.user._id,
  });

  if (resource) {
    res.json({ message: 'Resource removed' });
  } else {
    res.status(404);
    throw new Error('Resource not found');
  }
});
