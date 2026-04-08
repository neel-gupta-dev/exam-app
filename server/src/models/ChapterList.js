import mongoose from 'mongoose';

const columnSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true }
}, { _id: false });

const chapterSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, default: '' },
  dueDate: { type: Date, default: null },
  progress: {
    type: Map,
    of: Boolean,
    default: {}
  }
}, { _id: false });

const chapterListSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    subject: {
      type: String,
      required: true,
      enum: ['Physics', 'Chemistry', 'Mathematics'],
      index: true
    },
    columns: {
      type: [columnSchema],
      default: []
    },
    chapters: {
      type: [chapterSchema],
      default: []
    }
  },
  { timestamps: true }
);

// Ensure a user only has one tracker per subject
chapterListSchema.index({ user: 1, subject: 1 }, { unique: true });

const ChapterList = mongoose.model('ChapterList', chapterListSchema);

export default ChapterList;
