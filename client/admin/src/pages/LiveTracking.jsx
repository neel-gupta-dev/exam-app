import { useEffect, useState } from 'react';
import api from '../api';

const formatDuration = (seconds = 0) => {
  const totalSeconds = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${minutes}m ${secs}s`;
};

export default function LiveTracking() {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchLiveExams = async () => {
    try {
      const res = await api.get('/admin/live-exams');
      setAttempts(res.data.liveAttempts || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch live exams');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveExams();
    // Refresh every 10 seconds
    const interval = setInterval(fetchLiveExams, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="page"><h1>Live Tracking</h1><p>Loading active exams...</p></div>;
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="breadcrumb">Home / Exam Platform / Live Tracking</div>
          <h1>Live Exam Tracking 🔴</h1>
          <p style={{ opacity: 0.7, marginTop: 4 }}>Real-time view of students currently taking a test.</p>
        </div>
        <div className="btn-group">
          <button className="btn" onClick={fetchLiveExams}>Refresh Now</button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="stat-box">
          <div className="stat-label">Active Users</div>
          <div className="stat-value">{attempts.length}</div>
          <div className="stat-sub">Currently giving exams</div>
        </div>
      </div>

      <div className="card">
        {attempts.length === 0 ? (
          <p style={{ padding: '20px', textAlign: 'center', opacity: 0.7 }}>No students are currently taking a test.</p>
        ) : (
          <table className="table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>Student</th>
                <th style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>Test Name</th>
                <th style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>Started At</th>
                <th style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>Time Left</th>
                <th style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>Questions Visited</th>
              </tr>
            </thead>
            <tbody>
              {attempts.map(attempt => (
                <tr key={attempt._id}>
                  <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>
                    <strong>{attempt.userId?.name || 'Unknown'}</strong><br/>
                    <span style={{ fontSize: '0.85em', opacity: 0.7 }}>{attempt.userId?.email || 'N/A'}</span>
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>
                    {attempt.testId?.title || 'Unknown Test'}
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>
                    {new Date(attempt.startedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #ddd', color: attempt.timeLeft < 300 ? 'red' : 'inherit', fontWeight: 'bold' }}>
                    {formatDuration(attempt.timeLeft)}
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>
                    {attempt.answers?.filter(a => a.visitCount > 0).length || 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
