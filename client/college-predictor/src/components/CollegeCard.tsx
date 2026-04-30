"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Award,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  BarChart3,
  Bookmark,
  Loader2,
} from "lucide-react";
import { PredictionResult } from "../lib/types";
import { getChanceColor, getInstituteTypeColor, formatNumber } from "../lib/utils";
import { getBranchCategory, getBranchTrend } from "../lib/branchRanker";
import { getFactorScores } from "../lib/collegeScorer";
import RankTrendChart from "./RankTrendChart";
import type { ShortlistItem } from "../hooks/useShortlist";

interface TrendData {
  josaa: { year: number; closing_rank: number }[];
  csab:  { year: number; closing_rank: number }[];
}

interface CollegeCardProps {
  result: PredictionResult;
  index: number;
  isShortlisted: boolean;
  onToggleShortlist: (item: Omit<ShortlistItem, "sessionId">) => void;
}

export default function CollegeCard({
  result,
  index,
  isShortlisted,
  onToggleShortlist,
}: CollegeCardProps) {
  const [expanded, setExpanded]   = useState(false);
  const [trendData, setTrendData] = useState<TrendData | null>(null);
  const [trendLoading, setTrendLoading] = useState(false);

  const chance       = getChanceColor(result.chance);
  const typeColor    = getInstituteTypeColor(result.institute.type);
  const branchCategory = getBranchCategory(result.cutoff.program_name);
  const trend        = getBranchTrend(result.cutoff.program_name);
  const factors      = getFactorScores(result.institute);

  const trendInfo = {
    rising:   { icon: "↗", color: "text-emerald-400" },
    stable:   { icon: "→", color: "text-gray-400" },
    declining:{ icon: "↘", color: "text-red-400" },
  }[trend];

  const isBits       = result.institute.type === "BITS";
  const displayDelta = isBits ? -result.rank_delta : result.rank_delta;
  const isSafer      = result.rank_delta < 0;

  // Fetch trend data lazily when the card is expanded for the first time
  async function handleExpand() {
    const nextExpanded = !expanded;
    setExpanded(nextExpanded);
    if (nextExpanded && !trendData && !trendLoading) {
      setTrendLoading(true);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
        const params = new URLSearchParams({
          institute_code: result.cutoff.institute_code,
          program_code:   result.cutoff.program_code,
          quota:          result.cutoff.quota,
          seat_type:      result.cutoff.seat_type,
          gender:         result.cutoff.gender,
        });
        const res  = await fetch(`${apiUrl}/public/cutoffs/trend?${params}`);
        const data = await res.json();
        setTrendData(data);
      } catch {
        setTrendData({ josaa: [], csab: [] });
      } finally {
        setTrendLoading(false);
      }
    }
  }

  function handleBookmark() {
    onToggleShortlist({
      institute_code:       result.cutoff.institute_code,
      program_code:         result.cutoff.program_code,
      institute_name:       result.institute.institute_name,
      short_name:           result.institute.short_name,
      program_name:         result.cutoff.program_name,
      institute_type:       result.institute.type,
      city:                 result.institute.city,
      nirf_rank:            result.institute.nirf_rank,
      placement_median_lpa: result.institute.placement_median_lpa,
      chance:               result.chance,
      chance_percentage:    result.chance_percentage,
      composite_score:      result.composite_score,
      closing_rank:         result.cutoff.closing_rank,
      quota:                result.cutoff.quota,
      seat_type:            result.cutoff.seat_type,
      counseling:           result.cutoff.counseling,
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.5) }}
      className={`glass-card-light overflow-hidden transition-all duration-300 hover:border-blue-500/20 ${
        result.chance === "safe"
          ? "hover:shadow-emerald-500/5"
          : result.chance === "moderate"
          ? "hover:shadow-amber-500/5"
          : "hover:shadow-red-500/5"
      }`}
    >
      <div className="p-4 sm:p-5">
        {/* Top Row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className={`chip ${typeColor} text-[11px] px-2 py-0.5`}>
                {result.institute.type}
              </span>
              <span className={`chip ${chance.bg} ${chance.text} ${chance.border} text-[11px] px-2 py-0.5`}>
                {chance.emoji} {chance.label}
              </span>
              {result.cutoff.quota !== "AI" && (
                <span className="chip bg-navy-700/50 text-gray-400 border-navy-600 text-[11px] px-2 py-0.5">
                  {result.cutoff.quota === "HS" ? "Home State" : "Other State"}
                </span>
              )}
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-white font-[family-name:var(--font-heading)] leading-tight">
              {result.institute.short_name}
            </h3>
            <p className="text-sm text-gray-400 mt-0.5">{result.cutoff.program_name}</p>
          </div>

          {/* Right: Score + Bookmark */}
          <div className="flex flex-col items-center gap-2 shrink-0">
            <div
              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center font-bold text-lg sm:text-xl font-[family-name:var(--font-heading)] ${chance.bg} ${chance.text} border ${chance.border}`}
            >
              {result.composite_score}
            </div>
            <span className="text-[10px] text-gray-500">Score</span>
            <button
              onClick={handleBookmark}
              aria-label={isShortlisted ? "Remove from shortlist" : "Add to shortlist"}
              className={`p-1.5 rounded-lg transition-all ${
                isShortlisted
                  ? "text-blue-400 bg-blue-500/10 border border-blue-500/30"
                  : "text-gray-500 hover:text-blue-400 hover:bg-blue-500/10 border border-transparent"
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isShortlisted ? "fill-blue-400" : ""}`} />
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
          <div className="flex items-center gap-1.5">
            <BarChart3 className="w-3.5 h-3.5 text-gray-500" />
            <div>
              <p className="text-[10px] text-gray-500 uppercase">
                {isBits ? "Cutoff Score" : "Closing Rank"}
              </p>
              <p className="text-sm font-medium text-gray-200">
                {isBits ? result.cutoff.closing_rank : formatNumber(result.cutoff.closing_rank)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-gray-500" />
            <div>
              <p className="text-[10px] text-gray-500 uppercase">Location</p>
              <p className="text-sm font-medium text-gray-200">{result.institute.city}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-gray-500" />
            <div>
              <p className="text-[10px] text-gray-500 uppercase">NIRF</p>
              <p className="text-sm font-medium text-gray-200">
                {result.institute.nirf_rank ? `#${result.institute.nirf_rank}` : "—"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-gray-500" />
            <div>
              <p className="text-[10px] text-gray-500 uppercase">Median CTC</p>
              <p className="text-sm font-medium text-gray-200">
                {result.institute.placement_median_lpa
                  ? `₹${result.institute.placement_median_lpa}L`
                  : "—"}
              </p>
            </div>
          </div>
        </div>

        {/* Chance Bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500">Admission Probability</span>
            <span className={`text-xs font-medium ${chance.text}`}>
              {result.chance_percentage}%
            </span>
          </div>
          <div className="score-bar">
            <div
              className={`score-bar-fill ${
                result.chance === "safe"
                  ? "bg-gradient-to-r from-emerald-600 to-emerald-400"
                  : result.chance === "moderate"
                  ? "bg-gradient-to-r from-amber-600 to-amber-400"
                  : "bg-gradient-to-r from-red-600 to-red-400"
              }`}
              style={{ width: `${result.chance_percentage}%` }}
            />
          </div>
        </div>

        {/* Expand Toggle */}
        <button
          onClick={handleExpand}
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 transition-colors w-full justify-center py-1"
        >
          {expanded ? (
            <>Less details <ChevronUp className="w-3 h-3" /></>
          ) : (
            <>More details <ChevronDown className="w-3 h-3" /></>
          )}
        </button>

        {/* Expanded Details */}
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-3 pt-3 border-t border-navy-700 space-y-4"
          >
            {/* Score Breakdown */}
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-2 bg-navy-800/50 rounded-lg">
                <p className="text-[10px] text-gray-500 uppercase mb-1">Branch Score</p>
                <p className="text-lg font-bold text-blue-400">{result.branch_score}</p>
                <p className="text-[10px] text-gray-500">
                  {branchCategory}{" "}
                  <span className={trendInfo.color}>{trendInfo.icon}</span>
                </p>
              </div>
              <div className="text-center p-2 bg-navy-800/50 rounded-lg">
                <p className="text-[10px] text-gray-500 uppercase mb-1">College Pref Score</p>
                <p className="text-lg font-bold text-cyan-400">{result.college_pref_score}</p>
              </div>
            </div>

            {/* Factor Bars */}
            <div className="space-y-2">
              {[
                { label: "City Life",  value: factors.city_life,   color: "from-violet-500 to-violet-400" },
                { label: "Placements", value: factors.placements,  color: "from-emerald-500 to-emerald-400" },
                { label: "Reputation", value: factors.reputation,  color: "from-amber-500 to-amber-400" },
                { label: "Campus",     value: factors.campus_life, color: "from-blue-500 to-blue-400" },
              ].map((factor) => (
                <div key={factor.label} className="flex items-center gap-3">
                  <span className="text-[10px] text-gray-400 w-16">{factor.label}</span>
                  <div className="flex-1 score-bar">
                    <div
                      className={`score-bar-fill bg-gradient-to-r ${factor.color}`}
                      style={{ width: `${factor.value}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-gray-400 w-6 text-right">{factor.value}</span>
                </div>
              ))}
            </div>

            {/* ── Rank Trend Charts ── */}
            <div className="space-y-1">
              <p className="text-[10px] text-gray-500 uppercase tracking-wide font-medium">
                Historical Closing {isBits ? "Score" : "Rank"} Trend (Round 2)
              </p>
              {trendLoading ? (
                <div className="flex items-center justify-center gap-2 py-6 text-xs text-gray-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading trend data...
                </div>
              ) : trendData ? (
                <div className="bg-navy-800/40 rounded-lg p-3">
                  <RankTrendChart
                    josaa={trendData.josaa}
                    csab={trendData.csab}
                    isBits={isBits}
                  />
                </div>
              ) : null}
            </div>

            {/* Additional Info */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
              <span>Est. {result.institute.established_year}</span>
              <span>•</span>
              <span>Round {result.cutoff.round}</span>
              <span>•</span>
              <span>
                {result.cutoff.seat_type} / {result.cutoff.gender === "Gender-Neutral" ? "Any" : "Female"}
              </span>
              <span>•</span>
              <span>
                {isBits ? "Score Margin" : "Rank Delta"}:{" "}
                <span className={isSafer ? "text-emerald-400" : "text-red-400"}>
                  {displayDelta > 0 ? "+" : ""}
                  {isBits ? displayDelta : formatNumber(displayDelta)}
                </span>
              </span>
            </div>

            {/* Website Link */}
            <a
              href={result.institute.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              Visit Website <ExternalLink className="w-3 h-3" />
            </a>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
