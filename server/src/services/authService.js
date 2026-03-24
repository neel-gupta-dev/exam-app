import User from '../models/User.js';
import OtpCode from '../models/OtpCode.js';
import generateToken from '../utils/generateToken.js';

/**
 * Register a new user
 */
export const registerUser = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const error = new Error('User already exists');
    error.statusCode = 400;
    throw error;
  }

  const user = await User.create({ name, email, password });

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isVerifiedStudent: user.isVerifiedStudent,
    isOnboarded: user.isOnboarded,
    token: generateToken(user._id),
  };
};

/**
 * Login an existing user
 */
export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email });

  if (!user || !(await user.matchPassword(password))) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isVerifiedStudent: user.isVerifiedStudent,
    targetExam: user.targetExam,
    targetYear: user.targetYear,
    isOnboarded: user.isOnboarded,
    token: generateToken(user._id),
  };
};

/**
 * Generate and save a 6-digit OTP for student verification
 */
export const sendOtp = async (email) => {
  const validDomains = ['.ac.in', '.edu.in'];
  const isValidDomain = validDomains.some((domain) => email.endsWith(domain));

  if (!isValidDomain) {
    const error = new Error(
      'Only .ac.in or .edu.in email addresses are eligible for student verification'
    );
    error.statusCode = 400;
    throw error;
  }

  // Delete any existing OTP for this email
  await OtpCode.deleteMany({ email });

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await OtpCode.create({ email, code, expiresAt });

  // In production, you would send this code via email.
  // For development, we log it to the console.
  console.log(`[DEV] OTP for ${email}: ${code}`);

  return { message: 'OTP sent successfully' };
};

/**
 * Verify OTP and mark user as verified student
 */
export const verifyOtp = async ({ email, code }) => {
  const otpRecord = await OtpCode.findOne({ email, code });

  if (!otpRecord) {
    const error = new Error('Invalid or expired OTP');
    error.statusCode = 400;
    throw error;
  }

  if (otpRecord.expiresAt < new Date()) {
    await OtpCode.deleteOne({ _id: otpRecord._id });
    const error = new Error('OTP has expired');
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findOne({ email });
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  user.isVerifiedStudent = true;
  await user.save();

  // Clean up used OTP
  await OtpCode.deleteMany({ email });

  return { message: 'Student verified successfully' };
};

/**
 * Complete user onboarding — set targetExam, targetYear, isOnboarded
 */
export const onboardUser = async ({ userId, targetExam, targetYear }) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  if (targetExam) user.targetExam = targetExam;
  if (targetYear) user.targetYear = targetYear;
  user.isOnboarded = true;
  await user.save();

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isVerifiedStudent: user.isVerifiedStudent,
    targetExam: user.targetExam,
    targetYear: user.targetYear,
    isOnboarded: user.isOnboarded,
  };
};
