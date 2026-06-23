import { useState, useEffect, useCallback, useContext } from 'react';
import api from '../api';
import Pagination from '../components/Pagination';
import { Link } from 'react-router-dom';
import { AuthCtx } from '../App';

export default function Sessions() {
  const [data, setData] = useState({ sessions: [], total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState('');
  const [page, setPage] = useState(1);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const { user } = useContext(AuthCtx);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 25 };
      if (active) params.active = active;
      const { data: res } = await api.get('/admin/sessions', { params });
      setData(res);
    } catch (e) {
      setMsg({ type: 'error', text: 'Failed to load sessions' });
    } finally {
      setLoading(false);
    }
  }, [page, active]);

  useEffect(() => { load(); }, [load]);

  const forceClose = async (id) => {
    if (!confirm('Force-close this session?')) return;
    try {
      await api.delete(`/admin/sessions/${id}`);
      setMsg({ type: 'success', text: 'Session closed.' });
      load();
    } catch (e) {
      setMsg({ type: 'error', text: e.response?.data?.message || 'Failed' });
    }
  };

  const duration = (s) => {
    if (!s.logoutAt) {
      const ms = new Date() - new Date(s.loginAt);
      const m = Math.floor(ms / 60000);
      return m > 60 ? `${Math.floor(m/60)}h ${m%60}m (live)` : `${m}m (live)`;
    }
    const ms = new Date(s.logoutAt) - new Date(s.loginAt);
    const m = Math.floor(ms / 60000);
    return m > 60 ? `${Math.floor(m/60)}h ${m%60}m` : `${m}m`;
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="breadcrumb">Home / Sessions</div>
          <h1>Sessions</h1>
        </div>
        <span className="text-muted">{data.total} records</span>
      </div>

      {msg.text && (
        <div className={`alert alert-${msg.type === 'error' ? 'error' : 'success'}`}>
          {msg.text} <button style={{ float:'right', background:'none', border:'none', cursor:'pointer' }} onClick={() => setMsg({type:'',text:''})}>✕</button>
        </div>
      )}

      <div className="toolbar">
        <select value={active} onChange={e => { setActive(e.target.value); setPage(1); }}>
          <option value="">All Sessions</option>
          <option value="true">Active Only</option>
          <option value="false">Closed Only</option>
        </select>
        <button className="btn" onClick={load}>↻ Refresh</button>
      </div>

      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <div className="loading-page"><span className="spinner" /> Loading...</div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Login Time</th>
                    <th>Duration</th>
                    <th>IP Address</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {data.sessions.map(s => (
                    <tr key={s._id}>
                      <td>
                        {s.userId
                          ? <Link to={`/users/${s.userId._id}`}>{s.userId.name}</Link>
                          : <span className="text-muted">Deleted</span>}
                      </td>
                      <td className="td-mono">{s.userId?.email || '—'}</td>
                      <td className="td-mono">{new Date(s.loginAt).toLocaleString()}</td>
                      <td>{duration(s)}</td>
                      <td className="td-mono">{s.ipAddress || '—'}</td>
                      <td>{s.location ? `${s.location.city}, ${s.location.country}` : '—'}</td>
                      <td>
                        {!s.logoutAt
                          ? <span className="badge badge-green">ACTIVE</span>
                          : <span className="badge badge-gray">CLOSED</span>}
                      </td>
                      <td>
                        {!s.logoutAt && user?.role !== 'subAdmin' && (
                          <button className="btn btn-sm btn-danger" onClick={() => forceClose(s._id)}>
                            Force Close
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {data.sessions.length === 0 && (
                    <tr><td colSpan={8} className="text-center text-muted" style={{ padding: 20 }}>No sessions found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <Pagination page={data.page} pages={data.pages} onPage={setPage} />
    </div>
  );
}
