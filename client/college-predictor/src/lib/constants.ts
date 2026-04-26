// ============================================================
// College Predictor — Constants
// ============================================================

import { Category } from "./types";

/** All Indian states and UTs */
export const STATES = [
  "Andaman and Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
] as const;

/** JEE categories */
export const CATEGORIES: { value: Category; label: string }[] = [
  { value: "OPEN", label: "General / OPEN" },
  { value: "OBC-NCL", label: "OBC-NCL" },
  { value: "SC", label: "SC" },
  { value: "ST", label: "ST" },
  { value: "EWS", label: "EWS" },
];

/** PwD variants of categories */
export const PWD_CATEGORIES: { value: Category; label: string }[] = [
  { value: "OPEN (PwD)", label: "General / OPEN (PwD)" },
  { value: "OBC-NCL (PwD)", label: "OBC-NCL (PwD)" },
  { value: "SC (PwD)", label: "SC (PwD)" },
  { value: "ST (PwD)", label: "ST (PwD)" },
  { value: "EWS (PwD)", label: "EWS (PwD)" },
];

/** Seat type mappings for filtering */
export const SEAT_TYPE_MAP: Record<string, string[]> = {
  OPEN: ["OPEN", "OPEN (PwD)"],
  "OBC-NCL": ["OBC-NCL", "OBC-NCL (PwD)"],
  SC: ["SC", "SC (PwD)"],
  ST: ["ST", "ST (PwD)"],
  EWS: ["EWS", "EWS (PwD)"],
  "OPEN (PwD)": ["OPEN (PwD)"],
  "OBC-NCL (PwD)": ["OBC-NCL (PwD)"],
  "SC (PwD)": ["SC (PwD)"],
  "ST (PwD)": ["ST (PwD)"],
  "EWS (PwD)": ["EWS (PwD)"],
};

/** Chance thresholds (as ratio of user_rank / closing_rank) */
export const CHANCE_THRESHOLDS = {
  safe: 0.8,      // rank ≤ 80% of closing rank
  moderate: 1.0,  // rank between 80%-100%
  low: 1.2,       // rank between 100%-120%
} as const;

/** Composite score weights */
export const SCORE_WEIGHTS = {
  chance: 0.40,
  branch_preference: 0.25,
  college_preference: 0.25,
  institute_type: 0.10,
} as const;

/** Institute type base scores */
export const INSTITUTE_TYPE_SCORES: Record<string, number> = {
  IIT: 100,
  NIT: 75,
  IIIT: 70,
  GFTI: 50,
};

/** Default college preferences (all equal) */
export const DEFAULT_COLLEGE_PREFERENCES = {
  city_life: 50,
  placements: 50,
  reputation: 50,
  campus_life: 50,
};

/** Common branch names for the preference UI */
export const BRANCH_LIST = [
  "Computer Science and Engineering",
  "Artificial Intelligence and Machine Learning",
  "Data Science and Engineering",
  "Electronics and Communication Engineering",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Chemical Engineering",
  "Mathematics and Computing",
  "Biotechnology",
  "Aerospace Engineering",
  "Engineering Physics",
  "Metallurgical and Materials Engineering",
  "Mining Engineering",
  "Production and Industrial Engineering",
  "Textile Engineering",
  "Architecture",
  "Ocean Engineering and Naval Architecture",
  "Agricultural and Food Engineering",
  "Biomedical Engineering",
] as const;

/** JoSAA round numbers */
export const JOSAA_ROUNDS = [1, 2, 3, 4, 5, 6] as const;
export const CSAB_ROUNDS = [1, 2] as const;
