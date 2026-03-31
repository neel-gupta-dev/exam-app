import { Metadata } from 'next';
import Link from 'next/link';
import { ShieldAlert, UserPlus, ArrowRight } from 'lucide-react';
import ProtocolRetry from '@/components/ProtocolRetry';
import { API_BASE_URL } from '@/config/env';

async function getProfile(rollNo: string) {
  'use cache';
  try {
    const res = await fetch(`${API_BASE_URL}/public/profile/${rollNo}`, {
      next: { revalidate: 10 },
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ rollNo: string }> }): Promise<Metadata> {
  const { rollNo } = await params;
  const profile = await getProfile(rollNo);
  if (!profile) return { title: 'Vault Not Found | Vayl' };

  return {
    title: `${profile.name}'s Academic Vault | Vayl`,
    description: `Level ${profile.level} Scholar with ${profile.streak} day streak. Explore their academic journey.`,
    openGraph: {
      title: `${profile.name} - ${profile.targetExam} Aspirant`,
      description: `Scholar Level ${profile.level} | ${profile.totalStudyHours}h Focused | ${profile.streak} Day Streak`,
      type: 'profile',
    }
  };
}

export default async function PublicProfilePage({ params }: { params: Promise<{ rollNo: string }> }) {
  const { rollNo } = await params;
  const profile = await getProfile(rollNo);

  if (!profile) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-primary/10 p-6 rounded-3xl mb-8 border border-primary/20 shadow-2xl shadow-primary/10">
          <ShieldAlert className="w-12 h-12 text-primary" />
        </div>
        <h1 className="text-4xl font-headline font-extrabold text-white mb-4 tracking-tighter">Vault Protocol Error</h1>
        <p className="text-on-surface-variant max-w-sm mb-2 font-body leading-relaxed text-center">
          The Vault ID <span className="text-primary font-mono font-bold">#{rollNo.replace('#', '')}</span> was not resolved by the protocol.
        </p>
        <p className="text-on-surface-variant/60 text-xs mb-10 font-body text-center">
          The node may be offline or the registry is still propagating.
        </p>
        <div className="flex flex-col gap-4 w-full max-w-xs mx-auto">
          <ProtocolRetry />
          <Link
            href="/signup"
            className="px-8 py-3.5 bg-gradient-to-br from-primary to-primary-container text-on-primary font-headline font-bold rounded-xl active:scale-95 transition-all shadow-xl shadow-primary/20 flex items-center gap-2 group justify-center text-sm"
          >
            Create New Vault
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface selection:bg-primary selection:text-on-primary font-body overflow-x-hidden relative">
      <header className="fixed top-0 w-full z-50 bg-surface-container-low border-b border-white/5">
        <nav className="flex justify-between items-center w-full px-8 h-16 max-w-7xl mx-auto">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold tracking-tighter text-indigo-400 font-headline">
              Vayl
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/signup"
              className="px-5 py-2 bg-primary/10 text-primary border border-primary/20 rounded-xl font-headline font-bold text-xs hover:bg-primary hover:text-white transition-all active:scale-95"
            >
              Join the Hub
            </Link>
          </div>
        </nav>
      </header>

      <main className="pt-24 pb-20 max-w-5xl mx-auto px-4 md:px-6 space-y-10 md:space-y-16">
        {/* Hero Section: Virtual ID Card Style */}
        <section className="flex flex-col items-center justify-center text-center space-y-10">
          <div className="w-full max-w-2xl bg-surface-container-low rounded-xl p-1 shadow-2xl shadow-primary/5 relative overflow-hidden group border border-white/5">
            {/* Ambient Glows */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/5 rounded-full -ml-24 -mb-24 blur-3xl"></div>

            <div className="relative bg-surface-container border border-outline-variant/10 rounded-lg p-6 md:p-12 flex flex-col md:flex-row items-center gap-6 md:gap-10">
              {/* Profile Image with Level Badge */}
              <div className="relative">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-lg overflow-hidden border-2 border-primary/20 p-1 bg-surface-container-highest/30">
                  <div className="w-full h-full rounded bg-gradient-to-br from-primary/10 to-surface-container-high flex items-center justify-center text-5xl font-black text-white selection:bg-transparent">
                    {profile.name.charAt(0)}
                  </div>
                </div>
                <div className="absolute -bottom-3 -right-3 bg-primary text-on-primary font-headline font-extrabold px-3 py-1 rounded text-sm shadow-lg">
                  LVL {profile.level}
                </div>
              </div>

              {/* User Info Details */}
              <div className="flex-1 text-center md:text-left">
                <div className="space-y-1 mb-6">
                  <h1 className="text-4xl md:text-5xl font-headline font-extrabold tracking-tighter text-on-surface">
                    {profile.name}
                  </h1>
                  <p className="text-primary font-medium tracking-wide uppercase text-xs">
                    {profile.targetExam} Aspirant
                  </p>
                </div>
                <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-8">
                  {profile.isVerified && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-container-highest rounded-full text-xs font-medium text-on-surface-variant">
                      <span className="material-symbols-outlined text-[16px]">verified_user</span>
                      <span>Verified Architect</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-container-highest rounded-full text-xs font-medium text-on-surface-variant">
                    <span className="material-symbols-outlined text-[16px]">location_on</span>
                    <span>Knowledge Hub</span>
                  </div>
                </div>
                <Link
                  href="/signup"
                  className="w-full md:w-auto px-8 py-4 bg-gradient-to-br from-primary to-primary-container text-on-primary font-headline font-bold rounded-xl active:scale-95 transition-all shadow-xl shadow-primary/10 flex items-center justify-center gap-2 group"
                >
                  <UserPlus className="w-4 h-4" />
                  Create Your Own Vault
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Activity Summary: Bento Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <div className="bg-surface-container-low p-6 md:p-8 rounded-xl flex flex-col items-center justify-center text-center space-y-3 border border-white/5">
            <span className="text-on-surface-variant text-sm font-medium tracking-tight opacity-60">Total Study Hours</span>
            <span className="text-4xl font-headline font-extrabold text-on-surface tracking-tighter">{profile.totalStudyHours}h</span>
            <div className="w-full h-1 bg-surface-variant rounded-full overflow-hidden">
              <div className="h-full bg-primary" style={{ width: '75%' }}></div>
            </div>
          </div>

          <div className="bg-surface-container-low p-6 md:p-8 rounded-xl flex flex-col items-center justify-center text-center space-y-3 border border-white/5">
            <span className="text-on-surface-variant text-sm font-medium tracking-tight opacity-60">Learning Streak</span>
            <div className="flex items-end gap-1">
              <span className="text-4xl font-headline font-extrabold text-on-surface tracking-tighter">{profile.streak}</span>
              <span className="text-primary font-bold mb-1">days</span>
            </div>
            <div className="flex gap-1">
              {[...Array(7)].map((_, i) => (
                <div key={i} className={`w-2 h-2 rounded-full ${i < (profile.streak % 7 || 7) ? 'bg-primary' : 'bg-surface-variant'}`} />
              ))}
            </div>
          </div>

          <div className="bg-surface-container-low p-6 md:p-8 rounded-xl flex flex-col items-center justify-center text-center space-y-3 border border-white/5">
            <span className="text-on-surface-variant text-sm font-medium tracking-tight opacity-60">Resources Saved</span>
            <span className="text-4xl font-headline font-extrabold text-on-surface tracking-tighter">{profile.resourceCount}</span>
            <span className="text-xs text-on-surface-variant font-bold text-primary">+8 this week</span>
          </div>
        </section>

        {/* Achievement Badges Section */}
        <section className="space-y-8">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-headline font-bold text-on-surface tracking-tight">Achievement Badges</h2>
            <div className="h-px flex-1 bg-surface-variant opacity-30"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {profile.badges.map((badge: any) => (
              <div key={badge.id} className={`group bg-surface-container p-6 rounded-xl text-center space-y-4 hover:bg-surface-container-high transition-all border border-white/5 ${badge.locked ? 'opacity-40' : ''}`}>
                <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center transition-transform ${badge.locked ? 'bg-surface-variant/30 grayscale' : 'bg-primary/10 group-hover:scale-110'}`}>
                  <span className={`material-symbols-outlined text-3xl ${badge.locked ? 'text-on-surface-variant' : 'text-primary'}`}>
                    {badge.icon}
                  </span>
                </div>
                <div>
                  <p className={`font-headline font-bold text-sm ${badge.locked ? 'text-on-surface-variant' : 'text-on-surface'}`}>
                    {badge.name}
                  </p>
                  <p className="text-xs text-on-surface-variant mt-1 opacity-60">
                    {badge.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Activity Insight Section */}
        <section className="bg-surface-container-low p-6 md:p-8 rounded-xl border border-white/5 overflow-hidden relative group">
          <div className="absolute bottom-0 left-0 w-full flex items-end justify-between px-10 h-24 opacity-20 group-hover:opacity-40 transition-opacity duration-700">
            {[40, 60, 30, 80, 50, 95, 70].map((h, i) => (
              <div key={i} className="w-10 bg-primary/50 rounded-t-sm" style={{ height: `${h}%` }} />
            ))}
          </div>
          <div className="relative z-10 text-center py-6">
            <p className="text-3xl font-headline font-extrabold text-on-surface tracking-tighter">Peak Focus Journey</p>
            <p className="text-sm text-on-surface-variant mt-2 font-medium opacity-70">Exploring scholar milestones and academic data clusters.</p>
          </div>
        </section>

        {/* ID Footer */}
        <div className="pt-12 border-t border-white/5 flex flex-col items-center">
          <div className="font-mono text-[10px] text-outline uppercase tracking-[0.4em] opacity-40">
            Vault Protocol ID: #{profile.rollNo.replace('#', '')}
          </div>
        </div>
      </main>

      <footer className="w-full py-12 border-t border-white/5 bg-surface-container-low">
        <div className="flex flex-col items-center justify-center space-y-4 w-full">
          <span className="text-lg font-bold text-on-surface font-headline opacity-80">Vayl</span>
          <div className="flex gap-6 text-on-surface-variant text-sm font-body opacity-60">
            <Link className="hover:text-primary transition-colors" href="/privacy-policy">Privacy</Link>
            <Link className="hover:text-primary transition-colors" href="/terms">Terms</Link>
            <Link className="hover:text-primary transition-colors" href="/contact">Support</Link>
          </div>
          <p className="text-on-surface-variant text-xs font-body opacity-40">© 2024 Vayl. The Silent Architect.</p>
        </div>
      </footer>
    </div>
  );
}
