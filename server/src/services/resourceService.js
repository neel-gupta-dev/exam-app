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
export const getUserResources = async ({ userId, page = 1, limit = 20, folder }) => {
  const skip = (page - 1) * limit;

  const query = { userId };
  if (folder) {
    query.folderName = { $regex: new RegExp(`^${folder}$`, 'i') };
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
  return resource;
};
