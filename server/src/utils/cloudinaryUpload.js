import cloudinary from '../config/cloudinary.js';

/**
 * Dynamic Configurator
 * Dynamically binds process.env keys to the Cloudinary runtime right before execution.
 * Ensures serverless cold-starts never lose reference to configuration data.
 */
const ensureConfigured = () => {
  const config = {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  };

  if (!config.cloud_name || !config.api_key || !config.api_secret) {
    console.error('[Cloudinary Runtime] CRITICAL: Env vars are missing!', {
      hasCloudName: !!config.cloud_name,
      hasApiKey: !!config.api_key,
      hasSecret: !!config.api_secret
    });
    throw new Error('Cloudinary credentials not provisioned in active environment.');
  }

  // Officially configure the SDK at execution time
  cloudinary.config(config);
};

/**
 * Helper to upload a raw file buffer into Cloudinary via streaming.
 * Invokes dynamic runtime binding to eliminate serverless cold-start singleton issues.
 * 
 * @param {Buffer} fileBuffer - Buffer from req.file.buffer
 * @param {string} folder - Target Cloudinary folder
 * @param {string} publicId - Custom slugified public_id (optional)
 * @returns {Promise<Object>} - Cloudinary result object
 */
export const uploadBufferToCloudinary = (fileBuffer, folder = 'study-materials', publicId = null) => {
  return new Promise((resolve, reject) => {
    try {
      // 1. Bind live environment keys to the SDK right before execution
      ensureConfigured();

      const options = {
        folder,
        resource_type: 'auto', // Automatically handles pdfs
      };
      
      if (publicId) {
        options.public_id = publicId;
      }

      // 2. Execute upload stream using the now-configured SDK
      const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
        if (error) {
          console.error('[Cloudinary Stream] API invocation failed:', error);
          return reject(error);
        }
        resolve(result);
      });

      uploadStream.end(fileBuffer);
    } catch (err) {
      reject(err);
    }
  });
};

/**
 * Delete an asset from Cloudinary by public ID using dynamic binding
 * 
 * @param {string} publicId - Asset identification key
 * @returns {Promise<Object>}
 */
export const deleteFromCloudinary = async (publicId) => {
  // Bind live environment keys right before deleting
  ensureConfigured();
  return cloudinary.uploader.destroy(publicId);
};
