import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['pdf', 'video', 'link', 'other'],
      required: [true, 'Resource type is required'],
    },
    url: {
      type: String,
      required: [true, 'Resource URL is required'],
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    folderName: {
      type: String,
      default: 'Uncategorized',
      trim: true,
    },
  },
  { timestamps: true }
);

const Resource = mongoose.model('Resource', resourceSchema);
export default Resource;
