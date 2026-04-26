// dotenv is handled by src/config/index.js (dev only)
// On Vercel, env vars are injected via the dashboard — no .env file needed
import express from 'express';
import helmet from 'helmet';
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
import { startEvaluationWorker } from '../src/workers/evaluationWorker.js';
import adminRoutes from '../src/routes/adminRoutes.js';
import chapterListRoutes from '../src/routes/chapterListRoutes.js';
import followRoutes from '../src/routes/followRoutes.js';
import notificationRoutes from '../src/routes/notificationRoutes.js';
import flashcardRoutes from '../src/routes/flashcardRoutes.js';
import testRoutes from '../src/routes/testRoutes.js';
import b2bRoutes from '../src/routes/b2bRoutes.js';
import coachingAdminRoutes from '../src/routes/coachingAdminRoutes.js';
import attemptRoutes from '../src/routes/attemptRoutes.js';
import cheatsheetRoutes from '../src/routes/cheatsheetRoutes.js';
import assessmentRoutes from '../src/routes/assessmentRoutes.js';
import passport from 'passport';
import configurePassport from '../src/config/passport.js';
import { MONGO_URI, PORT, ALLOWED_ORIGINS } from '../src/config/index.js';
import { connectRedis } from '../src/config/redis.js';



// Connect to Redis (non-blocking — app works without it)
// On Vercel serverless, skip Redis entirely — no persistent connection available
// and a hanging TCP SYN to localhost:6379 would drain the function timeout.
if (!process.env.VERCEL && process.env.REDIS_URL) {
  connectRedis().catch(err => {
    console.warn('[Redis] Skipping Redis:', err.message);
  });
} else if (!process.env.REDIS_URL) {
  console.warn('[Redis] No REDIS_URL set — running without cache.');
}

// Configure Passport
configurePassport();

const app = express();

// Block requests strictly until Serverless DB resolves (Fixes Vercel Container Freezing Mongoose TCP)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    if (req.path === '/health' || req.path === '/api/health') {
       return res.json({ database: { status: 'failed', error: error.message } });
    }
    res.status(503).json({ message: 'Database Connection Failed', error: error.message });
  }
});

app.use(helmet());
app.use((req, res, next) => {
  res.setHeader(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), browsing-topics=()'
  );
  next();
});
app.use(compression());

// Trust proxy for accurate IP detection (needed for Hostinger/Nginx)
app.set('trust proxy', true);

// --- CORS Configuration ---
// Always-allowed origins as a hard-coded safety net.
// ALLOWED_ORIGINS env var extends this list (comma-separated).
const HARDCODED_ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
  'https://vayl.in',
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

      // Allow any vayl.in subdomains (e.g. www.vayl.in)
      if (origin === 'https://vayl.in' || origin.endsWith('.vayl.in')) {
        return callback(null, true);
      }

      // Keep allowing Vercel preview deploys for this project
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
const apiRouter = express.Router();
apiRouter.get('/health', getHealth);
apiRouter.use('/auth', authRoutes);
apiRouter.use('/resources', resourceRoutes);
apiRouter.use('/users', userRoutes);
apiRouter.use('/notes', noteRoutes);
apiRouter.use('/focus', focusRoutes);
apiRouter.use('/public', publicRoutes);
apiRouter.use('/study', studyRoutes);
apiRouter.use('/analytics', analyticsRoutes);
apiRouter.use('/feedback', feedbackRoutes);
apiRouter.use('/classroom', classroomRoutes);
apiRouter.use('/performance', performanceRoutes);
apiRouter.use('/calendar', calendarRoutes);
apiRouter.use('/admin', adminRoutes);
apiRouter.use('/chapter-list', chapterListRoutes);
apiRouter.use('/follow', followRoutes);
apiRouter.use('/notifications', notificationRoutes);
apiRouter.use('/flashcards', flashcardRoutes);
apiRouter.use('/tests', testRoutes);
apiRouter.use('/b2b', b2bRoutes);
apiRouter.use('/coaching', coachingAdminRoutes);
apiRouter.use('/attempts', attemptRoutes);
apiRouter.use('/cheatsheet', cheatsheetRoutes);
apiRouter.use('/assessment', assessmentRoutes);

// Mount the API router
app.use('/api', apiRouter); // Legacy/Admin Panel support
app.use('/', apiRouter);    // New direct routes

// ─── ADMIN PANEL (Static SPA) ────────────────────────────────────────────────
// Served at a secret path with an extra HTTP Basic Auth gate.
// Set ADMIN_PATH, ADMIN_BASIC_USER, ADMIN_BASIC_PASS in Railway env vars.
const ADMIN_PATH   = process.env.ADMIN_PATH;
const ADMIN_USER   = process.env.ADMIN_BASIC_USER;
const ADMIN_PASS   = process.env.ADMIN_BASIC_PASS;

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const adminStaticDir = path.join(__dirname, '..', 'admin-static');

if (ADMIN_PATH && ADMIN_USER && ADMIN_PASS) {
  // Gate 1: HTTP Basic Auth
  app.use(ADMIN_PATH, basicAuth({
    users: { [ADMIN_USER]: ADMIN_PASS },
    challenge: true,
    realm: 'Restricted',
  }));

  // Serve static admin panel files
  app.use(ADMIN_PATH, express.static(adminStaticDir));

  // SPA fallback — send index.html for all sub-routes (React Router handles them)
  app.get(`${ADMIN_PATH}/*splat`, (req, res) => {
    res.sendFile(path.join(adminStaticDir, 'index.html'));
  });
} else if (process.env.NODE_ENV === 'production') {
  console.warn('[Security] Admin panel disabled: ADMIN_PATH, ADMIN_BASIC_USER, or ADMIN_BASIC_PASS env vars are missing.');
}

// --- Error Handling ---
app.use(notFound);
app.use(errorHandler);

// --- Start Server ---
if (!process.env.VERCEL) {
  const port = process.env.PORT || 5000;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);

    // Run Janitor every 30 minutes
    setInterval(closeExpiredSessions, 30 * 60 * 1000);
    
    // Start background grading engine
    startEvaluationWorker();
  });
}

export default app;
