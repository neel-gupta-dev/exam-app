import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './src/config/db.js';
import { notFound, errorHandler } from './src/middlewares/errorMiddleware.js';
import authRoutes from './src/routes/authRoutes.js';
import resourceRoutes from './src/routes/resourceRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import noteRoutes from './src/routes/noteRoutes.js';
import focusRoutes from './src/routes/focusRoutes.js';
import publicRoutes from './src/routes/publicRoutes.js';
import { closeExpiredSessions } from './src/services/authService.js';

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Trust proxy for accurate IP detection (needed for Hostinger/Nginx)
app.set('trust proxy', true);

// --- CORS Configuration ---
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : ['http://localhost:3000'];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) return callback(null, true);

      // Allow Chrome Extension origins
      if (origin.startsWith('chrome-extension://')) {
        return callback(null, true);
      }

      // Allow whitelisted origins
      if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        return callback(null, true);
      }

      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- API Routes ---
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/focus', focusRoutes);
app.use('/api/public', publicRoutes);

// --- Error Handling ---
app.use(notFound);
app.use(errorHandler);

// --- Start Server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
  // Run Janitor every 30 minutes
  setInterval(closeExpiredSessions, 30 * 60 * 1000);
});
