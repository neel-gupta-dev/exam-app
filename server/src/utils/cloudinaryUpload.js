import cloudinary from '../config/cloudinary.js';

/**
 * Helper to upload a raw file buffer (e.g., from multer) into Cloudinary via streaming.
 * Bypasses global state by injecting credentials directly into the execution context,
 * providing 100% stability across Vercel Serverless cold-starts.
 * 
 * @param {Buffer} fileBuffer - Buffer from req.file.buffer
 * @param {string} folder - Target Cloudinary folder
 * @param {string} publicId - Custom slugified public_id (optional)
 * @returns {Promise<Object>} - Cloudinary result object
 */
export const uploadBufferToCloudinary = (fileBuffer, folder = 'study-materials', publicId = null) => {
  return new Promise((resolve, reject) => {
    // Build self-contained credentials configuration object
    const directConfig = {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    };

    // Print explicit sanity check for server logs (without revealing the secret itself)
    if (!directConfig.cloud_name || !directConfig.api_key || !directConfig.api_secret) {
      console.error('[Cloudinary Stream] CRITICAL: Cloudinary environment variables are missing on process.env!', {
        hasCloudName: !!directConfig.cloud_name,
        hasApiKey: !!directConfig.api_key,
        hasSecret: !!directConfig.api_secret
      });
      return reject(new Error('Cloudinary credentials missing on production environment.'));
    }

    const options = {
      ...directConfig, // Inject credentials directly to bypass global singleton issues
      folder,
      resource_type: 'auto', // Automatically handle pdfs
    };
    
    if (publicId) {
      options.public_id = publicId;
    }

    // Trigger stream uploading using explicit, self-contained runtime options
    const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) {
        console.error('[Cloudinary Stream] Upload invocation failed:', error);
        return reject(error);
      }
      resolve(result);
    });

    uploadStream.end(fileBuffer);
  });
};

/**
 * Delete an asset from Cloudinary by public ID with direct credential injection
 * 
 * @param {string} publicId - Asset identification key
 * @returns {Promise<Object>}
 */
export const deleteFromCloudinary = async (publicId) => {
  const directConfig = {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  };

  return cloudinary.uploader.destroy(publicId, directConfig);
};
