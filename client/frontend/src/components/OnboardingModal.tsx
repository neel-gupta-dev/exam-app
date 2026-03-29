'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { toast } from 'sonner';

import { TARGET_EXAMS as EXAMS } from '@shared/constants';


const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => currentYear + i);

type Step = 'profile' | 'otp-send' | 'otp-verify' | 'done';

/**
 * Global Onboarding Modal
 * Forces new users to complete their profile (Target Exams & Year) before
 * interacting with the app. Also includes a flow for student email verification
 * (.ac.in or .edu.in) to unlock premium backend features or statuses.
 * Rendered globally by AppProviders.
 */
export default function OnboardingModal() {
  const { user, updateUser } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<Step>('profile');
  const [targetExams, setTargetExams] = useState<string[]>([]);
  const [targetYear, setTargetYear] = useState<number>(currentYear);
  const [otpEmail, setOtpEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Set mounted state
  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when modal is active
  useEffect(() => {
    const isVisible = mounted && user && !user.isOnboarded && step !== 'done';
    if (isVisible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mounted, user, user?.isOnboarded, step]);



  // Handle click outside to close dropdown

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isDropdownOpen && !(e.target as HTMLElement).closest('.exam-dropdown')) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  // Don't show if not mounted, already onboarded, or no user
  if (!mounted || !user || user.isOnboarded) return null;

  /**
   * Profile Setup Step
   * Submits the chosen exams and graduation year to the backend.
   * If the user is already academically verified, onboarding completes.
   * Otherwise, it moves to the OTP step.
   */
  const handleProfileSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (targetExams.length === 0) {
      toast.error('Please select at least one target exam');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.patch('/auth/onboard', { targetExam: targetExams, targetYear });
      updateUser(data);
      toast.success('Profile setup complete!');

      // If not verified, move to OTP step; otherwise close
      if (!data.isVerifiedStudent) {
        setStep('otp-send');
      } else {
        setStep('done');
      }
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to save profile';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e: FormEvent) => {
    e.preventDefault();
    if (!otpEmail) {
      toast.error('Please enter your student email');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/send-otp', { email: otpEmail });
      toast.success('OTP sent! Check your email.');
      setStep('otp-verify');
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to send OTP';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    if (!otpCode) {
      toast.error('Please enter the OTP code');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/verify-otp', { email: otpEmail, code: otpCode });
      updateUser({ isVerifiedStudent: true });
      toast.success('Student verified!');
      setStep('done');
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Invalid OTP';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSkipOtp = () => {
    setStep('done');
  };

  if (step === 'done') return null;

  return (
    <div 
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/75 backdrop-blur-lg px-4"
      style={{ pointerEvents: 'auto' }}
    >
      <div 
        className="bg-surface-container rounded-2xl p-8 w-full max-w-md shadow-2xl border border-white/10 relative"
        style={{ pointerEvents: 'auto' }}
      >

        {/* Top accent line */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-indigo-500 to-primary"></div>

        {/* Step 1: Profile setup */}
        {step === 'profile' && (
          <form onSubmit={handleProfileSubmit} className="space-y-6">
            <div className="text-center mb-2">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 mb-4">
                <span className="material-symbols-outlined text-2xl text-primary">school</span>
              </div>
              <h2 className="font-headline text-xl font-bold text-on-surface">Complete Your Profile</h2>
              <p className="text-sm text-on-surface-variant mt-1">Tell us about your preparation goals</p>
            </div>

            <div className="space-y-3">
              <label className="font-label text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                Target Exams
              </label>
              
              {/* Custom Multi-select Dropdown */}
              <div className="relative exam-dropdown">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`w-full bg-surface-container-highest/50 border rounded-xl py-3.5 px-4 text-sm flex items-center justify-between transition-all outline-none ${
                    isDropdownOpen 
                      ? 'border-primary ring-2 ring-primary/20' 
                      : 'border-outline-variant/30 hover:border-outline-variant/60'
                  }`}
                >
                  <span className={`truncate mr-2 ${targetExams.length === 0 ? 'text-outline-variant' : 'text-on-surface'}`}>
                    {targetExams.length === 0 
                      ? 'Select Target Exams' 
                      : targetExams.join(', ')}
                  </span>
                  <span className={`material-symbols-outlined transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}>
                    expand_more
                  </span>
                </button>

                {isDropdownOpen && (
                  <div className="absolute z-50 top-[calc(100%+8px)] left-0 w-full bg-surface-container border border-outline-variant/30 rounded-xl shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-1 ring-1 ring-white/5">
                    <div className="max-h-80 overflow-y-auto p-2 pb-8 space-y-1 custom-scrollbar">
                      {EXAMS.map((exam) => {
                        const isSelected = targetExams.includes(exam);
                        return (
                          <button
                            key={exam}
                            type="button"
                            onClick={() => {
                              setTargetExams(prev => 
                                prev.includes(exam)
                                  ? prev.filter(e => e !== exam)
                                  : [...prev, exam]
                              );
                            }}
                            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors group ${
                              isSelected 
                                ? 'bg-primary/10 text-primary' 
                                : 'text-on-surface-variant hover:bg-surface-container-highest'
                            }`}
                          >
                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                              isSelected 
                                ? 'bg-primary border-primary shadow-lg shadow-primary/20' 
                                : 'border-outline-variant/60 group-hover:border-primary/50'
                            }`}>
                              {isSelected && <span className="material-symbols-outlined text-white text-[16px] font-bold">check</span>}
                            </div>
                            <span className="text-sm font-medium">{exam}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>


            <div className="space-y-2">
              <label className="font-label text-xs font-bold text-on-surface-variant uppercase tracking-widest" htmlFor="targetYear">
                Target Year
              </label>
              <div className="relative">
                <select
                  id="targetYear"
                  value={targetYear}
                  onChange={(e) => setTargetYear(Number(e.target.value))}
                  className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-xl py-3.5 px-4 text-sm text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all outline-none cursor-pointer"
                >
                  {YEARS.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-container text-primary-fixed font-headline font-bold py-4 rounded-xl shadow-lg hover:bg-on-primary-fixed-variant hover:-translate-y-0.5 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-primary-fixed border-t-transparent rounded-full animate-spin mx-auto" />
              ) : (
                'Continue'
              )}
            </button>
          </form>
        )}

        {/* Step 2: Send OTP */}
        {step === 'otp-send' && (
          <form onSubmit={handleSendOtp} className="space-y-6">
            <div className="text-center mb-2">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-500/10 mb-4">
                <span className="material-symbols-outlined text-2xl text-indigo-400">verified_user</span>
              </div>
              <h2 className="font-headline text-xl font-bold text-on-surface">Verify Student Status</h2>
              <p className="text-sm text-on-surface-variant mt-1">Enter your <code className="text-primary">.ac.in</code> or <code className="text-primary">.edu.in</code> email</p>
            </div>

            <div className="space-y-2">
              <label className="font-label text-xs font-bold text-on-surface-variant uppercase tracking-widest" htmlFor="otpEmail">
                Student Email
              </label>
              <input
                id="otpEmail"
                type="email"
                value={otpEmail}
                onChange={(e) => setOtpEmail(e.target.value)}
                placeholder="name@university.ac.in"
                className="w-full bg-surface-container-highest/50 border border-outline-variant/30 rounded-xl py-3.5 px-4 text-sm text-on-surface placeholder:text-outline/60 focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-headline font-bold py-4 rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
              ) : (
                'Send Verification Code'
              )}
            </button>

            <button
              type="button"
              onClick={handleSkipOtp}
              className="w-full text-sm text-on-surface-variant hover:text-on-surface transition-colors py-2"
            >
              Skip for now
            </button>
          </form>
        )}

        {/* Step 3: Verify OTP */}
        {step === 'otp-verify' && (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div className="text-center mb-2">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-500/10 mb-4">
                <span className="material-symbols-outlined text-2xl text-emerald-400">pin</span>
              </div>
              <h2 className="font-headline text-xl font-bold text-on-surface">Enter Verification Code</h2>
              <p className="text-sm text-on-surface-variant mt-1">
                We sent a 6-digit code to <span className="text-primary font-medium">{otpEmail}</span>
              </p>
            </div>

            <div className="space-y-2">
              <label className="font-label text-xs font-bold text-on-surface-variant uppercase tracking-widest" htmlFor="otpCode">
                OTP Code
              </label>
              <input
                id="otpCode"
                type="text"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="123456"
                maxLength={6}
                className="w-full bg-surface-container-highest/50 border border-outline-variant/30 rounded-xl py-3.5 px-4 text-sm text-on-surface text-center tracking-[0.3em] font-mono text-lg placeholder:text-outline/60 placeholder:tracking-[0.3em] focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-headline font-bold py-4 rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
              ) : (
                'Verify'
              )}
            </button>

            <button
              type="button"
              onClick={() => setStep('otp-send')}
              className="w-full text-sm text-on-surface-variant hover:text-on-surface transition-colors py-2"
            >
              ← Back to email input
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
