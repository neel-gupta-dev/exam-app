import { coreConnection } from '../config/db.js';
import mongoose from 'mongoose';

const otpCodeSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  code: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  type: {
    type: String,
    enum: ['student_verify', 'signup'],
    default: 'student_verify',
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
});

// TTL index — MongoDB uses the date value in expiresAt directly when expireAfterSeconds is 0
otpCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const OtpCode = coreConnection.model('OtpCode', otpCodeSchema);
export default OtpCode;
