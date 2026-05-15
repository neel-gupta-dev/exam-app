import mongoose from 'mongoose';

const studyMaterialSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      trim: true,
      index: true,
      lowercase: true,
    },
    cloudinaryUrl: {
      type: String,
      required: [true, 'Cloudinary URL is required'],
    },
    cloudinaryPublicId: {
      type: String,
      required: [true, 'Cloudinary Public ID is required'],
    },
    subject: {
      type: String,
      default: 'General',
      trim: true,
    },
    fileSize: {
      type: Number, // Storage in bytes
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: true,
    }
  },
  { timestamps: true }
);

/**
 * Pre-validate hook: auto-generate slug from title if not provided.
 * Converts to lowercase, replaces spaces/special chars with hyphens,
 * and strips trailing hyphens.
 */
studyMaterialSchema.pre('validate', function () {
  if (!this.slug && this.title) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
});

// Ensure compound index for faster searching
studyMaterialSchema.index({ title: 'text', subject: 1 });

const StudyMaterial = mongoose.model('StudyMaterial', studyMaterialSchema);
export default StudyMaterial;
