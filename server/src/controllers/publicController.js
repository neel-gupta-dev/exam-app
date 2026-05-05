import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Follow from '../models/Follow.js';
import PredictorLead from '../models/PredictorLead.js';
import { load } from 'cheerio';

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

// @desc    Store a predictor lead
// @route   POST /api/public/predictor-lead
// @access  Public
export const storePredictorLead = asyncHandler(async (req, res) => {
  try {
    const data = req.body;
    
    // Create new lead document
    const lead = new PredictorLead({
      ...data,
      ip_address: req.ip || req.headers['x-forwarded-for'] || 'unknown',
    });
    
    await lead.save();
    
    res.status(201).json({ success: true, id: lead._id });
  } catch (error) {
    console.error('Error storing predictor lead:', error);
    // Don't leak DB errors to client, just return a generic success false
    // so it doesn't break the frontend flow
    res.status(500).json({ success: false, error: 'Failed to store lead' });
  }
});

export const getUrlMetadata = asyncHandler(async (req, res) => {
  const { url } = req.query;
  if (!url) {
    res.status(400);
    throw new Error('URL is required');
  }

  try {
    // Ensure URL has protocol
    const targetUrl = url.startsWith('http') ? url : `https://${url}`;
    
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8'
      },
      redirect: 'follow'
    });

    if (!response.ok) {
      throw new Error(`Target site returned ${response.status}`);
    }

    const html = await response.text();
    const $ = load(html);

    const metadata = {
      title: $('meta[property="og:title"]').attr('content') || $('title').text() || $('meta[name="twitter:title"]').attr('content') || 'No Title',
      description: $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content') || $('meta[name="twitter:description"]').attr('content') || 'No description available.',
      image: $('meta[property="og:image"]').attr('content') || $('meta[name="twitter:image"]').attr('content') || '',
      url: targetUrl,
      siteName: $('meta[property="og:site_name"]').attr('content') || (new URL(targetUrl)).hostname
    };

    res.json(metadata);
  } catch (error) {
    console.error(`[Metadata Proxy] Error for ${url}:`, error.message);
    res.status(500).json({ 
      message: 'Failed to analyze URL', 
      error: error.message 
    });
  }
});
