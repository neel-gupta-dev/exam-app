import { useState, useEffect, useCallback } from 'react';
import api from '../api';

export default function Health() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [latency, setLatency] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const t0 = performance.now();
    try {
      const { data: res } = await api.get('/health');
      setLatency(Math.round(performance.now() - t0));
      setData(res);
      setError('');
      setLastRefresh(new Date());
    } catch (e) {
      setError(e.response?.data?.message || 'Backend unreachable');
      setLatency(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const iv = setInterval(load, 30000);
    return () => clearInterval(iv);
  }, [load]);

  const bar = (val, max, color) => (
    <div style={{ background: '#e5e7eb', height: 10, borderRadius: 2, overflow: 'hidden', width: '100%', marginTop: 4 }}>
      <div style={{ width: `${Math.min(100, (val/max)*100)}%`, height: '100%', background: color }} />
    </div>
  );

  const parseMB = (str) => parseFloat(str?.replace(' MB', '') || 0);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="breadcrumb">Home / Health Monitor</div>
          <h1>System Health</h1>
        </div>
        <div className="btn-group">
          {latency !== null && (
            <span style={{ padding: '5px 10px', background: '#fff', border: '1px solid #d1d5db', borderRadius: 2, fontSize: 12 }}>
              Latency: <strong style={{ color: latency < 200 ? '#27ae60' : latency < 500 ? '#e67e22' : '#c0392b' }}>{latency}ms</strong>
            </span>
          )}
          <button className="btn" onClick={load} disabled={loading}>↻ Refresh</button>
        </div>
      </div>

      {loading && !data && <div className="loading-page"><span className="spinner" /> Pinging backend...</div>}

      {error && (
        <div className="alert alert-error">
          <strong>Backend Unreachable:</strong> {error}
        </div>
      )}

      {data && (
        <>
          {/* Status Row */}
          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)', marginBottom: 16 }}>
            <div className={`stat-box ${data.status === 'ok' ? 'success' : 'danger'}`}>
              <div className="stat-label">API Status</div>
              <div className="stat-value" style={{ fontSize: 18 }}>{data.status?.toUpperCase()}</div>
              <div className="stat-sub">{data.environment}</div>
            </div>
            <div className={`stat-box ${data.services.database.status === 'connected' ? 'success' : 'danger'}`}>
              <div className="stat-label">Database</div>
              <div className="stat-value" style={{ fontSize: 18 }}>{data.services.database.connection?.toUpperCase()}</div>
              <div className="stat-sub">{data.services.database.stats?.activeSessions} active sessions</div>
            </div>
            <div className="stat-box">
              <div className="stat-label">Uptime</div>
              <div className="stat-value" style={{ fontSize: 18 }}>{data.services.server.uptime}</div>
              <div className="stat-sub">PID {data.services.server.pid}</div>
            </div>
            <div className="stat-box warning">
              <div className="stat-label">API Latency</div>
              <div className="stat-value" style={{ fontSize: 18 }}>{latency ?? '—'}ms</div>
              <div className="stat-sub">Frontend → Backend</div>
            </div>
          </div>

          <div className="two-col">
            {/* Memory */}
            <div className="card">
              <div className="card-header">Memory Usage</div>
              <div className="card-body">
                {[
                  ['Heap Used', parseMB(data.services.server.memoryUsage.heapUsed), parseMB(data.services.server.memoryUsage.heapTotal), '#2980b9'],
                  ['RSS (Resident)', parseMB(data.services.server.memoryUsage.rss), 512, '#8e44ad'],
                ].map(([label, used, max, color]) => (
                  <div key={label} style={{ marginBottom: 14 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', fontSize: 12 }}>
                      <span>{label}</span>
                      <span className="text-muted">{used.toFixed(1)} / {max.toFixed(0)} MB</span>
                    </div>
                    {bar(used, max, color)}
                  </div>
                ))}
              </div>
            </div>

            {/* Server Info */}
            <div className="card">
              <div className="card-header">Server Info</div>
              <div className="card-body">
                {[
                  ['Node Version', data.services.server.nodeVersion],
                  ['Platform', data.services.server.platform],
                  ['Load Avg (1m)', data.services.server.loadAverage?.[0]?.toFixed(2)],
                  ['Load Avg (5m)', data.services.server.loadAverage?.[1]?.toFixed(2)],
                  ['Load Avg (15m)', data.services.server.loadAverage?.[2]?.toFixed(2)],
                  ['Environment', data.environment],
                  ['Last Refresh', lastRefresh?.toLocaleTimeString()],
                ].map(([k, v]) => (
                  <div className="detail-row" key={k}>
                    <span className="detail-label">{k}</span>
                    <span className="detail-value text-mono">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Raw JSON */}
          <div className="card">
            <div className="card-header">Raw JSON Response</div>
            <div className="card-body" style={{ padding: 0 }}>
              <div className="health-json">{JSON.stringify(data, null, 2)}</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
