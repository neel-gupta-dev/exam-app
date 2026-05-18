import mongoose from 'mongoose';
import { coreConnection } from '../config/db.js';

const mediaAssetSchema = new mongoose.Schema(
  {
    hash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    url: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      required: true,
    },
    format: {
      type: String,
    },
    bytes: {
      type: Number,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
  },
  { timestamps: true }
);

const MediaAsset = coreConnection.model('MediaAsset', mediaAssetSchema);

export default MediaAsset;
