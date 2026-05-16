import { coreConnection } from '../config/db.js';
import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      unique: true,
      index: true,
      trim: true,
      lowercase: true,
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
    },
    coverImageUrl: {
      type: String,
      default: '',
      trim: true,
    },
    author: {
      type: String,
      required: [true, 'Author name is required'],
      trim: true,
    },
    category: {
      type: String,
      default: 'General',
      trim: true,
    },
    readTime: {
      type: String,
      default: '5 min',
      trim: true,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

/**
 * Pre-validate hook: auto-generate slug from title if not provided.
 * Converts to lowercase, replaces spaces/special chars with hyphens,
 * and strips trailing hyphens.
 */
blogSchema.pre('validate', function () {
  if (!this.slug && this.title) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
});

const Blog = coreConnection.model('Blog', blogSchema);

export default Blog;
