import asyncHandler from 'express-async-handler';
import * as authService from '../services/authService.js';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Please provide name, email, and password');
  }

  const data = await authService.registerUser({ name, email, password });
  res.status(201).json(data);
});

// @desc    Login user & return token
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  const data = await authService.loginUser({ email, password });
  res.json(data);
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
