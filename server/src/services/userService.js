import User from '../models/User.js';
import { generateVaultId } from '../utils/generateVaultId.js';
import { logActivity } from '../utils/telemetry.js';

/**
 * Update user academic profile
 */
export const updateUserProfile = async ({ userId, dreamColleges, currentCoaching, academicLevel, targetYear }) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  if (dreamColleges) user.profile.dreamColleges = dreamColleges;
  if (currentCoaching) user.profile.currentCoaching = currentCoaching;
  if (academicLevel) user.profile.academicLevel = academicLevel;
  if (targetYear) user.targetYear = targetYear;

  // Generate Vault ID if it doesn't exist AND student has set their dream colleges (onboarding phase 2)
  if (!user.vaultId && user.profile.dreamColleges?.length > 0) {
    try {
      user.vaultId = generateVaultId(user);
      await user.save();
    } catch (error) {
      if (error.code === 11000) {
        // Retry once with a new random suffix if collision occurs
        user.vaultId = generateVaultId(user);
        await user.save();
      } else {
        throw error;
      }
    }
  } else {
    user.isOnboarded = true; // Mark as onboarded once they fill this
    await user.save();
  }

  return user;
};

/**
 * Update study confidence using weighted average
 * New Average = ((Old Average * Count) + New Rating) / (Count + 1)
 */
export const updateStudyConfidence = async ({ userId, rating }) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');
  const numericRating = Number(rating);

  if (!Number.isFinite(numericRating) || numericRating < 1 || numericRating > 5) {
    const error = new Error('Rating must be between 1 and 5');
    error.statusCode = 400;
    throw error;
  }

  const oldAvg = user.analytics.studyConfidence || 0;
  const count = user.analytics.studyConfidenceCount || 0;
  
  const newAvg = ((oldAvg * count) + numericRating) / (count + 1);
  
  user.analytics.studyConfidence = newAvg;
  user.analytics.studyConfidenceCount = count + 1;
  
  await user.save();
  logActivity({
    userId,
    actionType: 'CONFIDENCE_RATED',
    metadata: { score: numericRating, previousScore: oldAvg, newAverage: newAvg },
  });
  return user;
};

/**
 * Log search term to history (last 20)
 */
export const logSearch = async ({ userId, term }) => {
  if (!term) return null;
  const cleanTerm = String(term).trim().slice(0, 200);
  if (!cleanTerm) return null;
  
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  // Add to front of array
  user.analytics.searchHistory.unshift({ term: cleanTerm, timestamp: new Date() });
  
  // Keep last 20
  if (user.analytics.searchHistory.length > 20) {
    user.analytics.searchHistory = user.analytics.searchHistory.slice(0, 20);
  }

  await user.save();
  logActivity({
    userId,
    actionType: 'SEARCH_PERFORMED',
    metadata: { term: cleanTerm },
  });
  return user;
};
