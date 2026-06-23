import { useState, useEffect, useCallback, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import Pagination from '../components/Pagination';
import { AuthCtx } from '../App';

export default function Users() {
  const [data, setData] = useState({ users: [], total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [authMethod, setAuthMethod] = useState('');
  const [page, setPage] = useState(1);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const { user } = useContext(AuthCtx);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 25 };
      if (search) params.search = search;
      if (role)   params.role = role;
      if (authMethod) params.authMethod = authMethod;
      const { data: res } = await api.get('/admin/users', { params });
      setData(res);
    } catch (e) {
      setMsg({ type: 'error', text: e.response?.data?.message || 'Failed to load users' });
    } finally {
      setLoading(false);
    }
  }, [page, search, role, authMethod]);

  useEffect(() => { load(); }, [load]);

  const deleteUser = async (user) => {
    if (!confirm(`Delete ${user.email} and ALL their data permanently? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/users/${user._id}`);
      setMsg({ type: 'success', text: `User ${user.email} deleted.` });
      load();
    } catch (e) {
      setMsg({ type: 'error', text: e.response?.data?.message || 'Delete failed' });
    }
  };

  const changeRole = async (user, newRole) => {
    if (!confirm(`Change ${user.email}'s role to ${newRole}?`)) return;
    try {
      await api.patch(`/admin/users/${user._id}/role`, { role: newRole });
      setMsg({ type: 'success', text: `Role updated to ${newRole}` });
      load();
    } catch (e) {
      setMsg({ type: 'error', text: e.response?.data?.message || 'Role change failed' });
    }
  };

  const roleBadge = (role) => {
    if (role === 'admin') return <span className="badge badge-red">Admin</span>;
    if (role === 'writer') return <span className="badge badge-blue">Writer</span>;
    if (role === 'coachingAdmin') return <span className="badge badge-purple">Coach Admin</span>;
    return <span className="badge badge-gray">Student</span>;
  };

  const authBadge = (method) => method === 'google'
    ? <span className="badge badge-blue">Google</span>
    : <span className="badge badge-gray">Email</span>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="breadcrumb">Home / Users</div>
          <h1>User Management</h1>
        </div>
        <div className="text-muted">{data.total} total users</div>
      </div>

      {msg.text && (
        <div className={`alert alert-${msg.type === 'error' ? 'error' : 'success'}`}>
          {msg.text} <button style={{ float:'right', background:'none', border:'none', cursor:'pointer' }} onClick={() => setMsg({type:'',text:''})}>✕</button>
        </div>
      )}

      {/* Toolbar */}
      <div className="toolbar">
        <input
          type="text"
          placeholder="Search name, email, vaultId..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
        />
        <select value={role} onChange={e => { setRole(e.target.value); setPage(1); }}>
          <option value="">All Roles</option>
          <option value="student">Student</option>
          <option value="writer">Writer</option>
          <option value="admin">Admin</option>
          <option value="coachingAdmin">Coach Admin</option>
        </select>
        <select value={authMethod} onChange={e => { setAuthMethod(e.target.value); setPage(1); }}>
          <option value="">All Auth Methods</option>
          <option value="local">Email/Password</option>
          <option value="google">Google OAuth</option>
        </select>
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
                    <th>Auth</th>
                    <th>Onboarded</th>
                    <th>Streak</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.users.map(u => (
                    <tr key={u._id}>
                      <td><Link to={`/users/${u._id}`}>{u.name}</Link></td>
                      <td className="td-mono">{u.email}</td>
                      <td>{roleBadge(u.role)}</td>
                      <td>{authBadge(u.authMethod)}</td>
                      <td>{u.isOnboarded ? <span className="text-success">✓</span> : <span className="text-muted">—</span>}</td>
                      <td>{u.currentStreak ?? 0} days</td>
                      <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div className="btn-group">
                          <Link to={`/users/${u._id}`} className="btn btn-sm btn-primary">View</Link>
                          {user?.role !== 'subAdmin' && (
                            <>
                              <select
                                className="btn btn-sm"
                                value={u.role}
                                onChange={e => changeRole(u, e.target.value)}
                                title="Change role"
                              >
                                <option value="student">Student</option>
                                <option value="writer">Writer</option>
                                <option value="admin">Admin</option>
                                <option value="subAdmin">Sub-Admin</option>
                                <option value="coachingAdmin">Coach Admin</option>
                              </select>
                              <button className="btn btn-sm btn-danger" onClick={() => deleteUser(u)}>Del</button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {data.users.length === 0 && (
                    <tr><td colSpan={8} className="text-center text-muted" style={{ padding: 20 }}>No users found.</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
      <Pagination page={data.page} pages={data.pages} onPage={setPage} />
    </div>
  );
}
