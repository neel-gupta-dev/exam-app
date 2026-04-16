import { useState, useEffect } from 'react';
import api from '../api';

export default function Cheatsheets() {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [jsonInput, setJsonInput] = useState('');

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      const { data } = await api.get('/cheatsheet/admin');
      setSections(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this section?')) return;
    try {
      await api.delete(`/cheatsheet/${id}`);
      setSections(sections.filter(s => s._id !== id));
    } catch (err) {
      alert('Failed to delete: ' + err.message);
    }
  };

  const handleTogglePublish = async (section) => {
    try {
      const { data } = await api.patch(`/cheatsheet/${section._id}`, {
        isPublished: !section.isPublished
      });
      setSections(sections.map(s => s._id === data._id ? data : s));
    } catch (err) {
      alert('Failed to update: ' + err.message);
    }
  };

  // Simple raw JSON adder for admins 
  const handleAddRawJson = async () => {
    try {
      const parsed = JSON.parse(jsonInput);
      await api.post('/cheatsheet', parsed);
      setJsonInput('');
      fetchSections();
    } catch (err) {
      alert('Invalid JSON or request failed: ' + err.message);
    }
  };

  if (loading) return <div>Loading cheatsheets...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="page-container">
      <div className="card">
        <h3>Manage Cheatsheets</h3>
        <p style={{marginBottom: 10}}>Create and edit blocks of formulas, tables, and grids. Order controls the display sequence.</p>
        
        <table className="table">
          <thead>
            <tr>
              <th>Subject</th>
              <th>Order</th>
              <th>Title</th>
              <th>Blocks</th>
              <th>Color</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sections.map(s => (
              <tr key={s._id}>
                <td style={{textTransform: 'capitalize'}}>{s.subject}</td>
                <td>{s.order}</td>
                <td>{s.title}</td>
                <td>{s.blocks.length} block(s)</td>
                <td>{s.accentColor}</td>
                <td>
                  <button 
                    className={`btn btn-sm ${s.isPublished ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => handleTogglePublish(s)}
                  >
                    {s.isPublished ? 'Published' : 'Draft'}
                  </button>
                </td>
                <td>
                  <button onClick={() => handleDelete(s._id)} className="btn btn-sm btn-danger">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card" style={{marginTop: 20}}>
        <h3>Add Section (Raw JSON)</h3>
        <p style={{fontSize: 12, color: '#666', marginBottom: 10}}>
          Example: {`{"subject":"physics","title":"Kinematics","order":1,"accentColor":"orange","blocks":[{"type":"formula","items":[{"text":"v = u + at"}]}]}`}
        </p>
        <textarea 
          style={{width: '100%', height: 150, fontFamily: 'monospace', padding: 10, background: '#1a1a1a', color: '#fff', border: '1px solid #333'}}
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          placeholder="Paste raw JSON here..."
        />
        <br/>
        <button className="btn btn-primary" onClick={handleAddRawJson} style={{marginTop: 10}}>
          Create Section
        </button>
      </div>
    </div>
  );
}
