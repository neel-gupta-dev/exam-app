// ============================================================
// College Predictor — Core Prediction Algorithm (v2)
// ============================================================
//
// UPGRADED 5-step pipeline:
// 1. Filter by eligibility (category, gender, quota, round)
// 2. Z-score based admission probability (uses normalCDF)
// 3. Score branch preference (data-driven demand index or user prefs)
// 4. Score college life preferences (percentile-normalized)
// 5. Adaptive composite score and rank results
//
// Key improvements over v1:
// - Z-score probability replaces naive rank/closingRank ratio
// - Adaptive weighting respects user slider intensity
// - Pre-computed stats (mean, σ) enable statistical rigor
// ============================================================

import {
  CutoffEntry,
  InstituteMetadata,
  UserInput,
  PredictionResult,
  PredictionOutput,
  ChanceLevel,
  CollegePreferences,
  ProgramStats,
} from "./types";
import {
  INSTITUTE_TYPE_SCORES,
} from "./constants";
import { calculateBranchPreferenceScore } from "./branchRanker";
import { calculateCollegePreferenceScore } from "./collegeScorer";

// ────────────────────────────────────────────────────
// Program Stats Cache (loaded from pre-computed JSON)
// ────────────────────────────────────────────────────
let programStatsMap = new Map<string, ProgramStats>();

/** Load pre-computed program statistics */
export function loadProgramStats(stats: ProgramStats[]) {
  programStatsMap = new Map();
  for (const s of stats) {
    programStatsMap.set(s.k, s);
  }
}

// ────────────────────────────────────────────────────
// Normal CDF (Abramowitz & Stegun approximation)
// ────────────────────────────────────────────────────
function normalCDF(x: number): number {
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741;
  const a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
  const sign = x < 0 ? -1 : 1;
  const absX = Math.abs(x) / Math.SQRT2;
  const t = 1.0 / (1.0 + p * absX);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-absX * absX);
  return 0.5 * (1.0 + sign * y);
}

// ────────────────────────────────────────────────────
// Adaptive Weighting
// ────────────────────────────────────────────────────
interface ScoreWeights {
  chance: number;
  branch_preference: number;
  college_preference: number;
  institute_type: number;
}

function calculateAdaptiveWeights(prefs: CollegePreferences): ScoreWeights {
  const BASE = { chance: 0.35, branch: 0.25, college: 0.25, type: 0.15 };

  // Calculate how opinionated the user is (spread of slider values)
  const values = [prefs.city_life, prefs.placements, prefs.reputation, prefs.campus_life];
  const maxSlider = Math.max(...values);
  const minSlider = Math.min(...values);
  const spread = (maxSlider - minSlider) / 100; // 0 = all equal, 1 = max spread

  // When spread is high, boost college_pref weight at the expense of chance
  const boost = spread * 0.15; // Up to 15% shift

  return {
    chance: Math.max(0.20, BASE.chance - boost),
    branch_preference: BASE.branch,
    college_preference: Math.min(0.40, BASE.college + boost),
    institute_type: BASE.type,
  };
}

