import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

const fmt = (secs) => {
  if (!secs) return '0h';
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const load = async () => {
    try {
      const { data } = await api.get('/admin/stats');
      setStats(data);
      setLastRefresh(new Date());
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <div className="loading-page"><span className="spinner" /> Loading dashboard...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="breadcrumb">Home</div>
          <h1>Dashboard</h1>
        </div>
        <button className="btn" onClick={load}>↻ Refresh</button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {stats && (
        <>
          {/* Stat Boxes */}
          <div className="stats-grid">
            <div className="stat-box">
              <div className="stat-label">Total Users</div>
              <div className="stat-value">{stats.totalUsers}</div>
              <div className="stat-sub">+{stats.recentSignups} this week</div>
            </div>
            <div className="stat-box success">
              <div className="stat-label">Active Sessions</div>
              <div className="stat-value">{stats.activeSessions}</div>
              <div className="stat-sub">of {stats.totalSessions} total</div>
            </div>
            <div className="stat-box warning">
              <div className="stat-label">Resources</div>
              <div className="stat-value">{stats.totalResources}</div>
              <div className="stat-sub">Across all users</div>
            </div>
            <div className="stat-box purple">
              <div className="stat-label">Feedback</div>
              <div className="stat-value">{stats.totalFeedback}</div>
              <div className="stat-sub">Ratings received</div>
            </div>
            <div className="stat-box teal">
              <div className="stat-label">Google Users</div>
              <div className="stat-value">{stats.googleUsers}</div>
              <div className="stat-sub">{stats.localUsers} email/password</div>
            </div>
            <div className="stat-box gray">
              <div className="stat-label">Admins</div>
              <div className="stat-value">{stats.adminCount}</div>
              <div className="stat-sub">Admin accounts</div>
            </div>
          </div>

          {/* Top Users Table */}
          <div className="card">
            <div className="card-header">
              🏆 Top Users by Study Time
              <Link to="/users" className="btn btn-sm">View all users →</Link>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Study Time</th>
                      <th>Streak</th>
                      <th>Level</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.topUsers.map((u, i) => (
                      <tr key={u._id}>
                        <td>{i + 1}</td>
                        <td>{u.name}</td>
                        <td className="td-mono">{u.email}</td>
                        <td>{fmt(u.totalActiveSeconds)}</td>
                        <td>{u.currentStreak} days</td>
                        <td>{u.level}</td>
                        <td>
                          <Link to={`/users/${u._id}`} className="btn btn-sm btn-primary">View</Link>
                        </td>
                      </tr>
                    ))}
                    {stats.topUsers.length === 0 && (
                      <tr><td colSpan={7} className="text-center text-muted">No users yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 8 }}>
            Last refreshed: {lastRefresh.toLocaleTimeString()}
          </div>
        </>
      )}
    </div>
  );
}
