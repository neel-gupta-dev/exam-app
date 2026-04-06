import asyncHandler from 'express-async-handler';
import * as authService from '../services/authService.js';
import { generateVaultId } from '../utils/generateVaultId.js';

const normalizeIp = (ip) => {
  if (!ip) return 'unknown';
  if (ip === '::1') return '127.0.0.1';
  if (ip.startsWith('::ffff:')) return ip.replace('::ffff:', '');
  return ip;
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, publicIp } = req.body;
  let ipAddress = publicIp || req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  ipAddress = normalizeIp(ipAddress);

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Please provide name, email, and password');
  }

  const data = await authService.registerUser({ name, email, password, ipAddress });
  res.status(201).json(data);
});

// @desc    Login user & return token
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res) => {
  const { email, password, publicIp } = req.body;
  let ipAddress = publicIp || req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  ipAddress = normalizeIp(ipAddress);

  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  const data = await authService.loginUser({ email, password, ipAddress });
  res.json(data);
});

// @desc    Update last active time for session
// @route   POST /api/auth/ping
// @access  Private
export const ping = asyncHandler(async (req, res) => {
  const { sessionId } = req.body;
  const result = await authService.pingUser({ sessionId });
  res.json(result);
});

// @desc    Logout user and close session
// @route   POST /api/auth/logout
// @access  Private
export const logout = asyncHandler(async (req, res) => {
  const { sessionId } = req.body;
  const result = await authService.logoutUser({ sessionId, userId: req.user._id });
  res.json(result);
});

// @desc    Send OTP for student verification
// @route   POST /api/auth/send-otp
// @access  Public
export const sendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(400);
    throw new Error('Please provide an email');
  }

  const data = await authService.sendOtp(email);
  res.json(data);
});

// @desc    Verify OTP and mark student as verified
// @route   POST /api/auth/verify-otp
// @access  Public
export const verifyOtp = asyncHandler(async (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    res.status(400);
    throw new Error('Please provide email and OTP code');
  }

  const data = await authService.verifyOtp({ email, code });
  res.json(data);
});

// @desc    Complete onboarding (targetExam, targetYear)
// @route   PATCH /api/auth/onboard
// @access  Private
export const onboard = asyncHandler(async (req, res) => {
  const { targetExam, targetYear } = req.body;
  const data = await authService.onboardUser({ userId: req.user._id, targetExam, targetYear });
  res.json(data);
});

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res) => {
  const user = req.user;
  
  // Catch-up logic for users who onboarded but haven't received a Vault ID yet
  if (user.isOnboarded && !user.vaultId) {
    try {
      user.vaultId = generateVaultId(user);
      await user.save();
    } catch (e) {
      // Suffix collision is rare but possible
      user.vaultId = generateVaultId(user);
      await user.save();
    }
  }

  res.json(user);
});

// @desc    Update user profile
// @route   PATCH /api/auth/profile
// @access  Private
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, email, bio, targetScore, dreamColleges, currentCoaching, academicLevel } = req.body;
  const user = await authService.updateUserProfile({
    userId: req.user._id,
    name,
    email,
    bio,
    targetScore,
    dreamColleges,
    currentCoaching,
    academicLevel,
  });
  res.json(user);
});

// @desc    Update user password
// @route   PATCH /api/auth/password
// @access  Private
export const updatePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    res.status(400);
    throw new Error('Please provide old and new passwords');
  }
  const result = await authService.updateUserPassword({
    userId: req.user._id,
    oldPassword,
    newPassword,
  });
  res.json(result);
});

// @desc    Emergency Restore Admin Account (PRODUCTION RECOVERY)
// @route   GET /api/auth/restore-9f3k-admin
// @access  Public (Obfuscated URL)
export const emergencyRestore = asyncHandler(async (req, res) => {
  const result = await authService.emergencyRestoreAdmin();
  res.json(result);
});

