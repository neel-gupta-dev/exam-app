import { XP_PER_HOUR, XP_PER_STREAK, XP_PER_RESOURCE } from '../constants';

/**
 * Calculates total XP based on hourly effort, streak continuity, and resources saved.
 */
export const calculateXP = (hours: number, streak: number, resourceCount: number): number => {
  return (hours * XP_PER_HOUR) + (streak * XP_PER_STREAK) + (resourceCount * XP_PER_RESOURCE);
};

/**
 * Calculates current level based on total XP using the Effort-Weighted power function.
 * Formula: floor((XP / 50) ^ 0.7)
 */
export const calculateLevel = (totalXP: number): number => {
  if (totalXP === 0) return 1;
  return Math.max(1, Math.floor(Math.pow(totalXP / 50, 0.7)));
};

/**
 * Calculates percentage progress toward the next level.
 */
export const calculateProgressToNext = (totalXP: number): number => {
  if (totalXP === 0) return 0;
  
  const currentLevel = calculateLevel(totalXP);
  const nextLevelXP = Math.pow(currentLevel + 1, 1 / 0.7) * 50;
  const currentLevelXP = Math.pow(currentLevel, 1 / 0.7) * 50;
  
  const progress = ((totalXP - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;
  return Math.max(0, Math.min(100, progress));
};

/**
 * Calculates XP remaining to reach the next level.
 */
export const calculateXPRemaining = (totalXP: number): number => {
  const currentLevel = calculateLevel(totalXP);
  const nextLevelXP = Math.pow(currentLevel + 1, 1 / 0.7) * 50;
  return Math.max(0, Math.round(nextLevelXP - totalXP));
};
