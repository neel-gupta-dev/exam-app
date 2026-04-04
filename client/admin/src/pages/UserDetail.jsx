import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api';

const fmt = (secs) => {
  if (!secs) return '0m';
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

export default function UserDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const load = async () => {
    try {
      const { data: res } = await api.get(`/admin/users/${id}`);
      setData(res);
    } catch (e) {
      setMsg({ type: 'error', text: e.response?.data?.message || 'Failed to load user' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const changeRole = async (newRole) => {
    if (!confirm(`Change role to ${newRole}?`)) return;
    try {
      await api.patch(`/admin/users/${id}/role`, { role: newRole });
      setMsg({ type: 'success', text: 'Role updated.' });
      load();
    } catch (e) {
      setMsg({ type: 'error', text: e.response?.data?.message || 'Failed' });
    }
  };

  const deleteUser = async () => {
    if (!confirm('Delete this user and ALL their data permanently?')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      nav('/users');
    } catch (e) {
      setMsg({ type: 'error', text: e.response?.data?.message || 'Delete failed' });
    }
  };

  if (loading) return <div className="loading-page"><span className="spinner" /> Loading user...</div>;

  const { user, sessions, resourceCount, noteCount } = data || {};

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="breadcrumb"><Link to="/users">Users</Link> / {user?.name}</div>
          <h1>{user?.name}</h1>
        </div>
        <div className="btn-group">
          <select className="btn" value={user?.role} onChange={e => changeRole(e.target.value)}>
            <option value="student">Role: Student</option>
            <option value="admin">Role: Admin</option>
          </select>
          <button className="btn btn-danger" onClick={deleteUser}>Delete User</button>
          <Link to="/users" className="btn">← Back</Link>
        </div>
      </div>

      {msg.text && (
        <div className={`alert alert-${msg.type === 'error' ? 'error' : 'success'}`}>{msg.text}</div>
      )}

      <div className="two-col">
        {/* Left: Profile */}
        <div>
          <div className="card">
            <div className="card-header">Profile Information</div>
            <div className="card-body">
              <div className="detail-grid">
                {[
                  ['Name', user?.name],
                  ['Email', user?.email],
                  ['Role', user?.role],
                  ['Auth Method', user?.authMethod],
                  ['Vault ID', user?.vaultId || '—'],
                  ['Onboarded', user?.isOnboarded ? 'Yes' : 'No'],
                  ['Verified Student', user?.isVerifiedStudent ? 'Yes' : 'No'],
                  ['Target Exam', user?.targetExam?.join(', ') || '—'],
                  ['Target Year', user?.targetYear || '—'],
                  ['Current Streak', `${user?.currentStreak ?? 0} days`],
                  ['Study Time', fmt(user?.totalActiveSeconds)],
                  ['Level', user?.level || 1],
                  ['Last Login', user?.lastLoginDate || '—'],
                  ['Joined', new Date(user?.createdAt).toLocaleString()],
                  ['Google Classroom', user?.googleClassroomLinked ? 'Linked' : 'No'],
                  ['Google Calendar', user?.googleCalendarLinked ? 'Linked' : 'No'],
                ].map(([label, val]) => (
                  <div className="detail-row" key={label}>
                    <span className="detail-label">{label}</span>
                    <span className="detail-value">{String(val ?? '—')}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">Profile Extended</div>
            <div className="card-body">
              {[
                ['Bio', user?.bio || '—'],
                ['Dream Colleges', user?.profile?.dreamColleges?.join(', ') || '—'],
                ['Coaching', user?.profile?.currentCoaching || '—'],
                ['Academic Level', user?.profile?.academicLevel || '—'],
                ['Target Score', user?.targetScore || '—'],
              ].map(([label, val]) => (
                <div className="detail-row" key={label}>
                  <span className="detail-label">{label}</span>
                  <span className="detail-value">{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Stats + Sessions */}
        <div>
          <div className="stats-grid" style={{ gridTemplateColumns: '1fr 1fr', marginBottom: 16 }}>
            <div className="stat-box success">
              <div className="stat-label">Resources</div>
              <div className="stat-value">{resourceCount}</div>
            </div>
            <div className="stat-box warning">
              <div className="stat-label">Notes</div>
              <div className="stat-value">{noteCount}</div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">Recent Sessions (last 20)</div>
            <div className="card-body" style={{ padding: 0 }}>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Login</th>
                      <th>Logout</th>
                      <th>IP</th>
                      <th>Location</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions?.map(s => (
                      <tr key={s._id}>
                        <td className="td-mono">{new Date(s.loginAt).toLocaleString()}</td>
                        <td className="td-mono">{s.logoutAt ? new Date(s.logoutAt).toLocaleString() : '—'}</td>
                        <td className="td-mono">{s.ipAddress || '—'}</td>
                        <td>{s.location ? `${s.location.city}, ${s.location.country}` : '—'}</td>
                        <td>
                          {!s.logoutAt
                            ? <span className="badge badge-green">ACTIVE</span>
                            : <span className="badge badge-gray">CLOSED</span>}
                        </td>
                      </tr>
                    ))}
                    {!sessions?.length && (
                      <tr><td colSpan={5} className="text-center text-muted" style={{ padding: 14 }}>No sessions.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
