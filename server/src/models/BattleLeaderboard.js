import { analyticsConnection } from '../config/db.js';
import mongoose from 'mongoose';

/**
  * BattleLeaderboard — Daily per-user score aggregation.
  */
const BattleLeaderboardSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
    index: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: String,   // "YYYY-MM-DD" in IST
    required: true,
  },
  points: {
    type: Number,
    default: 0,
  },
  gamesPlayed: {
    type: Number,
    default: 0,
  },
  correctAnswers: {
    type: Number,
    default: 0,
  },
  wrongAnswers: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

// Fast daily top-N query within a tenant
BattleLeaderboardSchema.index({ tenantId: 1, date: 1, points: -1 });

// One entry per user per day per tenant
BattleLeaderboardSchema.index({ tenantId: 1, userId: 1, date: 1 }, { unique: true });

const BattleLeaderboard = analyticsConnection.model('BattleLeaderboard', BattleLeaderboardSchema);

export default BattleLeaderboard;
