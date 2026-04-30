// ============================================================
// Custom Hooks — Data Loading & Prediction (v2)
// ============================================================
//
// Now loads pre-computed program stats and demand index
// alongside cutoff data and metadata.
// ============================================================

"use client";

import { useState, useEffect, useCallback } from "react";
import {
  CutoffEntry,
  InstituteMetadata,
  BranchRanking,
  UserInput,
  PredictionOutput,
  ProgramStats,
  DemandIndex,
} from "../lib/types";
import { predictColleges, loadProgramStats } from "../lib/algorithm";
import { loadBranchRankings, loadDemandIndex } from "../lib/branchRanker";
import { initNormalization } from "../lib/collegeScorer";


/** Hook to load all cutoff and metadata. */
export function useCutoffData() {
  const [cutoffs, setCutoffs] = useState<CutoffEntry[]>([]);
  const [institutes, setInstitutes] = useState<Map<string, InstituteMetadata>>(
    new Map()
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);

        // Load all data in parallel
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const [metaRes, branchRes, cutoffRes, statsRes, demandRes] = await Promise.all([
          fetch("/data/institute-metadata.json"),
          fetch("/data/branch-rankings.json"),
          fetch(`${apiUrl}/public/cutoffs/all`),
          fetch("/data/program-stats.json"),
          fetch("/data/demand-index.json"),
        ]);

        const metaData: InstituteMetadata[] = await metaRes.json();
        const branchData: BranchRanking[] = await branchRes.json();
        const rawCutoffs: any[] = await cutoffRes.json();
        const statsData: ProgramStats[] = await statsRes.json();
        const demandData: DemandIndex = await demandRes.json();

        // Build institute lookup map and inflate cutoffs
        const instituteMap = new Map<string, InstituteMetadata>();
        for (const inst of metaData) {
          instituteMap.set(inst.institute_code, inst);
        }
        
        const cutoffData: CutoffEntry[] = rawCutoffs.map(c => {
          const institute_name = instituteMap.get(c[0])?.institute_name || "";
          return {
            institute_code: c[0],
            institute_name: institute_name,
            program_code: c[1],
            program_name: c[2],
            quota: c[3],
            seat_type: c[4],
            gender: c[5] === "F" ? "Female-only (including Supernumerary)" : "Gender-Neutral",
            opening_rank: c[6],
            closing_rank: c[7],
            round: c[8],
            year: c[9],
            counseling: c[10]
          };
        });

        // Initialize scoring engines
        loadBranchRankings(branchData);
        loadDemandIndex(demandData);
        initNormalization(metaData);
        loadProgramStats(statsData);

        setInstitutes(instituteMap);
        setCutoffs(cutoffData);

        setLoading(false);
      } catch (err) {
        console.error("Failed to load data:", err);
        setError("Failed to load prediction data. Please refresh the page.");
        setLoading(false);
      }
    }

    loadData();
  }, []);

  return { cutoffs, institutes, loading, error };
}

/** Hook to run predictions. */
export function usePredictor(
  cutoffs: CutoffEntry[],
  institutes: Map<string, InstituteMetadata>
) {
  const [results, setResults] = useState<PredictionOutput | null>(null);
  const [predicting, setPredicting] = useState(false);

  const predict = useCallback(
    (input: UserInput, onDone?: (output: PredictionOutput) => void) => {
      setPredicting(true);

      // Run prediction in a timeout to avoid blocking main thread
      setTimeout(() => {
        const output = predictColleges(cutoffs, institutes, input);
        setResults(output);
        setPredicting(false);
        onDone?.(output);
      }, 100);
    },
    [cutoffs, institutes]
  );

  const reset = useCallback(() => {
    setResults(null);
  }, []);

  return { results, predicting, predict, reset };
}
