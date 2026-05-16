// dotenv is handled by src/config/index.js (dev only)
// On Vercel, env vars are injected via the dashboard — no .env file needed
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import basicAuth from 'express-basic-auth';
import cookieParser from 'cookie-parser';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import path from 'path';
import { coreConnection, analyticsConnection, waitForConnections, closeConnections } from '../src/config/db.js';
import { notFound, errorHandler } from '../src/middlewares/errorMiddleware.js';
import authRoutes from '../src/routes/authRoutes.js';
import feedbackRoutes from '../src/routes/feedback.js';
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
import battleRoutes from '../src/routes/battleRoutes.js';
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
import blogRoutes from '../src/routes/blogRoutes.js';
import studyMaterialRoutes from '../src/routes/studyMaterialRoutes.js';
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

// Trust proxy for accurate IP detection (needed for Hostinger/Nginx & Vercel)
app.set('trust proxy', true);

// --- CORS Configuration (MUST be FIRST — before connectDB) ---
// On Vercel, every cold start re-runs connectDB which takes 3-5s.
// If CORS middleware comes AFTER connectDB, browser preflight OPTIONS
// requests get blocked/timeout WITHOUT proper CORS headers, causing
// the frontend to see "CORS error" instead of the real issue.
const HARDCODED_ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:3003',
  'http://localhost:3004',
  'http://localhost:3005',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'http://127.0.0.1:3002',
  'http://127.0.0.1:5173',
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

      // Allow exact vayl.in domain, subdomains, and potential ports securely
      const isVaylDomain = origin === 'https://vayl.in' || 
                          origin === 'http://vayl.in' ||
                          /^https?:\/\/[a-zA-Z0-9-]+\.vayl\.in(:\d+)?$/.test(origin);
      
      if (isVaylDomain) {
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

// Body parser (before connectDB — parsing the body doesn't need DB)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Security headers — configured for cross-origin API server
app.use(helmet({
  // Disable CORP — default 'same-origin' blocks cross-origin API responses
  crossOriginResourcePolicy: false,
  // Disable COEP — not needed for a JSON API and can block cross-origin loads
  crossOriginEmbedderPolicy: false,
}));
app.use((req, res, next) => {
  res.setHeader(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), browsing-topics=()'
  );
  next();
});
app.use(compression());

// Safety middleware to ensure DBs are connected (primarily for Vercel cold starts)
app.use(async (req, res, next) => {
  try {
    if (coreConnection.readyState !== 1 || analyticsConnection.readyState !== 1) {
      await waitForConnections();
    }
    next();
  } catch (error) {
    const errorMsg = process.env.NODE_ENV === 'development' ? error.message : 'Database Connection Failed';
    res.status(503).json({ message: 'Database Connection Failed', error: errorMsg });
  }
});

// Cookie parser (needed for OAuth origin tracking)
app.use(cookieParser());

// Passport initialization
app.use(passport.initialize());

// --- Global Rate Limiter ---
const globalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 500, // Increased to 500 requests per IP per minute
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

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
apiRouter.use('/battle', battleRoutes);
apiRouter.use('/blogs', blogRoutes);
apiRouter.use('/study-materials', studyMaterialRoutes);

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

  // Battle Question Manager (dedicated route to ensure it's not caught by SPA splat)
  app.get(`${ADMIN_PATH}/battle-questions`, (req, res) => {
    res.sendFile(path.join(adminStaticDir, 'battle-questions.html'));
  });

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
  
  const startApp = async () => {
    try {
      // 1. Connect to Databases FIRST
      console.log('[Server] Initializing databases...');
      await waitForConnections();

      // 2. Start Listening
      const server = app.listen(port, () => {
        console.log(`Server running on port ${port}`);

        // 3. Start Background Workers ONLY after DB is ready
        setInterval(closeExpiredSessions, 30 * 60 * 1000);
        startEvaluationWorker();
      });

      // Graceful Shutdown
      const shutdown = async (signal) => {
        console.log(`[Server] ${signal} received. Closing connections...`);
        
        // Force-kill timeout to prevent hanging
        const forceKill = setTimeout(() => {
          console.error('[Server] Graceful shutdown timed out (10s), forcing exit.');
          process.exit(1);
        }, 10000);

        try {
          await closeConnections();
          server.close(() => {
            console.log('[Server] Process terminated cleanly');
            clearTimeout(forceKill);
            process.exit(0);
          });
        } catch (err) {
          console.error('[Server] Error during shutdown:', err);
          clearTimeout(forceKill);
          process.exit(1);
        }
      };

      process.on('SIGINT', () => shutdown('SIGINT'));
      process.on('SIGTERM', () => shutdown('SIGTERM'));
      
    } catch (error) {
      console.error('[Server] Critical startup error:', error);
      process.exit(1);
    }
  };

  startApp();
}

export default app;
