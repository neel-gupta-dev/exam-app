import { useState, useEffect, useCallback, useContext } from 'react';
import api from '../api';
import Pagination from '../components/Pagination';
import { AuthCtx } from '../App';

const Stars = ({ n }) => '★'.repeat(n) + '☆'.repeat(5 - n);

export default function FeedbackPage() {
  const [data, setData] = useState({ feedback: [], total: 0, page: 1, pages: 1, avgRating: 'N/A' });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const { user } = useContext(AuthCtx);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data: res } = await api.get('/admin/feedback', { params: { page, limit: 25 } });
      setData(res);
    } catch (e) {
      setMsg({ type: 'error', text: 'Failed to load feedback' });
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const deleteFeedback = async (id) => {
    if (!confirm('Delete this feedback entry?')) return;
    try {
      await api.delete(`/admin/feedback/${id}`);
      setMsg({ type: 'success', text: 'Deleted.' });
      load();
    } catch (e) {
      setMsg({ type: 'error', text: 'Delete failed' });
    }
  };

  const ratingColor = (r) => {
    if (r >= 4) return '#27ae60';
    if (r >= 3) return '#e67e22';
    return '#c0392b';
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="breadcrumb">Home / Feedback</div>
          <h1>User Feedback</h1>
        </div>
        <div className="btn-group">
          <div style={{ padding: '5px 12px', background: '#fff', border: '1px solid #d1d5db', borderRadius: 2, fontSize: 13 }}>
            Avg Rating: <strong style={{ color: '#2980b9' }}>{data.avgRating} / 5</strong>
          </div>
          <span className="text-muted" style={{ lineHeight: '32px' }}>{data.total} entries</span>
          <button className="btn" onClick={load}>↻ Refresh</button>
        </div>
      </div>

      {msg.text && (
        <div className={`alert alert-${msg.type === 'error' ? 'error' : 'success'}`}>
          {msg.text} <button style={{ float:'right', background:'none', border:'none', cursor:'pointer' }} onClick={() => setMsg({type:'',text:''})}>✕</button>
        </div>
      )}

      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <div className="loading-page"><span className="spinner" /> Loading...</div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Rating</th>
                    <th>Comment</th>
                    <th>Submitted</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {data.feedback.map(f => (
                    <tr key={f._id}>
                      <td className="td-mono">{f.email}</td>
                      <td>
                        <span style={{ color: ratingColor(f.rating), fontWeight: 700, fontFamily: 'monospace', letterSpacing: 2 }}>
                          {Stars(f.rating)}
                        </span>
                        {' '}<span className="text-muted">({f.rating}/5)</span>
                      </td>
                      <td>{f.comment}</td>
                      <td className="td-mono">{new Date(f.createdAt).toLocaleString()}</td>
                      <td>
                        {user?.role !== 'subAdmin' && (
                          <button className="btn btn-sm btn-danger" onClick={() => deleteFeedback(f._id)}>Del</button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {data.feedback.length === 0 && (
                    <tr><td colSpan={5} className="text-center text-muted" style={{ padding: 20 }}>No feedback yet.</td></tr>
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
