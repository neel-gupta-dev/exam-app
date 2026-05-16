import { coreConnection } from '../config/db.js';
import mongoose from 'mongoose';

const battleQuestionSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true,
    },
    battleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Battle',
      required: true,
      index: true,
    },
    text: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
    },
    options: [
      {
        key: { type: String, required: true },
        text: { type: String },
        imageUrl: { type: String },
      }
    ],
    correctAnswer: {
      type: String, // Battles usually only SCQ
      required: true,
    },
    positivePoints: {
      type: Number,
      default: 4,
    },
    negativePoints: {
      type: Number,
      default: 1,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const BattleQuestion = coreConnection.model('BattleQuestion', battleQuestionSchema);

export default BattleQuestion;
