import { useState, useEffect, useCallback } from 'react';
import api from '../api';

export default function StudyMaterials() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ type: '', text: '' });
  
  // Upload form states
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('General');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isPublished, setIsPublished] = useState(true);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch ALL materials from the admin-protected endpoint to support drafts
      const { data } = await api.get('/study-materials/admin');
      setMaterials(data);
    } catch (e) {
      setMsg({ type: 'error', text: 'Failed to load study materials' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== 'application/pdf') {
        alert('Please select a valid PDF file.');
        e.target.value = null;
        return;
      }
      setSelectedFile(file);
      
      // Auto-generate a cleaner title from the filename if title is empty
      if (!title) {
        const cleanName = file.name
          .replace(/\.pdf$/i, '')
          .replace(/[-_]+/g, ' ')
          .split(' ')
          .map(w => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');
        setTitle(cleanName);
      }
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return setMsg({ type: 'error', text: 'Please select a PDF file.' });
    if (!title.trim()) return setMsg({ type: 'error', text: 'Please provide a title.' });

    setUploading(true);
    setMsg({ type: '', text: '' });

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('title', title.trim());
    formData.append('subject', subject);
    formData.append('isPublished', String(isPublished)); // Ensure string boolean for FormData compatibility

    try {
      await api.post('/study-materials', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setMsg({ type: 'success', text: 'Study Material uploaded to Cloudinary and synced successfully!' });
      
      // Reset form
      setTitle('');
      setSubject('General');
      setSelectedFile(null);
      setIsPublished(true);
      // Reset native file input element
      const fileInput = document.getElementById('pdf-file-input');
      if (fileInput) fileInput.value = '';
      
      // Reload list
      load();
    } catch (err) {
      setMsg({ 
        type: 'error', 
        text: err.response?.data?.message || 'Upload failed. Check Cloudinary keys.' 
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id, fileTitle) => {
    if (!confirm(`Are you sure you want to permanently delete "${fileTitle}"?\nThis will wipe it from both MongoDB and Cloudinary CDN.`)) {
      return;
    }
    
    try {
      await api.delete(`/study-materials/${id}`);
      setMsg({ type: 'success', text: 'Resource purged from CDN and Database.' });
      load();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Purge failed.' });
    }
  };

  const togglePublishStatus = async (material) => {
    try {
      // Wait, we didn't implement a PUT patch route yet, but we could easily or just skip for now.
      // Let's skip and keep it simple unless user wants to modify in-place.
      // But let's at least make sure they can read drafts.
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    }
  };

  const formatSize = (bytes) => {
    if (!bytes) return 'Unknown';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="breadcrumb">Home / Public Platform</div>
          <h1>📚 Study Materials (Notes)</h1>
        </div>
        <span className="text-muted">{materials.length} total docs</span>
      </div>

      {msg.text && (
        <div className={`alert alert-${msg.type === 'error' ? 'error' : 'success'}`} style={{ marginBottom: 20 }}>
          {msg.text} 
          <button 
            style={{ float:'right', background:'none', border:'none', color: 'inherit', cursor:'pointer', fontSize: '16px' }} 
            onClick={() => setMsg({type:'', text:''})}
          >
            ✕
          </button>
        </div>
      )}

      <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '20px' }}>
        
        {/* Table Section (Left Column) */}
        <div className="card">
          <div className="card-body" style={{ padding: 0 }}>
            <div className="page-header" style={{ padding: '15px 20px', borderBottom: '1px solid var(--border-color)', margin: 0 }}>
              <h3 style={{ margin: 0 }}>Notes Master Index</h3>
            </div>
            
            {loading ? (
              <div className="loading-page" style={{ minHeight: 200 }}><span className="spinner" /> Loading Notes Database...</div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Document Title</th>
                      <th>Subject</th>
                      <th>Status</th>
                      <th>Filesize</th>
                      <th>CDN Link</th>
                      <th>Added</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {materials.map(m => (
                      <tr key={m._id}>
                        <td style={{ maxWidth: 220, fontWeight: 'bold' }}>{m.title}</td>
                        <td>
                          <span className="badge badge-blue" style={{ textTransform: 'uppercase' }}>{m.subject}</span>
                        </td>
                        <td>
                          {m.isPublished ? (
                            <span className="badge badge-green">PUBLISHED</span>
                          ) : (
                            <span className="badge badge-gray" style={{ opacity: 0.6 }}>DRAFT</span>
                          )}
                        </td>
                        <td className="td-mono">{formatSize(m.fileSize)}</td>
                        <td>
                          <a 
                            href={m.cloudinaryUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="btn btn-sm"
                            style={{ textDecoration: 'none' }}
                          >
                            View Cloud ↗
                          </a>
                        </td>
                        <td className="td-mono">{new Date(m.createdAt).toLocaleDateString()}</td>
                        <td>
                          <button 
                            className="btn btn-sm btn-danger" 
                            onClick={() => handleDelete(m._id, m.title)}
                          >
                            Purge Asset
                          </button>
                        </td>
                      </tr>
                    ))}
                    {materials.length === 0 && (
                      <tr>
                        <td colSpan={7} className="text-center text-muted" style={{ padding: 40 }}>
                          No dynamic materials found in Cloudinary. Upload one to start.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Upload Form Section (Right Column) */}
        <div className="card" style={{ height: 'fit-content' }}>
          <div className="card-body" style={{ padding: '20px' }}>
            <h3 style={{ marginTop: 0, marginBottom: 15 }}>📤 Cloudinary Sync Upload</h3>
            <form onSubmit={handleUpload}>
              
              <div style={{ marginBottom: 15 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 'bold', color: '#888', marginBottom: 5, textTransform: 'uppercase' }}>
                  Document PDF File
                </label>
                <input 
                  type="file" 
                  id="pdf-file-input"
                  accept="application/pdf" 
                  onChange={handleFileChange}
                  style={{ width: '100%', padding: 10, background: '#1a1a1a', border: '1px dashed #444', borderRadius: 6, color: '#ccc' }}
                  required
                />
              </div>

              <div style={{ marginBottom: 15 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 'bold', color: '#888', marginBottom: 5, textTransform: 'uppercase' }}>
                  SEO Display Title
                </label>
                <input 
                  type="text" 
                  placeholder="e.g., Limits and Continuity Chart"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #333', background: '#111', color: '#fff' }}
                  required
                />
              </div>

              <div style={{ marginBottom: 15 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 'bold', color: '#888', marginBottom: 5, textTransform: 'uppercase' }}>
                  Platform Subject
                </label>
                <select 
                  value={subject} 
                  onChange={e => setSubject(e.target.value)}
                  style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #333', background: '#111', color: '#fff' }}
                >
                  <option value="General">General</option>
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Biology">Biology</option>
                </select>
              </div>

              <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                <input 
                  type="checkbox" 
                  id="publish-check"
                  checked={isPublished} 
                  onChange={e => setIsPublished(e.target.checked)}
                />
                <label htmlFor="publish-check" style={{ fontSize: 13, userSelect: 'none', cursor: 'pointer' }}>
                  Publish instantly to <strong>/notes</strong>
                </label>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={uploading}
                style={{ width: '100%', padding: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                {uploading ? (
                  <>
                    <span className="spinner" style={{ width: 14, height: 14 }} /> 
                    Streaming to Cloud CDN...
                  </>
                ) : (
                  '🚀 Start Secure Stream Upload'
                )}
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
