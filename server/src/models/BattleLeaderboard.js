import mongoose from 'mongoose';

/**
 * BattleLeaderboard — Daily per-user score aggregation.
 *
 * Each document represents ONE user's performance for ONE day (IST).
 * Scoring: correct answer → +4, wrong answer → −1, skipped → 0.
 *
 * The `date` field stores the IST calendar date as a string ("YYYY-MM-DD")
 * so the leaderboard naturally resets at midnight IST without any cron job.
 */
const BattleLeaderboardSchema = new mongoose.Schema({
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

// Fast daily top-N query
BattleLeaderboardSchema.index({ date: 1, points: -1 });

// One entry per user per day
BattleLeaderboardSchema.index({ userId: 1, date: 1 }, { unique: true });

const BattleLeaderboard =
  mongoose.models.BattleLeaderboard ||
  mongoose.model('BattleLeaderboard', BattleLeaderboardSchema);

export default BattleLeaderboard;
