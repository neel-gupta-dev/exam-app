import { useState, useEffect } from 'react';
import axios from 'axios';

export default function UserSegmentation() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    role: '',
    targetExam: '',
    isOnboarded: '',
    search: ''
  });

  const API_BASE = import.meta.env.VITE_API_URL || 'https://api.vayl.in';

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const res = await axios.get(`${API_BASE}/api/admin/users`, {
        params: { ...filters, limit: 100 },
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data.users);
      setTotal(res.data.total);
    } catch (err) {
      console.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    if (users.length === 0) return;
    
    const headers = ['Name', 'Email', 'Role', 'Target Exam', 'Onboarded', 'Joined At'];
    const rows = users.map(u => [
      u.name,
      u.email,
      u.role,
      u.targetExam?.join(', ') || 'N/A',
      u.isOnboarded ? 'Yes' : 'No',
      new Date(u.createdAt).toLocaleDateString()
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `vayl_segment_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="card-header flex justify-between items-center">
          <div>
            <h2 className="card-title">🎯 User Segmentation</h2>
            <p className="card-subtitle">Filter and export user cohorts for targeted marketing.</p>
          </div>
          <button 
            className="btn btn-primary" 
            onClick={downloadCSV}
            disabled={users.length === 0}
          >
            📥 Export CSV ({total})
          </button>
        </div>
        
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="form-group">
              <label className="form-label">Search</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="Name, Email..." 
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Role</label>
              <select 
                className="form-control"
                value={filters.role}
                onChange={(e) => setFilters({...filters, role: e.target.value})}
              >
                <option value="">All Roles</option>
                <option value="user">User</option>
                <option value="writer">Writer</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Target Exam</label>
              <select 
                className="form-control"
                value={filters.targetExam}
                onChange={(e) => setFilters({...filters, targetExam: e.target.value})}
              >
                <option value="">All Exams</option>
                <option value="JEE">JEE</option>
                <option value="NEET">NEET</option>
                <option value="BITSAT">BITSAT</option>
                <option value="CUET">CUET</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Onboarding</label>
              <select 
                className="form-control"
                value={filters.isOnboarded}
                onChange={(e) => setFilters({...filters, isOnboarded: e.target.value})}
              >
                <option value="">Status...</option>
                <option value="true">Onboarded</option>
                <option value="false">Pending</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          <table className="table">
            <thead>
              <tr>
                <th>User</th>
                <th>Target Exam</th>
                <th>Status</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>Loading users...</td></tr>
              ) : users.map(u => (
                <tr key={u._id}>
                  <td>
                    <div style={{ fontWeight: 'bold' }}>{u.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#7f8c8d' }}>{u.email}</div>
                  </td>
                  <td>
                    {u.targetExam?.map(e => (
                      <span key={e} className="badge badge-primary" style={{ marginRight: '4px' }}>{e}</span>
                    ))}
                  </td>
                  <td>
                    <span className={`badge ${u.isOnboarded ? 'badge-success' : 'badge-danger'}`}>
                      {u.isOnboarded ? 'Onboarded' : 'Pending'}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: '#7f8c8d' }}>
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {!loading && users.length === 0 && (
                <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>No users match your criteria.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
