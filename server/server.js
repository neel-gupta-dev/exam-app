import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './src/config/db.js';
import { notFound, errorHandler } from './src/middlewares/errorMiddleware.js';
import authRoutes from './src/routes/authRoutes.js';
import resourceRoutes from './src/routes/resourceRoutes.js';
import noteRoutes from './src/routes/noteRoutes.js';

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// --- CORS Configuration ---
const allowedOrigins = ['http://localhost:3000'];

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
      if (allowedOrigins.includes(origin)) {
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
app.use('/api/notes', noteRoutes);

// --- Error Handling ---
app.use(notFound);
app.use(errorHandler);

// --- Start Server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
