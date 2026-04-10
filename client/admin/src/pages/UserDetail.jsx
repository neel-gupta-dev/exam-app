import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api';
import useUserAnalytics from '../hooks/useUserAnalytics';

/**
 * UserDetail Component (God Mode Analytics)
 * 
 * A comprehensive deep-dive into individual student activity.
 * Replaces the legacy profile view with high-fidelity telemetry and 
 * time-series visualizations.
 */
export default function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { analytics, loading, error, refetch } = useUserAnalytics(id);

  const handleDelete = async () => {
    if (!confirm('Permanently delete this user and all their associated data? This cannot be undone.')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      navigate('/users');
    } catch (err) {
      alert('Failed to delete user: ' + (err.response?.data?.message || err.message));
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  if (error) return (
    <div className="p-8 text-center">
      <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-100">
        {error}
      </div>
      <button onClick={refetch} className="mt-4 text-indigo-600 font-bold hover:underline">Try Again</button>
    </div>
  );

  const { user, vitals, timeline, heatmap } = analytics;

  // Helper for dates
  const formatDate = (date) => new Intl.DateTimeFormat('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  }).format(new Date(date));

  // Helper for heatmap colors (GitHub Green mapping)
  const getHeatmapColor = (count) => {
    if (count === 0) return 'bg-gray-100';
    if (count <= 2) return 'bg-green-100';
    if (count <= 5) return 'bg-green-300';
    if (count <= 10) return 'bg-green-500';
    return 'bg-green-600';
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 font-sans">
      {/* breadcrumbs & Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <nav className="text-sm text-gray-400 mb-2">
            <Link to="/users" className="hover:text-indigo-600 transition-colors">Users</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-600 font-medium">User Analytics</span>
          </nav>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">{user.name}</h1>
          <p className="text-gray-500 font-medium mt-1">{user.email} • ID: {user._id.slice(-8).toUpperCase()}</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={refetch}
            className="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-all font-bold text-sm"
          >
            Refetch Data
          </button>
          <button 
            onClick={handleDelete}
            className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all font-bold text-sm"
          >
            Delete Account
          </button>
        </div>
      </header>

      {/* SECTION 1: VITALS HEADER */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <VitalCard 
          label="Study Hours" 
          value={`${vitals.totalHours}h`} 
          color="text-indigo-600" 
          sub="Cumulative" 
          trend={vitals.totalHours > 100}
        />
        <VitalCard 
          label="Current Streak" 
          value={`${vitals.currentStreak}d`} 
          color="text-orange-600" 
          sub="Consecutive" 
          trend={vitals.currentStreak > 7}
        />
        <VitalCard 
          label="Focus Sessions" 
          value={vitals.totalFocusSessions} 
          color="text-emerald-600" 
          sub="Completed" 
          trend={vitals.totalFocusSessions > 50}
        />
        <VitalCard 
          label="Flashcards" 
          value={vitals.totalFlashcards} 
          color="text-purple-600" 
          sub="In Mastery" 
          trend={vitals.totalFlashcards > 200}
        />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT: HEATMAP + DETAILS */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* SECTION 2: ACTIVITY HEATMAP */}
          <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span className="w-2 h-6 bg-green-500 rounded-full"></span>
              30-Day Activity Heatmap
            </h3>
            
            <div className="grid grid-cols-7 sm:grid-cols-10 md:grid-cols-15 gap-2">
              {/* Note: In a real app we'd map exactly to the 30 dates. 
                  Here we generate the grid based on the 30-day window. */}
              {Array.from({ length: 30 }).map((_, i) => {
                const date = new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                const dayData = heatmap.find(h => h.date === date);
                const count = dayData ? dayData.count : 0;
                
                return (
                  <div key={date} className="group relative">
                    <div className={`aspect-square w-full rounded-md border border-black/5 transition-transform hover:scale-110 ${getHeatmapColor(count)}`}></div>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-900 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-10">
                      {count} actions on {date}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex items-center justify-end gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
              <span>Less</span>
              <div className="w-3 h-3 rounded bg-gray-100"></div>
              <div className="w-3 h-3 rounded bg-green-100"></div>
              <div className="w-3 h-3 rounded bg-green-300"></div>
              <div className="w-3 h-3 rounded bg-green-500"></div>
              <div className="w-3 h-3 rounded bg-green-600"></div>
              <span>More</span>
            </div>
          </section>

          {/* SECTION 3: AUDIT TRAIL FEED */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800">Recent Activity Feed</h3>
              <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-1 rounded font-black uppercase tracking-widest">Live Logs</span>
            </div>
            <div className="divide-y divide-gray-50 max-h-[600px] overflow-y-auto">
              {timeline.map((log, idx) => (
                <div key={log._id} className="p-4 hover:bg-gray-50 transition-colors flex gap-4 text-sm group">
                  <div className="mt-1">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getActionStyle(log.actionType)}`}>
                      {idx + 1}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <p className="font-bold text-gray-900">{formatAction(log.actionType)}</p>
                      <time className="text-[10px] font-black text-gray-300 group-hover:text-gray-500 uppercase">{formatDate(log.createdAt)}</time>
                    </div>
                    {blockMetadata(log.metadata) && (
                      <p className="text-xs text-gray-400 mt-1 line-clamp-1">{blockMetadata(log.metadata)}</p>
                    )}
                  </div>
                </div>
              ))}
              {!timeline.length && <div className="p-12 text-center text-gray-400 font-medium">No activity logged yet.</div>}
            </div>
          </section>
        </div>

        {/* RIGHT: ACCOUNT DETAILS */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 border-b border-gray-50 pb-2">Account Vitals</h4>
            
            <dl className="space-y-4">
              <DetailItem label="Status" value={user.isOnboarded ? 'Active Onboarded' : 'Pending Onboarding'} color="text-emerald-500" />
              <DetailItem label="Target Exam" value={user.targetExam?.join(', ') || 'N/A'} />
              <DetailItem label="Member Since" value={new Date(user.createdAt).toLocaleDateString()} />
              <DetailItem label="Last Login" value={user.lastLoginDate ? new Date(user.lastLoginDate).toLocaleDateString() : 'Never'} />
              <DetailItem label="Last Active" value={user.lastActiveAt ? formatDate(user.lastActiveAt) : 'N/A'} />
            </dl>
          </div>

          <div className="bg-indigo-900 p-6 rounded-2xl text-white shadow-xl shadow-indigo-900/20">
            <div className="text-[10px] font-black uppercase tracking-tighter opacity-50 mb-1">God Mode Note</div>
            <p className="text-sm font-medium leading-relaxed">
              This page displays raw telemetry coupled with derived stats. Use this for debugging user state or verifying study credit distribution.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

// --- SUBCOMPONENTS ---

function VitalCard({ label, value, color, sub, trend }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md group">
      <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 group-hover:text-gray-500 transition-colors">{label}</p>
      <div className="flex items-end justify-between">
        <h2 className={`text-3xl font-black ${color} tracking-tighter`}>{value}</h2>
        {trend && <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse mb-2"></span>}
      </div>
      <p className="text-[10px] text-gray-300 font-bold mt-1 uppercase tracking-tighter">{sub}</p>
    </div>
  );
}

function DetailItem({ label, value, color = "text-gray-900" }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <dt className="text-gray-400 font-medium">{label}</dt>
      <dd className={`font-black ${color}`}>{value}</dd>
    </div>
  );
}

// --- HELPERS ---

const formatAction = (type) => type.replace(/_/g, ' ').toLowerCase();

const getActionStyle = (type) => {
  if (type.includes('CHECKED')) return 'bg-emerald-50 text-emerald-600';
  if (type.includes('SESSION')) return 'bg-indigo-50 text-indigo-600';
  if (type.includes('FLASHCARD')) return 'bg-purple-50 text-purple-600';
  if (type.includes('RESOURCE')) return 'bg-orange-50 text-orange-600';
  return 'bg-gray-50 text-gray-500';
};

const blockMetadata = (meta) => {
  if (!meta) return null;
  const parts = [];
  if (meta.subject) parts.push(meta.subject);
  if (meta.chapterName) parts.push(`Ch: ${meta.chapterName}`);
  if (meta.timeSpentMs) parts.push(`${(meta.timeSpentMs / 60000).toFixed(1)} mins`);
  return parts.length ? parts.join(' • ') : JSON.stringify(meta);
};
