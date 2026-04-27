// ============================================================
// College Predictor — Core Prediction Algorithm
// ============================================================
//
// 5-step pipeline:
// 1. Filter by eligibility (category, gender, quota, round)
// 2. Classify admission chance (safe / moderate / low)
// 3. Score branch preference (user prefs or market demand)
// 4. Score college life preferences (city, placements, reputation, campus)
// 5. Compute composite score and rank results
// ============================================================

import {
  CutoffEntry,
  InstituteMetadata,
  UserInput,
  PredictionResult,
  PredictionOutput,
  ChanceLevel,
} from "./types";
import {
  CHANCE_THRESHOLDS,
  SCORE_WEIGHTS,
  INSTITUTE_TYPE_SCORES,
} from "./constants";
import { calculateBranchPreferenceScore } from "./branchRanker";
import { calculateCollegePreferenceScore } from "./collegeScorer";

/**
 * Main prediction function. Takes all cutoff data, institute metadata,
 * and user input to produce ranked results.
 */
export function predictColleges(
  cutoffs: CutoffEntry[],
  institutes: Map<string, InstituteMetadata>,
  input: UserInput
): PredictionOutput {
  const mainsResults: PredictionResult[] = [];
  const advancedResults: PredictionResult[] = [];
  const bitsatResults: PredictionResult[] = [];

  // Determine which seat types to filter by
  const seatTypes = getSeatTypes(input.category, input.is_pwd);
  const genderFilter = getGenderFilter(input.gender);

  for (const cutoff of cutoffs) {
    const institute = institutes.get(cutoff.institute_code);
    if (!institute) continue;

    // ─── BITSAT Branch ───
    if (institute.type === "BITS") {
      if (input.bitsat_score === null || input.bitsat_score === undefined) continue;

      const chanceResult = classifyScoreChance(input.bitsat_score, cutoff.closing_rank);
      if (!chanceResult) continue;

      const branchScore = calculateBranchPreferenceScore(
        cutoff.program_name,
        input.use_market_ranking ? [] : input.branch_preferences
      );
      const collegePrefScore = calculateCollegePreferenceScore(institute, input.college_preferences);
      const instituteTypeScore = INSTITUTE_TYPE_SCORES[institute.type] || 50;
      const compositeScore = calculateCompositeScore(chanceResult.percentage, branchScore, collegePrefScore, instituteTypeScore);

      bitsatResults.push({
        institute,
        cutoff,
        chance: chanceResult.level,
        chance_percentage: chanceResult.percentage,
        branch_score: branchScore,
        college_pref_score: collegePrefScore,
        composite_score: compositeScore,
        rank_delta: cutoff.closing_rank - input.bitsat_score, // Negative is safer
      });
      continue;
    }

    // Determine if this cutoff is for Mains or Advanced
    const isAdvanced = institute.type === "IIT";
    const userRank = isAdvanced ? input.jee_advanced_rank : input.jee_mains_rank;

    // Skip if user hasn't provided the relevant rank
    if (userRank === null || userRank === undefined) continue;

    // ─── Step 1: Filter by Eligibility ───
    if (!isEligible(cutoff, input, seatTypes, genderFilter, institute)) continue;

    // ─── Step 2: Classify Chance ───
    const chanceResult = classifyChance(userRank, cutoff.closing_rank);
    if (!chanceResult) continue; // Beyond 120% threshold

    const branchScore = calculateBranchPreferenceScore(
      cutoff.program_name,
      input.use_market_ranking ? [] : input.branch_preferences
    );

    // ─── Step 4: College Pref Score ───
    const collegePrefScore = calculateCollegePreferenceScore(
      institute,
      input.college_preferences
    );

    // ─── Step 5: Composite Score ───
    const instituteTypeScore = INSTITUTE_TYPE_SCORES[institute.type] || 50;
    const compositeScore = calculateCompositeScore(
      chanceResult.percentage,
      branchScore,
      collegePrefScore,
      instituteTypeScore
    );

    const result: PredictionResult = {
      institute,
      cutoff,
      chance: chanceResult.level,
      chance_percentage: chanceResult.percentage,
      branch_score: branchScore,
      college_pref_score: collegePrefScore,
      composite_score: compositeScore,
      rank_delta: userRank - cutoff.closing_rank,
    };

    if (isAdvanced) {
      advancedResults.push(result);
    } else {
      mainsResults.push(result);
    }
  }

  // Sort each result set by composite score (descending)
  const sortedMains = sortResults(mainsResults);
  const sortedAdvanced = sortResults(advancedResults);
  const sortedBitsat = sortResults(bitsatResults);

  // Deduplicate: keep only best round per institute+program combination
  const dedupedMains = deduplicateResults(sortedMains);
  const dedupedAdvanced = deduplicateResults(sortedAdvanced);
  const dedupedBitsat = deduplicateResults(sortedBitsat);

  return {
    mains_results: dedupedMains,
    advanced_results: dedupedAdvanced,
    bitsat_results: dedupedBitsat,
    total_safe:
      dedupedMains.filter((r) => r.chance === "safe").length +
      dedupedAdvanced.filter((r) => r.chance === "safe").length +
      dedupedBitsat.filter((r) => r.chance === "safe").length,
    total_moderate:
      dedupedMains.filter((r) => r.chance === "moderate").length +
      dedupedAdvanced.filter((r) => r.chance === "moderate").length +
      dedupedBitsat.filter((r) => r.chance === "moderate").length,
    total_low:
      dedupedMains.filter((r) => r.chance === "low").length +
      dedupedAdvanced.filter((r) => r.chance === "low").length +
      dedupedBitsat.filter((r) => r.chance === "low").length,
  };
}

// ────────────────────────────────────────────────────
// Helper Functions
// ────────────────────────────────────────────────────

