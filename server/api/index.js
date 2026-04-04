import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import compression from 'compression';
import basicAuth from 'express-basic-auth';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import path from 'path';
import connectDB from '../src/config/db.js';
import { notFound, errorHandler } from '../src/middlewares/errorMiddleware.js';
import authRoutes from '../src/routes/authRoutes.js';
import feedbackRoutes from '../src/routes/feedback.js'
import resourceRoutes from '../src/routes/resourceRoutes.js';
import userRoutes from '../src/routes/userRoutes.js';
import noteRoutes from '../src/routes/noteRoutes.js';
import focusRoutes from '../src/routes/focusRoutes.js';
import publicRoutes from '../src/routes/publicRoutes.js';
import studyRoutes from '../src/routes/study.js';
import analyticsRoutes from '../src/routes/analyticsRoutes.js';
import classroomRoutes from '../src/routes/classroomRoutes.js';
import performanceRoutes from '../src/routes/performanceRoutes.js';
import calendarRoutes from '../src/routes/calendarRoutes.js';
import { getHealth } from '../src/controllers/healthController.js';
import { closeExpiredSessions } from '../src/services/authService.js';
import adminRoutes from '../src/routes/adminRoutes.js';
import passport from 'passport';
import configurePassport from '../src/config/passport.js';
import { MONGO_URI, PORT, ALLOWED_ORIGINS } from '../src/config/index.js';

// Connect to MongoDB
connectDB().catch(err => {
  console.error('CRITICAL: MongoDB Connection Failed:', err.message);
});

// Configure Passport
configurePassport();

const app = express();
app.use(compression());

// Trust proxy for accurate IP detection (needed for Hostinger/Nginx)
app.set('trust proxy', true);

// --- CORS Configuration ---
// Always-allowed origins as a hard-coded safety net.
// ALLOWED_ORIGINS env var extends this list (comma-separated).
const HARDCODED_ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://vayl-app.vercel.app',
];

const runtimeAllowedOrigins = ALLOWED_ORIGINS
  ? [...new Set([...HARDCODED_ALLOWED_ORIGINS, ...ALLOWED_ORIGINS])]
  : HARDCODED_ALLOWED_ORIGINS;

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, Postman, etc.)
      if (!origin) return callback(null, true);

      // Allow Chrome Extension origins
      if (origin.startsWith('chrome-extension://')) {
        return callback(null, true);
      }

      // Allow any Vercel preview deploy for this project
      if (origin.endsWith('.vercel.app')) {
        return callback(null, true);
      }

      // Allow whitelisted origins
      if (runtimeAllowedOrigins.includes(origin) || runtimeAllowedOrigins.includes('*')) {
        return callback(null, true);
      }

      console.warn(`[CORS] Blocked request from origin: ${origin}`);
      return callback(new Error(`Not allowed by CORS: ${origin}`));
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
app.use('/api/analytics', analyticsRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/classroom', classroomRoutes);
app.use('/api/performance', performanceRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/admin', adminRoutes);

// ─── ADMIN PANEL (Static SPA) ────────────────────────────────────────────────
// Served at a secret path with an extra HTTP Basic Auth gate.
// Set ADMIN_PATH, ADMIN_BASIC_USER, ADMIN_BASIC_PASS in Railway env vars.
const ADMIN_PATH   = process.env.ADMIN_PATH       || '/sys-9f3k-ctrl';
const ADMIN_USER   = process.env.ADMIN_BASIC_USER  || 'vayl_ops';
const ADMIN_PASS   = process.env.ADMIN_BASIC_PASS  || 'ctrl#9f3k!vayl';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const adminStaticDir = path.join(__dirname, '..', 'admin-static');

// Gate 1: HTTP Basic Auth
app.use(ADMIN_PATH, basicAuth({
  users: { [ADMIN_USER]: ADMIN_PASS },
  challenge: true,
  realm: 'Restricted',
}));

// Serve static admin panel files
app.use(ADMIN_PATH, express.static(adminStaticDir));

// SPA fallback — send index.html for all sub-routes (React Router handles them)
app.get(`${ADMIN_PATH}/*`, (req, res) => {
  res.sendFile(path.join(adminStaticDir, 'index.html'));
});

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
