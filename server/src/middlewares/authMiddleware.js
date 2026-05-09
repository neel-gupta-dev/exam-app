import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import { JWT_SECRET } from '../config/index.js';

const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer')) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password -googleAccessToken -googleRefreshToken');

    if (!req.user) {
      res.status(401);
      throw new Error('Not authorized, user not found');
    }

    // Fire-and-forget: stamp lastActiveAt without blocking the request chain.
    // Using updateOne bypasses Mongoose hooks for maximum performance.
    User.updateOne(
      { _id: req.user._id },
      { $set: { lastActiveAt: new Date() } }
    ).catch((err) => {
      console.error('[Auth] Failed to update lastActiveAt:', err.message);
    });

    return next();
  } catch (error) {
    res.status(401);
    throw new Error('Not authorized, token failed');
  }
});

export { protect };
