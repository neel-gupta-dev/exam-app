import { useEffect, useMemo, useState } from 'react';
import api from '../api';

const formatDate = (value) => value
  ? new Date(value).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  : '-';

const formatDuration = (seconds = 0) => {
  const totalSeconds = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${minutes}m ${secs}s`;
};

export default function TestTelemetry() {
  const [data, setData] = useState({ rows: [], summary: {}, page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAttempt, setSelectedAttempt] = useState(null);
  const [status, setStatus] = useState('');

  const fetchTelemetry = async () => {
    try {
      setLoading(true);
      setError('');
      const params = status ? { status } : {};
      const res = await api.get('/admin/test-telemetry', { params });
      setData(res.data || { rows: [], summary: {} });
      setSelectedAttempt((current) => {
        if (!current) return res.data?.rows?.[0] || null;
        return res.data?.rows?.find((row) => row._id === current._id) || res.data?.rows?.[0] || null;
      });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load telemetry');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();
  }, [status]);

  const maxQuestionTime = useMemo(() => {
    const times = selectedAttempt?.telemetry?.questions?.map((question) => question.timeSpentSeconds || 0) || [];
    return Math.max(1, ...times);
  }, [selectedAttempt]);

  if (loading) {
    return <div className="page"><h1>Test Telemetry</h1><p>Loading telemetry...</p></div>;
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="breadcrumb">Home / Exam Platform / Test Telemetry</div>
          <h1>Test Telemetry</h1>
          <p style={{ opacity: 0.7, marginTop: 4 }}>Organized CBT attempt timing, question visits, IPs, and integrity signals.</p>
        </div>
        <div className="btn-group">
          <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ minWidth: 160 }}>
            <option value="">All statuses</option>
            <option value="completed">Completed</option>
            <option value="auto-submitted">Auto-submitted</option>
            <option value="in-progress">In progress</option>
            <option value="evaluating">Evaluating</option>
          </select>
          <button className="btn" onClick={fetchTelemetry}>Refresh</button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="stat-box">
          <div className="stat-label">Attempts</div>
          <div className="stat-value">{data.summary?.attempts || 0}</div>
          <div className="stat-sub">Matching filter</div>
        </div>
        <div className="stat-box success">
          <div className="stat-label">Tracked Time</div>
          <div className="stat-value">{Math.round((data.summary?.totalTrackedSeconds || 0) / 60)}m</div>
          <div className="stat-sub">Current page total</div>
        </div>
        <div className="stat-box warning">
          <div className="stat-label">Question Visits</div>
          <div className="stat-value">{data.summary?.totalVisits || 0}</div>
          <div className="stat-sub">Current page total</div>
        </div>
        <div className="stat-box purple">
          <div className="stat-label">Tab Switches</div>
          <div className="stat-value">{data.summary?.totalTabSwitches || 0}</div>
          <div className="stat-sub">Integrity signal</div>
        </div>
      </div>

      <div className="two-col" style={{ marginTop: 20 }}>
        <div className="card">
          <div className="card-header">Attempts</div>
          <div className="card-body" style={{ padding: 0 }}>
            <div className="table-wrap" style={{ maxHeight: 620, overflowY: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Test</th>
                    <th>Submitted</th>
                    <th>Score</th>
                    <th>Telemetry</th>
                    <th>IP</th>
                  </tr>
                </thead>
                <tbody>
                  {data.rows.map((attempt) => (
                    <tr
                      key={attempt._id}
                      onClick={() => setSelectedAttempt(attempt)}
                      style={{ cursor: 'pointer', background: selectedAttempt?._id === attempt._id ? 'rgba(79,70,229,0.08)' : undefined }}
                    >
                      <td>
                        <strong>{attempt.user?.name || attempt.user?.username || 'Unknown'}</strong>
                        <div className="text-muted" style={{ fontSize: 11 }}>{attempt.user?.email || '-'}</div>
                      </td>
                      <td>
                        <strong>{attempt.test?.title || 'Deleted Test'}</strong>
                        <div className="text-muted" style={{ fontSize: 11 }}>{attempt.test?.category || 'General'}</div>
                      </td>
                      <td className="td-mono">{formatDate(attempt.submittedAt || attempt.startedAt)}</td>
                      <td>
                        <strong>{attempt.score?.totalScore ?? '-'}</strong>
                        <span className="text-muted" style={{ fontSize: 11 }}> / {attempt.score?.maxPossibleScore ?? attempt.test?.totalMarks ?? '-'}</span>
                        <div className="text-muted" style={{ fontSize: 11 }}>{attempt.score?.percentage ?? 0}%</div>
                      </td>
                      <td style={{ fontSize: 12 }}>
                        {formatDuration(attempt.telemetry?.totalTimeSpentSeconds || 0)}
                        <div className="text-muted">{attempt.telemetry?.totalVisits || 0} visits • {attempt.integrity?.tabSwitchCount || 0} switches</div>
                      </td>
                      <td className="td-mono">{attempt.ipAddress || '-'}</td>
                    </tr>
                  ))}
                  {!data.rows.length && (
                    <tr><td colSpan={6} className="text-center text-muted" style={{ padding: 24 }}>No telemetry found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">Attempt Detail</div>
          <div className="card-body">
            {selectedAttempt ? (
              <div>
                <div className="detail-grid">
                  {[
                    ['Student', selectedAttempt.user?.name || selectedAttempt.user?.email || '-'],
                    ['Test', selectedAttempt.test?.title || '-'],
                    ['Started', formatDate(selectedAttempt.startedAt)],
                    ['Submitted', formatDate(selectedAttempt.submittedAt)],
                    ['Total Tracked', formatDuration(selectedAttempt.telemetry?.totalTimeSpentSeconds || 0)],
                    ['Avg / Question', `${selectedAttempt.telemetry?.averageQuestionTimeSeconds || 0}s`],
                    ['Answered', `${selectedAttempt.telemetry?.answeredQuestions || 0} / ${selectedAttempt.telemetry?.totalQuestions || 0}`],
                    ['Tab Switches', selectedAttempt.integrity?.tabSwitchCount || 0],
                    ['Slowest Question', selectedAttempt.telemetry?.slowestQuestion ? `Q${selectedAttempt.telemetry.slowestQuestion.questionNumber} (${formatDuration(selectedAttempt.telemetry.slowestQuestion.timeSpentSeconds)})` : '-'],
                    ['Most Visited', selectedAttempt.telemetry?.mostVisitedQuestion ? `Q${selectedAttempt.telemetry.mostVisitedQuestion.questionNumber} (${selectedAttempt.telemetry.mostVisitedQuestion.visitCount} visits)` : '-'],
                  ].map(([label, value]) => (
                    <div className="detail-row" key={label}>
                      <span className="detail-label">{label}</span>
                      <span className="detail-value" style={{ fontWeight: 600 }}>{value}</span>
                    </div>
                  ))}
                </div>

                <h3 style={{ marginTop: 24, marginBottom: 12 }}>Question Timing</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 420, overflowY: 'auto', paddingRight: 4 }}>
                  {selectedAttempt.telemetry?.questions?.map((question) => (
                    <div key={question.questionId || question.questionNumber}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                        <strong>Q{question.questionNumber}</strong>
                        <span className="text-muted">{formatDuration(question.timeSpentSeconds)} • {question.visitCount} visits • {question.status}</span>
                      </div>
                      <div style={{ height: 8, background: 'rgba(148,163,184,0.2)', borderRadius: 999, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${Math.min(100, ((question.timeSpentSeconds || 0) / maxQuestionTime) * 100)}%`, background: '#4f46e5' }} />
                      </div>
                      <div className="text-muted" style={{ fontSize: 10, marginTop: 3 }}>
                        First: {formatDate(question.firstVisitedAt)} | Last: {formatDate(question.lastVisitedAt)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-muted">Select an attempt to inspect question-level telemetry.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
