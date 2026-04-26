// ============================================================
// College Predictor — Utility Functions
// ============================================================

import { ChanceLevel, ResultFilters, PredictionResult } from "./types";

/**
 * Format a number with commas for display.
 */
export function formatNumber(num: number): string {
  return num.toLocaleString("en-IN");
}

/**
 * Get the CSS class / colors for a chance level.
 */
export function getChanceColor(level: ChanceLevel) {
  switch (level) {
    case "safe":
      return {
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/30",
        text: "text-emerald-400",
        dot: "bg-emerald-400",
        glow: "shadow-emerald-500/20",
        label: "Safe",
        emoji: "🟢",
      };
    case "moderate":
      return {
        bg: "bg-amber-500/10",
        border: "border-amber-500/30",
        text: "text-amber-400",
        dot: "bg-amber-400",
        glow: "shadow-amber-500/20",
        label: "Moderate",
        emoji: "🟡",
      };
    case "low":
      return {
        bg: "bg-red-500/10",
        border: "border-red-500/30",
        text: "text-red-400",
        dot: "bg-red-400",
        glow: "shadow-red-500/20",
        label: "Low Possibility",
        emoji: "🔴",
      };
  }
}

/**
 * Get the badge color for institute type.
 */
export function getInstituteTypeColor(type: string) {
  switch (type) {
    case "IIT":
      return "bg-violet-500/20 text-violet-300 border-violet-500/30";
    case "NIT":
      return "bg-blue-500/20 text-blue-300 border-blue-500/30";
    case "IIIT":
      return "bg-cyan-500/20 text-cyan-300 border-cyan-500/30";
    case "GFTI":
      return "bg-teal-500/20 text-teal-300 border-teal-500/30";
    default:
      return "bg-gray-500/20 text-gray-300 border-gray-500/30";
  }
}

/**
 * Apply filters to prediction results.
 */
export function filterResults(
  results: PredictionResult[],
  filters: ResultFilters
): PredictionResult[] {
  return results.filter((r) => {
    // Filter by institute type
    if (
      filters.institute_types.length > 0 &&
      !filters.institute_types.includes(r.institute.type)
    )
      return false;

    // Filter by chance level
    if (
      filters.chance_levels.length > 0 &&
      !filters.chance_levels.includes(r.chance)
    )
      return false;

    // Filter by search query
    if (filters.search) {
      const query = filters.search.toLowerCase();
      const matchesInstitute = r.institute.institute_name
        .toLowerCase()
        .includes(query);
      const matchesShort = r.institute.short_name.toLowerCase().includes(query);
      const matchesProgram = r.cutoff.program_name.toLowerCase().includes(query);
      const matchesCity = r.institute.city.toLowerCase().includes(query);
      if (!matchesInstitute && !matchesShort && !matchesProgram && !matchesCity)
        return false;
    }

    // Filter by states
    if (
      filters.states.length > 0 &&
      !filters.states.includes(r.institute.state)
    )
      return false;

    return true;
  });
}

/**
 * Get unique branches from results.
 */
export function getUniqueBranches(results: PredictionResult[]): string[] {
  const branches = new Set(results.map((r) => r.cutoff.program_name));
  return Array.from(branches).sort();
}

/**
 * Get unique states from results.
 */
export function getUniqueStates(results: PredictionResult[]): string[] {
  const states = new Set(results.map((r) => r.institute.state));
  return Array.from(states).sort();
}

/**
 * Truncate text with ellipsis.
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

/**
 * Get growth trend indicator.
 */
export function getTrendIndicator(trend: string) {
  switch (trend) {
    case "rising":
      return { icon: "↗", text: "Rising demand", color: "text-emerald-400" };
    case "declining":
      return { icon: "↘", text: "Declining demand", color: "text-red-400" };
    default:
      return { icon: "→", text: "Stable demand", color: "text-gray-400" };
  }
}
