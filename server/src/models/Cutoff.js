import { coreConnection } from '../config/db.js';
import mongoose from 'mongoose';

const cutoffSchema = new mongoose.Schema({
  institute_code: { type: String, required: true },
  institute_name: { type: String, required: true },
  program_code: { type: String, required: true },
  program_name: { type: String, required: true },
  quota: { type: String, required: true },
  seat_type: { type: String, required: true },
  gender: { type: String, required: true },
  opening_rank: { type: Number, required: true },
  closing_rank: { type: Number, required: true },
  round: { type: Number, required: true },
  year: { type: Number, required: true },
  counseling: { type: String, required: true }
}, {
  timestamps: true
});

// Compound index to quickly find and prevent overlaps based on year, counseling, and round
cutoffSchema.index({ year: 1, counseling: 1, round: 1 });

export default coreConnection.model('Cutoff', cutoffSchema);
