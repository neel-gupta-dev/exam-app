// If we are in production (Vercel), use relative paths. 
// If local, use localhost:5000.
export const API_BASE_URL = process.env.NODE_ENV === 'production'
    ? 'https://vayl-express.vercel.app/api'
    : 'https://vayl-express.vercel.app/api';