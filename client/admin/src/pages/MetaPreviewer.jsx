import { useState } from 'react';
import api from '../api';

export default function MetaPreviewer() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [metadata, setMetadata] = useState(null);
  const [error, setError] = useState('');

  const fetchMetadata = async (e) => {
    e.preventDefault();
    if (!url) return;
    setLoading(true);
    setError('');
    setMetadata(null);

    try {
      const res = await api.get(`/api/admin/metadata-proxy`, {
        params: { url: url.trim() }
      });
      setMetadata(res.data);
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to fetch metadata';
      setError(`${msg}. Please try another URL.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">📱 Social Meta Previewer</h2>
          <p className="card-subtitle">Check how your links will look on WhatsApp, Twitter, and LinkedIn.</p>
        </div>
        <div className="card-body">
          <form onSubmit={fetchMetadata} className="flex gap-2">
            <input 
              type="url" 
              className="form-control" 
              placeholder="https://lab.vayl.in/v/physics"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />
            <button className="btn btn-primary" disabled={loading}>
              {loading ? 'Fetching...' : 'Analyze Link'}
            </button>
          </form>
          {error && <p style={{ color: '#e74c3c', marginTop: '1rem', fontSize: '0.8rem', fontWeight: 'bold' }}>{error}</p>}
        </div>
      </div>

      {metadata && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* WhatsApp Preview */}
          <div className="card" style={{ background: '#075e54', color: 'white' }}>
            <div className="p-4 border-b border-white/10 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20" />
              <span className="text-sm font-bold">WhatsApp Business</span>
            </div>
            <div className="p-4">
              <div className="bg-[#dcf8c6] text-black p-2 rounded-lg shadow-sm max-w-[85%]">
                <div className="bg-black/5 rounded-md overflow-hidden mb-2">
                  {metadata.image && <img src={metadata.image} alt="Preview" className="w-full h-32 object-cover" />}
                  <div className="p-2 border-l-4 border-emerald-500 bg-white/50">
                    <div className="text-[10px] font-bold text-gray-500 uppercase">{metadata.siteName}</div>
                    <div className="text-xs font-bold line-clamp-1">{metadata.title}</div>
                    <div className="text-[10px] text-gray-600 line-clamp-2">{metadata.description}</div>
                  </div>
                </div>
                <div className="text-xs text-blue-600 underline break-all">{url}</div>
              </div>
            </div>
          </div>

          {/* Twitter / X Preview */}
          <div className="card" style={{ background: '#000', color: 'white', border: '1px solid #333' }}>
            <div className="p-4 border-b border-white/10 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-400" />
              <span className="text-sm font-bold text-gray-300">VAYL Social</span>
            </div>
            <div className="p-4">
              <div className="border border-[#333] rounded-2xl overflow-hidden hover:bg-white/5 transition-colors cursor-pointer">
                {metadata.image && <img src={metadata.image} alt="Preview" className="w-full h-48 object-cover" />}
                <div className="p-3 bg-[#000]">
                  <div className="text-xs text-gray-500 mb-1">{new URL(url).hostname}</div>
                  <div className="text-sm font-bold text-white mb-1">{metadata.title}</div>
                  <div className="text-sm text-gray-400 line-clamp-2">{metadata.description}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Google / SEO Preview */}
          <div className="card col-span-1 md:col-span-2">
            <div className="card-header border-b">
              <h3 className="card-title text-xs uppercase tracking-widest text-gray-400">Google Search Preview</h3>
            </div>
            <div className="card-body p-6 bg-white rounded-b-3xl">
              <div className="max-w-xl">
                <div className="text-[12px] text-[#202124] mb-1 flex items-center gap-1">
                  {new URL(url).hostname} <span className="text-gray-400 text-[10px]">› ...</span>
                </div>
                <div className="text-xl text-[#1a0dab] hover:underline cursor-pointer mb-1">
                  {metadata.title}
                </div>
                <div className="text-sm text-[#4d5156] line-clamp-2">
                  {metadata.description}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
