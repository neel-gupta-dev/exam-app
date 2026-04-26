"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  X,
  SlidersHorizontal,
} from "lucide-react";
import { PredictionResult, ResultFilters, ChanceLevel } from "../lib/types";
import { getUniqueStates } from "../lib/utils";

interface FilterBarProps {
  results: PredictionResult[];
  filters: ResultFilters;
  onFilterChange: (filters: ResultFilters) => void;
}

export default function FilterBar({ results, filters, onFilterChange }: FilterBarProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const states = useMemo(() => getUniqueStates(results), [results]);

  function toggleInstituteType(type: "IIT" | "NIT" | "IIIT" | "GFTI") {
    const current = filters.institute_types;
    const next = current.includes(type)
      ? current.filter((t) => t !== type)
      : [...current, type];
    onFilterChange({ ...filters, institute_types: next });
  }

  function toggleChanceLevel(level: ChanceLevel) {
    const current = filters.chance_levels;
    const next = current.includes(level)
      ? current.filter((l) => l !== level)
      : [...current, level];
    onFilterChange({ ...filters, chance_levels: next });
  }

  function toggleState(state: string) {
    const current = filters.states;
    const next = current.includes(state)
      ? current.filter((s) => s !== state)
      : [...current, state];
    onFilterChange({ ...filters, states: next });
  }

  function clearFilters() {
    onFilterChange({
      institute_types: [],
      chance_levels: [],
      branches: [],
      states: [],
      search: "",
    });
  }

  const hasActiveFilters =
    filters.institute_types.length > 0 ||
    filters.chance_levels.length > 0 ||
    filters.states.length > 0 ||
    filters.search.length > 0;

  return (
    <div className="space-y-3">
      {/* Search + Filter Toggle */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            id="filter-search"
            type="text"
            placeholder="Search college, branch, city..."
            value={filters.search}
            onChange={(e) =>
              onFilterChange({ ...filters, search: e.target.value })
            }
            className="w-full pl-10 pr-4 py-2.5 bg-navy-800 border border-navy-600 rounded-xl text-sm text-white placeholder:text-gray-500 transition-all"
          />
          {filters.search && (
            <button
              onClick={() => onFilterChange({ ...filters, search: "" })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
            showAdvanced || hasActiveFilters
              ? "bg-blue-500/10 border-blue-500/30 text-blue-400"
              : "bg-navy-800 border-navy-600 text-gray-400 hover:text-white"
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span className="hidden sm:inline">Filters</span>
          {hasActiveFilters && (
            <span className="w-2 h-2 bg-blue-400 rounded-full" />
          )}
        </button>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-xs text-gray-500 hover:text-white transition-colors whitespace-nowrap"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="glass-card-light p-4 space-y-4"
        >
          {/* Institute Type */}
          <div>
            <p className="text-xs text-gray-400 mb-2 uppercase tracking-wider">
              Institute Type
            </p>
            <div className="flex flex-wrap gap-2">
              {(["IIT", "NIT", "IIIT", "GFTI"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => toggleInstituteType(type)}
                  className={`chip transition-all ${
                    filters.institute_types.includes(type)
                      ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                      : "bg-navy-700/50 text-gray-400 border-navy-600 hover:text-white"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Chance Level */}
          <div>
            <p className="text-xs text-gray-400 mb-2 uppercase tracking-wider">
              Chance Level
            </p>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  { level: "safe" as const, label: "🟢 Safe", color: "emerald" },
                  { level: "moderate" as const, label: "🟡 Moderate", color: "amber" },
                  { level: "low" as const, label: "🔴 Low", color: "red" },
                ] as const
              ).map(({ level, label, color }) => (
                <button
                  key={level}
                  onClick={() => toggleChanceLevel(level)}
                  className={`chip transition-all ${
                    filters.chance_levels.includes(level)
                      ? `bg-${color}-500/20 text-${color}-300 border-${color}-500/30`
                      : "bg-navy-700/50 text-gray-400 border-navy-600 hover:text-white"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* States */}
          {states.length > 0 && (
            <div>
              <p className="text-xs text-gray-400 mb-2 uppercase tracking-wider">
                State
              </p>
              <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                {states.map((state) => (
                  <button
                    key={state}
                    onClick={() => toggleState(state)}
                    className={`chip text-[11px] transition-all ${
                      filters.states.includes(state)
                        ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                        : "bg-navy-700/50 text-gray-400 border-navy-600 hover:text-white"
                    }`}
                  >
                    {state}
                  </button>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
