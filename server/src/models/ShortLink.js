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
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastClickedAt: {
    type: Date
  }
});

// Index for fast lookups
shortLinkSchema.index({ slug: 1 });

const ShortLink = mongoose.model('ShortLink', shortLinkSchema);
export default ShortLink;
