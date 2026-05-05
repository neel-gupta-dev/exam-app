import { useState, useEffect } from 'react';
import api from '../api';

export default function ExamManagement() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form State
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState('Engineering');
  const [description, setDescription] = useState('');
  const [registrationLink, setRegistrationLink] = useState('');
  const [icon, setIcon] = useState('Calendar');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => { fetchExams(); }, []);

  const fetchExams = async () => {
    try {
      const { data } = await api.get('/admin/exams');
      setExams(data);
    } catch (err) {
      setError('Failed to fetch exams');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !date) {
      setError('Please fill in name and date.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const payload = { id: editingId, name, date, category, description, registrationLink, icon };
      const { data } = await api.post('/admin/exams', payload);
      
      if (editingId) {
        setExams(exams.map(ex => ex._id === editingId ? data : ex));
        setSuccess('Exam updated successfully!');
      } else {
        setExams([...exams, data].sort((a,b) => new Date(a.date) - new Date(b.date)));
        setSuccess('Exam added successfully!');
      }
      
      resetForm();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save exam');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (ex) => {
    setEditingId(ex._id);
    setName(ex.name);
    setDate(new Date(ex.date).toISOString().split('T')[0]);
    setCategory(ex.category);
    setDescription(ex.description || '');
    setRegistrationLink(ex.registrationLink || '');
    setIcon(ex.icon || 'Calendar');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this exam?')) return;
    try {
      await api.delete(`/admin/exams/${id}`);
      setExams(exams.filter(ex => ex._id !== id));
    } catch (err) {
      alert('Failed to delete exam');
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setDate('');
    setCategory('Engineering');
    setDescription('');
    setRegistrationLink('');
    setIcon('Calendar');
  };

  if (loading) return <div className="page loading-page"><div className="spinner"></div> Loading Exams...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="breadcrumb">System / Data Management</div>
          <h1>Exam Tracking Manager</h1>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="two-col" style={{ alignItems: 'flex-start' }}>
        {/* ── FORM ── */}
        <div className="card">
          <div className="card-header">{editingId ? 'Edit Exam' : 'Add New Exam'}</div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="form-group" style={{ marginBottom: 12 }}>
                <label className="form-label">Exam Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. JEE Main 2026 Session 1"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Exam Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Category</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option>Engineering</option>
                    <option>Medical</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 12 }}>
                <label className="form-label">Description (optional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Additional details about the exam..."
                  rows={2}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 12 }}>
                <label className="form-label">Registration Link (optional)</label>
                <input
                  type="url"
                  value={registrationLink}
                  onChange={(e) => setRegistrationLink(e.target.value)}
                  placeholder="https://jeemain.nta.nic.in"
                />
              </div>

              <div className="form-group" style={{ marginBottom: 20 }}>
                <label className="form-label">Icon Label (Lucide name)</label>
                <input
                  type="text"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  placeholder="Calendar, Target, Star..."
                />
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{ flex: 1 }}>
                  {isSubmitting ? 'Saving...' : editingId ? 'Update Exam' : 'Add Exam'}
                </button>
                {editingId && (
                  <button type="button" className="btn btn-gray" onClick={resetForm}>Cancel</button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* ── LIST ── */}
        <div className="card">
          <div className="card-header">Upcoming Exams ({exams.length})</div>
          <div className="card-body" style={{ maxHeight: 600, overflowY: 'auto' }}>
            {exams.length === 0 ? (
              <div className="text-muted text-center" style={{ padding: 20 }}>No exams tracked yet.</div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Exam Name</th>
                    <th>Date</th>
                    <th>Category</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {exams.map((ex) => (
                    <tr key={ex._id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{ex.name}</div>
                        <div className="text-muted" style={{ fontSize: 11 }}>{ex.description || 'No description'}</div>
                      </td>
                      <td>{new Date(ex.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                      <td><span className={`badge badge-${ex.category === 'Engineering' ? 'blue' : ex.category === 'Medical' ? 'red' : 'gray'}`}>{ex.category}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-sm btn-outline" onClick={() => handleEdit(ex)}>Edit</button>
                          <button className="btn btn-sm btn-danger" onClick={() => handleDelete(ex._id)}>Del</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
