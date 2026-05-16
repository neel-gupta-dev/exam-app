import { analyticsConnection } from '../config/db.js';
import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  email: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, default: "One-click feedback" },
  createdAt: { type: Date, default: Date.now }
});

// TTL Index: Auto-expire after 365 days
feedbackSchema.index({ createdAt: 1 }, { expireAfterSeconds: 31536000 });

const Feedback = analyticsConnection.model('Feedback', feedbackSchema);

export default Feedback;