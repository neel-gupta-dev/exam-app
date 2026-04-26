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

  // Determine which seat types to filter by
  const seatTypes = getSeatTypes(input.category, input.is_pwd);
  const genderFilter = getGenderFilter(input.gender);

  for (const cutoff of cutoffs) {
    const institute = institutes.get(cutoff.institute_code);
    if (!institute) continue;

    // Determine if this cutoff is for Mains or Advanced
    const isAdvanced = institute.type === "IIT";
    const userRank = isAdvanced ? input.jee_advanced_rank : input.jee_mains_rank;

    // Skip if user hasn't provided the relevant rank
    if (userRank === null || userRank === undefined) continue;

    // ─── Step 1: Filter by Eligibility ───
    if (!isEligible(cutoff, input, seatTypes, genderFilter)) continue;

    // ─── Step 2: Classify Chance ───
    const chanceResult = classifyChance(userRank, cutoff.closing_rank);
    if (!chanceResult) continue; // Beyond 120% threshold

    // ─── Step 3: Branch Score ───
    const branchScore = calculateBranchPreferenceScore(
      cutoff.program_name,
      input.branch_preferences
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

  // Deduplicate: keep only best round per institute+program combination
  const dedupedMains = deduplicateResults(sortedMains);
  const dedupedAdvanced = deduplicateResults(sortedAdvanced);

  return {
    mains_results: dedupedMains,
    advanced_results: dedupedAdvanced,
    total_safe:
      dedupedMains.filter((r) => r.chance === "safe").length +
      dedupedAdvanced.filter((r) => r.chance === "safe").length,
    total_moderate:
      dedupedMains.filter((r) => r.chance === "moderate").length +
      dedupedAdvanced.filter((r) => r.chance === "moderate").length,
    total_low:
      dedupedMains.filter((r) => r.chance === "low").length +
      dedupedAdvanced.filter((r) => r.chance === "low").length,
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
  genderFilter: string[]
): boolean {
  // Check seat type (category)
  if (!seatTypes.includes(cutoff.seat_type)) return false;

  // Check gender
  if (!genderFilter.includes(cutoff.gender)) return false;

  // Check round (if specific round requested)
  if (input.round !== null && cutoff.round !== input.round) return false;

  // Check quota for NITs (HS/OS based on home state)
  const institute_type = cutoff.institute_code.startsWith("IIT") ? "IIT" : "other";
  if (institute_type !== "IIT") {
    // For NITs/IIITs/GFTIs: check home state vs other state quota
    if (cutoff.quota === "HS" || cutoff.quota === "OS") {
      const isHomeState = isInstituteInHomeState(
        cutoff.institute_name,
        input.home_state
      );
      if (cutoff.quota === "HS" && !isHomeState) return false;
      if (cutoff.quota === "OS" && isHomeState) return false;
    }
    // AI (All India) quota is always eligible
  }

  return true;
}

/**
 * Check if an institute is in the user's home state.
 * Uses the institute metadata for state matching.
 */
function isInstituteInHomeState(
  instituteName: string,
  homeState: string
): boolean {
  // This is a simplified check — in production, use institute metadata
  const lowerName = instituteName.toLowerCase();
  const lowerState = homeState.toLowerCase();

  // Direct state name match
  if (lowerName.includes(lowerState)) return true;

  // Common abbreviations and city-to-state mappings
  const stateKeywords: Record<string, string[]> = {
    "tamil nadu": ["trichy", "tiruchirappalli", "madras", "chennai", "kancheepuram"],
    karnataka: ["surathkal", "bangalore", "dharwad"],
    "west bengal": ["kharagpur", "durgapur", "kalyani"],
    telangana: ["warangal", "hyderabad"],
    kerala: ["calicut", "kozhikode", "palakkad", "kottayam"],
    odisha: ["rourkela", "bhubaneswar"],
    maharashtra: ["mumbai", "bombay", "nagpur", "pune"],
    "uttar pradesh": ["kanpur", "allahabad", "varanasi", "lucknow"],
    rajasthan: ["jaipur", "jodhpur", "kota", "ajmer"],
    "madhya pradesh": ["bhopal", "indore", "gwalior", "jabalpur"],
    bihar: ["patna", "bhagalpur"],
    gujarat: ["gandhinagar", "surat", "ahmedabad", "vadodara"],
    punjab: ["jalandhar", "rupnagar", "ropar", "longowal"],
    haryana: ["kurukshetra", "sonepat", "kundli"],
    himachal: ["hamirpur", "mandi", "una"],
    jharkhand: ["dhanbad", "jamshedpur", "ranchi"],
    assam: ["guwahati", "silchar", "tezpur"],
    delhi: ["delhi"],
    goa: ["goa", "ponda"],
    chhattisgarh: ["raipur", "bhilai", "bilaspur", "naya raipur"],
    "jammu and kashmir": ["jammu", "srinagar", "katra"],
    "andhra pradesh": ["tirupati", "sri city", "kurnool", "tadepalligudem"],
    uttarakhand: ["roorkee", "srinagar garhwal", "haridwar"],
    chandigarh: ["chandigarh"],
    puducherry: ["puducherry", "karaikal"],
    tripura: ["agartala"],
    meghalaya: ["shillong"],
    manipur: ["imphal"],
    mizoram: ["aizawl"],
    nagaland: ["dimapur"],
    sikkim: ["ravangla"],
    "arunachal pradesh": ["nirjuli", "itanagar"],
  };

  const keywords = stateKeywords[lowerState];
  if (keywords) {
    return keywords.some((kw) => lowerName.includes(kw));
  }

  return false;
}

/**
 * Classify admission chance based on rank vs closing rank.
 */
function classifyChance(
  userRank: number,
  closingRank: number
): { level: ChanceLevel; percentage: number } | null {
  const ratio = userRank / closingRank;

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
  const chancePriority: Record<ChanceLevel, number> = {
    safe: 0,
    moderate: 1,
    low: 2,
  };

  return results.sort((a, b) => {
    // First sort by composite score (highest first)
    return b.composite_score - a.composite_score;
  });
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

  return Array.from(seen.values()).sort(
    (a, b) => b.composite_score - a.composite_score
  );
}
