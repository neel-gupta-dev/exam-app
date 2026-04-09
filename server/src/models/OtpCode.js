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
    index: { expires: 0 }, // TTL index — document auto-deletes when expiresAt is reached
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

const OtpCode = mongoose.model('OtpCode', otpCodeSchema);
export default OtpCode;
