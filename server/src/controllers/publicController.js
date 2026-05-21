import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Follow from '../models/Follow.js';
import PredictorLead from '../models/PredictorLead.js';
import { load } from 'cheerio';
import { safeFetch } from '../utils/securityUtils.js';

const MAX_TEXT = 500;
const MAX_ARRAY_ITEMS = 50;

const cleanString = (value, max = MAX_TEXT) => (
  typeof value === 'string' ? value.trim().slice(0, max) : undefined
);

const cleanNumber = (value, { min = 0, max = Number.MAX_SAFE_INTEGER } = {}) => {
  if (value === undefined || value === null || value === '') return undefined;
  const num = Number(value);
  return Number.isFinite(num) && num >= min && num <= max ? num : undefined;
};

const cleanBoolean = (value, defaultValue = false) => {
  if (value === undefined || value === null || value === '') return defaultValue;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (['true', '1', 'yes'].includes(normalized)) return true;
    if (['false', '0', 'no'].includes(normalized)) return false;
  }
  if (typeof value === 'number') return value === 1;
  return defaultValue;
};

const cleanStringArray = (value, maxItems = MAX_ARRAY_ITEMS) => {
  if (!Array.isArray(value)) return undefined;
  return value
    .map((item) => cleanString(item, 120))
    .filter(Boolean)
    .slice(0, maxItems);
};

const cleanDeviceInfo = (value) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;
  return {
    user_agent: cleanString(value.user_agent, 300),
    screen_width: cleanNumber(value.screen_width, { min: 0, max: 100000 }),
    language: cleanString(value.language, 50),
    referrer: cleanString(value.referrer, 500),
  };
};

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

    const safeData = {
      name: cleanString(data.name, 120),
      jee_mains_rank: cleanNumber(data.jee_mains_rank, { min: 1, max: 2000000 }),
      jee_advanced_rank: cleanNumber(data.jee_advanced_rank, { min: 1, max: 500000 }),
      bitsat_score: cleanNumber(data.bitsat_score, { min: 0, max: 450 }),
      category: cleanString(data.category, 40),
      gender: cleanString(data.gender, 40),
      home_state: cleanString(data.home_state, 80),
      is_pwd: cleanBoolean(data.is_pwd, false),
      round: cleanNumber(data.round, { min: 1, max: 20 }),
      branch_preferences: cleanStringArray(data.branch_preferences),
      use_market_ranking: cleanBoolean(data.use_market_ranking, true),
      device_info: cleanDeviceInfo(data.device_info),
    };

    if (!safeData.name) {
      return res.status(400).json({ success: false, error: 'Name is required' });
    }

    if (data.college_preferences && typeof data.college_preferences === 'object' && !Array.isArray(data.college_preferences)) {
      safeData.college_preferences = {
        city_life: cleanNumber(data.college_preferences.city_life, { min: 0, max: 10 }),
        placements: cleanNumber(data.college_preferences.placements, { min: 0, max: 10 }),
        reputation: cleanNumber(data.college_preferences.reputation, { min: 0, max: 10 }),
        campus_life: cleanNumber(data.college_preferences.campus_life, { min: 0, max: 10 }),
      };
    }

    if (data.results_summary && typeof data.results_summary === 'object' && !Array.isArray(data.results_summary)) {
      safeData.results_summary = {
        total_safe: cleanNumber(data.results_summary.total_safe, { min: 0, max: 100000 }),
        total_moderate: cleanNumber(data.results_summary.total_moderate, { min: 0, max: 100000 }),
        total_low: cleanNumber(data.results_summary.total_low, { min: 0, max: 100000 }),
        total_results: cleanNumber(data.results_summary.total_results, { min: 0, max: 100000 }),
      };
    }

    for (const key of Object.keys(safeData)) {
      if (safeData[key] === undefined) delete safeData[key];
    }
    
    // Create new lead document
    const lead = new PredictorLead({
      ...safeData,
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

/**
 * SECURITY-HARDENED Metadata Proxy
 * 
 * Mitigations:
 * 1. DNS resolution validation — checks resolved IP, not just hostname string (blocks DNS rebinding)
 * 2. IPv6 loopback and link-local blocking ([::1], fe80::, etc.)
 * 3. redirect: 'manual' — prevents redirect-chain SSRF (attacker URL → 169.254.169.254)
 * 4. 5-second timeout via AbortController — prevents slow-loris style attacks
 * 5. 2MB response body limit — prevents OOM via large payloads
 */
export const getUrlMetadata = asyncHandler(async (req, res) => {
  const { url } = req.query;
  if (!url) {
    res.status(400);
    throw new Error('URL is required');
  }

    try {
      const response = await safeFetch(url, { maxBodySize: 2 * 1024 * 1024 });

      // Handle redirects safely — don't follow, just return basic metadata
      if ([301, 302, 303, 307, 308].includes(response.status)) {
        return res.json({
          title: 'Redirected Page',
          description: 'This URL redirects to another location.',
          image: '',
          url: response.url,
          siteName: response.parsedUrl.hostname,
        });
      }

      if (!response.ok) {
        throw new Error(`Target site returned ${response.status}`);
      }

      const html = await response.text();
      const $ = load(html);

      const metadata = {
        title: $('meta[property="og:title"]').attr('content') || $('title').text() || $('meta[name="twitter:title"]').attr('content') || 'No Title',
        description: $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content') || $('meta[name="twitter:description"]').attr('content') || 'No description available.',
        image: $('meta[property="og:image"]').attr('content') || $('meta[name="twitter:image"]').attr('content') || '',
        url: response.url,
        siteName: $('meta[property="og:site_name"]').attr('content') || response.parsedUrl.hostname
      };

      res.json(metadata);
    } catch (error) {
      if (error.message.includes('timed out')) {
        return res.status(504).json({ message: 'Request to target URL timed out (5s)' });
      }
      if (error.message.includes('blocked') || error.message.includes('prohibited')) {
        return res.status(403).json({ message: error.message });
      }
      console.error(`[Metadata Proxy] Error for ${url}:`, error.message);
      res.status(500).json({ 
        message: 'Failed to analyze URL', 
        error: error.message 
      });
    }
});
