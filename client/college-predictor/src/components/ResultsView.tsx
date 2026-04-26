"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  AlertTriangle,
  AlertCircle,
  LayoutGrid,
  GraduationCap,
  School,
} from "lucide-react";
import { PredictionOutput, PredictionResult, ResultFilters } from "../lib/types";
import { filterResults } from "../lib/utils";
import CollegeCard from "./CollegeCard";
import FilterBar from "./FilterBar";

interface ResultsViewProps {
  output: PredictionOutput;
}

type TabKey = "all" | "safe" | "moderate" | "low";
type ExamTab = "both" | "mains" | "advanced";

export default function ResultsView({ output }: ResultsViewProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [examTab, setExamTab] = useState<ExamTab>(
    output.advanced_results.length > 0 && output.mains_results.length > 0
      ? "both"
      : output.advanced_results.length > 0
      ? "advanced"
      : "mains"
  );
  const [filters, setFilters] = useState<ResultFilters>({
    institute_types: [],
    chance_levels: [],
    branches: [],
    states: [],
    search: "",
  });

  // Combine results based on exam tab
  const combinedResults = useMemo(() => {
    let results: PredictionResult[] = [];
    if (examTab === "both" || examTab === "advanced") {
      results = [...results, ...output.advanced_results];
    }
    if (examTab === "both" || examTab === "mains") {
      results = [...results, ...output.mains_results];
    }
    // Sort by composite score
    return results.sort((a, b) => b.composite_score - a.composite_score);
  }, [examTab, output]);

  // Apply chance tab filter
  const tabFilteredResults = useMemo(() => {
    if (activeTab === "all") return combinedResults;
    return combinedResults.filter((r) => r.chance === activeTab);
  }, [activeTab, combinedResults]);

  // Apply search/advanced filters
  const filteredResults = useMemo(() => {
    return filterResults(tabFilteredResults, filters);
  }, [tabFilteredResults, filters]);

  const totalResults = combinedResults.length;
  const safeCount = combinedResults.filter((r) => r.chance === "safe").length;
  const moderateCount = combinedResults.filter((r) => r.chance === "moderate").length;
  const lowCount = combinedResults.filter((r) => r.chance === "low").length;

  const hasAdvanced = output.advanced_results.length > 0;
  const hasMains = output.mains_results.length > 0;

  const tabs: { key: TabKey; label: string; count: number; icon: React.ReactNode; color: string }[] = [
    {
      key: "all",
      label: "All",
      count: totalResults,
      icon: <LayoutGrid className="w-3.5 h-3.5" />,
      color: "blue",
    },
    {
      key: "safe",
      label: "Safe",
      count: safeCount,
      icon: <Shield className="w-3.5 h-3.5" />,
      color: "emerald",
    },
    {
      key: "moderate",
      label: "Moderate",
      count: moderateCount,
      icon: <AlertTriangle className="w-3.5 h-3.5" />,
      color: "amber",
    },
    {
      key: "low",
      label: "Low",
      count: lowCount,
      icon: <AlertCircle className="w-3.5 h-3.5" />,
      color: "red",
    },
  ];

  return (
    <div className="w-full">
      {/* Summary Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-3 gap-3 sm:gap-4 mb-6"
      >
        <div className="glass-card-light p-3 sm:p-4 text-center">
          <p className="text-2xl sm:text-3xl font-bold text-emerald-400 font-[family-name:var(--font-heading)]">
            {safeCount}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">Safe Picks</p>
        </div>
        <div className="glass-card-light p-3 sm:p-4 text-center">
          <p className="text-2xl sm:text-3xl font-bold text-amber-400 font-[family-name:var(--font-heading)]">
            {moderateCount}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">Moderate</p>
        </div>
        <div className="glass-card-light p-3 sm:p-4 text-center">
          <p className="text-2xl sm:text-3xl font-bold text-red-400 font-[family-name:var(--font-heading)]">
            {lowCount}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">Low Possibility</p>
        </div>
      </motion.div>

      {/* Exam Type Tabs (if both ranks provided) */}
      {hasAdvanced && hasMains && (
        <div className="flex items-center gap-2 mb-4">
          {(
            [
              { key: "both" as const, label: "All Colleges", icon: <LayoutGrid className="w-3.5 h-3.5" /> },
              { key: "advanced" as const, label: "IITs (Advanced)", icon: <GraduationCap className="w-3.5 h-3.5" /> },
              { key: "mains" as const, label: "NITs/IIITs/GFTIs (Mains)", icon: <School className="w-3.5 h-3.5" /> },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setExamTab(tab.key)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                examTab === tab.key
                  ? "bg-blue-500/15 text-blue-300 border border-blue-500/30"
                  : "text-gray-400 hover:text-white border border-transparent"
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Chance Level Tabs */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === tab.key
                ? `bg-${tab.color}-500/15 text-${tab.color}-300 border border-${tab.color}-500/30`
                : "text-gray-400 hover:text-white border border-transparent"
            }`}
          >
            {tab.icon}
            {tab.label}
            <span
              className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${
                activeTab === tab.key
                  ? `bg-${tab.color}-500/20`
                  : "bg-navy-700"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="mb-5">
        <FilterBar
          results={combinedResults}
          filters={filters}
          onFilterChange={setFilters}
        />
      </div>

      {/* Results Count */}
      <p className="text-xs text-gray-500 mb-3">
        Showing {filteredResults.length} of {totalResults} results
      </p>

      {/* Results Grid */}
      {filteredResults.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
          {filteredResults.map((result, index) => (
            <CollegeCard
              key={`${result.cutoff.institute_code}-${result.cutoff.program_code}-${result.cutoff.quota}-${result.cutoff.seat_type}`}
              result={result}
              index={index}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 glass-card-light">
          <p className="text-gray-400 text-lg mb-2">No results found</p>
          <p className="text-gray-500 text-sm">
            Try adjusting your filters or rank input.
          </p>
        </div>
      )}
    </div>
  );
}
