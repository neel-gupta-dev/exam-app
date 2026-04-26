// ============================================================
// Branch Ranker — Market Demand Scoring Engine
// ============================================================

import { BranchRanking } from "./types";

let branchRankings: BranchRanking[] = [];

/** Load branch rankings from JSON data */
export function loadBranchRankings(data: BranchRanking[]) {
  branchRankings = data;
}

/**
 * Match a program name to a branch category and return its market score.
 * Uses keyword matching with case-insensitive search.
 */
export function getBranchScore(programName: string): number {
  const lowerName = programName.toLowerCase();

  for (const branch of branchRankings) {
    for (const keyword of branch.keywords) {
      if (lowerName.includes(keyword.toLowerCase())) {
        return branch.market_score;
      }
    }
  }

  // Fallback: "Other Engineering" score
  return 35;
}

/**
 * Get the branch category name for a program.
 */
export function getBranchCategory(programName: string): string {
  const lowerName = programName.toLowerCase();

  for (const branch of branchRankings) {
    for (const keyword of branch.keywords) {
      if (lowerName.includes(keyword.toLowerCase())) {
        return branch.category;
      }
    }
  }

  return "Other Engineering";
}

/**
 * Get growth trend for a program.
 */
export function getBranchTrend(programName: string): "rising" | "stable" | "declining" {
  const lowerName = programName.toLowerCase();

  for (const branch of branchRankings) {
    for (const keyword of branch.keywords) {
      if (lowerName.includes(keyword.toLowerCase())) {
        return branch.growth_trend;
      }
    }
  }

  return "stable";
}

/**
 * Calculate branch preference score based on user's preferences.
 * If user has set preferences, score is based on position in their list.
 * If no preferences, use market demand scores.
 */
export function calculateBranchPreferenceScore(
  programName: string,
  userPreferences: string[]
): number {
  // If user hasn't set preferences, use market demand ranking
  if (!userPreferences || userPreferences.length === 0) {
    return getBranchScore(programName);
  }

  const lowerName = programName.toLowerCase();
  const totalPrefs = userPreferences.length;

  // Check if program matches any user preference
  for (let i = 0; i < userPreferences.length; i++) {
    const pref = userPreferences[i].toLowerCase();
    if (lowerName.includes(pref) || pref.includes(lowerName.split("(")[0].trim())) {
      // Score from 100 (top preference) to  minimum based on position
      return Math.round(100 - (i / totalPrefs) * 70);
    }
  }

  // Check via keyword matching as fallback
  const branchCategory = getBranchCategory(programName);
  for (let i = 0; i < userPreferences.length; i++) {
    if (
      branchCategory.toLowerCase().includes(userPreferences[i].toLowerCase()) ||
      userPreferences[i].toLowerCase().includes(branchCategory.toLowerCase())
    ) {
      return Math.round(100 - (i / totalPrefs) * 70);
    }
  }

  // Program not in user preferences at all — low score but not zero
  return 15;
}
