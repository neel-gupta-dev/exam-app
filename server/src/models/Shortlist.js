import mongoose from 'mongoose';

const shortlistSchema = new mongoose.Schema({
  // We store by a device fingerprint (session ID) since predictor is public/no-auth
  sessionId: { type: String, required: true, index: true },
  institute_code: { type: String, required: true },
  program_code: { type: String, required: true },
  // Snapshot of the key display fields so we don't need to re-fetch
  institute_name: { type: String, required: true },
  short_name: { type: String, required: true },
  program_name: { type: String, required: true },
  institute_type: { type: String, required: true },
  city: { type: String },
  nirf_rank: { type: Number, default: null },
  placement_median_lpa: { type: Number, default: null },
  chance: { type: String, enum: ['safe', 'moderate', 'low'], required: true },
  chance_percentage: { type: Number, required: true },
  composite_score: { type: Number, required: true },
  closing_rank: { type: Number, required: true },
  quota: { type: String },
  seat_type: { type: String },
  counseling: { type: String },
}, {
  timestamps: true
});

// Prevent duplicate shortlisting of same program
shortlistSchema.index({ sessionId: 1, institute_code: 1, program_code: 1 }, { unique: true });

export default mongoose.models.Shortlist || mongoose.model('Shortlist', shortlistSchema);
