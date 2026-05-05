import { useState, useEffect } from 'react';

const COMMON_MEDIUMS = [
  'social',
  'email',
  'cpc',
  'referral',
  'organic',
  'whatsapp',
  'banner',
  'video',
  'affiliate',
  'internal_referral'
];

export default function UTMGenerator() {
  const [url, setUrl] = useState('');
  const [source, setSource] = useState('');
  const [medium, setMedium] = useState('');
  const [campaign, setCampaign] = useState('');
  const [term, setTerm] = useState('');
  const [content, setContent] = useState('');
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!url) {
      setGeneratedUrl('');
      return;
    }

    try {
      const baseUrl = url.trim();
      const params = new URLSearchParams();

      if (source.trim()) params.append('utm_source', source.trim());
      if (medium.trim()) params.append('utm_medium', medium.trim());
      if (campaign.trim()) params.append('utm_campaign', campaign.trim());
      if (term.trim()) params.append('utm_term', term.trim());
      if (content.trim()) params.append('utm_content', content.trim());

      const queryStr = params.toString();
      const connector = baseUrl.includes('?') ? '&' : '?';
      
      setGeneratedUrl(queryStr ? `${baseUrl}${connector}${queryStr}` : baseUrl);
    } catch (e) {
      setGeneratedUrl('Invalid URL');
    }
  }, [url, source, medium, campaign, term, content]);

  const copyToClipboard = () => {
    if (!generatedUrl || generatedUrl === 'Invalid URL') return;
    navigator.clipboard.writeText(generatedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">🚀 UTM Link Generator</h2>
        <p className="card-subtitle">Generate trackable links for marketing and growth analysis.</p>
      </div>

      <div className="card-body">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div className="space-y-4">
            <div className="form-group">
              <label className="form-label">Base URL (Domain + Page)</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="https://vayl.in/studio" 
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              <small style={{ color: '#7f8c8d' }}>Include http:// or https://</small>
            </div>

            <div className="form-group">
              <label className="form-label">UTM Source (Where?)</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="google, facebook, github, newsletter" 
                value={source}
                onChange={(e) => setSource(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">UTM Medium (How?)</label>
              <select 
                className="form-control"
                value={medium}
                onChange={(e) => setMedium(e.target.value)}
              >
                <option value="">Select Medium...</option>
                {COMMON_MEDIUMS.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
                <option value="custom">-- Custom --</option>
              </select>
              {medium === 'custom' && (
                <input 
                  type="text" 
                  className="form-control" 
                  style={{ marginTop: '0.5rem' }}
                  placeholder="Enter custom medium" 
                  onBlur={(e) => setMedium(e.target.value)}
                />
              )}
            </div>

            <div className="form-group">
              <label className="form-label">UTM Campaign (Why?)</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="summer_sale, launch_2026" 
                value={campaign}
                onChange={(e) => setCampaign(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">UTM Term / Content (Optional)</label>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Term (keywords)" 
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                />
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Content (A/B test)" 
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="form-group">
              <label className="form-label">Preview & Generated Link</label>
              <div 
                style={{ 
                  background: '#2c3e50', 
                  color: '#27ae60', 
                  padding: '1.5rem', 
                  borderRadius: '12px',
                  wordBreak: 'break-all',
                  minHeight: '100px',
                  border: '1px solid #34495e',
                  fontFamily: 'monospace',
                  fontSize: '0.9rem'
                }}
              >
                {generatedUrl || 'Start filling the form to generate your link...'}
              </div>
            </div>

            <button 
              className={`btn w-full ${copied ? 'btn-success' : 'btn-primary'}`}
              style={{ padding: '1rem', fontWeight: 'bold' }}
              onClick={copyToClipboard}
              disabled={!generatedUrl || generatedUrl === 'Invalid URL'}
            >
              {copied ? '✅ Copied to Clipboard!' : '🔗 Copy Trackable Link'}
            </button>

            <div style={{ marginTop: '2rem', padding: '1rem', background: '#f8f9fa', borderRadius: '12px', border: '1px solid #dee2e6' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#34495e' }}>💡 Quick Tips:</h4>
              <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.8rem', color: '#7f8c8d', lineHeight: '1.5' }}>
                <li>Use lowercase for everything to avoid messy data in GA4.</li>
                <li>Avoid using spaces; use underscores (_) or hyphens (-).</li>
                <li>Ensure the URL starts with <strong>https://</strong>.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
