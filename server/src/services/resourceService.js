import Resource from '../models/Resource.js';

/**
 * Create a new resource
 */
export const createResource = async ({ userId, type, url, title, folderName }) => {
  const resource = await Resource.create({ userId, type, url, title, folderName });
  return resource;
};

/**
 * Get resources for a user (paginated)
 */
export const getUserResources = async ({ userId, page = 1, limit = 20 }) => {
  const skip = (page - 1) * limit;

  const [resources, total] = await Promise.all([
    Resource.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Resource.countDocuments({ userId }),
  ]);

  return {
    resources,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
};
