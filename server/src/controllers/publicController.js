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

  // Generate dynamic badges (Synchronized with private profile)
  const badges = [
    { 
      id: 'early', 
      name: 'Early Adopter', 
      icon: 'award_star', 
      desc: 'Joined Beta', 
      locked: false 
    },
    { 
      id: 'builder', 
      name: 'Vault Builder', 
      icon: 'menu_book', 
      desc: `${resourceCount} Files`, 
      locked: resourceCount === 0 
    },
    { 
      id: 'master', 
      name: 'Master Mind', 
      icon: 'psychology', 
      desc: levelData.currentLevel >= 25 ? 'Scholar Guru' : 'Locked', 
      locked: levelData.currentLevel < 25 
    },
    { 
      id: 'focused', 
      name: 'Focused', 
      icon: 'local_fire_department', 
      desc: user.isOnboarded ? 'Onboarded' : 'Locked', 
      locked: !user.isOnboarded 
    }
  ];

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
