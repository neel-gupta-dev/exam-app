import Resource from '../models/Resource.js';
import User from '../models/User.js';
import { logActivity } from '../utils/telemetry.js';

/** Escape special regex characters in user input to prevent ReDoS */
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Sanitize a string for use as a MongoDB document key (strip dots, $, and control chars) */
const sanitizeKey = (str) => String(str).replace(/[.$\x00]/g, '_').slice(0, 100);

/**
 * Create a new resource
 */
export const createResource = async ({ userId, type, url, title, folderName }) => {
  const resource = await Resource.create({ userId, type, url, title, folderName });
  
  // O(1) increment of subject distribution and global resource count
  const safeFolder = sanitizeKey(folderName || 'Uncategorized');
  await User.findByIdAndUpdate(userId, {
    $inc: { 
      [`analytics.subjectDistribution.${safeFolder}`]: folderName ? 1 : 0,
      'analytics.resourceCount': 1
    }
  });

  logActivity({
    userId,
    actionType: 'RESOURCE_SAVED',
    resourceId: resource._id,
    metadata: { type, title, folderName: folderName || 'Uncategorized' },
  });
  
  return resource;
};

/**
 * Get resources for a user (paginated)
 */
export const getUserResources = async ({ userId, page = 1, limit = 20, folder, search }) => {
  const skip = (page - 1) * limit;

  const query = { userId };
  if (folder) {
    query.folderName = { $regex: new RegExp(`^${escapeRegex(String(folder))}$`, 'i') };
  }
  
  if (search) {
    query.title = { $regex: escapeRegex(String(search)), $options: 'i' };
  }

  const [resources, total] = await Promise.all([
    Resource.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Resource.countDocuments(query),
  ]);

  return {
    resources,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
};
/**
 * Get a single resource by ID and userId
 */
export const getResourceById = async ({ id, userId }) => {
  const resource = await Resource.findOne({ _id: id, userId });
  if (resource) {
    logActivity({
      userId,
      actionType: 'RESOURCE_VIEWED',
      resourceId: resource._id,
      metadata: { type: resource.type, title: resource.title, folderName: resource.folderName },
    });
  }
  return resource;
};

/**
 * Delete a resource and decrement subject distribution
 */
export const deleteResource = async ({ id, userId }) => {
  const resource = await Resource.findOne({ _id: id, userId });
  if (!resource) return null;

  const folderName = resource.folderName;
  await Resource.deleteOne({ _id: id });

  // O(1) decrement of subject distribution and global resource count
  const safeFolder = sanitizeKey(folderName || 'Uncategorized');
  await User.findByIdAndUpdate(userId, {
    $inc: { 
      [`analytics.subjectDistribution.${safeFolder}`]: folderName ? -1 : 0,
      'analytics.resourceCount': -1
    }
  });

  logActivity({
    userId,
    actionType: 'RESOURCE_DELETED',
    resourceId: resource._id,
    metadata: { type: resource.type, title: resource.title, folderName: resource.folderName },
  });

  return resource;
};
