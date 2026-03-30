import User from '../models/User.js';
import Session from '../models/Session.js';
import Resource from '../models/Resource.js';
import OtpCode from '../models/OtpCode.js';
import { generateVaultId } from '../utils/generateVaultId.js';
import generateToken from '../utils/generateToken.js';
import geoip from 'geoip-lite';

/**
 * Helper to get location from IP (skips localhost)
 */
const getLocationInfo = (ip) => {
  if (!ip || ip === '::1' || ip === '127.0.0.1' || ip === 'unknown') {
    return null;
  }
  try {
    const geo = geoip.lookup(ip);
    if (!geo) return { city: 'Unknown', region: 'Unknown', country: 'Unknown' };
    return {
      city: geo.city || 'Unknown',
      region: geo.region || 'Unknown',
      country: geo.country || 'Unknown'
    };
  } catch (error) {
    console.error(`[GeoIP] Lookup failed for ${ip}:`, error.message);
    return null;
  }
};

/**
 * Register a new user
 */
export const registerUser = async ({ name, email, password, ipAddress }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const error = new Error('User already exists');
    error.statusCode = 400;
    throw error;
  }

  const user = await User.create({ 
    name, 
    email, 
    password,
    lastLoginDate: new Date().toISOString().split('T')[0],
    currentStreak: 1,
    level: 1
  });

  const location = getLocationInfo(ipAddress);
  const session = await Session.create({
    userId: user._id,
    loginAt: new Date(),
    lastActiveAt: new Date(),
    ipAddress: ipAddress || 'unknown',
    location: location || undefined
  });

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isVerifiedStudent: user.isVerifiedStudent,
    targetExam: user.targetExam,
    targetYear: user.targetYear,
    isOnboarded: user.isOnboarded,
    vaultId: user.vaultId,
    profile: user.profile,
    googleClassroomLinked: user.googleClassroomLinked,
    googleAccessToken: user.googleAccessToken,
    token: generateToken(user._id),
    sessionId: session._id,
  };
};

/**
 * Login an existing user
 */
export const loginUser = async ({ email, password, ipAddress }) => {
  console.log(`[loginUser] Attempting login for ${email} with IP: ${ipAddress}`);
  const user = await User.findOne({ email });

  if (!user || !(await user.matchPassword(password))) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  // Session & Streak Logic
  const todayDateStr = new Date().toISOString().split('T')[0];
  if (user.lastLoginDate) {
    const today = new Date(todayDateStr);
    const lastLogin = new Date(user.lastLoginDate);
    const diffTime = today.getTime() - lastLogin.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      user.currentStreak += 1;
    } else if (diffDays > 1) {
      user.currentStreak = 1;
    }
  } else {
    user.currentStreak = 1;
  }
  user.lastLoginDate = todayDateStr;

  // Migration check: ensure resourceCount is synced for legacy users
  if (!user.analytics.resourceCount || user.analytics.resourceCount === 0) {
    const actualCount = await Resource.countDocuments({ userId: user._id });
    if (actualCount > 0) {
      user.analytics.resourceCount = actualCount;
      await user.save();
    }
  }

  const location = getLocationInfo(ipAddress);
  const session = await Session.create({
    userId: user._id,
    loginAt: new Date(),
    lastActiveAt: new Date(),
    ipAddress: ipAddress || 'unknown',
    location: location || undefined
  });

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isVerifiedStudent: user.isVerifiedStudent,
    targetExam: user.targetExam,
    targetYear: user.targetYear,
    isOnboarded: user.isOnboarded,
    currentStreak: user.currentStreak,
    totalActiveSeconds: user.totalActiveSeconds,
    levelData: user.levelData,
    vaultId: user.vaultId,
    profile: user.profile,
    googleClassroomLinked: user.googleClassroomLinked,
    googleAccessToken: user.googleAccessToken,
    token: generateToken(user._id),
    sessionId: session._id,
  };
};

export const pingUser = async ({ sessionId }) => {
  if (!sessionId) return { success: false };
  await Session.findByIdAndUpdate(sessionId, { lastActiveAt: new Date() });
  return { success: true };
};

export const logoutUser = async ({ sessionId, userId }) => {
  if (!sessionId) return { success: false };
  const session = await Session.findById(sessionId);
  if (!session || session.logoutAt) return { success: false };

  session.logoutAt = new Date();
  session.lastActiveAt = session.logoutAt;
  const duration = Math.floor((session.logoutAt.getTime() - session.loginAt.getTime()) / 1000);
  
  await session.save();

  const user = await User.findById(userId);
  if (user) {
    user.totalActiveSeconds += duration;
    await user.save();
  }
  return { success: true };
};

/**
 * Janitor function: close sessions expired > 15 mins ago
 */
export const closeExpiredSessions = async () => {
  try {
    const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000);
    
    const expiredSessions = await Session.find({
      logoutAt: null,
      lastActiveAt: { $lt: fifteenMinsAgo },
    });

    for (const session of expiredSessions) {
      session.logoutAt = session.lastActiveAt;
      const duration = Math.floor((session.logoutAt.getTime() - session.loginAt.getTime()) / 1000);
      session.activeDuration = duration > 0 ? duration : 0;
      await session.save();

      const user = await User.findById(session.userId);
      if (user) {
        user.totalActiveSeconds += session.activeDuration;
        await user.save();
      }
    }
    console.log(`[Janitor] Closed ${expiredSessions.length} expired sessions.`);
  } catch (error) {
    console.error("[Janitor] Error closing expired sessions:", error);
  }
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
  
  // Generate Vault ID if it doesn't exist yet
  if (!user.vaultId) {
    try {
      user.vaultId = generateVaultId(user);
    } catch (e) {
      // Suffix collision is rare but possible
      user.vaultId = generateVaultId(user);
    }
  }

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
    vaultId: user.vaultId,
    profile: user.profile,
    googleClassroomLinked: user.googleClassroomLinked,
    googleAccessToken: user.googleAccessToken,
  };
};

/**
 * Update user profile
 */
export const updateUserProfile = async ({ userId, name, email, bio, targetScore, dreamColleges, currentCoaching, academicLevel }) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  if (name) user.name = name;
  if (email && email !== user.email) {
    const existing = await User.findOne({ email });
    if (existing) {
      const error = new Error('Email already in use');
      error.statusCode = 400;
      throw error;
    }
    user.email = email;
  }
  if (bio !== undefined) user.bio = bio;
  if (targetScore !== undefined) user.targetScore = targetScore;

  // Handle Profile Object Updates
  if (!user.profile) user.profile = {};
  if (dreamColleges !== undefined) user.profile.dreamColleges = dreamColleges;
  if (currentCoaching !== undefined) user.profile.currentCoaching = currentCoaching;
  if (academicLevel !== undefined) user.profile.academicLevel = academicLevel;

  await user.save();
  return user;
};

/**
 * Update user password
 */
export const updateUserPassword = async ({ userId, oldPassword, newPassword }) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  if (!(await user.matchPassword(oldPassword))) {
    const error = new Error('Incorrect old password');
    error.statusCode = 401;
    throw error;
  }

  user.password = newPassword;
  await user.save();
  return { message: 'Password updated successfully' };
};

