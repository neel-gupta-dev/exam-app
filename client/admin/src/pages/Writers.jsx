import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

export default function Writers() {
  const [writers, setWriters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/writers');
      setWriters(data);
      setMsg({ type: '', text: '' });
    } catch (e) {
      setMsg({ type: 'error', text: e.response?.data?.message || 'Failed to load writers' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const roleBadge = (role) => {
    if (role === 'admin') return <span className="badge badge-red">Admin</span>;
    if (role === 'writer') return <span className="badge badge-blue">Writer</span>;
    return <span className="badge badge-gray">{role}</span>;
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="breadcrumb">Home / Writers</div>
          <h1>Writer Management</h1>
        </div>
        <div className="text-muted">{writers.length} authorized writers</div>
      </div>

      {msg.text && (
        <div className={`alert alert-${msg.type === 'error' ? 'error' : 'success'}`}>
          {msg.text} 
          <button style={{ float:'right', background:'none', border:'none', cursor:'pointer' }} onClick={() => setMsg({type:'',text:''})}>✕</button>
        </div>
      )}

      <div className="toolbar">
        <div className="text-muted text-sm">
          Displays all users with <strong>writer</strong> or <strong>admin</strong> roles and their total published blog posts.
        </div>
        <button className="btn" onClick={load}>↻ Refresh</button>
      </div>

      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-wrap">
            {loading ? (
              <div className="loading-page"><span className="spinner" /> Loading...</div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Published Posts</th>
                    <th>Account Created</th>
                    <th>Last Active</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {writers.map(w => (
                    <tr key={w._id}>
                      <td><Link to={`/users/${w._id}`}>{w.name}</Link></td>
                      <td className="td-mono">{w.email}</td>
                      <td>{roleBadge(w.role)}</td>
                      <td>
                        <strong>{w.postCount}</strong>
                      </td>
                      <td>{new Date(w.createdAt).toLocaleDateString()}</td>
                      <td>{w.lastActiveAt ? new Date(w.lastActiveAt).toLocaleDateString() : '—'}</td>
                      <td>
                        <Link to={`/users/${w._id}`} className="btn btn-sm btn-primary">View User</Link>
                      </td>
                    </tr>
                  ))}
                  {writers.length === 0 && (
                    <tr><td colSpan={7} className="text-center text-muted" style={{ padding: 20 }}>No writers found.</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
