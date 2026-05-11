import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    loginAt: {
      type: Date,
      required: true,
    },
    logoutAt: {
      type: Date,
      default: null,
    },
    lastActiveAt: {
      type: Date,
      default: Date.now,
    },
    /**
     * Tracks whether the session's active duration has been credited
     * to user.totalActiveSeconds. Prevents duration loss if logoutUser
     * crashes after saving the session but before updating the user.
     */
    durationCredited: {
      type: Boolean,
      default: false,
    },
    ipAddress: {
      type: String,
    },
    location: {
      city: String,
      region: String,
      country: String,
    },
  },
  { timestamps: true }
);

const Session = mongoose.model('Session', sessionSchema);
export default Session;
