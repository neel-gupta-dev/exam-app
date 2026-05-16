import { coreConnection } from '../config/db.js';
import mongoose from 'mongoose';

const followSchema = new mongoose.Schema(
  {
    followerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    followingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// Prevent duplicate follows
followSchema.index({ followerId: 1, followingId: 1 }, { unique: true });
// Optimize looking up who a user is following or followers
followSchema.index({ followingId: 1 });
followSchema.index({ followerId: 1 });

const Follow = coreConnection.model('Follow', followSchema);
export default Follow;
