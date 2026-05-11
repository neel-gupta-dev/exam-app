import mongoose from 'mongoose';

const BattleSchema = new mongoose.Schema({
  roomCode: {
    type: String,
    unique: true,
    uppercase: true,
    index: true,
  },
  player1: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  player2: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  status: {
    type: String,
    enum: ['waiting', 'active', 'finished', 'abandoned'],
    default: 'waiting',
  },
  questions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BattleQuestion',
  }],
  player1Answers: [{
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'BattleQuestion' },
    selectedOptionIndex: Number,
    selectedOptionIndices: [Number],
    submittedInteger: Number,
    isCorrect: Boolean,
    lbPoints: Number, // Leaderboard points for this specific answer
    timeTakenSeconds: Number,
    points: Number,
  }],
  player2Answers: [{
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'BattleQuestion' },
    selectedOptionIndex: Number,
    selectedOptionIndices: [Number],
    submittedInteger: Number,
    isCorrect: Boolean,
    lbPoints: Number, // Leaderboard points for this specific answer
    timeTakenSeconds: Number,
    points: Number,
  }],
  player1Score: {
    type: Number,
    default: 0,
  },
  player2Score: {
    type: Number,
    default: 0,
  },
  player1TabSwitches: {
    type: Number,
    default: 0,
  },
  player2TabSwitches: {
    type: Number,
    default: 0,
  },
  player1TabAwaySeconds: {
    type: Number,
    default: 0,
  },
  player2TabAwaySeconds: {
    type: Number,
    default: 0,
  },
  isCustomRoom: {
    type: Boolean,
    default: false,
  },
  isSolo: {
    type: Boolean,
    default: false,
  },
  /**
   * Bot opponent fields.
   * When isBot is true, player2 is null and the bot's answers are
   * pre-computed at creation time. The GET polling route lazily reveals
   * them into player2Answers based on elapsed time vs botTimestamps.
   */
  isBot: {
    type: Boolean,
    default: false,
  },
  botName: {
    type: String,
  },
  botAnswers: [{
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'BattleQuestion' },
    selectedOptionIndex: Number,
    selectedOptionIndices: [Number],
    submittedInteger: Number,
    isCorrect: Boolean,
    lbPoints: Number,
    timeTakenSeconds: Number,
    points: Number,
  }],
  botTimestamps: [Number], // Cumulative ms offsets from startedAt
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  startedAt: {
    type: Date,
  },
  finishedAt: {
    type: Date,
  },
  player1LastAnswerAt: {
    type: Date,
  },
  player2LastAnswerAt: {
    type: Date,
  }
}, { timestamps: true });

// Matchmaking & cleanup queries filter by status + creation time
BattleSchema.index({ status: 1, createdAt: -1 });
// Player lookup for "already in a battle" checks
BattleSchema.index({ player1: 1, status: 1 });
BattleSchema.index({ player2: 1, status: 1 });

const Battle = mongoose.models.Battle || mongoose.model('Battle', BattleSchema);

export default Battle;