// ────────────────────────────────────────────────────
// Main Prediction Function
// ────────────────────────────────────────────────────

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

  // Calculate adaptive weights based on user's slider preferences
  const weights = calculateAdaptiveWeights(input.college_preferences);

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
      const compositeScore = calculateCompositeScore(chanceResult.percentage, branchScore, collegePrefScore, instituteTypeScore, weights);

      bitsatResults.push({
        institute,
        cutoff,
        chance: chanceResult.level,
        chance_percentage: chanceResult.percentage,
        branch_score: branchScore,
        college_pref_score: collegePrefScore,
        composite_score: compositeScore,
        rank_delta: cutoff.closing_rank - input.bitsat_score,
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

    // ─── Step 2: Z-Score Admission Probability ───
    const chanceResult = classifyChanceZScore(userRank, cutoff);
    if (!chanceResult) continue;

    // ─── Step 3: Branch Preference Score ───
    const branchScore = calculateBranchPreferenceScore(
      cutoff.program_name,
      input.use_market_ranking ? [] : input.branch_preferences
    );

    // ─── Step 4: College Pref Score ───
    const collegePrefScore = calculateCollegePreferenceScore(
      institute,
      input.college_preferences
    );

    // ─── Step 5: Adaptive Composite Score ───
    const instituteTypeScore = INSTITUTE_TYPE_SCORES[institute.type] || 50;
    const compositeScore = calculateCompositeScore(
      chanceResult.percentage,
      branchScore,
      collegePrefScore,
      instituteTypeScore,
      weights
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
 * Z-Score based admission chance classification.
 * Uses pre-computed program statistics (mean, σ) when available.
 * Falls back to simple ratio-based classification otherwise.
 */
function classifyChanceZScore(
  userRank: number,
  cutoff: CutoffEntry
): { level: ChanceLevel; percentage: number } | null {
  // Build the stats lookup key
  const statsKey = `${cutoff.institute_code}|${cutoff.program_code}|${cutoff.quota}|${cutoff.seat_type}|${cutoff.gender}`;
  const stats = programStatsMap.get(statsKey);

  if (stats && stats.s > 0) {
    // ─── Z-Score Path ───
    // Use the latest closing rank as the reference point
    const refCutoff = stats.l;
    const effectiveStd = Math.max(stats.s, refCutoff * 0.03);

    // Z-score: positive means user rank is worse (higher number) than cutoff
    const z = (userRank - refCutoff) / effectiveStd;

    // P(admitted) = Φ(-z) because lower rank = better chance
    const probability = normalCDF(-z) * 100;

    // Prevent showing colleges far below student's level
    if (probability > 99.5 && (refCutoff - userRank) > 30000) {
      return null;
    }

    // Classify
    if (probability >= 75) {
      return { level: "safe", percentage: Math.min(99, Math.round(probability)) };
    }
    if (probability >= 40) {
      return { level: "moderate", percentage: Math.round(probability) };
    }
    if (probability >= 12) {
      return { level: "low", percentage: Math.round(probability) };
    }

    return null; // Below 12% — don't show
  }

  // ─── Fallback: Ratio-based (for entries without stats) ───
  return classifyChanceFallback(userRank, cutoff.closing_rank);
}

/**
 * Fallback chance classification using simple rank ratio.
 * Used when pre-computed stats aren't available for a program tuple.
 */
function classifyChanceFallback(
  userRank: number,
  closingRank: number
): { level: ChanceLevel; percentage: number } | null {
  const ratio = userRank / closingRank;

  // Prevent showing colleges far below student's standard
  if (ratio < 0.33 && (closingRank - userRank) > 30000) {
    return null;
  }

  if (ratio <= 0.8) {
    const percentage = Math.round(100 - (ratio / 0.8) * 20);
    return { level: "safe", percentage: Math.max(80, percentage) };
  }

  if (ratio <= 1.0) {
    const pos = (ratio - 0.8) / 0.2;
    const percentage = Math.round(79 - pos * 29);
    return { level: "moderate", percentage: Math.max(50, percentage) };
  }

  if (ratio <= 1.2) {
    const pos = (ratio - 1.0) / 0.2;
    const percentage = Math.round(49 - pos * 29);
    return { level: "low", percentage: Math.max(20, percentage) };
  }

  return null;
}

/**
 * Classify admission chance for score-based exams (BITSAT).
 */
function classifyScoreChance(
  userScore: number,
  closingScore: number
): { level: ChanceLevel; percentage: number } | null {
  const margin = userScore - closingScore;

  if (margin >= 0) {
    const percentage = Math.min(99, Math.round(80 + (margin / 20) * 20));
    return { level: "safe", percentage: Math.max(80, percentage) };
  }

  if (margin >= -10) {
    const pos = (margin + 10) / 10;
    const percentage = Math.round(50 + pos * 29);
    return { level: "moderate", percentage };
  }

  if (margin >= -25) {
    const pos = (margin + 25) / 15;
    const percentage = Math.round(20 + pos * 29);
    return { level: "low", percentage };
  }

  return null;
}

/**
 * Calculate composite score from all factors using adaptive weights.
 */
function calculateCompositeScore(
  chancePercentage: number,
  branchScore: number,
  collegePrefScore: number,
  instituteTypeScore: number,
  weights: ScoreWeights
): number {
  return Math.round(
    chancePercentage * weights.chance +
    branchScore * weights.branch_preference +
    collegePrefScore * weights.college_preference +
    instituteTypeScore * weights.institute_type
  );
}

/**
 * Sort results by composite score (descending).
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
