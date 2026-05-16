import { analyticsConnection } from '../config/db.js';
import mongoose from 'mongoose';

const shortLinkSchema = new mongoose.Schema({
  originalUrl: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  clicks: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  lastClickedAt: {
    type: Date
  }
}, { timestamps: true });

// Index for fast lookups
shortLinkSchema.index({ slug: 1 });

// TTL Index: Auto-expire after 365 days
shortLinkSchema.index({ createdAt: 1 }, { expireAfterSeconds: 31536000 });

const ShortLink = analyticsConnection.model('ShortLink', shortLinkSchema);
export default ShortLink;
