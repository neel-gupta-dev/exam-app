"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import Image from "next/image";
import { 
  Trophy, 
  MapPin, 
  BookOpen, 
  ChevronRight, 
  X, 
  Check, 
  School,
  Sparkles,
  Target
} from "lucide-react";

import { toast } from "sonner";

const DESTINATION_MAPPING: Record<string, { label: string, icon: any, options: string[] }> = {
  'JEE Advanced': {
    label: 'Dream IITs',
    icon: Trophy,
    options: ['IIT Bombay', 'IIT Delhi', 'IIT Madras', 'IIT Kanpur', 'IIT Kharagpur', 'IIT Roorkee', 'IIT Guwahati', 'IISc Bangalore']
  },
  'JEE Main': {
    label: 'Top Engineering Colleges',
    icon: School,
    options: ['NIT Trichy', 'NIT Surathkal', 'NIT Warangal', 'IIIT Hyderabad', 'IIIT Bangalore', 'BITS Pilani', 'DTU', 'NSUT']
  },
  'NEET': {
    label: 'Dream Medical Colleges',
    icon: Sparkles,
    options: ['AIIMS Delhi', 'CMC Vellore', 'JIPMER Pondicherry', 'AFMC Pune', 'Maulana Azad Medical College', 'KGMU Lucknow']
  },
  'UPSC': {
    label: 'Target Administrative Posts',
    icon: Trophy,
    options: ['IAS (Indian Administrative Service)', 'IPS (Indian Police Service)', 'IFS (Indian Foreign Service)', 'IRS (Indian Revenue Service)', 'IAAS (Indian Audit and Accounts Service)']
  },
  'CAT': {
    label: 'Dream B-Schools',
    icon: Trophy,
    options: ['IIM Ahmedabad', 'IIM Bangalore', 'IIM Calcutta', 'IIM Lucknow', 'IIM Indore', 'FMS Delhi', 'XLRI Jamshedpur']
  },
  'GATE': {
    label: 'Target PSUs & Research',
    icon: School,
    options: ['ONGC', 'IOCL', 'GAIL', 'BARC', 'DRDO', 'IISc Bangalore', 'IIT Research Fellow']
  },
  'SSC CGL': {
    label: 'Target Government Posts',
    icon: Trophy,
    options: ['Income Tax Inspector', 'Excise Inspector', 'CBI Sub-Inspector', 'AAO', 'ED Assistant Enforcement Officer']
  },
  'GRE': {
    label: 'Target Global Universities',
    icon: School,
    options: ['Harvard University', 'Stanford University', 'MIT', 'Oxford University', 'Cambridge University', 'UC Berkeley', 'ETH Zurich']
  },
  'GMAT': {
    label: 'Target Global B-Schools',
    icon: BookOpen,
    options: ['Harvard B-School', 'Stanford GSB', 'Wharton', 'INSEAD', 'London Business School', 'Booth School of Business']
  },
  'SAT': {
    label: 'Target Undergraduate Schools',
    icon: School,
    options: ['Harvard', 'Yale', 'Princeton', 'Stanford', 'MIT', 'Caltech', 'Cornell', 'Columbia']
  },
  'Other': {
    label: 'Your Dream Institution',
    icon: Target,
    options: ['Top University', 'State Government Job', 'Premium Research Lab', 'Leading Tech Giant', 'Entrepreneurial Journey']
  }
};

const ACADEMIC_LEVELS = ["11th", "12th", "Dropper"];

const COACHING = [
  "Allen", "Aakash", "FITJEE", "Unacademy", "Physics Wallah", "Resonance", "Vibrant Academy", "Self-Study", "Other"
];



/**
 * Dream College/Goal Modal
 * A personalized onboarding step that appears *after* initial signup (if dreamColleges are empty).
 * Dynamically renders options based on the user's selected `targetExams` (e.g., IITs for JEE, AIIMS for NEET).
 */
