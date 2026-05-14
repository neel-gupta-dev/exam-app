import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resource',
      required: false,
      index: true,
    },
    sourceUrl: {
      type: String,
      default: null,
    },
    isWebClip: {
      type: Boolean,
      default: false,
    },
    content: {
      type: String,
      required: [true, 'Note content is required'],
    },
    videoTimestamp: {
      type: Number,
      default: null,
    },
  },
  { timestamps: true }
);

const Note = mongoose.model('Note', noteSchema);
export default Note;
