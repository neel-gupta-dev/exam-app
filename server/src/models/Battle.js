import { coreConnection } from '../config/db.js';
import mongoose from 'mongoose';

const battleSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
      index: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['upcoming', 'live', 'ended'],
      default: 'upcoming',
      index: true,
    },
    maxParticipants: {
      type: Number,
      default: 0, // 0 for unlimited
    },
    participantCount: {
      type: Number,
      default: 0,
    },
    entryFeePoints: {
      type: Number,
      default: 0,
    },
    prizePool: {
      type: String,
    },
  },
  { timestamps: true }
);

const Battle = coreConnection.model('Battle', battleSchema);

export default Battle;
