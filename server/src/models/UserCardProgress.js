import { coreConnection } from '../config/db.js';
import mongoose from 'mongoose';

const userCardProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    cardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Flashcard',
      required: true,
    },
    deckId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Deck',
      required: true,
    },
    interval: {
      type: Number,
      default: 0,
    },
    repetition: {
      type: Number,
      default: 0,
    },
    easeFactor: {
      type: Number,
      default: 2.5,
    },
    nextReviewDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Compound unique index for fast lookups and to prevent duplicate progress docs
userCardProgressSchema.index({ userId: 1, cardId: 1 }, { unique: true });

const UserCardProgress = coreConnection.model('UserCardProgress', userCardProgressSchema);
export default UserCardProgress;
