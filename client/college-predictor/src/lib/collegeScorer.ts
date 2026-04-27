// ============================================================
// College Scorer — College Life Preference Scoring Engine
// ============================================================
// 
// Upgraded to use PERCENTILE RANK normalization instead of min-max.
// This prevents outliers (e.g., IIIT-Hyd at 32 LPA) from compressing
// all other colleges into a narrow range.
// ============================================================

import { CollegePreferences, InstituteMetadata } from "./types";

/** Sorted arrays for percentile lookups */
interface NormalizationContext {
  sortedPlacements: number[];
  sortedNirfRanks: number[];
}

let normCtx: NormalizationContext = {
  sortedPlacements: [],
  sortedNirfRanks: [],
};

/**
 * Pre-compute sorted arrays from all institute metadata.
 * Call this once after loading metadata.
 */
export function initNormalization(institutes: InstituteMetadata[]) {
  normCtx.sortedPlacements = institutes
    .map((i) => i.placement_median_lpa)
    .filter((v): v is number => v !== null && v > 0)
    .sort((a, b) => a - b);

  normCtx.sortedNirfRanks = institutes
    .map((i) => i.nirf_rank)
    .filter((v): v is number => v !== null && v > 0)
    .sort((a, b) => a - b);
}

/**
 * Binary search to find the percentile rank of a value in a sorted array.
 * Returns 0-100 where 100 = highest value in the dataset.
 */
function percentileRank(value: number, sortedArray: number[]): number {
  if (sortedArray.length === 0) return 50;

  let lo = 0, hi = sortedArray.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (sortedArray[mid] < value) lo = mid + 1;
    else hi = mid;
  }
  return Math.round((lo / sortedArray.length) * 100);
}

/**
 * Score city life based on city tier.
 * Tier 1 (Metro) = 100, Tier 2 = 60, Tier 3 = 30
 */
function scoreCityLife(institute: InstituteMetadata): number {
  switch (institute.city_tier) {
    case 1: return 100;
    case 2: return 60;
    case 3: return 30;
    default: return 30;
  }
}

/**
 * Score placements using percentile rank normalization.
 * A college at the 70th percentile of placements scores 70.
 */
function scorePlacements(institute: InstituteMetadata): number {
  if (institute.placement_median_lpa === null) return 20; // unknown = low default
  return percentileRank(institute.placement_median_lpa, normCtx.sortedPlacements);
}

/**
 * Score reputation using NIRF rank (inverted — rank 1 is best).
 * A college at NIRF rank 1 (top percentile) scores ~100.
 * A college at NIRF rank 200 (bottom percentile) scores ~0.
 */
function scoreReputation(institute: InstituteMetadata): number {
  if (institute.nirf_rank === null) return 15; // unranked = very low default
  // Invert: lower NIRF rank = better, so we want 100 - percentile
  return 100 - percentileRank(institute.nirf_rank, normCtx.sortedNirfRanks);
}

/**
 * Score campus life from the curated rating (1-5 → 20-100).
 */
function scoreCampusLife(institute: InstituteMetadata): number {
  return Math.round((institute.campus_rating / 5) * 100);
}

/**
 * Calculate composite college preference score.
 * Weighted average of each factor based on user slider values.
 */
export function calculateCollegePreferenceScore(
  institute: InstituteMetadata,
  preferences: CollegePreferences
): number {
  const cityScore = scoreCityLife(institute);
  const placementScore = scorePlacements(institute);
  const reputationScore = scoreReputation(institute);
  const campusScore = scoreCampusLife(institute);

  // User sliders determine how much each factor matters (0-100)
  const totalWeight =
    preferences.city_life +
    preferences.placements +
    preferences.reputation +
    preferences.campus_life;

  if (totalWeight === 0) {
    // All sliders at 0 = equal weight
    return Math.round((cityScore + placementScore + reputationScore + campusScore) / 4);
  }

  const weightedScore =
    (preferences.city_life / totalWeight) * cityScore +
    (preferences.placements / totalWeight) * placementScore +
    (preferences.reputation / totalWeight) * reputationScore +
    (preferences.campus_life / totalWeight) * campusScore;

  return Math.round(weightedScore);
}

/**
 * Get individual factor scores for display in college cards.
 */
export function getFactorScores(institute: InstituteMetadata) {
  return {
    city_life: scoreCityLife(institute),
    placements: scorePlacements(institute),
    reputation: scoreReputation(institute),
    campus_life: scoreCampusLife(institute),
  };
}
