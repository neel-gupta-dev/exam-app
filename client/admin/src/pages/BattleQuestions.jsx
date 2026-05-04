import { useState, useEffect } from 'react';
import api from '../api';
import { MathJax, MathJaxContext } from 'better-react-mathjax';

const mathJaxConfig = {
  loader: { load: ["input/tex", "output/chtml"] },
  tex: {
    inlineMath: [["$", "$"], ["\\(", "\\)"]],
    displayMath: [["$$", "$$"], ["\\[", "\\]"]],
  },
};

export default function BattleQuestions() {
  return (
    <MathJaxContext config={mathJaxConfig}>
      <BattleQuestionsContent />
    </MathJaxContext>
  );
}

function BattleQuestionsContent() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form State
  const [subject, setSubject] = useState('Physics');
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState([
    { text: '', isCorrect: true },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
  ]);
  const [difficulty, setDifficulty] = useState('Medium');
  const [explanation, setExplanation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  useEffect(() => {
    fetchQuestions();
  }, []);

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
    const newOptions = options.map((opt, i) => ({
      ...opt,
      isCorrect: i === index
    }));
    setOptions(newOptions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!questionText || options.some(opt => !opt.text)) {
      setError('Please fill in all fields.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const { data } = await api.post('/admin/battle-questions', {
        subject,
        questionText,
        options,
        difficulty,
        explanation
      });
      setQuestions([data, ...questions]);
      // Reset form
      setQuestionText('');
      setExplanation('');
      setOptions([
        { text: '', isCorrect: true },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
      ]);
      setSuccess('Question added successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add question');
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
        {/* FORM SECTION */}
        <div className="card">
          <div className="card-header">Add New Question</div>
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
                  <label className="form-label">Difficulty</label>
                  <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                    <option>Easy</option>
                    <option>Medium</option>
                    <option>Hard</option>
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 12 }}>
                <label className="form-label">Question Text (LaTeX Supported with $...$)</label>
                <textarea
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="e.g. Evaluate $\int_{0}^{1} x^2 dx$"
                  rows={4}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 12 }}>
                <label className="form-label">Options (Select correct one)</label>
                {options.map((opt, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                    <input
                      type="radio"
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

              <div className="form-group" style={{ marginBottom: 20 }}>
                <label className="form-label">Explanation (Optional)</label>
                <textarea
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  placeholder="Explain the solution..."
                  rows={3}
                />
              </div>

              <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{ width: '100%', padding: '10px' }}>
                {isSubmitting ? 'Saving...' : 'Save Question'}
              </button>
            </form>
          </div>
        </div>

        {/* PREVIEW AND LIST SECTION */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Live Preview Card */}
          {showPreview && (
            <div className="card" style={{ border: '2px dashed var(--accent)' }}>
              <div className="card-header" style={{ background: '#fff', color: 'var(--accent)' }}>Live Preview</div>
              <div className="card-body">
                <div style={{ marginBottom: '16px' }}>
                  <span className="badge badge-blue">{subject}</span> <span className="badge badge-gray">{difficulty}</span>
                </div>
                <div style={{ fontSize: '15px', marginBottom: '16px' }}>
                  <MathJax>{questionText || 'Your question will appear here...'}</MathJax>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {options.map((opt, i) => (
                    <div key={i} style={{ 
                      padding: '10px', 
                      border: opt.isCorrect ? '1px solid var(--success)' : '1px solid var(--border)', 
                      borderRadius: '3px',
                      background: opt.isCorrect ? '#f0fdf4' : '#fff'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontWeight: 'bold', color: 'var(--text-muted)' }}>{String.fromCharCode(65+i)}</span>
                        <MathJax>{opt.text || `Option ${String.fromCharCode(65+i)}`}</MathJax>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* List Card */}
          <div className="card">
            <div className="card-header">Existing Questions ({questions.length})</div>
            <div className="card-body" style={{ maxHeight: '500px', overflowY: 'auto' }}>
              {questions.length === 0 ? (
                <div className="text-muted text-center" style={{ padding: '20px' }}>No questions found.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {questions.map((q) => (
                    <div key={q._id} style={{ border: '1px solid var(--border)', borderRadius: '3px', padding: '12px', position: 'relative' }}>
                      <button 
                        className="btn btn-sm btn-danger" 
                        style={{ position: 'absolute', top: '12px', right: '12px' }}
                        onClick={() => handleDelete(q._id)}
                      >
                        Delete
                      </button>
                      <div style={{ marginBottom: '8px' }}>
                        <span className="badge badge-blue" style={{ marginRight: '4px' }}>{q.subject}</span>
                        <span className="badge badge-gray">{q.difficulty}</span>
                      </div>
                      <div style={{ fontWeight: '500', marginBottom: '12px', paddingRight: '60px' }}>
                        <MathJax>{q.questionText}</MathJax>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {q.options.map((o, idx) => (
                          <div key={idx} style={{
                            width: '12px', height: '12px', borderRadius: '50%',
                            background: o.isCorrect ? 'var(--success)' : '#e5e7eb'
                          }} title={o.isCorrect ? 'Correct Option' : 'Incorrect Option'} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

