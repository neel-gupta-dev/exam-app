import asyncHandler from 'express-async-handler';
import Follow from '../models/Follow.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';

// @desc    Toggle follow status for a user
// @route   POST /api/follow/toggle
// @access  Private
export const toggleFollow = asyncHandler(async (req, res) => {
  const { targetVaultId } = req.body;
  const followerId = req.user._id;

  if (!targetVaultId) {
    res.status(400);
    throw new Error('Target Vault ID is required');
  }

  // Find the user to follow
  const targetUser = await User.findOne({ vaultId: targetVaultId });
  if (!targetUser) {
    res.status(404);
    throw new Error('User to follow not found');
  }

  const followingId = targetUser._id;

  if (followerId.toString() === followingId.toString()) {
    res.status(400);
    throw new Error('You cannot follow yourself');
  }

  // Check if follow exists
  const existingFollow = await Follow.findOne({ followerId, followingId });

  if (existingFollow) {
    // Unfollow
    await existingFollow.deleteOne();
    // Remove the associated notification if it hasn't been read yet
    await Notification.deleteOne({ 
      recipient: followingId, 
      sender: followerId, 
      type: 'follow',
      isRead: false 
    });
    res.json({ message: 'Unfollowed user successfully', isFollowing: false });
  } else {
    // Follow
    await Follow.create({ followerId, followingId });
    // Create a notification for the recipient
    await Notification.create({
      recipient: followingId,
      sender: followerId,
      type: 'follow'
    });
    res.status(201).json({ message: 'Followed user successfully', isFollowing: true });
  }
});

// @desc    Get follow status with another user
// @route   GET /api/follow/status/:vaultId
// @access  Private
export const getFollowStatus = asyncHandler(async (req, res) => {
  const { vaultId } = req.params;
  const followerId = req.user._id;

  const targetUser = await User.findOne({ vaultId });
  if (!targetUser) {
    res.status(404);
    throw new Error('User not found');
  }

  const followingId = targetUser._id;

  const existingFollow = await Follow.findOne({ followerId, followingId });

  res.json({ isFollowing: !!existingFollow });
});
