import dotenv from 'dotenv';
import path from 'path';
import crypto from 'crypto';
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

export const ANALYTICS_MONGO_URI = process.env.ANALYTICS_MONGO_URI || 
    (isProd ? undefined : 'mongodb://localhost:27017/vayl_analytics');

export const PORT = process.env.PORT || 5000;

export const FRONTEND_URL = process.env.FRONTEND_URL || 
    (isProd ? 'https://vayl.in' : 'http://localhost:3000');

export const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : [FRONTEND_URL];

// SECURITY: JWT_SECRET must be explicitly configured.
// In production: crash immediately if missing (fail-fast, not fail-silently-on-first-request).
// In development: generate a random ephemeral secret per process start (never hardcoded).

export const JWT_SECRET = (() => {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  if (isProd) {
    console.error('\n[FATAL] JWT_SECRET environment variable is not set in production.\nThe server cannot start without it — all authentication would be broken.\nSet it in your hosting dashboard (Vercel/Railway env vars).\n');
    process.exit(1);
  }
  // Dev: generate a per-process random secret (never a well-known hardcoded string)
  const devSecret = crypto.randomBytes(32).toString('hex');
  console.warn('[Config] JWT_SECRET not set — using a random ephemeral secret for this dev session.');
  return devSecret;
})();

// Google OAuth Configuration
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
export const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || 
  (isProd 
    ? '' 
    : 'http://localhost:5000/auth/google/callback');

// Validation — crash in production if critical vars are missing
if (isProd) {
  if (!MONGO_URI) {
    console.error('[FATAL] MONGO_URI is not set in production. Exiting.');
    process.exit(1);
  }
} else {
  if (!MONGO_URI) console.warn('[Config] MONGO_URI missing.');
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
  GOOGLE_CALLBACK_URL,
};

