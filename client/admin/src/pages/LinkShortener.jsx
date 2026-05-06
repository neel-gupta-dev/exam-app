import { useState, useEffect } from 'react';
import api from '../api';

export default function LinkShortener() {
  const [links, setLinks] = useState([]);
  const [longUrl, setLongUrl] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const REDIRECT_BASE = import.meta.env.VITE_REDIRECT_BASE || 'https://vayl.in/v';

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      const res = await api.get(`/api/admin/short-links`);
      setLinks(res.data);
    } catch (err) {
      console.error('Failed to fetch links');
    }
  };

  const handleShorten = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await api.post(`/api/admin/short-links`, {
        originalUrl: longUrl,
        slug: customSlug
      });

      setSuccess(`Link created: ${REDIRECT_BASE}/${res.data.slug}`);
      setLongUrl('');
      setCustomSlug('');
      fetchLinks();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create link');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this link?')) return;
    try {
      await api.delete(`/api/admin/short-links/${id}`);
      fetchLinks();
    } catch (err) {
      alert('Failed to delete');
    }
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">✂️ URL Shortener</h2>
          <p className="card-subtitle">Create clean, branded short links with click tracking.</p>
        </div>

        <div className="card-body">
          <form onSubmit={handleShorten} className="space-y-4">
            <div className="form-group">
              <label className="form-label">Destination URL</label>
              <input 
                type="url" 
                className="form-control" 
                placeholder="https://lab.vayl.in/?utm_source=twitter..." 
                value={longUrl}
                onChange={(e) => setLongUrl(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Custom Slug (Optional)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: '#7f8c8d', fontSize: '0.9rem' }}>vayl.in/v/</span>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="physics-lab" 
                  value={customSlug}
                  onChange={(e) => setCustomSlug(e.target.value)}
                />
              </div>
              <small style={{ color: '#7f8c8d' }}>Leave blank to generate a random code.</small>
            </div>

            {error && <div style={{ color: '#e74c3c', fontSize: '0.8rem', fontWeight: 'bold' }}>❌ {error}</div>}
            {success && <div style={{ color: '#27ae60', fontSize: '0.8rem', fontWeight: 'bold' }}>✅ {success}</div>}

            <button 
              type="submit" 
              className="btn btn-primary w-full" 
              disabled={loading}
              style={{ padding: '0.8rem' }}
            >
              {loading ? 'Shortening...' : 'Create Short Link'}
            </button>
          </form>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">📊 Active Short Links</h3>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <table className="table">
            <thead>
              <tr>
                <th>Short Link</th>
                <th>Original URL</th>
                <th>Clicks</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {links.map(link => (
                <tr key={link._id}>
                  <td>
                    <a href={`${REDIRECT_BASE}/${link.slug}`} target="_blank" rel="noreferrer" style={{ color: '#3498db', fontWeight: 'bold' }}>
                      /{link.slug}
                    </a>
                  </td>
                  <td>
                    <div style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.8rem' }}>
                      {link.originalUrl}
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-primary">{link.clicks}</span>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: '#7f8c8d' }}>
                    {new Date(link.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <button 
                      className="btn btn-sm btn-danger" 
                      onClick={() => handleDelete(link._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {links.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#bdc3c7' }}>
                    No short links created yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