/**
 * Get applicable seat types for the user's category.
 */
function getSeatTypes(category: string, isPwd: boolean): string[] {
  if (isPwd) {
    // PwD candidates are eligible for both PwD and general category seats
    const baseCategory = category.replace(" (PwD)", "");
    return [category, `${baseCategory} (PwD)`, baseCategory];
  }
  return [category];
}

/**
 * Get gender filter values.
 */
function getGenderFilter(gender: string): string[] {
  if (gender === "Female") {
    return ["Gender-Neutral", "Female-only (including Supernumerary)"];
  }
  return ["Gender-Neutral"];
}

/**
 * Check if a cutoff entry is eligible for the user.
 */
function isEligible(
  cutoff: CutoffEntry,
  input: UserInput,
  seatTypes: string[],
  genderFilter: string[],
  institute: InstituteMetadata
): boolean {
  // Check seat type (category)
  if (!seatTypes.includes(cutoff.seat_type)) return false;

  // Check gender
  if (!genderFilter.includes(cutoff.gender)) return false;

  // Check round (if specific round requested)
  if (input.round !== null && cutoff.round !== input.round) return false;

  // Check quota for NITs (HS/OS based on home state)
  const institute_type = institute.type;
  if (institute_type !== "IIT") {
    // For NITs/IIITs/GFTIs: check home state vs other state quota
    if (cutoff.quota === "HS" || cutoff.quota === "OS") {
      const isHomeState = institute.state.toLowerCase() === input.home_state.toLowerCase();
      if (cutoff.quota === "HS" && !isHomeState) return false;
      if (cutoff.quota === "OS" && isHomeState) return false;
    }
    // AI (All India) quota is always eligible
  }

  return true;
}

/**
 * Classify admission chance based on rank vs closing rank.
 */
function classifyChance(
  userRank: number,
  closingRank: number
): { level: ChanceLevel; percentage: number } | null {
  const ratio = userRank / closingRank;

  // Prevent showing colleges that are far below the student's standard (too "safe")
  // A college is hidden if its cutoff is >3x the user's rank AND the rank gap is >30k.
  // e.g. User 32k will not see 300k cutoffs, but will see up to ~96k as backups.
  if (ratio < 0.33 && (closingRank - userRank) > 30000) {
    return null;
  }

  if (ratio <= CHANCE_THRESHOLDS.safe) {
    // Safe: 80-100% chance score
    const percentage = Math.round(100 - (ratio / CHANCE_THRESHOLDS.safe) * 20);
    return { level: "safe", percentage: Math.max(80, percentage) };
  }

  if (ratio <= CHANCE_THRESHOLDS.moderate) {
    // Moderate: 50-79% chance score
    const range = CHANCE_THRESHOLDS.moderate - CHANCE_THRESHOLDS.safe;
    const pos = (ratio - CHANCE_THRESHOLDS.safe) / range;
    const percentage = Math.round(79 - pos * 29);
    return { level: "moderate", percentage: Math.max(50, percentage) };
  }

  if (ratio <= CHANCE_THRESHOLDS.low) {
    // Low: 20-49% chance score
    const range = CHANCE_THRESHOLDS.low - CHANCE_THRESHOLDS.moderate;
    const pos = (ratio - CHANCE_THRESHOLDS.moderate) / range;
    const percentage = Math.round(49 - pos * 29);
    return { level: "low", percentage: Math.max(20, percentage) };
  }

  // Beyond 120% — not shown
  return null;
}

/**
 * Classify admission chance based on user score vs cutoff score (e.g. BITSAT).
 */
function classifyScoreChance(
  userScore: number,
  closingScore: number
): { level: ChanceLevel; percentage: number } | null {
  const margin = userScore - closingScore;
  
  if (margin >= 0) {
    // Safe: 80-100%
    const percentage = Math.min(100, Math.round(80 + (margin / 20) * 20));
    return { level: "safe", percentage: Math.max(80, percentage) };
  }
  
  if (margin >= -10) {
    // Moderate: 50-79%
    const pos = (margin + 10) / 10;
    const percentage = Math.round(50 + pos * 29);
    return { level: "moderate", percentage };
  }
  
  if (margin >= -25) {
    // Low: 20-49%
    const pos = (margin + 25) / 15;
    const percentage = Math.round(20 + pos * 29);
    return { level: "low", percentage };
  }

  return null;
}

/**
 * Calculate composite score from all factors.
 */
function calculateCompositeScore(
  chancePercentage: number,
  branchScore: number,
  collegePrefScore: number,
  instituteTypeScore: number
): number {
  return Math.round(
    chancePercentage * SCORE_WEIGHTS.chance +
      branchScore * SCORE_WEIGHTS.branch_preference +
      collegePrefScore * SCORE_WEIGHTS.college_preference +
      instituteTypeScore * SCORE_WEIGHTS.institute_type
  );
}

/**
 * Sort results by: chance level priority, then composite score.
 */
function sortResults(results: PredictionResult[]): PredictionResult[] {
  return results.sort((a, b) => b.composite_score - a.composite_score);
}

/**
 * Deduplicate results: if the same institute+program appears multiple times
 * (from different rounds), keep the one with the best chance.
 */
function deduplicateResults(results: PredictionResult[]): PredictionResult[] {
  const seen = new Map<string, PredictionResult>();

  for (const result of results) {
    const key = `${result.cutoff.institute_code}-${result.cutoff.program_code}-${result.cutoff.quota}-${result.cutoff.seat_type}-${result.cutoff.gender}`;

    const existing = seen.get(key);
    if (!existing || result.composite_score > existing.composite_score) {
      seen.set(key, result);
    }
  }

  return sortResults(Array.from(seen.values()));
}
