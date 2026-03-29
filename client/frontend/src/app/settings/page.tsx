"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { toast } from "sonner";
import { Sparkles, Database, Flag } from "lucide-react";
import StreakIcon from "@/components/StreakIcon";
import { TARGET_EXAMS as EXAMS } from '@shared/constants';
import MonthlyGoalWidget from "@/components/MonthlyGoalWidget";

/**
 * Settings Page
 * Allows users to update their personal information, target exams, app preferences (haptics),
 * and change their password.
 */
export default function SettingsPage() {

  // Global authentication state and refresh function
  const { user, fetchUser, hapticsEnabled, setHapticsEnabled } = useAuth();

  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    targetScore: "",
    bio: "",
    targetExam: [] as string[],
  });

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || "",
        email: user.email || "",
        targetScore: user.targetScore || "",
        bio: user.bio || "",
        targetExam: user.targetExam || [],
      });
    }
  }, [user]);

  // Handle click outside for dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isDropdownOpen && !(e.target as HTMLElement).closest('.exam-dropdown')) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  /**
   * Input Change Handlers
   * Standard controlled component handlers for form updates.
   */
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  const submitProfile = async () => {
    try {
      setIsSavingProfile(true);
      await api.patch('/auth/profile', profileForm);
      toast.success("Profile updated successfully");
      fetchUser();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsSavingProfile(false);
    }
  };

  /**
   * Password Update Logic
   * Validates matching passwords before submitting to the security endpoint.
   */
  const submitPassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return toast.error("New passwords do not match");
    }

    try {
      setIsSavingPassword(true);
      await api.patch('/auth/password', {
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success("Password changed successfully");
      setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to change password");
    } finally {
      setIsSavingPassword(false);
    }
  };

  // real metrics for the right panel
  const rank = user?.currentStreak || 0;
  const bioLength = profileForm.bio.length;

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row h-full w-full -m-4 md:-m-8">
        {/* Main Content Area */}
        <section className="flex-1 overflow-y-auto px-4 md:px-12 py-6 md:py-10 pb-24 md:pb-10">
          <header className="mb-6 md:mb-10">
            <h2 className="text-3xl font-extrabold tracking-tight text-on-surface mb-2">Edit Profile</h2>
            <p className="text-on-surface-variant max-w-lg">Manage your identity and digital presence across the Vayl ecosystem.</p>
          </header>

          <div className="max-w-3xl space-y-8 pb-10">
            {/* Personal Details Form */}
            <div className="bg-surface-container p-6 md:p-8 rounded-xl space-y-6 md:space-y-8 border border-white/5">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold">Account Information</h3>
                <button
                  onClick={submitProfile}
                  disabled={isSavingProfile}
                  className="bg-gradient-to-br from-primary to-primary-container px-6 py-2 rounded-xl text-xs font-extrabold text-on-primary shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-transform disabled:opacity-50"
                >
                  {isSavingProfile ? "Saving..." : "Save Info"}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Full Name</label>
                  <input
                    name="name"
                    value={profileForm.name}
                    onChange={handleProfileChange}
                    className="w-full bg-surface-container-highest border-none text-on-surface rounded-lg px-4 py-3 focus:ring-1 focus:ring-primary/50 transition-all"
                    type="text"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Email Address</label>
                  <input
                    name="email"
                    value={profileForm.email}
                    onChange={handleProfileChange}
                    className="w-full bg-surface-container-highest border-none text-on-surface rounded-lg px-4 py-3 focus:ring-1 focus:ring-primary/50 transition-all opacity-70"
                    type="email"
                  />
                </div>

                <div className="space-y-2 md:col-span-1">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Target Score</label>
                  <input
                    name="targetScore"
                    value={profileForm.targetScore}
                    onChange={handleProfileChange}
                    className="w-full bg-surface-container-highest border-none text-on-surface rounded-lg px-4 py-3 focus:ring-1 focus:ring-primary/50 transition-all"
                    placeholder="9.5+"
                    type="text"
                  />
                </div>

                <div className="space-y-2 md:col-span-1">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Target Exams</label>
                  <div className="relative exam-dropdown">
                    <button
                      type="button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className={`w-full bg-surface-container-highest/50 border rounded-xl py-3.5 px-4 text-sm flex items-center justify-between transition-all outline-none min-h-[56px] ${
                        isDropdownOpen 
                          ? 'border-primary ring-2 ring-primary/20' 
                          : 'border-outline-variant/30 hover:border-outline-variant/60'
                      }`}
                    >
                      <span className={`flex-1 text-left ${profileForm.targetExam.length === 0 ? 'text-outline-variant' : 'text-on-surface'}`}>
                        {profileForm.targetExam.length === 0 
                          ? 'Select Target Exams' 
                          : profileForm.targetExam.join(', ')}
                      </span>
                      <span className={`material-symbols-outlined shrink-0 ml-2 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}>
                        expand_more
                      </span>
                    </button>

                    {isDropdownOpen && (
                      <div className="absolute z-50 top-[calc(100%+8px)] left-0 w-full bg-surface-container border border-outline-variant/30 rounded-xl shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-1 ring-1 ring-white/5">
                        <div className="max-h-80 overflow-y-auto p-2 pb-8 space-y-1 custom-scrollbar">
                          {(EXAMS as readonly string[]).map((exam: string) => {
                            const isSelected = profileForm.targetExam.includes(exam);
                            return (
                              <button
                                key={exam}
                                type="button"
                                onClick={() => {
                                  const alreadySelected = profileForm.targetExam.includes(exam);
                                  const updated = alreadySelected
                                    ? profileForm.targetExam.filter(e => e !== exam)
                                    : [...profileForm.targetExam, exam];
                                  setProfileForm({ ...profileForm, targetExam: updated });
                                }}
                                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors group ${
                                  isSelected 
                                    ? 'bg-primary/10 text-primary' 
                                    : 'text-on-surface-variant hover:bg-surface-container-highest'
                                }`}
                              >
                                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                                  isSelected 
                                    ? 'bg-primary border-primary shadow-lg shadow-primary/20' 
                                    : 'border-outline-variant/60 group-hover:border-primary/50'
                                }`}>
                                  {isSelected && <span className="material-symbols-outlined text-white text-[12px] font-bold">check</span>}
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

              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Bio</label>
                <textarea
                  name="bio"
                  value={profileForm.bio}
                  onChange={handleProfileChange}
                  className="w-full bg-surface-container-highest border-none text-on-surface rounded-lg px-4 py-3 focus:ring-1 focus:ring-primary/50 transition-all resize-none"
                  placeholder="Write a short bio about yourself..."
                  rows={4}
                />
                <p className="text-[11px] text-on-surface-variant text-right">{bioLength} / 300 characters</p>
              </div>
            </div>

            {/* App Preferences */}
            <div className="bg-surface-container p-6 md:p-8 rounded-xl space-y-6 border border-white/5">
              <h3 className="text-lg font-bold">App Preferences</h3>
              <div className="flex items-center justify-between py-2">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-on-surface">Haptic Feedback</p>
                  <p className="text-xs text-on-surface-variant max-w-xs">Provide physical confirmation for key actions like timer completion and saving resources.</p>
                </div>
                <button
                  onClick={() => setHapticsEnabled(!hapticsEnabled)}
                  className={`w-12 h-6 rounded-full relative transition-all duration-300 ${hapticsEnabled ? 'bg-primary/40' : 'bg-surface-container-highest border border-white/5'}`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full transition-all duration-300 shadow-sm ${hapticsEnabled ? 'right-1 bg-primary' : 'left-1 bg-on-surface-variant'}`}></span>
                </button>
              </div>
            </div>

            {/* Change Password Section */}
            <div className="bg-surface-container p-6 md:p-8 rounded-xl space-y-6 border border-white/5">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold">Change Password</h3>
                <button
                  onClick={submitPassword}
                  disabled={isSavingPassword || !passwordForm.oldPassword || !passwordForm.newPassword}
                  className="bg-surface-container-highest border border-white/10 px-6 py-2 rounded-xl text-xs font-extrabold text-on-surface shadow-lg hover:bg-surface-bright active:scale-95 transition-transform disabled:opacity-50"
                >
                  {isSavingPassword ? "Updating..." : "Update Password"}
                </button>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2 max-w-xs">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Old Password</label>
                  <input
                    name="oldPassword"
                    value={passwordForm.oldPassword}
                    onChange={handlePasswordChange}
                    className="w-full bg-surface-container-highest border-none text-on-surface rounded-lg px-4 py-3 focus:ring-1 focus:ring-primary/50 transition-all"
                    placeholder="••••••••"
                    type="password"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">New Password</label>
                    <input
                      name="newPassword"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      className="w-full bg-surface-container-highest border-none text-on-surface rounded-lg px-4 py-3 focus:ring-1 focus:ring-primary/50 transition-all"
                      placeholder="••••••••"
                      type="password"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Confirm New Password</label>
                    <input
                      name="confirmPassword"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordChange}
                      className="w-full bg-surface-container-highest border-none text-on-surface rounded-lg px-4 py-3 focus:ring-1 focus:ring-primary/50 transition-all"
                      placeholder="••••••••"
                      type="password"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Right Column: Metrics & Goals */}
        <aside className="w-80 bg-surface-container-low p-8 hidden xl:flex flex-col gap-8 h-full overflow-y-auto border-l border-white/5">
          {/* Target Goal Widget */}
          <MonthlyGoalWidget />

          {/* Key Metrics Bento */}
          <div className="space-y-4">
            <h4 className="font-bold text-xs uppercase tracking-widest text-on-surface-variant px-1">Key Metrics</h4>
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-surface-container p-5 rounded-xl flex items-center justify-between border border-white/5">
                <div>
                  <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-tight">Vault Score</p>
                  <p className="text-xl font-extrabold text-on-surface">{user?.targetScore || "N/A"}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Sparkles className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-surface-container p-5 rounded-xl flex items-center justify-between border border-white/5">
                <div>
                  <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-tight">Active Streak</p>
                  <p className="text-xl font-extrabold text-on-surface">{rank} Days</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-orange-600/10 flex items-center justify-center text-primary">
                  <StreakIcon className="w-8 h-8" />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-auto pt-8 flex items-center justify-center opacity-30">
            <span className="text-[10px] font-black tracking-[0.3em] uppercase">Vayl</span>
          </div>
        </aside>
      </div>
    </DashboardLayout>
  );
}