export default function DreamerModal() {
  const { user, updateUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [selectedDestinations, setSelectedDestinations] = useState<string[]>([]);
  const [selectedCoaching, setSelectedCoaching] = useState("");
  const [academicLevel, setAcademicLevel] = useState("");

  const targetExams = user?.targetExam || [];
  const ACADEMIC_TARGETS = ['JEE Main', 'JEE Advanced', 'School Exams'];
  const isAcademicPath = targetExams.some(exam => ACADEMIC_TARGETS.includes(exam));

  let availableDestinations: string[] = [];
  let categoryLabel = "Dream Destinations";
  let CategoryIcon = Trophy;

  /**
   * Dynamic Destination Mapping
   * Determines which colleges/destinations to show based on the user's
   * first chosen target exam. Collects options into `availableDestinations`.
   */
  targetExams.forEach((exam, index) => {
    const mapping = DESTINATION_MAPPING[exam];
    if (mapping) {
      availableDestinations = [...availableDestinations, ...mapping.options];
      if (index === 0) {
        categoryLabel = mapping.label;
        CategoryIcon = mapping.icon;
      }
    }
  });

  // Unique destinations
  availableDestinations = Array.from(new Set(availableDestinations));

  // Fallback if empty
  if (availableDestinations.length === 0) {
    availableDestinations = DESTINATION_MAPPING['Other'].options;
  }

  useEffect(() => {
    // Show if user is logged in, onboarded, but dream colleges are not yet set
    if (user && user.isOnboarded && (!user.profile?.dreamColleges || user.profile.dreamColleges.length === 0)) {
      setIsOpen(true);
    }
  }, [user, user?.isOnboarded]);


  if (!isOpen) return null;

  const toggleDestination = (dest: string) => {
    setSelectedDestinations(prev => 
      prev.includes(dest) ? prev.filter(c => c !== dest) : [...prev, dest]
    );
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const payload: any = {
        dreamColleges: selectedDestinations,
      };

      if (isAcademicPath) {
        payload.currentCoaching = selectedCoaching;
        payload.academicLevel = academicLevel;
      }

      const { data } = await api.patch('/users/profile', payload);
      updateUser(data);
      toast.success("Profile updated! Let's get to work.");
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to save profile", error);
      toast.error("Something went wrong saving your profile.");
    } finally {
      setLoading(false);
    }
  };



  const skip = () => setIsOpen(false);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-surface-container border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative">
        
        {/* Progress Bar */}
        <div className="h-1 w-full bg-white/5">
          <div 
            className="h-full bg-primary transition-all duration-500" 
            style={{ width: `${(step / 2) * 100}%` }} 
          />
        </div>

        <button 
          onClick={skip}
          className="absolute top-4 right-4 p-2 text-on-surface-variant hover:text-on-surface transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8">
          {step === 1 ? (
            <div className="animate-in slide-in-from-right-4 duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <CategoryIcon className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-on-surface">{categoryLabel}</h2>
                  <p className="text-xs text-on-surface-variant italic">Where do you find yourself in {user?.targetYear || (new Date().getFullYear() + 1)}?</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-8 max-h-[240px] overflow-y-auto pr-2 custom-scrollbar">
                {availableDestinations.map(dest => (
                  <button
                    key={dest}
                    onClick={() => toggleDestination(dest)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg border text-xs font-bold transition-all text-left ${
                      selectedDestinations.includes(dest)
                        ? "bg-primary/10 border-primary text-primary"
                        : "bg-surface-bright border-white/5 text-on-surface-variant hover:border-white/20"
                    }`}
                  >
                    <span className="line-clamp-2">{dest}</span>
                    {selectedDestinations.includes(dest) && <Check className="w-3.5 h-3.5 shrink-0" />}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between gap-4">
                <button 
                  onClick={skip}
                  className="text-xs font-bold text-on-surface-variant hover:text-on-surface transition-colors uppercase tracking-widest"
                >
                  Skip for now
                </button>
                <button
                  disabled={selectedDestinations.length === 0 || loading}
                  onClick={() => isAcademicPath ? setStep(2) : handleSave()}
                  className="flex items-center gap-2 px-6 py-3 bg-primary text-on-primary rounded-xl text-xs font-bold transition-all hover:bg-primary-dim disabled:opacity-50 disabled:cursor-not-allowed group shadow-lg shadow-primary/20"
                >
                  {isAcademicPath ? 'PROCEED' : (loading ? 'SAVING...' : 'FINISH SETUP')}
                  {!loading && (isAcademicPath ? (
                    <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  ))}
                </button>

              </div>
            </div>

          ) : (
            <div className="animate-in slide-in-from-right-4 duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400">
                  <School className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-on-surface">Preparation Core</h2>
                  <p className="text-xs text-on-surface-variant">How are you currently studying?</p>
                </div>
              </div>

              <div className="space-y-6 mb-10">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-2">Target Grade</label>
                  <div className="flex gap-2">
                    {ACADEMIC_LEVELS.map(level => (
                      <button
                        key={level}
                        onClick={() => setAcademicLevel(level)}
                        className={`flex-1 py-3 rounded-xl border text-xs font-bold transition-all ${
                          academicLevel === level
                            ? "bg-primary/10 border-primary text-primary"
                            : "bg-surface-bright border-white/5 text-on-surface-variant hover:border-white/20"
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-2">Coaching Center</label>
                  <select
                    value={selectedCoaching}
                    onChange={(e) => setSelectedCoaching(e.target.value)}
                    className="w-full bg-surface-bright border border-white/5 rounded-xl py-3 px-4 text-sm text-on-surface focus:outline-none focus:border-primary transition-all appearance-none cursor-pointer"
                  >
                    <option value="" disabled>Select your institute</option>
                    {COACHING.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4">
                <button 
                  onClick={() => setStep(1)}
                  className="text-xs font-bold text-on-surface-variant hover:text-on-surface transition-colors uppercase tracking-widest"
                >
                  Back
                </button>
                <button
                  disabled={!academicLevel || !selectedCoaching || loading}
                  onClick={handleSave}
                  className="flex items-center gap-2 px-8 py-3 bg-primary text-on-primary rounded-xl text-xs font-bold transition-all hover:bg-primary-dim disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
                >
                  {loading ? "SAVING..." : (
                    <>
                      FINISH SETUP
                      <Sparkles className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
