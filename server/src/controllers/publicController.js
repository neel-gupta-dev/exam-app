import asyncHandler from 'express-async-handler';
import User from '../models/User.js';

// @desc    Get public profile by roll number (vaultId)
// @route   GET /api/public/profile/:rollNo
// @access  Public
export const getPublicProfile = asyncHandler(async (req, res) => {
  const { rollNo } = req.params;
  const cleanRollNo = rollNo.replace(/^#/, '');
  
  // Use regex to be resilient to # prefix and case-sensitivity
  const searchPattern = new RegExp(`^#?${cleanRollNo}$`, 'i');
  
  const user = await User.findOne({ vaultId: { $regex: searchPattern } })
    .select('name targetExam totalActiveSeconds currentStreak isOnboarded isVerifiedStudent createdAt vaultId analytics level');

  if (!user) {
    res.status(404);
    throw new Error('Vault not found');
  }

  const levelData = user.levelData;
  const totalStudyHours = Math.round(user.totalActiveSeconds / 3600);
  const resourceCount = user.analytics?.resourceCount || 0;

  // Generate dynamic badges
  const badges = [];
  if (user.createdAt < new Date('2024-12-31')) badges.push({ id: 'early', name: 'Early Adopter', icon: 'rocket_launch', desc: 'Founding Student' });
  if (totalStudyHours > 100) badges.push({ id: 'focused', name: 'Deep Focus', icon: 'center_focus_strong', desc: '100+ Study Hours' });
  if (user.currentStreak > 7) badges.push({ id: 'consistent', name: 'Unstoppable', icon: 'bolt', desc: '7+ Day Streak' });
  if (resourceCount > 50) badges.push({ id: 'architect', name: 'Vault Architect', icon: 'architecture', desc: '50+ Resources Saved' });
  
  if (badges.length === 0) badges.push({ id: 'scholar', name: 'Knowledge Seeker', icon: 'school', desc: 'Active Learner' });

  res.json({
    name: user.name,
    level: levelData.currentLevel,
    xp: levelData.totalXP,
    targetExam: user.targetExam?.[0] || 'Aspirant',
    isVerified: user.isVerifiedStudent,
    totalStudyHours,
    streak: user.currentStreak || 0,
    resourceCount,
    badges,
    rollNo: user.vaultId,
    joinedAt: user.createdAt
  });
});
