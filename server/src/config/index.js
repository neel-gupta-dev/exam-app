import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env only in development
if (process.env.NODE_ENV !== 'production') {
    const envPath = path.resolve(process.cwd(), '.env');
    dotenv.config({ path: envPath });
}

const isProd = process.env.NODE_ENV === 'production';

// Critical Variables with Defaults
export const MONGO_URI = process.env.MONGO_URI || 
    (isProd ? undefined : 'mongodb://localhost:27017/vayl');

export const PORT = process.env.PORT || 5000;

export const FRONTEND_URL = process.env.FRONTEND_URL || 
    (isProd ? 'https://vayl.in' : 'http://localhost:3000');

export const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : [FRONTEND_URL];

export const JWT_SECRET = process.env.JWT_SECRET || (isProd ? undefined : 'your_jwt_secret_here');

// Google OAuth Configuration
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
export const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || 
  (isProd 
    ? 'https://api.vayl.in/auth/google/callback' 
    : 'http://localhost:5000/auth/google/callback');

// Validation in Dev
if (!isProd) {
    if (!MONGO_URI) console.warn('[Config] MONGO_URI missing.');
    if (!JWT_SECRET) console.warn('[Config] JWT_SECRET missing.');
    if (!GOOGLE_CLIENT_ID) console.warn('[Config] GOOGLE_CLIENT_ID missing.');
}

export default {
  MONGO_URI,
  PORT,
  FRONTEND_URL,
  ALLOWED_ORIGINS,
  JWT_SECRET,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL
};

