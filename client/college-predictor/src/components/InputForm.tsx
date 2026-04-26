"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import {
  GraduationCap,
  User,
  ListOrdered,
  SlidersHorizontal,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  Loader2,
  RotateCcw,
} from "lucide-react";
import { UserInput, CollegePreferences } from "../lib/types";
import { STATES, CATEGORIES, BRANCH_GROUPS, JOSAA_ROUNDS } from "../lib/constants";

interface InputFormProps {
  onSubmit: (input: UserInput) => void;
  loading: boolean;
  onReset?: () => void;
  hasResults?: boolean;
}

const STEPS = [
  { id: 1, title: "Exam Details", icon: GraduationCap },
  { id: 2, title: "Personal Info", icon: User },
  { id: 3, title: "Branch Prefs", icon: ListOrdered },
  { id: 4, title: "College Prefs", icon: SlidersHorizontal },
];

export default function InputForm({ onSubmit, loading, onReset, hasResults }: InputFormProps) {
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [isValidating, setIsValidating] = useState(false);
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [jeeMainsRank, setJeeMainsRank] = useState("");
  const [jeeAdvancedRank, setJeeAdvancedRank] = useState("");
  const [bitsatScore, setBitsatScore] = useState("");
  const [category, setCategory] = useState("OPEN");
  const [gender, setGender] = useState("Male");
  const [homeState, setHomeState] = useState("");
  const [isPwd, setIsPwd] = useState(false);
  const [round, setRound] = useState<string>("");
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const [useMarketRanking, setUseMarketRanking] = useState(true);
  const [collegePrefs, setCollegePrefs] = useState<CollegePreferences>({
    city_life: 50,
    placements: 50,
    reputation: 50,
    campus_life: 50,
  });

  const canProceedStep1 = name.trim().length > 0 && (jeeMainsRank || jeeAdvancedRank || bitsatScore);
  const canProceedStep2 = homeState !== "";

  async function handleSubmit() {
    if (!executeRecaptcha) {
      alert("Security check is still loading. Please try again in a moment.");
      return;
    }

    setIsValidating(true);
    try {
      const token = await executeRecaptcha("predict");
      const res = await fetch("/api/verify-captcha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token })
      });
      const data = await res.json();
      
      if (!data.success) {
        alert("Bot verification failed. Please try again.");
        setIsValidating(false);
        return;
      }

      const input: UserInput = {
        name: name.trim(),
        jee_mains_rank: jeeMainsRank ? parseInt(jeeMainsRank) : null,
        jee_advanced_rank: jeeAdvancedRank ? parseInt(jeeAdvancedRank) : null,
        bitsat_score: bitsatScore ? parseInt(bitsatScore) : null,
        category: category as UserInput["category"],
        gender: gender as UserInput["gender"],
        home_state: homeState,
        is_pwd: isPwd,
        round: round ? parseInt(round) : null,
        branch_preferences: selectedBranches,
        use_market_ranking: useMarketRanking,
        college_preferences: collegePrefs,
      };

      onSubmit(input);
    } catch (err) {
      console.error(err);
      alert("Error verifying security check. Please try again.");
    } finally {
      setIsValidating(false);
    }
  }

  function toggleBranch(branch: string) {
    setSelectedBranches((prev) => {
      if (prev.includes(branch)) return prev.filter((b) => b !== branch);
      return [...prev, branch];
    });
  }

  function moveBranch(index: number, direction: "up" | "down") {
    setSelectedBranches((prev) => {
      const newArr = [...prev];
      const newIndex = direction === "up" ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= newArr.length) return prev;
      [newArr[index], newArr[newIndex]] = [newArr[newIndex], newArr[index]];
      return newArr;
    });
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Step Indicators */}
      <div className="flex items-center justify-center mb-10 gap-2">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const isActive = step === s.id;
          const isCompleted = step > s.id;

          return (
            <div key={s.id} className="flex items-center">
              <button
                onClick={() => {
                  if (isCompleted || isActive) setStep(s.id);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 text-sm font-medium ${
                  isActive
                    ? "step-active text-white"
                    : isCompleted
                    ? "step-completed text-white"
                    : "step-inactive text-gray-500"
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">{s.title}</span>
              </button>
              {i < STEPS.length - 1 && (
                <div
                  className={`w-8 h-0.5 mx-1 rounded ${
                    isCompleted ? "bg-emerald-500" : "bg-navy-700"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Form Content */}
      <div className="glass-card p-6 sm:p-8">
        <AnimatePresence mode="wait">
          {/* ─── Step 1: Exam Details ─── */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl font-bold mb-1 font-[family-name:var(--font-heading)]">
                Enter Your Ranks
              </h2>
              <p className="text-gray-400 mb-6 text-sm">
                Enter at least one rank or score. We'll show results across all applicable exams simultaneously.
              </p>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 bg-navy-800 border border-navy-600 rounded-xl text-white placeholder:text-gray-500 transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="flex items-center gap-4 my-2">
                  <div className="h-px bg-navy-700 flex-1"></div>
                  <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Exams</span>
                  <div className="h-px bg-navy-700 flex-1"></div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">
                    BITSAT Score (out of 390)
                    <span className="ml-2 text-xs text-gray-500">
                      For BITS Pilani, Goa, Hyderabad
                    </span>
                  </label>
                  <input
                    id="bitsat-score"
                    type="number"
                    placeholder="e.g., 250"
                    value={bitsatScore}
                    onChange={(e) => setBitsatScore(e.target.value)}
                    className="w-full px-4 py-3 bg-navy-800 border border-navy-600 rounded-xl text-white placeholder:text-gray-500 transition-all"
                    min={1}
                    max={390}
                  />
                </div>

                <div className="flex items-center gap-4 my-2">
                  <div className="h-px bg-navy-700 flex-1"></div>
                  <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">AND / OR</span>
                  <div className="h-px bg-navy-700 flex-1"></div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">
                    JEE Mains Rank (AIR)
                    <span className="ml-2 text-xs text-gray-500">
                      For NITs, IIITs, GFTIs
                    </span>
                  </label>
                  <input
                    id="jee-mains-rank"
                    type="number"
                    placeholder="e.g., 5000"
                    value={jeeMainsRank}
                    onChange={(e) => setJeeMainsRank(e.target.value)}
                    className="w-full px-4 py-3 bg-navy-800 border border-navy-600 rounded-xl text-white placeholder:text-gray-500 transition-all"
                    min={1}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">
                    JEE Advanced Rank (AIR)
                    <span className="ml-2 text-xs text-gray-500">
                      For IITs only
                    </span>
                  </label>
                  <input
                    id="jee-advanced-rank"
                    type="number"
                    placeholder="e.g., 2000"
                    value={jeeAdvancedRank}
                    onChange={(e) => setJeeAdvancedRank(e.target.value)}
                    className="w-full px-4 py-3 bg-navy-800 border border-navy-600 rounded-xl text-white placeholder:text-gray-500 transition-all"
                    min={1}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">
                    Counseling Round{" "}
                    <span className="text-xs text-gray-500">
                      (leave empty for best chance across all rounds)
                    </span>
                  </label>
                  <select
                    id="round-select"
                    value={round}
                    onChange={(e) => setRound(e.target.value)}
                    className="w-full px-4 py-3 bg-navy-800 border border-navy-600 rounded-xl text-white transition-all"
                  >
                    <option value="">Best Chance (All Rounds)</option>
                    {JOSAA_ROUNDS.map((r) => (
                      <option key={r} value={r}>
                        JoSAA Round {r}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>
          )}

          {/* ─── Step 2: Personal Info ─── */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl font-bold mb-1 font-[family-name:var(--font-heading)]">
                Personal Details
              </h2>
              <p className="text-gray-400 mb-6 text-sm">
                These determine your eligibility for seat quotas.
              </p>

              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-300">
                      Category
                    </label>
                    <select
                      id="category-select"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-4 py-3 bg-navy-800 border border-navy-600 rounded-xl text-white transition-all"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-300">
                      Gender
                    </label>
                    <select
                      id="gender-select"
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full px-4 py-3 bg-navy-800 border border-navy-600 rounded-xl text-white transition-all"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">
                    Home State
                    <span className="ml-2 text-xs text-gray-500">
                      For HS/OS quota determination in NITs
                    </span>
                  </label>
                  <select
                    id="state-select"
                    value={homeState}
                    onChange={(e) => setHomeState(e.target.value)}
                    className="w-full px-4 py-3 bg-navy-800 border border-navy-600 rounded-xl text-white transition-all"
                  >
                    <option value="">Select your state</option>
                    {STATES.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </div>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <div
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      isPwd ? "bg-blue-500" : "bg-navy-700"
                    }`}
                    onClick={() => setIsPwd(!isPwd)}
                  >
                    <div
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                        isPwd ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </div>
                  <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                    Person with Disability (PwD)
                  </span>
                </label>
              </div>
            </motion.div>
          )}

          {/* ─── Step 3: Branch Preferences ─── */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl font-bold mb-1 font-[family-name:var(--font-heading)]">
                Branch Preferences
              </h2>
              <p className="text-gray-400 mb-4 text-sm">
                Select and order your preferred branches. Leave on &quot;Market
                Ranking&quot; for AI-based ordering.
              </p>

              {/* Toggle */}
              <label className="flex items-center gap-3 mb-5 cursor-pointer group">
                <div
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    useMarketRanking ? "bg-blue-500" : "bg-navy-700"
                  }`}
                  onClick={() => setUseMarketRanking(!useMarketRanking)}
                >
                  <div
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                      useMarketRanking ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </div>
                <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                  Use Market Demand Ranking{" "}
                  <span className="text-xs text-gray-500">(Recommended)</span>
                </span>
              </label>

              {!useMarketRanking && (
                <div className="mt-2">
                  {/* Selected branches (ordered) */}
                  {selectedBranches.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-400 mb-2 uppercase tracking-wider">
                        Your preference order:
                      </p>
                      <div className="space-y-2">
                        {selectedBranches.map((branch, idx) => (
                          <div
                            key={branch}
                            className="flex items-center gap-2 px-3 py-2 bg-blue-500/10 border border-blue-500/20 rounded-lg text-sm"
                          >
                            <span className="text-blue-400 font-bold text-xs w-5">
                              {idx + 1}
                            </span>
                            <span className="flex-1 text-gray-200">
                              {branch}
                            </span>
                            <div className="flex gap-1">
                              <button
                                onClick={() => moveBranch(idx, "up")}
                                disabled={idx === 0}
                                className="p-1 text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
                              >
                                ↑
                              </button>
                              <button
                                onClick={() => moveBranch(idx, "down")}
                                disabled={idx === selectedBranches.length - 1}
                                className="p-1 text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
                              >
                                ↓
                              </button>
                              <button
                                onClick={() => toggleBranch(branch)}
                                className="p-1 text-red-400 hover:text-red-300 transition-colors"
                              >
                                ×
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Available branches by Category */}
                  <div className="flex justify-between items-end mb-3">
                    <p className="text-xs text-gray-400 uppercase tracking-wider">
                      Click to add:
                    </p>
                  </div>
                  <div className="flex flex-col gap-5 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
                    {BRANCH_GROUPS.map((group: any) => {
                      const availableBranches = group.branches.filter(
                        (b: string) => !selectedBranches.includes(b)
                      );
                      
                      if (availableBranches.length === 0) return null;

                      return (
                        <div key={group.name} className="bg-navy-800/40 p-3 rounded-lg border border-navy-700/50">
                          <p className="text-sm font-semibold text-blue-300 mb-2 border-b border-navy-700 pb-1">
                            {group.name}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {availableBranches.map((branch: string) => (
                              <button
                                key={branch}
                                onClick={() => toggleBranch(branch)}
                                className="px-2 py-1 text-left text-xs rounded-md bg-navy-700/50 text-gray-300 border border-navy-600 hover:bg-navy-600 hover:text-white transition-all shadow-sm"
                              >
                                + {branch}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ─── Step 4: College Preferences ─── */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl font-bold mb-1 font-[family-name:var(--font-heading)]">
                What Matters to You?
              </h2>
              <p className="text-gray-400 mb-6 text-sm">
                Drag sliders to prioritize what&apos;s important. Higher values
                = more weight in results.
              </p>

              <div className="space-y-6">
                {(
                  [
                    {
                      key: "city_life" as const,
                      label: "City Life",
                      desc: "Prefer metro / Tier-1 cities",
                      emoji: "🏙️",
                    },
                    {
                      key: "placements" as const,
                      label: "Placements",
                      desc: "Higher median salary packages",
                      emoji: "💰",
                    },
                    {
                      key: "reputation" as const,
                      label: "Reputation & Ranking",
                      desc: "NIRF rank, brand value",
                      emoji: "🏆",
                    },
                    {
                      key: "campus_life" as const,
                      label: "Campus & Culture",
                      desc: "Hostel, fests, sports, clubs",
                      emoji: "🎓",
                    },
                  ] as const
                ).map(({ key, label, desc, emoji }) => (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{emoji}</span>
                        <div>
                          <p className="text-sm font-medium text-gray-200">
                            {label}
                          </p>
                          <p className="text-xs text-gray-500">{desc}</p>
                        </div>
                      </div>
                      <span className="text-sm font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
                        {collegePrefs[key]}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={collegePrefs[key]}
                      onChange={(e) =>
                        setCollegePrefs((prev) => ({
                          ...prev,
                          [key]: parseInt(e.target.value),
                        }))
                      }
                      className="w-full"
                    />
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-navy-700">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-2 px-5 py-2.5 text-gray-400 hover:text-white transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          ) : hasResults ? (
            <button
              onClick={onReset}
              className="flex items-center gap-2 px-5 py-2.5 text-gray-400 hover:text-white transition-colors text-sm"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={
                (step === 1 && !canProceedStep1) ||
                (step === 2 && !canProceedStep2)
              }
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-medium text-sm hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading || isValidating}
              className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-500 via-cyan-500 to-violet-500 text-white rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-blue-500/25 transition-all pulse-glow disabled:opacity-60"
            >
              {loading || isValidating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {isValidating ? "Verifying..." : "Predicting..."}
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Predict My Colleges
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
