"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { 
  Trophy, 
  MapPin, 
  BookOpen, 
  ChevronRight, 
  X, 
  Check, 
  School,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";

const COLLEGES = [
  "IIT Bombay", "IIT Delhi", "IIT Madras", "IIT Kanpur", "IIT Kharagpur",
  "IIT Roorkee", "IIT Guwahati", "IIIT Hyderabad", "IIIT Bangalore",
  "NIT Trichy", "NIT Surathkal", "BITS Pilani", "IISc Bangalore", "AIIMS Delhi"
];

const COACHING = [
  "Allen", "Aakash", "FITJEE", "Unacademy", "Physics Wallah", "Resonance", "Vibrant Academy", "Self-Study", "Other"
];

const ACADEMIC_LEVELS = ["11th", "12th", "Dropper"];

export default function DreamerModal() {
  const { user, updateUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [selectedColleges, setSelectedColleges] = useState<string[]>([]);
  const [selectedCoaching, setSelectedCoaching] = useState("");
  const [academicLevel, setAcademicLevel] = useState("");

  useEffect(() => {
    // Show if user is logged in and dream colleges are empty
    if (user && (!user.profile?.dreamColleges || user.profile.dreamColleges.length === 0) && !user.isOnboarded) {
      setIsOpen(true);
    }
  }, [user]);

  if (!isOpen) return null;

  const toggleCollege = (college: string) => {
    setSelectedColleges(prev => 
      prev.includes(college) ? prev.filter(c => c !== college) : [...prev, college]
    );
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data } = await api.patch('/users/profile', {
        dreamColleges: selectedColleges,
        currentCoaching: selectedCoaching,
        academicLevel
      });
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
                  <Trophy className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-on-surface">The Dreamer Layer</h2>
                  <p className="text-xs text-on-surface-variant">Where do you see yourself in 2027?</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-8 max-h-[240px] overflow-y-auto pr-2 custom-scrollbar">
                {COLLEGES.map(college => (
                  <button
                    key={college}
                    onClick={() => toggleCollege(college)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg border text-xs font-bold transition-all ${
                      selectedColleges.includes(college)
                        ? "bg-primary/10 border-primary text-primary"
                        : "bg-surface-bright border-white/5 text-on-surface-variant hover:border-white/20"
                    }`}
                  >
                    <span>{college}</span>
                    {selectedColleges.includes(college) && <Check className="w-3.5 h-3.5" />}
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
                  disabled={selectedColleges.length === 0}
                  onClick={() => setStep(2)}
                  className="flex items-center gap-2 px-6 py-3 bg-primary text-on-primary rounded-xl text-xs font-bold transition-all hover:bg-primary-dim disabled:opacity-50 disabled:cursor-not-allowed group shadow-lg shadow-primary/20"
                >
                  PROCEED
                  <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
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
