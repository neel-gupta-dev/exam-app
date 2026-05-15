import cloudinary from '../config/cloudinary.js';

/**
 * Dynamic Configurator with safe logs
 */
const ensureConfigured = () => {
  const config = {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  };

  // Safe diagnostic logger to isolate string corruption/mismatch in Vercel
  if (config.api_secret) {
    const secret = config.api_secret;
    const safeSecretMask = `${secret.substring(0, 3)}...${secret.substring(secret.length - 3)}`;
    
    console.log('[Cloudinary Runtime Diagnostic]:', {
      cloudName: config.cloud_name,
      apiKey: config.api_key,
      secretMask: safeSecretMask, // Prints e.g., "abc...xyz"
      secretLength: secret.length
    });
  } else {
    console.error('[Cloudinary Runtime Diagnostic]: API SECRET IS UNDEFINED!');
  }

  if (!config.cloud_name || !config.api_key || !config.api_secret) {
    throw new Error('Cloudinary credentials missing from Vercel environment.');
  }

  cloudinary.config(config);
};

/**
 * Helper to upload a raw file buffer into Cloudinary via streaming.
 */
export const uploadBufferToCloudinary = (fileBuffer, folder = 'study-materials', publicId = null) => {
  return new Promise((resolve, reject) => {
    try {
      ensureConfigured();

      const options = {
        folder,
        resource_type: 'auto',
      };
      
      if (publicId) {
        options.public_id = publicId;
      }

      const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
        if (error) {
          console.error('[Cloudinary Stream] Upload Failed:', error);
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
 * Delete an asset from Cloudinary by public ID
 */
export const deleteFromCloudinary = async (publicId) => {
  ensureConfigured();
  return cloudinary.uploader.destroy(publicId);
};
