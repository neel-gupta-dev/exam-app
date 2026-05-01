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
    isCorrect: Boolean,
    timeTakenSeconds: Number,
    points: Number,
  }],
  player2Answers: [{
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'BattleQuestion' },
    selectedOptionIndex: Number,
    isCorrect: Boolean,
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
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  startedAt: {
    type: Date,
  },
  finishedAt: {
    type: Date,
  }
}, { timestamps: true });

const Battle = mongoose.models.Battle || mongoose.model('Battle', BattleSchema);

export default Battle;
