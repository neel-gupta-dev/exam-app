import { useState } from 'react';
import api from '../api';

export default function Settings() {
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });

    if (formData.newPassword !== formData.confirmPassword) {
      setMsg({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    if (formData.newPassword.length < 6) {
      setMsg({ type: 'error', text: 'New password must be at least 6 characters' });
      return;
    }

    setLoading(true);
    try {
      await api.patch('/auth/password', {
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword,
      });
      setMsg({ type: 'success', text: 'Password updated successfully!' });
      setFormData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setMsg({ 
        type: 'error', 
        text: err.response?.data?.message || 'Failed to update password' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="breadcrumb">Home / Settings</div>
          <h1>System Settings</h1>
        </div>
      </div>

      {msg.text && (
        <div className={`alert alert-${msg.type === 'error' ? 'error' : 'success'}`}>
          {msg.text}
          <button 
            style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }} 
            onClick={() => setMsg({ type: '', text: '' })}
          >
            ✕
          </button>
        </div>
      )}

      <div className="card" style={{ maxWidth: 500 }}>
        <div className="card-header">
          <h3 className="card-title">🛡️ Change Administrator Password</h3>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Current Password</label>
              <input
                type="password"
                name="oldPassword"
                className="form-control"
                placeholder="Enter current password"
                value={formData.oldPassword}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>New Password</label>
              <input
                type="password"
                name="newPassword"
                className="form-control"
                placeholder="Minimum 6 characters"
                value={formData.newPassword}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Confirm New Password</label>
              <input
                type="password"
                name="confirmPassword"
                className="form-control"
                placeholder="Repeat new password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={loading}
              style={{ width: '100%', padding: '12px', fontWeight: 600 }}
            >
              {loading ? <span className="spinner" /> : 'Update Password'}
            </button>
          </form>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 500, marginTop: 24, border: '1px dashed #e74c3c' }}>
        <div className="card-body" style={{ color: '#c0392b' }}>
          <strong>Note:</strong> Changing your password will not log you out of this session, but you will need to use the new password for future logins.
        </div>
      </div>
    </div>
  );
}
