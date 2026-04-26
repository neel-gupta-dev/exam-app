// ============================================================
// Custom Hooks — Data Loading & Prediction
// ============================================================

"use client";

import { useState, useEffect, useCallback } from "react";
import {
  CutoffEntry,
  InstituteMetadata,
  BranchRanking,
  UserInput,
  PredictionOutput,
} from "../lib/types";
import { predictColleges } from "../lib/algorithm";
import { loadBranchRankings } from "../lib/branchRanker";
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

        // Load institute metadata
        const metaRes = await fetch("/data/institute-metadata.json");
        const metaData: InstituteMetadata[] = await metaRes.json();

        // Load branch rankings
        const branchRes = await fetch("/data/branch-rankings.json");
        const branchData: BranchRanking[] = await branchRes.json();

        // Initialize scoring engines
        loadBranchRankings(branchData);
        initNormalization(metaData);

        // Build institute lookup map
        const instituteMap = new Map<string, InstituteMetadata>();
        for (const inst of metaData) {
          instituteMap.set(inst.institute_code, inst);
        }
        setInstitutes(instituteMap);

        // Load real cutoff data
        const cutoffRes = await fetch("/data/cutoffs-all.json");
        const realCutoffs = await cutoffRes.json();
        setCutoffs(realCutoffs);

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
    (input: UserInput) => {
      setPredicting(true);

      // Run prediction in a timeout to avoid blocking main thread
      setTimeout(() => {
        const output = predictColleges(cutoffs, institutes, input);
        setResults(output);
        setPredicting(false);
      }, 100);
    },
    [cutoffs, institutes]
  );

  const reset = useCallback(() => {
    setResults(null);
  }, []);

  return { results, predicting, predict, reset };
}
