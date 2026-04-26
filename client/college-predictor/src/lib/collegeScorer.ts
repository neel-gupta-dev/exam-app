// ============================================================
// College Scorer — College Life Preference Scoring Engine
// ============================================================

import { CollegePreferences, InstituteMetadata } from "./types";

/** Normalization context for relative scoring */
interface NormalizationContext {
  maxPlacement: number;
  minPlacement: number;
  maxNirf: number;
  minNirf: number;
}

let normCtx: NormalizationContext = {
  maxPlacement: 21.5,
  minPlacement: 3.5,
  maxNirf: 100,
  minNirf: 1,
};

/**
 * Pre-compute normalization bounds from all institute metadata.
 * Call this once after loading metadata.
 */
export function initNormalization(institutes: InstituteMetadata[]) {
  const placements = institutes
    .map((i) => i.placement_median_lpa)
    .filter((v): v is number => v !== null);
  const nirfRanks = institutes
    .map((i) => i.nirf_rank)
    .filter((v): v is number => v !== null);

  normCtx = {
    maxPlacement: Math.max(...placements),
    minPlacement: Math.min(...placements),
    maxNirf: Math.max(...nirfRanks),
    minNirf: Math.min(...nirfRanks),
  };
}

/**
 * Score city life based on city tier.
 * Tier 1 (Metro) = 100, Tier 2 = 60, Tier 3 = 30
 */
function scoreCityLife(institute: InstituteMetadata): number {
  switch (institute.city_tier) {
    case 1:
      return 100;
    case 2:
      return 60;
    case 3:
      return 30;
    default:
      return 30;
  }
}

/**
 * Score placements using min-max normalization.
 */
function scorePlacements(institute: InstituteMetadata): number {
  if (institute.placement_median_lpa === null) return 30; // unknown = low default
  const range = normCtx.maxPlacement - normCtx.minPlacement;
  if (range === 0) return 50;
  return Math.round(
    ((institute.placement_median_lpa - normCtx.minPlacement) / range) * 100
  );
}

/**
 * Score reputation using NIRF rank (inverted — rank 1 is best).
 */
function scoreReputation(institute: InstituteMetadata): number {
  if (institute.nirf_rank === null) return 25; // unranked = low default
  const range = normCtx.maxNirf - normCtx.minNirf;
  if (range === 0) return 50;
  // Invert: lower rank = higher score
  return Math.round(
    ((normCtx.maxNirf - institute.nirf_rank) / range) * 100
  );
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
