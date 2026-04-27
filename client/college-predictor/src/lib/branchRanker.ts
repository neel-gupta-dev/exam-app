// ============================================================
// Branch Ranker — Market Demand Scoring Engine
// ============================================================
//
// Upgraded: Uses a DATA-DRIVEN demand percentile index computed
// from actual cutoff competitiveness, instead of hardcoded scores.
// Falls back to keyword-based scoring from branch-rankings.json.
// ============================================================

import { BranchRanking, DemandIndex } from "./types";

let branchRankings: BranchRanking[] = [];
let demandIndex: DemandIndex = {};

/** Load branch rankings from JSON data (keyword matcher) */
export function loadBranchRankings(data: BranchRanking[]) {
  branchRankings = data;
}

/** Load the pre-computed demand index */
export function loadDemandIndex(data: DemandIndex) {
  demandIndex = data;
}

/**
 * Match a program name to a branch category using keyword matching.
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
 * Get the data-driven demand score for a program.
 * Uses the pre-computed demand percentile index.
 * Falls back to the legacy hardcoded market_score if the index is empty.
 */
export function getBranchScore(programName: string): number {
  const category = getBranchCategory(programName);

  // Use data-driven demand index if available
  const demand = demandIndex[category];
  if (demand) {
    return demand.demand_percentile;
  }

  // Fallback to legacy hardcoded score
  const lowerName = programName.toLowerCase();
  for (const branch of branchRankings) {
    for (const keyword of branch.keywords) {
      if (lowerName.includes(keyword.toLowerCase())) {
        return branch.market_score;
      }
    }
  }

  return 35;
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
 * If no preferences, use data-driven market demand scores.
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
      // Score from 100 (top preference) to minimum based on position
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
