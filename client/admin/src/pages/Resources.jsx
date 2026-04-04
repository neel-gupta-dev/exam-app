import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import Pagination from '../components/Pagination';

export default function Resources() {
  const [data, setData] = useState({ resources: [], total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [page, setPage] = useState(1);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 25 };
      if (search) params.search = search;
      if (type)   params.type = type;
      const { data: res } = await api.get('/admin/resources', { params });
      setData(res);
    } catch (e) {
      setMsg({ type: 'error', text: 'Failed to load resources' });
    } finally {
      setLoading(false);
    }
  }, [page, search, type]);

  useEffect(() => { load(); }, [load]);

  const deleteResource = async (id, title) => {
    if (!confirm(`Delete resource "${title}"?`)) return;
    try {
      await api.delete(`/admin/resources/${id}`);
      setMsg({ type: 'success', text: 'Resource deleted.' });
      load();
    } catch (e) {
      setMsg({ type: 'error', text: e.response?.data?.message || 'Delete failed' });
    }
  };

  const typeBadge = (t) => {
    const map = { pdf: 'badge-red', video: 'badge-blue', link: 'badge-green', other: 'badge-gray' };
    return <span className={`badge ${map[t] || 'badge-gray'}`}>{t?.toUpperCase()}</span>;
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="breadcrumb">Home / Resources</div>
          <h1>Resources</h1>
        </div>
        <span className="text-muted">{data.total} total</span>
      </div>

      {msg.text && (
        <div className={`alert alert-${msg.type === 'error' ? 'error' : 'success'}`}>
          {msg.text} <button style={{ float:'right', background:'none', border:'none', cursor:'pointer' }} onClick={() => setMsg({type:'',text:''})}>✕</button>
        </div>
      )}

      <div className="toolbar">
        <input
          type="text"
          placeholder="Search title, folder..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
        />
        <select value={type} onChange={e => { setType(e.target.value); setPage(1); }}>
          <option value="">All Types</option>
          <option value="pdf">PDF</option>
          <option value="video">Video</option>
          <option value="link">Link</option>
          <option value="other">Other</option>
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
                    <th>Title</th>
                    <th>Type</th>
                    <th>Folder</th>
                    <th>Owner</th>
                    <th>URL</th>
                    <th>Added</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {data.resources.map(r => (
                    <tr key={r._id}>
                      <td style={{ maxWidth: 200 }}>{r.title}</td>
                      <td>{typeBadge(r.type)}</td>
                      <td>{r.folderName}</td>
                      <td>
                        {r.userId
                          ? <Link to={`/users/${r.userId._id}`}>{r.userId.name}</Link>
                          : <span className="text-muted">Deleted</span>}
                      </td>
                      <td>
                        <a href={r.url} target="_blank" rel="noopener noreferrer" className="btn btn-sm">Open ↗</a>
                      </td>
                      <td className="td-mono">{new Date(r.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button className="btn btn-sm btn-danger" onClick={() => deleteResource(r._id, r.title)}>Del</button>
                      </td>
                    </tr>
                  ))}
                  {data.resources.length === 0 && (
                    <tr><td colSpan={7} className="text-center text-muted" style={{ padding: 20 }}>No resources found.</td></tr>
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
