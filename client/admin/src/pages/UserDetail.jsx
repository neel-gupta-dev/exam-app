import { useParams, Link, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import api from '../api';
import useUserAnalytics from '../hooks/useUserAnalytics';
import { AuthCtx } from '../App';
/**
 * UserDetail Component (God Mode Analytics - Refactored for Native CSS)
 * 
 * Fixed the UI to use the platform's native style.css components instead of 
 * missing Tailwind utilities. Restores the sidebar/topbar integration while 
 * maintaining the deep-dive analytics.
 */
export default function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { analytics, loading, error, refetch } = useUserAnalytics(id);
  const { user: currentUser } = useContext(AuthCtx);

  const handleDelete = async () => {
    if (!confirm('Permanently delete this user and ALL data? This CANNOT be undone.')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      navigate('/users');
    } catch (err) {
      alert('Delete failed: ' + (err.response?.data?.message || err.message));
    }
  };

  if (loading) return (
    <div className="loading-page">
      <span className="spinner" /> Loading God-Mode Analytics...
    </div>
  );

  if (error) return (
    <div className="page text-center">
      <div className="alert alert-error">{error}</div>
      <button onClick={refetch} className="btn btn-primary">Retry Connection</button>
    </div>
  );

  const { user, vitals, timeline, heatmap, testAttempts = [] } = analytics;

  // Helper for dates
  const formatDate = (date) => date ? new Date(date).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  }) : '—';

  // Heatmap intensity logic (GitHub Green Scale)
  const getIntensity = (count) => {
    if (count === 0) return '#f3f4f6'; // Gray-100
    if (count <= 2) return '#dcfce7'; // Green-100
    if (count <= 5) return '#86efac'; // Green-300
    if (count <= 10) return '#22c55e'; // Green-500
    return '#166534'; // Green-800
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="breadcrumb"><Link to="/users">Users</Link> / {user.name} / Analytics</div>
          <h1>{user.name} <span className="text-muted" style={{ fontWeight: 400, marginLeft: 8 }}>({user.email})</span></h1>
          <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4, fontFamily: 'monospace' }}>User ID: {user._id}</div>
        </div>
        <div className="btn-group">
          <button onClick={refetch} className="btn">↻ Refresh</button>
          {currentUser?.role !== 'subAdmin' && (
            <button onClick={handleDelete} className="btn btn-danger">Delete Account</button>
          )}
          <Link to="/users" className="btn">← Back to List</Link>
        </div>
      </div>

      {/* SECTION 1: VITALS HEADER */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="stat-box" style={{ borderLeftColor: '#4f46e5' }}>
          <div className="stat-label">Study Time</div>
          <div className="stat-value">{vitals.totalHours}h</div>
          <div className="stat-sub">Cumulative Hours</div>
        </div>
        <div className="stat-box warning">
          <div className="stat-label">Current Streak</div>
          <div className="stat-value">{vitals.currentStreak}d</div>
          <div className="stat-sub">Daily Login Chain</div>
        </div>
        <div className="stat-box success">
          <div className="stat-label">Focus Sessions</div>
          <div className="stat-value">{vitals.totalFocusSessions}</div>
          <div className="stat-sub">Completed Sessions</div>
        </div>
        <div className="stat-box purple">
          <div className="stat-label">Flashcards</div>
          <div className="stat-value">{vitals.totalFlashcards}</div>
          <div className="stat-sub">Mastery Queue</div>
        </div>
      </div>

      <div className="two-col">
        {/* LEFT COL: AUDIT LOG */}
        <div>
          <div className="card">
            <div className="card-header">
              Activity Audit Trail (Last 50 Logs)
              <span className="badge badge-blue">Live Feed</span>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              <div className="table-wrap" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <table>
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Action</th>
                      <th>Context / Metadata</th>
                    </tr>
                  </thead>
                  <tbody>
                    {timeline.map(log => (
                      <tr key={log._id}>
                        <td className="td-mono">{formatDate(log.createdAt)}</td>
                        <td>
                          <span className={`badge ${getActionBadge(log.actionType)}`}>
                            {log.actionType.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td style={{ fontSize: '11px', color: '#666' }}>
                          {formatMetadata(log.metadata)}
                        </td>
                      </tr>
                    ))}
                    {!timeline.length && (
                      <tr><td colSpan={3} className="text-center text-muted" style={{ padding: 20 }}>No logs found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="card" style={{ marginTop: '16px' }}>
            <div className="card-header">
              CBT Test Results
              <span className="badge badge-purple">{testAttempts.length} Attempts</span>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              <div className="table-wrap" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Test Name</th>
                      <th>Score</th>
                      <th>Stats</th>
                    </tr>
                  </thead>
                  <tbody>
                    {testAttempts.map(att => (
                      <tr key={att._id}>
                        <td className="td-mono">{formatDate(att.createdAt)}</td>
                        <td style={{ fontWeight: 600 }}>{att.testId?.title || 'Unknown Test'}</td>
                        <td>
                          {att.status === 'evaluating' ? (
                            <span style={{ color: '#d97706', fontWeight: 'bold' }}>Queued</span>
                          ) : (
                            <>
                              <strong style={{ color: (att.totalScore ?? 0) >= 0 ? '#166534' : '#991b1b' }}>{att.totalScore ?? '-'}</strong>
                              <span className="text-muted" style={{ fontSize: '11px' }}> / {att.maxPossibleScore || att.testId?.totalMarks || '?'}</span>
                            </>
                          )}
                        </td>
                        <td style={{ fontSize: '11px' }}>
                          {att.status === 'evaluating' ? (
                            <span className="text-muted">Evaluating...</span>
                          ) : (
                            <>
                              <span style={{ color: '#4f46e5', fontWeight: 600 }}>{att.percentage ?? 0}%</span> &nbsp;
                              <span style={{ color: '#64748b' }}>{Math.round((att.answers || []).reduce((sum, answer) => sum + (answer.timeSpentSeconds || 0), 0) / 60)}m</span> &nbsp;
                              <span style={{ color: '#64748b' }}>{(att.answers || []).reduce((sum, answer) => sum + (answer.visitCount || 0), 0)} visits</span>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                    {!testAttempts.length && (
                      <tr><td colSpan={4} className="text-center text-muted" style={{ padding: 20 }}>No tests attempted yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COL: HEATMAP & ACCOUNT INFO */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div className="card">
            <div className="card-header">30-Day Activity Heatmap</div>
            <div className="card-body">
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(7, 1fr)', 
                gap: '4px',
                marginBottom: '10px'
              }}>
                {/* Visualizing 30 days */}
                {Array.from({ length: 30 }).map((_, i) => {
                  const date = new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                  const dayData = heatmap.find(h => h.date === date);
                  const count = dayData ? dayData.count : 0;
                  
                  return (
                    <div 
                      key={date} 
                      title={`${count} actions on ${date}`}
                      style={{ 
                        aspectRatio: '1', 
                        backgroundColor: getIntensity(count), 
                        borderRadius: '2px',
                        border: '1px solid rgba(0,0,0,0.05)'
                      }}
                    />
                  );
                })}
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '4px', fontSize: '10px', color: '#888' }}>
                <span>Less</span>
                {[0, 2, 5, 10, 11].map(v => (
                  <div key={v} style={{ width: 10, height: 10, borderRadius: 2, background: getIntensity(v) }} />
                ))}
                <span>More</span>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">System Profile</div>
            <div className="card-body">
              <div className="detail-grid">
                {[
                  ['Role', user.role],
                  ['Exam', user.targetExam?.join(', ') || 'N/A'],
                  ['Onboarded', user.isOnboarded ? 'Yes' : 'No'],
                  ['Joined', new Date(user.createdAt).toLocaleDateString()],
                  ['Last Active', formatDate(user.lastActiveAt)],
                ].map(([label, val]) => (
                  <div className="detail-row" key={label}>
                    <span className="detail-label">{label}</span>
                    <span className="detail-value" style={{ fontWeight: 600 }}>{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="alert alert-info">
            <strong>Admin Note:</strong> This user's study data is derived from the ActivityLog time-series. If you suspect data discrepancies, check the audit trail on the left.
          </div>
        </div>
      </div>
    </div>
  );
}

// --- HELPERS ---

const getActionBadge = (type) => {
  if (type.includes('CHECKED')) return 'badge-green';
  if (type.includes('SESSION')) return 'badge-blue';
  if (type.includes('FLASHCARD')) return 'badge-purple';
  if (type.includes('RESOURCE')) return 'badge-yellow';
  return 'badge-gray';
};

const formatMetadata = (meta) => {
  if (!meta) return '—';
  const parts = [];
  if (meta.subject) parts.push(meta.subject);
  if (meta.chapterName) parts.push(`Ch: ${meta.chapterName}`);
  if (meta.timeSpentMs) parts.push(`${(meta.timeSpentMs / 60000).toFixed(1)} mins`);
  return parts.length ? parts.join(' • ') : JSON.stringify(meta);
};
