import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env only in development
if (process.env.NODE_ENV !== 'production') {
    dotenv.config({ path: path.join(__dirname, '../../.env') });
}

const isProd = process.env.NODE_ENV === 'production';

// Debug logging
console.log(`[Config] NODE_ENV: ${process.env.NODE_ENV || 'undefined'}`);
console.log(`[Config] isProd: ${isProd}`);

// Critical Variables with Defaults
export const MONGO_URI = process.env.MONGO_URI || 
    (isProd ? undefined : 'mongodb://localhost:27017/vayl');

// Log MONGO_URI (masked)
if (MONGO_URI) {
    const masked = MONGO_URI.replace(/:([^@]+)@/, ':****@');
    console.log(`[Config] Using MONGO_URI: ${masked}`);
}

export const PORT = process.env.PORT || 5000;


export const FRONTEND_URL = process.env.FRONTEND_URL || 
    (isProd ? 'https://vayl-app.vercel.app' : 'http://localhost:3000');

export const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : [FRONTEND_URL]; // Default to frontend url if not provided

export const JWT_SECRET = process.env.JWT_SECRET || (isProd ? undefined : 'your_jwt_secret_here');

// Validation in Dev
if (!isProd) {
    if (!process.env.MONGO_URI) console.warn('[Config] MONGO_URI missing, defaulting to local MongoDB.');
    if (!process.env.FRONTEND_URL) console.warn(`[Config] FRONTEND_URL missing, defaulting to ${FRONTEND_URL}.`);
    if (!process.env.JWT_SECRET) console.warn('[Config] JWT_SECRET missing, using insecure developer default.');
}


export default {
  MONGO_URI,
  PORT,
  FRONTEND_URL,
  ALLOWED_ORIGINS,
};

