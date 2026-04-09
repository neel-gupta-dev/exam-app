import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Follow from '../models/Follow.js';

// @desc    Get public profile by roll number (vaultId)
// @route   GET /api/public/profile/:rollNo
// @access  Public
export const getPublicProfile = asyncHandler(async (req, res) => {
  res.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=59');
  const { rollNo } = req.params;
  const cleanRollNo = rollNo.replace(/^#/, '');
  
  // Escape regex special chars in user input to prevent ReDoS
  const escaped = cleanRollNo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const searchPattern = new RegExp(`^#?${escaped}$`, 'i');
  
  const user = await User.findOne({ vaultId: { $regex: searchPattern } })
    .select('name targetExam totalActiveSeconds currentStreak isOnboarded isVerifiedStudent createdAt vaultId analytics level');

  if (!user) {
    res.status(404);
    throw new Error('Vault not found');
  }

  const levelData = user.levelData;
  const totalStudyHours = Math.round(user.totalActiveSeconds / 3600);
  const resourceCount = user.analytics?.resourceCount || 0;

  const [followersCount, followingCount] = await Promise.all([
    Follow.countDocuments({ followingId: user._id }),
    Follow.countDocuments({ followerId: user._id })
  ]);

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
    followersCount,
    followingCount,
    badges,
    rollNo: user.vaultId,
    joinedAt: user.createdAt
  });
});
