import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env only in development
if (process.env.NODE_ENV !== 'production') {
    dotenv.config({ path: path.join(__dirname, '../../.env') });
}

export const MONGO_URI = process.env.MONGO_URI;
export const PORT = process.env.PORT || 5000;
export const FRONTEND_URL = process.env.FRONTEND_URL;
export const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : []; // Default to empty if not provided, CORS will block by default

export default {
  MONGO_URI,
  PORT,
  FRONTEND_URL,
  ALLOWED_ORIGINS,
};
