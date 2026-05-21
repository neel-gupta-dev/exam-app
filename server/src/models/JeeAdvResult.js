import { coreConnection } from '../config/db.js';
import mongoose from 'mongoose';

const jeeAdvResultSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    candidateName: {
      type: String,
      default: ''
    },
    candidateId: {
      type: String,
      default: ''
    },
    paper1Url: {
      type: String,
      default: ''
    },
    paper2Url: {
      type: String,
      default: ''
    },
    totalScore: {
      type: Number,
      default: 0
    },
    paper1Score: {
      type: Number,
      default: 0
    },
    paper2Score: {
      type: Number,
      default: 0
    },
    subjectWise: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {}
    },
    paperSubjectWise: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

const JeeAdvResult = coreConnection.model('JeeAdvResult', jeeAdvResultSchema);
export default JeeAdvResult;
