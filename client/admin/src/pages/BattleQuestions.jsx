import { useState, useEffect } from 'react';
import api from '../api';
import LatexRenderer from '../components/LatexRenderer';

export default function BattleQuestions() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [subject, setSubject] = useState('Physics');
  const [questionCode, setQuestionCode] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [type, setType] = useState('single');
  const [correctInteger, setCorrectInteger] = useState('');
  const [options, setOptions] = useState([
    { text: '', isCorrect: true },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
  ]);
  const [difficulty, setDifficulty] = useState('Medium');
  const [explanation, setExplanation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);



  useEffect(() => { fetchQuestions(); }, []);

  const fetchQuestions = async () => {
    try {
      const { data } = await api.get('/admin/battle-questions');
      setQuestions(data);
    } catch (err) {
      setError('Failed to fetch questions');
    } finally {
      setLoading(false);
    }
  };

  const handleOptionChange = (index, text) => {
    const newOptions = [...options];
    newOptions[index].text = text;
    setOptions(newOptions);
  };

  const handleCorrectOptionChange = (index) => {
    if (type === 'multi') {
      const newOptions = [...options];
      newOptions[index].isCorrect = !newOptions[index].isCorrect;
      setOptions(newOptions);
    } else {
      setOptions(options.map((opt, i) => ({ ...opt, isCorrect: i === index })));
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setQuestionCode('');
    setQuestionText('');
    setExplanation('');
    setType('single');
    setCorrectInteger('');
    setOptions([
      { text: '', isCorrect: true },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
    ]);
  };

  const handleEdit = (q) => {
    setEditingId(q._id);
    setSubject(q.subject);
    setQuestionCode(q.questionCode || '');
    setQuestionText(q.questionText);
    setType(q.type || 'single');
    setCorrectInteger(q.correctInteger !== undefined ? q.correctInteger : '');
    setDifficulty(q.difficulty);
    setExplanation(q.explanation || '');
    setOptions(q.options.map(o => ({ text: o.text, isCorrect: o.isCorrect })));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    const isOptionsMissing = type !== 'integer' && options.some(opt => !opt.text);
    const isIntegerMissing = type === 'integer' && (correctInteger === '' || correctInteger === null);

    if (!questionText || isOptionsMissing || isIntegerMissing) {
      setError('Please fill in all fields.');
      return;
    }
    if (type !== 'integer' && !options.some(opt => opt.isCorrect)) {
      setError('At least one option must be marked as correct.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        subject, questionText, options, difficulty, explanation, type, questionCode,
        correctInteger: type === 'integer' ? Number(correctInteger) : undefined
      };
      
      if (editingId) {
        const { data } = await api.patch(`/admin/battle-questions/${editingId}`, payload);
        setQuestions(questions.map(q => q._id === editingId ? data : q));
        setSuccess('Question updated successfully!');
      } else {
        const { data } = await api.post('/admin/battle-questions', payload);
        setQuestions([data, ...questions]);
        setSuccess('Question added successfully!');
      }
      resetForm();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save question');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    try {
      await api.delete(`/admin/battle-questions/${id}`);
      setQuestions(questions.filter(q => q._id !== id));
    } catch (err) {
      alert('Failed to delete question');
    }
  };

  if (loading) return <div className="page loading-page"><div className="spinner"></div> Loading Questions...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="breadcrumb">Exam Platform / JEE Battle</div>
          <h1>Battle Question Manager</h1>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="two-col" style={{ alignItems: 'flex-start' }}>
        {/* ── FORM ── */}
        <div className="card">
          <div className="card-header">{editingId ? 'Edit Question' : 'Add New Question'}</div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Subject</label>
                  <select value={subject} onChange={(e) => setSubject(e.target.value)}>
                    <option>Physics</option>
                    <option>Chemistry</option>
                    <option>Mathematics</option>
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Type</label>
                  <select value={type} onChange={(e) => setType(e.target.value)}>
                    <option value="single">Single Correct</option>
                    <option value="multi">Multi Correct</option>
                    <option value="integer">Integer Type</option>
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Difficulty</label>
                  <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                    <option>Easy</option>
                    <option>Medium</option>
                    <option>Hard</option>
                  </select>
                </div>
              </div>

              {editingId && (
                <div className="form-group" style={{ marginBottom: 12 }}>
                  <label className="form-label">Question Code (Unique ID)</label>
                  <input
                    type="text"
                    value={questionCode}
                    onChange={(e) => setQuestionCode(e.target.value)}
                    placeholder="e.g. PHY-001"
                    style={{ width: '100%' }}
                  />
                </div>
              )}

              <div className="form-group" style={{ marginBottom: 12 }}>
                <label className="form-label">Question Text (LaTeX supported: $...$)</label>
                <textarea
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder={'e.g. Evaluate $\\\\int_{0}^{1} x^2 \\\\, dx$'}
                  rows={4}
                  style={{ width: '100%' }}
                  required
                />
              </div>

              {type === 'integer' ? (
                <div className="form-group" style={{ marginBottom: 12 }}>
                  <label className="form-label">Correct Integer Answer</label>
                  <input
                    type="number"
                    value={correctInteger}
                    onChange={(e) => setCorrectInteger(e.target.value)}
                    placeholder="e.g. 42"
                    style={{ width: '100%' }}
                    required
                  />
                </div>
              ) : (
                <div className="form-group" style={{ marginBottom: 12 }}>
                  <label className="form-label">Options ({type === 'multi' ? 'select multiple' : 'select the correct one'})</label>
                  {options.map((opt, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                      <input
                        type={type === 'multi' ? 'checkbox' : 'radio'}
                        name="correctOption"
                        checked={opt.isCorrect}
                        onChange={() => handleCorrectOptionChange(idx)}
                        style={{ cursor: 'pointer' }}
                      />
                      <input
                        type="text"
                        value={opt.text}
                        onChange={(e) => handleOptionChange(idx, e.target.value)}
                        placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                        required
                        style={{ flex: 1 }}
                      />
                    </div>
                  ))}
                </div>
              )}

              <div className="form-group" style={{ marginBottom: 20 }}>
                <label className="form-label">Explanation (optional)</label>
                <textarea
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  placeholder="Explain the solution..."
                  rows={3}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{ flex: 1, padding: 10 }}>
                  {isSubmitting ? 'Saving...' : (editingId ? 'Update Question' : 'Save Question')}
                </button>
                {editingId && (
                  <button type="button" className="btn btn-secondary" onClick={resetForm} style={{ flex: 1 }}>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* ── PREVIEW + LIST ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Live preview */}
          <div className="card" style={{ border: '2px dashed var(--accent)' }}>
            <div className="card-header" style={{ background: '#fff', color: 'var(--accent)' }}>Live Preview</div>
            <div className="card-body">
              <div style={{ marginBottom: 16 }}>
                {questionCode && <span className="badge badge-gray" style={{ marginRight: 8 }}>{questionCode}</span>}
                <span className="badge badge-blue">{subject}</span>{' '}
                <span className="badge badge-gray">{difficulty}</span>{' '}
                <span className="badge badge-purple">
                  {type === 'multi' ? 'Multi-Correct' : type === 'integer' ? 'Integer Type' : 'Single-Correct'}
                </span>
              </div>
              <div style={{ fontSize: 15, marginBottom: 16 }}>
                <LatexRenderer text={questionText || 'Your question will appear here...'} />
              </div>
              {type === 'integer' ? (
                <div style={{ padding: 10, border: '1px solid var(--success)', borderRadius: 3, background: '#f0fdf4' }}>
                  <strong>Answer:</strong> {correctInteger || '...'}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {options.map((opt, i) => (
                    <div key={i} style={{
                      padding: 10,
                      border: opt.isCorrect ? '1px solid var(--success)' : '1px solid var(--border)',
                      borderRadius: 3,
                      background: opt.isCorrect ? '#f0fdf4' : '#fff'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontWeight: 'bold', color: 'var(--text-muted)' }}>{String.fromCharCode(65 + i)}</span>
                        <span>
                          <LatexRenderer text={opt.text || `Option ${String.fromCharCode(65 + i)}`} />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Existing questions */}
          <div className="card">
            <div className="card-header">All Questions ({questions.length})</div>
            <div className="card-body" style={{ maxHeight: 800, overflowY: 'auto' }}>
              {questions.length === 0 ? (
                <div className="text-muted text-center" style={{ padding: 20 }}>No questions found.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  {['Physics', 'Chemistry', 'Mathematics'].map((subj) => {
                    const subjQuestions = questions.filter(q => q.subject === subj);
                    if (subjQuestions.length === 0) return null;

                    return (
                      <div key={subj}>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 12, 
                          marginBottom: 12,
                          padding: '8px 12px',
                          background: 'var(--surface-variant)',
                          borderRadius: 6,
                          borderLeft: `4px solid ${subj === 'Physics' ? '#3b82f6' : subj === 'Chemistry' ? '#10b981' : '#8b5cf6'}`
                        }}>
                          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: 'var(--on-surface)' }}>{subj}</h3>
                          <span className="badge badge-gray">{subjQuestions.length}</span>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingLeft: 8 }}>
                          {subjQuestions.map((q) => (
                            <div key={q._id} style={{ border: '1px solid var(--border)', borderRadius: 3, padding: 12, position: 'relative', background: '#fff' }}>
                              <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 8 }}>
                                <button
                                  className="btn btn-sm btn-outline"
                                  onClick={() => handleEdit(q)}
                                >
                                  Edit
                                </button>
                                <button
                                  className="btn btn-sm btn-danger"
                                  onClick={() => handleDelete(q._id)}
                                >
                                  Delete
                                </button>
                              </div>
                              <div style={{ marginBottom: 8 }}>
                                {q.questionCode && <span className="badge badge-gray" style={{ marginRight: 4 }}>{q.questionCode}</span>}
                                <span className="badge badge-blue" style={{ marginRight: 4 }}>{q.subject}</span>
                                <span className="badge badge-gray" style={{ marginRight: 4 }}>{q.difficulty}</span>
                                <span className="badge badge-purple">{q.type === 'integer' ? 'Integer' : (q.type === 'multi' ? 'Multi' : 'Single')}</span>
                              </div>
                              <div style={{ fontWeight: 500, marginBottom: 12, paddingRight: 60, display: 'block' }}>
                                <LatexRenderer text={q.questionText} />
                              </div>
                              {q.type === 'integer' ? (
                                <div style={{ fontSize: '12px', color: 'var(--success)', fontWeight: 'bold' }}>
                                  Ans: {q.correctInteger}
                                </div>
                              ) : (
                                <div style={{ display: 'flex', gap: 8 }}>
                                  {q.options.map((o, idx) => (
                                    <div key={idx} style={{
                                      width: 12, height: 12, borderRadius: '50%',
                                      background: o.isCorrect ? 'var(--success)' : '#e5e7eb'
                                    }} title={o.isCorrect ? 'Correct' : 'Incorrect'} />
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
