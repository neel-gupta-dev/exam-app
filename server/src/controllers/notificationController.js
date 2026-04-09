import asyncHandler from 'express-async-handler';
import Notification from '../models/Notification.js';

// @desc    Get all unread notifications for the logged-in user
// @route   GET /api/notifications
// @access  Private
export const getUnreadNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ 
    recipient: req.user._id, 
    isRead: false 
  })
  .populate('sender', 'name vaultId')
  .sort({ createdAt: -1 });

  res.json(notifications);
});

// @desc    Mark multiple notifications as read
// @route   POST /api/notifications/read
// @access  Private
export const markAsRead = asyncHandler(async (req, res) => {
  const { notificationIds } = req.body;

  if (!notificationIds || !Array.isArray(notificationIds)) {
    res.status(400);
    throw new Error('Notification IDs array is required');
  }

  await Notification.updateMany(
    { _id: { $in: notificationIds }, recipient: req.user._id },
    { $set: { isRead: true } }
  );

  res.json({ message: 'Notifications marked as read' });
});

// @desc    Mark all notifications as read for the logged-in user
// @route   POST /api/notifications/read-all
// @access  Private
export const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { recipient: req.user._id, isRead: false },
    { $set: { isRead: true } }
  );

  res.json({ message: 'All notifications marked as read' });
});
