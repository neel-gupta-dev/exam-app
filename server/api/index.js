import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from '../src/config/db.js';
import { notFound, errorHandler } from '../src/middlewares/errorMiddleware.js';
import authRoutes from '../src/routes/authRoutes.js';
import resourceRoutes from '../src/routes/resourceRoutes.js';
import userRoutes from '../src/routes/userRoutes.js';
import noteRoutes from '../src/routes/noteRoutes.js';
import focusRoutes from '../src/routes/focusRoutes.js';
import publicRoutes from '../src/routes/publicRoutes.js';
import studyRoutes from '../src/routes/study.js';
import { getHealth } from '../src/controllers/healthController.js';
import { closeExpiredSessions } from '../src/services/authService.js';
import passport from 'passport';
import configurePassport from '../src/config/passport.js';
import { MONGO_URI, PORT, ALLOWED_ORIGINS } from '../src/config/index.js';

dotenv.config();

// Connect to MongoDB
connectDB().catch(err => {
  console.error('CRITICAL: MongoDB Connection Failed:', err.message);
});

// Configure Passport
configurePassport();

const app = express();

// Trust proxy for accurate IP detection (needed for Hostinger/Nginx)
app.set('trust proxy', true);

// --- CORS Configuration ---
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
      if (ALLOWED_ORIGINS.includes(origin) || ALLOWED_ORIGINS.includes('*')) {
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

// Passport initialization
app.use(passport.initialize());

// --- API Routes ---
app.get('/api/health', getHealth);

app.use('/api/auth', authRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/focus', focusRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/study', studyRoutes);

// --- Error Handling ---
app.use(notFound);
app.use(errorHandler);

// --- Start Server ---
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);

  // Run Janitor every 30 minutes
  setInterval(closeExpiredSessions, 30 * 60 * 1000);
});

export default app;
