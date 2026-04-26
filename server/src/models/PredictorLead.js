import mongoose from 'mongoose';

const PredictorLeadSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  jee_mains_rank: {
    type: Number,
    default: null,
  },
  jee_advanced_rank: {
    type: Number,
    default: null,
  },
  bitsat_score: {
    type: Number,
    default: null,
  },
  category: {
    type: String,
    default: 'OPEN',
  },
  gender: {
    type: String,
    default: 'Male',
  },
  home_state: {
    type: String,
    default: '',
  },
  is_pwd: {
    type: Boolean,
    default: false,
  },
  round: {
    type: Number,
    default: null,
  },
  branch_preferences: {
    type: [String],
    default: [],
  },
  use_market_ranking: {
    type: Boolean,
    default: true,
  },
  college_preferences: {
    city_life: Number,
    placements: Number,
    reputation: Number,
    campus_life: Number,
  },
  results_summary: {
    total_safe: Number,
    total_moderate: Number,
    total_low: Number,
    total_results: Number,
  },
  device_info: {
    user_agent: String,
    screen_width: Number,
    language: String,
    referrer: String,
  },
  ip_address: String,
}, {
  timestamps: { createdAt: 'submitted_at', updatedAt: false }
});

export default mongoose.models.PredictorLead || mongoose.model('PredictorLead', PredictorLeadSchema);
