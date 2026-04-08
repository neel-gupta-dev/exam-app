import 'dotenv/config';
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
import { closeExpiredSessions, forceAdminReset } from '../src/services/authService.js';
import adminRoutes from '../src/routes/adminRoutes.js';
import chapterListRoutes from '../src/routes/chapterListRoutes.js';
import passport from 'passport';
import configurePassport from '../src/config/passport.js';
import { MONGO_URI, PORT, ALLOWED_ORIGINS } from '../src/config/index.js';

// Connect to MongoDB
// ... [No changes to intervening lines in this diff block representation]

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

// Mount the API router
app.use('/api', apiRouter); // Legacy/Admin Panel support
app.use('/', apiRouter);    // New direct routes

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
app.get(`${ADMIN_PATH}/*splat`, (req, res) => {
  res.sendFile(path.join(adminStaticDir, 'index.html'));
});

// --- Error Handling ---
app.use(notFound);
app.use(errorHandler);

// --- Start Server ---
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);

  // Emergency admin reset (for Railway users)
  // If ADMIN_FORCE_EMAIL and ADMIN_FORCE_PASS are set in Railway, 
  // the server will reset the admin account on startup.
  if (process.env.ADMIN_FORCE_EMAIL && process.env.ADMIN_FORCE_PASS) {
    forceAdminReset(process.env.ADMIN_FORCE_EMAIL, process.env.ADMIN_FORCE_PASS);
  }

  // Run Janitor every 30 minutes
  setInterval(closeExpiredSessions, 30 * 60 * 1000);
});

export default app;
