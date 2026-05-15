import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

// In a production Express env, dotenv is loaded at entry, but load here conditionally for safety.
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export default cloudinary;
