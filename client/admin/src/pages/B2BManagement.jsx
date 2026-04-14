import { useState, useEffect } from 'react';
import api from '../api';

export default function B2BManagement() {
  const [tenants, setTenants] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTenantForm, setShowTenantForm] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(null); // tenantId
  const [showAdminForm, setShowAdminForm] = useState(null);   // tenantId
  const [credentials, setCredentials] = useState(null);

  const [tenantForm, setTenantForm] = useState({ name: '', subdomain: '', code: '', contactEmail: '', maxStudents: 500 });
  const [uploadForm, setUploadForm] = useState({ studentsText: '', defaultPassword: 'Exam@2025' });
  const [adminForm, setAdminForm] = useState({ name: '', email: '', password: '' });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tRes, gRes] = await Promise.all([
        api.get('/api/b2b/tenants'),
        api.get('/api/b2b/groups'),
      ]);
      setTenants(tRes.data || []);
      setGroups(gRes.data || []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleCreateTenant = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/b2b/tenants', tenantForm);
      setShowTenantForm(false);
      setTenantForm({ name: '', subdomain: '', code: '', contactEmail: '', maxStudents: 500 });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create tenant');
    }
  };

  const handleToggleTenant = async (tenantId) => {
    try {
      await api.patch(`/api/b2b/tenants/${tenantId}/toggle`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle');
    }
  };

  const handleBulkUpload = async (e) => {
    e.preventDefault();
    try {
      // Parse textarea: each line is "Name"
      const lines = uploadForm.studentsText.split('\n').filter(l => l.trim());
      const students = lines.map(line => ({ name: line.trim() }));

      const res = await api.post(`/api/b2b/tenants/${showUploadForm}/students/bulk`, {
        students,
        defaultPassword: uploadForm.defaultPassword,
      });

      setCredentials(res.data.credentials);
      setShowUploadForm(null);
      setUploadForm({ studentsText: '', defaultPassword: 'Exam@2025' });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to upload students');
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/api/b2b/tenants/${showAdminForm}/admin`, adminForm);
      setShowAdminForm(null);
      setAdminForm({ name: '', email: '', password: '' });
      alert('Coaching admin account created successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create admin');
    }
  };

  const downloadCSV = () => {
    if (!credentials) return;
    const csv = 'Name,Username,Password\n' + credentials.map(c => `${c.name},${c.username},${c.password}`).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student_credentials.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="page"><h1>B2B Management</h1><p>Loading...</p></div>;

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1>🏢 B2B Coaching Management</h1>
        <button className="btn btn-primary" onClick={() => setShowTenantForm(!showTenantForm)}>
          {showTenantForm ? 'Cancel' : '+ New Coaching'}
        </button>
      </div>

      {/* Credentials Download Modal */}
      {credentials && (
        <div className="card" style={{ marginBottom: 24, border: '2px solid #2ecc71' }}>
          <h3>✅ Students Created Successfully!</h3>
          <p>{credentials.length} student accounts generated. Download the credentials CSV to share with the coaching admin.</p>
          <table className="data-table">
            <thead><tr><th>Name</th><th>Username</th><th>Password</th></tr></thead>
            <tbody>
              {credentials.slice(0, 5).map((c, i) => (
                <tr key={i}><td>{c.name}</td><td><code>{c.username}</code></td><td><code>{c.password}</code></td></tr>
              ))}
              {credentials.length > 5 && <tr><td colSpan={3} style={{ textAlign: 'center', opacity: 0.5 }}>...and {credentials.length - 5} more</td></tr>}
            </tbody>
          </table>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button className="btn btn-primary" onClick={downloadCSV}>📥 Download CSV</button>
            <button className="btn btn-sm" onClick={() => setCredentials(null)}>Dismiss</button>
          </div>
        </div>
      )}

      {/* Create Tenant Form */}
      {showTenantForm && (
        <div className="card" style={{ marginBottom: 24 }}>
          <h3>Create New Coaching Institute</h3>
          <form onSubmit={handleCreateTenant}>
            <div className="form-grid">
              <div className="form-group">
                <label>Coaching Name *</label>
                <input value={tenantForm.name} onChange={e => setTenantForm({ ...tenantForm, name: e.target.value })} placeholder="Resonance JEE Batch A" required />
              </div>
              <div className="form-group">
                <label>Short Code * (used in usernames)</label>
                <input value={tenantForm.code} onChange={e => setTenantForm({ ...tenantForm, code: e.target.value.toUpperCase() })} placeholder="RST" maxLength={10} required style={{ textTransform: 'uppercase' }} />
              </div>
              <div className="form-group">
                <label>Subdomain</label>
                <input value={tenantForm.subdomain} onChange={e => setTenantForm({ ...tenantForm, subdomain: e.target.value })} placeholder="resonance" required />
              </div>
              <div className="form-group">
                <label>Contact Email</label>
                <input type="email" value={tenantForm.contactEmail} onChange={e => setTenantForm({ ...tenantForm, contactEmail: e.target.value })} placeholder="admin@resonance.com" />
              </div>
              <div className="form-group">
                <label>Max Students (Seat Limit)</label>
                <input type="number" value={tenantForm.maxStudents} onChange={e => setTenantForm({ ...tenantForm, maxStudents: Number(e.target.value) })} min={1} />
              </div>
            </div>
            <button type="submit" className="btn btn-primary" style={{ marginTop: 16 }}>Create Coaching</button>
          </form>
        </div>
      )}

      {/* Tenants List */}
      <div className="card">
        <h3>Coaching Institutes ({tenants.length})</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Code</th>
              <th>Students</th>
              <th>Max</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tenants.map(t => (
              <tr key={t._id}>
                <td><strong>{t.name}</strong></td>
                <td><code>{t.code}</code></td>
                <td>{t.studentCount || 0}</td>
                <td>{t.maxStudents}</td>
                <td>
                  <span className={`badge ${t.isActive ? 'badge-success' : 'badge-danger'}`}>
                    {t.isActive ? '✅ Active' : '❌ Inactive'}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-sm btn-primary" onClick={() => setShowUploadForm(t._id)}>📤 Upload Students</button>
                    <button className="btn btn-sm" onClick={() => setShowAdminForm(t._id)}>👤 Create Admin</button>
                    <button className="btn btn-sm" onClick={() => handleToggleTenant(t._id)}>
                      {t.isActive ? '⏸ Disable' : '▶ Enable'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {tenants.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32, opacity: 0.5 }}>No coachings yet.</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Bulk Upload Modal */}
      {showUploadForm && (
        <div className="card" style={{ marginTop: 24 }}>
          <h3>📤 Bulk Upload Students</h3>
          <p style={{ opacity: 0.7, marginBottom: 12 }}>Paste student names, one per line. Usernames will be auto-generated as <code>name_CODE_001</code>.</p>
          <form onSubmit={handleBulkUpload}>
            <div className="form-group">
              <label>Student Names (one per line) *</label>
              <textarea value={uploadForm.studentsText} onChange={e => setUploadForm({ ...uploadForm, studentsText: e.target.value })} rows={8} placeholder="Rahul Gupta\nPriya Sharma\nAmit Kumar" required />
            </div>
            <div className="form-group">
              <label>Default Password</label>
              <input value={uploadForm.defaultPassword} onChange={e => setUploadForm({ ...uploadForm, defaultPassword: e.target.value })} />
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button type="submit" className="btn btn-primary">🚀 Create Students</button>
              <button type="button" className="btn btn-sm" onClick={() => setShowUploadForm(null)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Create Coaching Admin Modal */}
      {showAdminForm && (
        <div className="card" style={{ marginTop: 24 }}>
          <h3>👤 Create Coaching Admin</h3>
          <p style={{ opacity: 0.7, marginBottom: 12 }}>This account can view student results but cannot create or modify tests.</p>
          <form onSubmit={handleCreateAdmin}>
            <div className="form-grid">
              <div className="form-group">
                <label>Admin Name</label>
                <input value={adminForm.name} onChange={e => setAdminForm({ ...adminForm, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input type="email" value={adminForm.email} onChange={e => setAdminForm({ ...adminForm, email: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Password *</label>
                <input type="password" value={adminForm.password} onChange={e => setAdminForm({ ...adminForm, password: e.target.value })} required minLength={6} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button type="submit" className="btn btn-primary">Create Admin</button>
              <button type="button" className="btn btn-sm" onClick={() => setShowAdminForm(null)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Groups */}
      {groups.length > 0 && (
        <div className="card" style={{ marginTop: 24 }}>
          <h3>📂 Student Groups ({groups.length})</h3>
          <table className="data-table">
            <thead><tr><th>Group Name</th><th>Coaching</th><th>Members</th><th>Auto-Generated</th><th>Created</th></tr></thead>
            <tbody>
              {groups.map(g => (
                <tr key={g._id}>
                  <td><strong>{g.name}</strong></td>
                  <td>{g.tenantId?.name || '—'}</td>
                  <td>{g.memberCount}</td>
                  <td>{g.isAutoGenerated ? '🤖 Auto' : '✋ Manual'}</td>
                  <td>{new Date(g.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
