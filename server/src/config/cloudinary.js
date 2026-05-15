import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

// In a production Express env, dotenv is loaded at entry, but load here conditionally for safety.
dotenv.config();

// In our enhanced architecture, configuration is injected in real-time during 
// each API request to guarantee stability across serverless cold starts.
// This module merely provides the raw SDK instance binding.
export default cloudinary;
