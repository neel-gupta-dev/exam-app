// ============================================================
// College Predictor — Type Definitions
// ============================================================

/** Raw cutoff entry from JoSAA/CSAB data */
export interface CutoffEntry {
  institute_code: string;
  institute_name: string;
  program_code: string;
  program_name: string;
  quota: "AI" | "OS" | "HS";
  seat_type: string;
  gender: "Gender-Neutral" | "Female-only (including Supernumerary)";
  opening_rank: number;
  closing_rank: number;
  round: number;
  year: number;
  counseling: "JOSAA" | "CSAB" | "BITSAT";
}

/** Institute metadata with college life info */
export interface InstituteMetadata {
  institute_code: string;
  institute_name: string;
  short_name: string;
  type: "IIT" | "NIT" | "IIIT" | "GFTI" | "BITS";
  city: string;
  state: string;
  city_tier: 1 | 2 | 3;
  nirf_rank: number | null;
  placement_median_lpa: number | null;
  placement_highest_lpa: number | null;
  campus_rating: number; // 1-5
  established_year: number;
  website: string;
}

/** Branch market demand ranking (legacy, used for keyword matching) */
export interface BranchRanking {
  category: string;
  keywords: string[];
  market_score: number; // 0-100
  growth_trend: "rising" | "stable" | "declining";
  description: string;
}

/** Pre-computed program statistics for Z-score probability */
export interface ProgramStats {
  k: string;  // key: "institute_code|program_code|quota|seat_type|gender"
  m: number;  // closing_rank_mean
  s: number;  // closing_rank_std
  l: number;  // closing_rank_latest
}

/** Data-driven branch demand entry */
export interface DemandEntry {
  demand_percentile: number;
  avg_demand_ratio: number;
  sample_size: number;
}

/** Full demand index (category → stats) */
export type DemandIndex = Record<string, DemandEntry>;


/** Represents the user's input from the frontend form */
export interface UserInput {
  name: string;
  jee_mains_rank: number | null;
  jee_advanced_rank: number | null;
  bitsat_score: number | null;
  category: Category;
  gender: Gender;
  home_state: string;
  is_pwd: boolean;
  round: number | null; // null = best chance (last round)
  branch_preferences: string[];
  use_market_ranking: boolean;
  college_preferences: CollegePreferences;
}

/** College life preference sliders (0-100) */
export interface CollegePreferences {
  city_life: number;
  placements: number;
  reputation: number;
  campus_life: number;
}

/** Individual prediction result */
export interface PredictionResult {
  institute: InstituteMetadata;
  cutoff: CutoffEntry;
  chance: ChanceLevel;
  chance_percentage: number;
  branch_score: number;
  college_pref_score: number;
  composite_score: number;
  rank_delta: number; // user_rank - closing_rank (negative = safer)
}

/** Chance classification */
export type ChanceLevel = "safe" | "moderate" | "low";

/** Prediction results grouped by exam type */
export interface PredictionOutput {
  mains_results: PredictionResult[];
  advanced_results: PredictionResult[];
  bitsat_results: PredictionResult[];
  total_safe: number;
  total_moderate: number;
  total_low: number;
}

/** Supported categories */
export type Category =
  | "OPEN"
  | "OBC-NCL"
  | "SC"
  | "ST"
  | "EWS"
  | "OPEN (PwD)"
  | "OBC-NCL (PwD)"
  | "SC (PwD)"
  | "ST (PwD)"
  | "EWS (PwD)";

/** Gender options */
export type Gender = "Male" | "Female";

/** Filter state for results */
export interface ResultFilters {
  institute_types: ("IIT" | "NIT" | "IIIT" | "GFTI" | "BITS")[];
  chance_levels: ChanceLevel[];
  branches: string[];
  states: string[];
  search: string;
}
