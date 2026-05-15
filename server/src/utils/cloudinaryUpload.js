import cloudinary from '../config/cloudinary.js';

/**
 * Helper to upload a raw file buffer (e.g., from multer) into Cloudinary via streaming.
 * Eliminates disk writes, enabling serverless runtime support.
 * 
 * @param {Buffer} fileBuffer - Buffer from req.file.buffer
 * @param {string} folder - Target Cloudinary folder
 * @param {string} publicId - Custom slugified public_id (optional)
 * @returns {Promise<Object>} - Cloudinary result object
 */
export const uploadBufferToCloudinary = (fileBuffer, folder = 'study-materials', publicId = null) => {
  return new Promise((resolve, reject) => {
    const options = {
      folder,
      resource_type: 'auto', // Automatically handles pdfs, images, etc
    };
    
    if (publicId) {
      options.public_id = publicId;
    }

    const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) {
        return reject(error);
      }
      resolve(result);
    });

    uploadStream.end(fileBuffer);
  });
};

/**
 * Delete an asset from Cloudinary by public ID
 * 
 * @param {string} publicId - Asset identification key
 * @returns {Promise<Object>}
 */
export const deleteFromCloudinary = async (publicId) => {
  return cloudinary.uploader.destroy(publicId);
};
