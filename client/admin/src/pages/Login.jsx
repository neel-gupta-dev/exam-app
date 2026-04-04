import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { AuthCtx } from '../App';

export default function Login() {
  const { login } = useContext(AuthCtx);
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      if (data.role !== 'admin') {
        setError('Access denied. Your account does not have admin privileges.');
        setLoading(false);
        return;
      }
      localStorage.setItem('admin_token', data.token);
      login({ name: data.name, email: data.email, role: data.role });
      nav('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <h2>Vayl Admin Panel</h2>
        <p>Restricted access. Admins only.</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@vayl.io"
              required
              autoFocus
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <div style={{ marginTop: 18 }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><span className="spinner" /> Signing in...</> : 'Sign In'}
            </button>
          </div>
        </form>

        <div style={{ marginTop: 16, fontSize: 11, color: '#6b7280', borderTop: '1px solid #e5e7eb', paddingTop: 12 }}>
          This panel is restricted to Vayl system administrators. Unauthorized access attempts are logged.
        </div>
      </div>
    </div>
  );
}
