'use client';

import { useState, FormEvent } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { toast } from 'sonner';

const EXAMS = ['JEE', 'NEET', 'UGEE', 'BITSAT', 'Other'] as const;
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => currentYear + i);

type Step = 'profile' | 'otp-send' | 'otp-verify' | 'done';

export default function OnboardingModal() {
  const { user, updateUser } = useAuth();
  const [step, setStep] = useState<Step>('profile');
  const [targetExam, setTargetExam] = useState('');
  const [targetYear, setTargetYear] = useState<number>(currentYear);
  const [otpEmail, setOtpEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);

  // Don't show if already onboarded or no user
  if (!user || user.isOnboarded) return null;

  const handleProfileSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!targetExam) {
      toast.error('Please select your target exam');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.patch('/auth/onboard', { targetExam, targetYear });
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-surface-container rounded-2xl p-8 w-full max-w-md shadow-2xl border border-white/5 relative overflow-hidden">
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

            <div className="space-y-2">
              <label className="font-label text-xs font-bold text-on-surface-variant uppercase tracking-widest" htmlFor="targetExam">
                Target Exam
              </label>
              <select
                id="targetExam"
                value={targetExam}
                onChange={(e) => setTargetExam(e.target.value)}
                className="w-full bg-surface-container-highest/50 border border-outline-variant/30 rounded-xl py-3.5 px-4 text-sm text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all outline-none appearance-none cursor-pointer"
              >
                <option value="">Select your exam</option>
                {EXAMS.map((exam) => (
                  <option key={exam} value={exam}>{exam}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="font-label text-xs font-bold text-on-surface-variant uppercase tracking-widest" htmlFor="targetYear">
                Target Year
              </label>
              <select
                id="targetYear"
                value={targetYear}
                onChange={(e) => setTargetYear(Number(e.target.value))}
                className="w-full bg-surface-container-highest/50 border border-outline-variant/30 rounded-xl py-3.5 px-4 text-sm text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all outline-none appearance-none cursor-pointer"
              >
                {YEARS.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
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
