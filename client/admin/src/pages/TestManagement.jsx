import { useState, useEffect } from 'react';
import api from '../api';
import LatexRenderer from '../components/LatexRenderer';

/* ─────────────────────────────────────────────────────────────────────────────
   TableEditor — builds a header + data-rows table for a question or option
   ─────────────────────────────────────────────────────────────────────────── */
function TableEditor({ value, onChange, label = 'Table' }) {
  const table = value || { headers: [], rows: [] };
  const cols = table.headers?.length || 2;
  const rows = table.rows?.length || 0;

  const setCols = (n) => {
    const n2 = Math.max(1, Math.min(8, n));
    const headers = Array.from({ length: n2 }, (_, i) => table.headers?.[i] ?? '');
    const newRows = (table.rows || []).map(r => Array.from({ length: n2 }, (_, i) => r[i] ?? ''));
    onChange({ headers, rows: newRows });
  };

  const setRows = (n) => {
    const n2 = Math.max(0, Math.min(20, n));
    const currentCols = table.headers?.length || 2;
    const newRows = Array.from({ length: n2 }, (_, i) => table.rows?.[i] ?? Array(currentCols).fill(''));
    const headers = table.headers?.length ? table.headers : Array(currentCols).fill('');
    onChange({ headers, rows: newRows });
  };

  const setHeader = (ci, val) => {
    const h = [...(table.headers || [])];
    while (h.length <= ci) h.push('');
    h[ci] = val;
    onChange({ ...table, headers: h });
  };

  const setCell = (ri, ci, val) => {
    const nr = (table.rows || []).map(r => [...r]);
    while (nr.length <= ri) {
      nr.push(Array(cols).fill(''));
    }
    nr[ri][ci] = val;
    onChange({ ...table, rows: nr });
  };

  const cellStyle = { border: '1px solid var(--border)', padding: '4px 6px', minWidth: 70, background: 'rgba(0,0,0,0.15)', color: 'inherit', fontSize: 12, width: '100%' };
  const thStyle = { ...cellStyle, background: 'rgba(79,70,229,0.18)', fontWeight: 600 };

  return (
    <div style={{ marginTop: 8, padding: 10, background: 'rgba(79,70,229,0.05)', borderRadius: 6, border: '1px solid rgba(79,70,229,0.2)' }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' }}>
        <strong style={{ fontSize: 12, color: '#818cf8' }}>📊 ${label}</strong>
        <label style={{ fontSize: 12 }}>Cols: <input type="number" min={1} max={8} value={cols} onChange={e => setCols(Number(e.target.value))} style={{ width: 44, padding: '2px 4px', fontSize: 12 }} /></label>
        <label style={{ fontSize: 12 }}>Rows: <input type="number" min={0} max={20} value={rows} onChange={e => setRows(Number(e.target.value))} style={{ width: 44, padding: '2px 4px', fontSize: 12 }} /></label>
        <button type="button" className="btn btn-sm" style={{ fontSize: 11, padding: '2px 8px', marginLeft: 'auto', background: 'rgba(239,68,68,0.15)', color: '#ef4444' }} onClick={() => onChange(null)}>✕ Remove Table</button>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr>
              {Array.from({ length: cols }, (_, ci) => (
                <th key={ci} style={{ padding: 2 }}>
                  <input value={table.headers?.[ci] ?? ''} onChange={e => setHeader(ci, e.target.value)} placeholder={`Col ${ci + 1}`} style={thStyle} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }, (_, ri) => (
              <tr key={ri}>
                {Array.from({ length: cols }, (_, ci) => (
                  <td key={ci} style={{ padding: 2 }}>
                    <input value={(table.rows?.[ri] ?? [])[ci] ?? ''} onChange={e => setCell(ri, ci, e.target.value)} placeholder="—" style={cellStyle} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   RenderContentTable — beautifully renders the custom question/option table
   ─────────────────────────────────────────────────────────────────────────── */
function RenderContentTable({ table }) {
  if (!table || !table.headers || table.headers.length === 0) return null;
  const thStyle = { border: '1px solid rgba(255,255,255,0.15)', padding: '6px 10px', background: 'rgba(79,70,229,0.12)', fontWeight: 600, fontSize: '12px', textAlign: 'left' };
  const tdStyle = { border: '1px solid rgba(255,255,255,0.1)', padding: '6px 10px', fontSize: '12px' };
  return (
    <div style={{ margin: '8px 0', overflowX: 'auto' }}>
      <table style={{ borderCollapse: 'collapse', minWidth: '150px', background: 'rgba(0,0,0,0.1)' }}>
        <thead>
          <tr>
            {table.headers.map((h, i) => (
              <th key={i} style={thStyle}><LatexRenderer text={h || ''} /></th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(table.rows || []).map((row, ri) => (
            <tr key={ri}>
              {row.map((cell, ci) => (
                <td key={ci} style={tdStyle}><LatexRenderer text={cell || ''} /></td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function TestManagement() {
  const [tests, setTests] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTest, setEditingTest] = useState(null);
  const [selectedTest, setSelectedTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);

  // PDF Import state
  const [showPdfImport, setShowPdfImport] = useState(false);
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfPreview, setPdfPreview] = useState(null);
  const [pdfStats, setPdfStats] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState(null);

  // JSON Import state
  const [showJsonImport, setShowJsonImport] = useState(false);
  const [jsonFile, setJsonFile] = useState(null);
  const [jsonPreview, setJsonPreview] = useState(null);
  const [jsonLoading, setJsonLoading] = useState(false);
  const [jsonError, setJsonError] = useState(null);
  const [imageUploading, setImageUploading] = useState('');

  const handleCopyShareLink = (testId) => {
    // Determine student URL based on environment
    const isProd = window.location.hostname !== 'localhost' && !window.location.hostname.includes('127.0.0.1');
    const studentBase = isProd ? 'https://tests.vayl.in' : 'http://localhost:5173';
    const shareUrl = `${studentBase}/t/${testId}`;
    navigator.clipboard.writeText(shareUrl);
    alert(`🔗 Share link copied to clipboard:\n${shareUrl}`);
  };

  // Test form state
  const [form, setForm] = useState({
    title: '', description: '', category: 'General', testType: 'full', durationMinutes: 180,
    totalMarks: 300, visibility: 'b2c_public', targetTenants: [], targetGroups: [],
    defaultPositiveMarks: 4, defaultNegativeMarks: 1, syllabusText: '',
    instructionGeneralText: '',
    instructionOtherText: '',
    instructionDeclaration: '',
    sectionsText: '', // Format: Name, QuestionCount, MaxAttemptable
  });

  // Question form state
  const [qForm, setQForm] = useState({
    section: 'General', type: 'single', content: '', imageUrl: '',
    contentTable: null,
    options: [
      { label: 'A', content: '', imageUrl: '', contentTable: null }, { label: 'B', content: '', imageUrl: '', contentTable: null },
      { label: 'C', content: '', imageUrl: '', contentTable: null }, { label: 'D', content: '', imageUrl: '', contentTable: null },
    ],
    correctAnswer: [], solution: '', solutionImageUrl: '', positiveMarks: '', negativeMarks: '',
    tags: '', difficulty: 'medium',
  });

  const handleJsonPreview = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setJsonFile(file);
    setJsonError(null);
    setJsonPreview(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        const questions = Array.isArray(data) ? data : data.questions;
        if (!Array.isArray(questions)) throw new Error('Invalid JSON format: Expected an array of questions.');
        setJsonPreview(questions);
      } catch (err) {
        setJsonError(err.message);
      }
    };
    reader.readAsText(file);
  };

  const handleJsonConfirmImport = async () => {
    if (!selectedTest || !jsonPreview) return;
    try {
      setJsonLoading(true);
      await api.post(`/tests/${selectedTest._id}/questions/bulk`, { questions: jsonPreview });
      alert('Questions imported successfully!');
      setShowJsonImport(false);
      setJsonPreview(null);
      setJsonFile(null);
      fetchQuestions(selectedTest._id);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to import JSON');
    } finally {
      setJsonLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [tRes, tenRes, gRes] = await Promise.all([
        api.get('/tests/admin'),
        api.get('/b2b/tenants').catch(() => ({ data: [] })),
        api.get('/b2b/groups').catch(() => ({ data: [] })),
      ]);
      setTests(tRes.data?.tests || tRes.data || []);
      setTenants(tenRes.data || []);
      setGroups(gRes.data || []);
    } catch (e) {
      console.error(e);
    } finally { setLoading(false); }
  };

  const fetchTests = async () => {
    try {
      const res = await api.get('/tests/admin');
      setTests(res.data?.tests || res.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchQuestions = async (testId) => {
    try {
      const res = await api.get(`/tests/${testId}/questions`);
      setQuestions(res.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleTestImageUpload = async (file, purpose, onUploaded) => {
    if (!file || !selectedTest) return;
    if (!file.type?.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }

    try {
      setImageUploading(purpose);
      const formData = new FormData();
      formData.append('image', file);
      formData.append('purpose', purpose);
      const res = await api.post(`/tests/${selectedTest._id}/images`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onUploaded(res.data.url);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to upload image');
    } finally {
      setImageUploading('');
    }
  };

  const handleSubmitTest = async (e) => {
    e.preventDefault();
    try {
      const {
        syllabusText,
        instructionGeneralText,
        instructionOtherText,
        instructionDeclaration,
        ...testFields
      } = form;
      const payload = {
        ...testFields,
        syllabus: syllabusText?.split('\n').map(s => s.trim()).filter(Boolean) || [],
        instructions: {
          general: instructionGeneralText?.split('\n').map(s => s.trim()).filter(Boolean) || [],
          other: instructionOtherText?.split('\n').map(s => s.trim()).filter(Boolean) || [],
          declaration: instructionDeclaration?.trim() || undefined,
        },
        sections: form.sectionsText?.split('\n').map(line => {
          const [name, count, max, correct, incorrect, unattempted, partial, partialMark, partialIncorrect] = line.split(',').map(s => s.trim());
          if (!name) return null;
          const sectionObj = {
            name,
            questionCount: parseInt(count) || 0,
            maxAttemptable: max && max !== 'null' ? parseInt(max) : null
          };
          if (correct !== undefined) {
            sectionObj.markingScheme = {
              correct: Number(correct) || 0,
              incorrect: Number(incorrect) || 0,
              unattempted: Number(unattempted) || 0,
              partial: partial === 'true',
              partialMarkPerOption: Number(partialMark) || 0,
              partialIncorrect: Number(partialIncorrect) || 0,
            };
          }
          return sectionObj;
        }).filter(Boolean) || [],
      };
      if (editingTest) {
        await api.patch(`/tests/${editingTest._id}`, payload);
      } else {
        await api.post('/tests', payload);
      }
      setShowForm(false);
      setEditingTest(null);
      setForm({ title: '', description: '', category: 'General', testType: 'full', durationMinutes: 180, totalMarks: 300, visibility: 'b2c_public', targetTenants: [], targetGroups: [], defaultPositiveMarks: 4, defaultNegativeMarks: 1, syllabusText: '', instructionGeneralText: '', instructionOtherText: '', instructionDeclaration: '', sectionsText: '' });
      fetchTests();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save test');
    }
  };

  const handleTogglePublish = async (testId) => {
    try {
      await api.patch(`/tests/${testId}/publish`);
      fetchTests();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle publish');
    }
  };

  const handleDeleteTest = async (testId) => {
    if (!confirm('Delete this test and ALL its questions?')) return;
    try {
      await api.delete(`/tests/${testId}`);
      fetchTests();
      if (selectedTest?._id === testId) { setSelectedTest(null); setQuestions([]); }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    if (!selectedTest) return;
    try {
      const payload = {
        ...qForm,
        positiveMarks: qForm.positiveMarks ? Number(qForm.positiveMarks) : null,
        negativeMarks: qForm.negativeMarks ? Number(qForm.negativeMarks) : null,
        imageUrl: qForm.imageUrl || null,
        matrixRows: qForm.matrixRows || [],
        matrixColumns: qForm.matrixColumns || [],
        tags: qForm.tags ? qForm.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      };

      if (editingQuestion) {
        await api.patch(`/tests/${selectedTest._id}/questions/${editingQuestion._id}`, payload);
      } else {
        await api.post(`/tests/${selectedTest._id}/questions`, payload);
      }

      setShowQuestionForm(false);
      setEditingQuestion(null);
      setQForm({
        section: 'General', type: 'single', content: '', imageUrl: '',
        options: [
          { label: 'A', content: '', imageUrl: '' }, { label: 'B', content: '', imageUrl: '' },
          { label: 'C', content: '', imageUrl: '' }, { label: 'D', content: '', imageUrl: '' },
        ],
        correctAnswer: [], solution: '', solutionImageUrl: '', positiveMarks: '', negativeMarks: '',
        tags: '', difficulty: 'medium',
      });
      fetchQuestions(selectedTest._id);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save question');
    }
  };

  const handleDeleteQuestion = async (qId) => {
    if (!confirm('Delete this question?')) return;
    try {
      await api.delete(`/tests/${selectedTest._id}/questions/${qId}`);
      fetchQuestions(selectedTest._id);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  // PDF Import handlers
  const handlePdfPreview = async () => {
    if (!pdfFile || !selectedTest) return;
    setPdfLoading(true);
    setPdfError(null);
    setPdfPreview(null);
    setPdfStats(null);
    try {
      const formData = new FormData();
      formData.append('pdf', pdfFile);
      formData.append('mode', 'preview');
      const res = await api.post(`/tests/${selectedTest._id}/questions/import-pdf`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.questions) {
        setPdfPreview(res.data.questions);
        setPdfStats(res.data.stats);
      } else {
        // Parse failed — show diagnostic
        setPdfError({ message: res.data.message, textSample: res.data.textSample });
      }
    } catch (err) {
      const data = err.response?.data;
      setPdfError({ message: data?.message || 'Failed to parse PDF', textSample: data?.textSample || null });
    } finally { setPdfLoading(false); }
  };

  const handlePdfConfirmImport = async () => {
    if (!pdfFile || !selectedTest) return;
    setPdfLoading(true);
    try {
      const formData = new FormData();
      formData.append('pdf', pdfFile);
      formData.append('mode', 'import');
      const res = await api.post(`/tests/${selectedTest._id}/questions/import-pdf`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert(`✅ ${res.data.count} questions imported!`);
      setPdfPreview(null); setPdfStats(null); setPdfFile(null); setShowPdfImport(false);
      fetchQuestions(selectedTest._id);
    } catch (err) {
      alert(err.response?.data?.message || 'Import failed');
    } finally { setPdfLoading(false); }
  };

  const visibilityLabel = (v) => ({ b2c_public: '🌐 B2C Public', b2c_group: '🎯 B2C Group', b2b_coaching: '🏢 B2B Coaching', b2b_group: '🏷️ B2B Group' }[v] || v);

  if (loading) return <div className="page"><h1>Test Management</h1><p>Loading...</p></div>;

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1>📝 Test Management</h1>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn" onClick={() => {
            setForm({
              ...form,
              title: 'NEET Mock Test', category: 'NEET', totalMarks: 720, durationMinutes: 200,
              sectionsText: 'Physics Sec A, 35, null\nPhysics Sec B, 15, 10\nChemistry Sec A, 35, null\nChemistry Sec B, 15, 10\nBotany Sec A, 35, null\nBotany Sec B, 15, 10\nZoology Sec A, 35, null\nZoology Sec B, 15, 10'
            });
            setShowForm(true);
            setEditingTest(null);
          }}>
            🍀 NEET Preset
          </button>
          <button className="btn" onClick={() => {
            setForm({
              ...form,
              title: 'JEE Mains Mock Test', category: 'JEE Mains', totalMarks: 300, durationMinutes: 180,
              sectionsText: 'Physics Sec A, 20, null\nPhysics Sec B, 5, null\nChemistry Sec A, 20, null\nChemistry Sec B, 5, null\nMaths Sec A, 20, null\nMaths Sec B, 5, null'
            });
            setShowForm(true);
            setEditingTest(null);
          }}>
            ⚡ JEE Mains Preset
          </button>
          <button className="btn" onClick={() => {
            setForm({
              ...form,
              title: 'JEE Advanced Practice Test',
              category: 'JEE Advance',
              totalMarks: 372,
              durationMinutes: 180,
              defaultPositiveMarks: 3,
              defaultNegativeMarks: 1,
              syllabusText: 'Physics: Mechanics, Waves, Electromagnetism, Modern Physics\nChemistry: Physical, Organic, Inorganic\nMathematics: Algebra, Calculus, Coordinate Geometry, Vectors',
              instructionGeneralText: 'The test is of 3 hours duration.\nThe test consists of three parts: Physics, Chemistry, and Mathematics.\nEach part has three sections.\nSection 1 contains 6 Single Correct Option questions.\nSection 2 contains 6 Multiple Correct Option questions with partial marking.\nSection 3 contains 6 Numerical Answer questions.',
              instructionOtherText: 'Make sure your internet connection is stable.\nDo not refresh the page during the exam.',
              instructionDeclaration: 'I have read all the instructions carefully and agree to abide by the rules of the examination.',
              sectionsText: 'Physics Section 1 (SCQ), 6, null, 3, -1, 0, false, 0, -1\nPhysics Section 2 (MCQ), 6, null, 4, -2, 0, true, 1, -2\nPhysics Section 3 (Numerical), 6, null, 3, 0, 0, false, 0, 0\nChemistry Section 1 (SCQ), 6, null, 3, -1, 0, false, 0, -1\nChemistry Section 2 (MCQ), 6, null, 4, -2, 0, true, 1, -2\nChemistry Section 3 (Numerical), 6, null, 3, 0, 0, false, 0, 0\nMathematics Section 1 (SCQ), 6, null, 3, -1, 0, false, 0, -1\nMathematics Section 2 (MCQ), 6, null, 4, -2, 0, true, 1, -2\nMathematics Section 3 (Numerical), 6, null, 3, 0, 0, false, 0, 0'
            });
            setShowForm(true);
            setEditingTest(null);
          }}>
            🌟 JEE Advanced Preset
          </button>
          <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); setEditingTest(null); }}>
            {showForm ? 'Cancel' : '+ Create Test'}
          </button>
        </div>
      </div>

      {/* Create/Edit Test Form */}
      {showForm && (
        <div className="card" style={{ marginBottom: 24 }}>
          <h3>{editingTest ? 'Edit Test' : 'Create New Test'}</h3>
          <form onSubmit={handleSubmitTest}>
            <div className="form-grid">
              <div className="form-group">
                <label>Title *</label>
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Exam Type (Category)</label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  <option value="JEE Mains">JEE Mains</option>
                  <option value="JEE Advance">JEE Advanced</option>
                  <option value="NEET">NEET</option>
                  <option value="General">General / Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Test Type</label>
                <select value={form.testType} onChange={e => setForm({ ...form, testType: e.target.value })}>
                  <option value="full">Full Test</option>
                  <option value="part">Part Test</option>
                  <option value="pyp">Previous Year Paper (PYP)</option>
                </select>
              </div>
              <div className="form-group">
                <label>Duration (minutes)</label>
                <input type="number" value={form.durationMinutes} onChange={e => setForm({ ...form, durationMinutes: Number(e.target.value) })} min={1} required />
              </div>
              <div className="form-group">
                <label>Total Marks</label>
                <input type="number" value={form.totalMarks} onChange={e => setForm({ ...form, totalMarks: Number(e.target.value) })} min={1} required />
              </div>
              <div className="form-group">
                <label>+ve Marks per Q</label>
                <input type="number" value={form.defaultPositiveMarks} onChange={e => setForm({ ...form, defaultPositiveMarks: Number(e.target.value) })} min={0} />
              </div>
              <div className="form-group">
                <label>-ve Marks per Q</label>
                <input type="number" value={form.defaultNegativeMarks} onChange={e => setForm({ ...form, defaultNegativeMarks: Number(e.target.value) })} min={0} />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Syllabus (One point per line)</label>
                <textarea value={form.syllabusText || ''} onChange={e => setForm({ ...form, syllabusText: e.target.value })} rows={4} placeholder="e.g. Physics - Kinematics..." />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>CBT General Instructions (One instruction per line)</label>
                <textarea value={form.instructionGeneralText || ''} onChange={e => setForm({ ...form, instructionGeneralText: e.target.value })} rows={5} placeholder="The countdown timer shows the remaining time..." />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>CBT Other Instructions (One instruction per line)</label>
                <textarea value={form.instructionOtherText || ''} onChange={e => setForm({ ...form, instructionOtherText: e.target.value })} rows={4} placeholder="Do not refresh or close the test window..." />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Test Sections (Format: Name, QuestionCount, MaxAttemptable)</label>
                <textarea
                  value={form.sectionsText || ''}
                  onChange={e => setForm({ ...form, sectionsText: e.target.value })}
                  rows={4}
                  placeholder="Physics Sec A, 35, null&#10;Physics Sec B, 15, 10"
                />
                <small>One section per line. Use 'null' for MaxAttemptable if there is no attempt limit.</small>
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>CBT Declaration Text</label>
                <textarea value={form.instructionDeclaration || ''} onChange={e => setForm({ ...form, instructionDeclaration: e.target.value })} rows={3} placeholder="I have read and understood the instructions..." />
              </div>

              {/* Audience Targeting */}
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Audience</label>
                <select value={form.visibility} onChange={e => setForm({ ...form, visibility: e.target.value })}>
                  <option value="b2c_public">🌐 All B2C Students (Public)</option>
                  <option value="b2c_group">🎯 Specific B2C Group</option>
                  <option value="b2b_coaching">🏢 Specific Coaching (B2B)</option>
                  <option value="b2b_group">🏷️ Specific B2B Group</option>
                </select>
              </div>

              {(form.visibility === 'b2b_coaching') && (
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Select Coaching(s)</label>
                  <select multiple value={form.targetTenants} onChange={e => setForm({ ...form, targetTenants: [...e.target.selectedOptions].map(o => o.value) })} style={{ minHeight: 80 }}>
                    {tenants.map(t => <option key={t._id} value={t._id}>{t.name} ({t.code})</option>)}
                  </select>
                  <small>Hold Ctrl/Cmd to select multiple</small>
                </div>
              )}

              {(form.visibility === 'b2c_group' || form.visibility === 'b2b_group') && (
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Select Group(s)</label>
                  <select multiple value={form.targetGroups} onChange={e => setForm({ ...form, targetGroups: [...e.target.selectedOptions].map(o => o.value) })} style={{ minHeight: 80 }}>
                    {groups.map(g => <option key={g._id} value={g._id}>{g.name} ({g.memberCount} members)</option>)}
                  </select>
                  <small>Hold Ctrl/Cmd to select multiple</small>
                </div>
              )}
            </div>
            <button type="submit" className="btn btn-primary" style={{ marginTop: 16 }}>{editingTest ? 'Update Test' : 'Create Test'}</button>
          </form>
        </div>
      )}

      {/* Test List */}
      <div className="card">
        <h3>All Tests ({tests.length})</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Type</th>
              <th>Duration</th>
              <th>Marks</th>
              <th>Questions</th>
              <th>Audience</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tests.map(test => (
              <tr key={test._id}>
                <td><strong>{test.title}</strong></td>
                <td>{test.category}</td>
                <td>{test.testType === 'pyp' ? 'PYP' : test.testType === 'part' ? 'Part Test' : 'Full Test'}</td>
                <td>{test.durationMinutes}m</td>
                <td>{test.totalMarks}</td>
                <td>{test.questionCount || 0}</td>
                <td><span className="badge">{visibilityLabel(test.visibility)}</span></td>
                <td>
                  <span className={`badge ${test.isPublished ? 'badge-success' : 'badge-warning'}`}>
                    {test.isPublished ? '✅ Published' : '📝 Draft'}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-sm" onClick={() => { setSelectedTest(test); fetchQuestions(test._id); }}>📋 Questions</button>
                    <button className="btn btn-sm" onClick={() => handleTogglePublish(test._id)}>
                      {test.isPublished ? '⏸ Unpublish' : '🚀 Publish'}
                    </button>
                    <button className="btn btn-sm" onClick={() => {
                      setEditingTest(test);
                      setForm({
                        title: test.title,
                        description: test.description || '',
                        category: test.category || 'General',
                        testType: test.testType || 'full',
                        durationMinutes: test.durationMinutes,
                        totalMarks: test.totalMarks,
                        visibility: test.visibility,
                        targetTenants: test.targetTenants?.map(t => t._id || t) || [],
                        targetGroups: test.targetGroups?.map(g => g._id || g) || [],
                        defaultPositiveMarks: test.defaultPositiveMarks || 4,
                        defaultNegativeMarks: test.defaultNegativeMarks || 1,
                        syllabusText: test.syllabus?.join('\n') || '',
                        instructionGeneralText: test.instructions?.general?.join('\n') || '',
                        instructionOtherText: test.instructions?.other?.join('\n') || '',
                        instructionDeclaration: test.instructions?.declaration || '',
                        sectionsText: test.sections?.map(s => `${s.name}, ${s.questionCount}, ${s.maxAttemptable || 'null'}`).join('\n') || ''
                      });
                      setShowForm(true);
                    }}>✏️ Edit</button>
                    <button className="btn btn-sm" onClick={() => handleCopyShareLink(test._id)} title="Copy Share Link">🔗 Share</button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDeleteTest(test._id)}>🗑</button>
                  </div>
                </td>
              </tr>
            ))}
            {tests.length === 0 && <tr><td colSpan={8} style={{ textAlign: 'center', padding: 32, opacity: 0.5 }}>No tests yet. Create your first test above.</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Question Management Panel */}
      {selectedTest && (
        <div className="card" style={{ marginTop: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>📋 Questions: {selectedTest.title} ({questions.length})</h3>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-primary" onClick={() => {
                setEditingQuestion(null);
                setQForm({
                  section: selectedTest.sections?.[0]?.name || 'General',
                  type: 'single', content: '', imageUrl: '',
                  options: [
                    { label: 'A', content: '', imageUrl: '' }, { label: 'B', content: '', imageUrl: '' },
                    { label: 'C', content: '', imageUrl: '' }, { label: 'D', content: '', imageUrl: '' },
                  ],
                  correctAnswer: [], solution: '', solutionImageUrl: '', positiveMarks: '', negativeMarks: '',
                  tags: '', difficulty: 'medium',
                });
                setShowQuestionForm(!showQuestionForm);
              }}>
                {showQuestionForm ? 'Cancel' : '➕ Add Question'}
              </button>
              <button className="btn" onClick={() => { setShowPdfImport(!showPdfImport); setShowJsonImport(false); }} style={{ background: 'rgba(124,58,237,0.2)', color: '#a78bfa' }}>
                {showPdfImport ? 'Cancel PDF' : '📄 Import PDF'}
              </button>
              <button className="btn" onClick={() => { setShowJsonImport(!showJsonImport); setShowPdfImport(false); }} style={{ background: 'rgba(5,150,105,0.2)', color: '#34d399' }}>
                {showJsonImport ? 'Cancel JSON' : 'JSON Import'}
              </button>
              <button className="btn btn-sm" onClick={() => { setSelectedTest(null); setQuestions([]); setShowQuestionForm(false); setShowPdfImport(false); setShowJsonImport(false); }}>✕ Close</button>
            </div>
          </div>

          {/* Add NEW Question Form — only shown when not editing an existing one */}
          {showQuestionForm && !editingQuestion && (
            <form onSubmit={handleAddQuestion} style={{ marginTop: 16, padding: 16, background: 'rgba(0,0,0,0.05)', borderRadius: 8 }}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Section</label>
                  {selectedTest?.sections?.length > 0 ? (
                    <select value={qForm.section} onChange={e => setQForm({ ...qForm, section: e.target.value })}>
                      <option value="">Select Section</option>
                      {selectedTest.sections.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                    </select>
                  ) : (
                    <input value={qForm.section} onChange={e => setQForm({ ...qForm, section: e.target.value })} placeholder="Physics, Chemistry..." />
                  )}
                </div>
                <div className="form-group">
                  <label>Type</label>
                  <select value={qForm.type} onChange={e => setQForm({ ...qForm, type: e.target.value })}>
                    <option value="single">Single Correct (SCQ)</option>
                    <option value="multiple">Multiple Correct (MCQ)</option>
                    <option value="integer">Integer / Numerical</option>
                    <option value="float">Decimal / Float</option>
                    <option value="matrix">Matrix Match</option>
                    <option value="comprehension_parent">Comprehension (Paragraph)</option>
                    <option value="comprehension_child">Comprehension (Child Question)</option>
                  </select>
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <label style={{ margin: 0 }}>Question Text</label>
                    {!qForm.contentTable && (
                      <button type="button" className="btn btn-sm" style={{ padding: '2px 8px', fontSize: 11, background: 'rgba(79,70,229,0.15)', color: '#818cf8', border: 'none', cursor: 'pointer' }} onClick={() => setQForm({ ...qForm, contentTable: { headers: ['Header 1', 'Header 2'], rows: [['Cell 1', 'Cell 2']] } })}>
                        📊 Add Grid/Table to Question
                      </button>
                    )}
                  </div>
                  <textarea value={qForm.content} onChange={e => setQForm({ ...qForm, content: e.target.value })} rows={3} placeholder="Add text, an image, or both." />
                  {qForm.contentTable && (
                    <TableEditor value={qForm.contentTable} onChange={(tbl) => setQForm({ ...qForm, contentTable: tbl })} label="Question Table" />
                  )}
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Image URL (optional)</label>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input style={{ flex: 1 }} value={qForm.imageUrl} onChange={e => setQForm({ ...qForm, imageUrl: e.target.value })} placeholder="https://..." />
                    <label className="btn btn-sm" style={{ margin: 0, cursor: 'pointer' }}>
                      {imageUploading === 'question' ? 'Uploading...' : 'Upload'}
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        disabled={imageUploading === 'question'}
                        onChange={e => handleTestImageUpload(e.target.files?.[0], 'question', (url) => setQForm({ ...qForm, imageUrl: url }))}
                      />
                    </label>
                  </div>
                  {qForm.imageUrl && <img src={qForm.imageUrl} alt="Question preview" style={{ maxHeight: 140, maxWidth: '100%', marginTop: 8, border: '1px solid var(--border)' }} />}
                </div>

                {/* Options (for MCQ types) */}
                {(qForm.type === 'single' || qForm.type === 'multiple') && (
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label>Options</label>
                    {qForm.options.map((opt, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                        <strong style={{ width: 24 }}>{opt.label}.</strong>
                        <input style={{ flex: 1 }} value={opt.content} onChange={e => {
                          const opts = [...qForm.options];
                          opts[idx] = { ...opts[idx], content: e.target.value };
                          setQForm({ ...qForm, options: opts });
                        }} placeholder={`Option ${opt.label}`} />
                        <input style={{ flex: 1 }} value={opt.imageUrl || ''} onChange={e => {
                          const opts = [...qForm.options];
                          opts[idx] = { ...opts[idx], imageUrl: e.target.value };
                          setQForm({ ...qForm, options: opts });
                        }} placeholder="Option image URL" />
                        <label className="btn btn-sm" style={{ margin: 0, cursor: 'pointer' }}>
                          {imageUploading === `option-${opt.label}` ? 'Uploading...' : 'Upload'}
                          <input
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            disabled={imageUploading === `option-${opt.label}`}
                            onChange={e => handleTestImageUpload(e.target.files?.[0], `option-${opt.label}`, (url) => {
                              const opts = [...qForm.options];
                              opts[idx] = { ...opts[idx], imageUrl: url };
                              setQForm({ ...qForm, options: opts });
                            })}
                          />
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                          <input
                            type={qForm.type === 'single' ? 'radio' : 'checkbox'}
                            name="correctAnswer"
                            checked={qForm.correctAnswer.includes(opt.label)}
                            onChange={() => {
                              if (qForm.type === 'single') {
                                setQForm({ ...qForm, correctAnswer: [opt.label] });
                              } else {
                                const has = qForm.correctAnswer.includes(opt.label);
                                setQForm({ ...qForm, correctAnswer: has ? qForm.correctAnswer.filter(a => a !== opt.label) : [...qForm.correctAnswer, opt.label] });
                              }
                            }}
                          />
                          Correct
                        </label>
                        {opt.imageUrl && <img src={opt.imageUrl} alt={`Option ${opt.label} preview`} style={{ maxHeight: 42, maxWidth: 80, border: '1px solid var(--border)' }} />}
                      </div>
                    ))}
                  </div>
                )}

                {/* Integer / Float answer */}
                {(qForm.type === 'integer' || qForm.type === 'float') && (
                  <div className="form-group">
                    <label>Correct Answer {qForm.type === 'float' ? '(decimal)' : '(integer)'}</label>
                    <input type="number" step={qForm.type === 'float' ? '0.01' : '1'} value={qForm.correctAnswer[0] || ''} onChange={e => setQForm({ ...qForm, correctAnswer: [e.target.value] })} required />
                  </div>
                )}

                {/* Matrix Match rows/columns */}
                {qForm.type === 'matrix' && (
                  <>
                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                      <label>List I — Rows (one per line, format: <code>A. Uniform velocity</code>)</label>
                      <textarea
                        rows={4}
                        value={(qForm.matrixRows || []).map(r => `${r.label}. ${r.content}`).join('\n')}
                        onChange={e => {
                          const rows = e.target.value.split('\n').map(line => {
                            const dotIdx = line.indexOf('.');
                            return dotIdx > -1
                              ? { label: line.slice(0, dotIdx).trim(), content: line.slice(dotIdx + 1).trim() }
                              : { label: '', content: line.trim() };
                          });
                          setQForm({ ...qForm, matrixRows: rows });
                        }}
                        placeholder={'A. Uniform velocity\nB. Uniform acceleration\nC. Non-uniform acceleration'}
                      />
                    </div>
                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                      <label>List II — Columns (one per line, format: <code>P. Motion with constant speed</code>)</label>
                      <textarea
                        rows={4}
                        value={(qForm.matrixColumns || []).map(c => `${c.label}. ${c.content}`).join('\n')}
                        onChange={e => {
                          const cols = e.target.value.split('\n').map(line => {
                            const dotIdx = line.indexOf('.');
                            return dotIdx > -1
                              ? { label: line.slice(0, dotIdx).trim(), content: line.slice(dotIdx + 1).trim() }
                              : { label: '', content: line.trim() };
                          });
                          setQForm({ ...qForm, matrixColumns: cols });
                        }}
                        placeholder={'P. Motion with constant speed\nQ. v-t graph is a straight line\nR. Acceleration is zero'}
                      />
                    </div>
                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                      <label>Correct Answers (one row per line, format: <code>A-P,Q</code>)</label>
                      <textarea
                        rows={4}
                        value={(qForm.correctAnswer || []).join('\n')}
                        onChange={e => setQForm({ ...qForm, correctAnswer: e.target.value.split('\n').map(s => s.trim()).filter(Boolean) })}
                        placeholder={'A-P,Q\nB-R\nC-P,R,S\nD-Q,S'}
                      />
                    </div>
                  </>
                )}

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Solution / Explanation</label>
                  <textarea value={qForm.solution} onChange={e => setQForm({ ...qForm, solution: e.target.value })} rows={2} />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Solution Image URL (optional)</label>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input style={{ flex: 1 }} value={qForm.solutionImageUrl || ''} onChange={e => setQForm({ ...qForm, solutionImageUrl: e.target.value })} placeholder="https://..." />
                    <label className="btn btn-sm" style={{ margin: 0, cursor: 'pointer' }}>
                      {imageUploading === 'solution' ? 'Uploading...' : 'Upload'}
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        disabled={imageUploading === 'solution'}
                        onChange={e => handleTestImageUpload(e.target.files?.[0], 'solution', (url) => setQForm({ ...qForm, solutionImageUrl: url }))}
                      />
                    </label>
                  </div>
                  {qForm.solutionImageUrl && <img src={qForm.solutionImageUrl} alt="Solution preview" style={{ maxHeight: 140, maxWidth: '100%', marginTop: 8, border: '1px solid var(--border)' }} />}
                </div>
                <div className="form-group">
                  <label>Difficulty</label>
                  <select value={qForm.difficulty} onChange={e => setQForm({ ...qForm, difficulty: e.target.value })}>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Tags (comma-separated)</label>
                  <input value={qForm.tags} onChange={e => setQForm({ ...qForm, tags: e.target.value })} placeholder="Kinematics, Projectile Motion" />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" style={{ marginTop: 12 }}>
                {editingQuestion ? 'Update Question' : 'Add Question'}
              </button>
            </form>
          )}

          {/* PDF Import Panel */}
          {showPdfImport && (
            <div style={{ marginTop: 16, padding: 20, background: 'rgba(124,58,237,0.08)', borderRadius: 8, border: '1px solid rgba(124,58,237,0.2)' }}>
              <h4 style={{ margin: '0 0 12px', color: '#7c3aed' }}>📄 Import Questions from PDF</h4>
              <p style={{ fontSize: 13, opacity: 0.7, margin: '0 0 16px' }}>Upload a JEE/NEET/CUET style PDF. The engine will auto-detect sections, question types, and answer keys. Questions with images will be flagged for manual review.</p>

              <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                <input type="file" accept=".pdf" onChange={e => { setPdfFile(e.target.files[0]); setPdfPreview(null); setPdfStats(null); setPdfError(null); }} style={{ flex: 1 }} />
                <button className="btn btn-primary" onClick={handlePdfPreview} disabled={!pdfFile || pdfLoading} style={{ background: '#7c3aed' }}>
                  {pdfLoading ? '⏳ Parsing...' : '🔍 Preview Questions'}
                </button>
              </div>

              {pdfError && (
                <div style={{ marginTop: 16, padding: 12, background: 'rgba(220,38,38,0.1)', borderRadius: 6, border: '1px solid rgba(220,38,38,0.3)', fontSize: 13 }}>
                  <strong style={{ color: '#ef4444' }}>❌ {pdfError.message}</strong>
                  {pdfError.textSample && (
                    <div style={{ marginTop: 10 }}>
                      <p style={{ opacity: 0.7, marginBottom: 4 }}>First 500 chars extracted from PDF (check if questions are numbered correctly):</p>
                      <pre style={{ background: 'rgba(0,0,0,0.2)', padding: 10, borderRadius: 4, fontSize: 11, whiteSpace: 'pre-wrap', maxHeight: 180, overflowY: 'auto' }}>{pdfError.textSample}</pre>
                    </div>
                  )}
                </div>
              )}

              {pdfStats && (
                <div style={{ marginTop: 16, padding: 12, background: 'rgba(0,0,0,0.05)', borderRadius: 6, fontSize: 13 }}>
                  <strong>Parse Results:</strong>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8, marginTop: 8 }}>
                    <div>📋 Total: <strong>{pdfStats.total}</strong></div>
                    <div>✅ With Answers: <strong>{pdfStats.withAnswers}</strong></div>
                    <div>🖼️ Need Images: <strong style={{ color: pdfStats.withImages > 0 ? '#e67e22' : 'inherit' }}>{pdfStats.withImages}</strong></div>
                    <div>📂 Sections: <strong>{pdfStats.sections?.join(', ')}</strong></div>
                    {pdfStats.withSolutions > 0 && <div>💡 Solutions: <strong>{pdfStats.withSolutions}</strong></div>}
                    {pdfStats.types && <div>📊 MCQ: {pdfStats.types.single}S + {pdfStats.types.multiple}M + {pdfStats.types.integer}I</div>}
                    {pdfStats.avgConfidence > 0 && <div>🎯 Confidence: <strong style={{ color: pdfStats.avgConfidence >= 70 ? '#2ecc71' : pdfStats.avgConfidence >= 40 ? '#f39c12' : '#e74c3c' }}>{pdfStats.avgConfidence}%</strong></div>}
                    {pdfStats.lowConfidenceCount > 0 && <div>⚠️ Low conf: <strong style={{ color: '#e67e22' }}>{pdfStats.lowConfidenceCount}</strong></div>}
                  </div>
                </div>
              )}

              {pdfPreview && pdfPreview.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <strong>Preview ({pdfPreview.length} questions):</strong>
                    <button className="btn btn-primary" onClick={handlePdfConfirmImport} disabled={pdfLoading} style={{ background: '#059669' }}>
                      {pdfLoading ? '⏳ Importing...' : `✅ Confirm Import (${pdfPreview.length} questions)`}
                    </button>
                  </div>
                  <div style={{ maxHeight: 400, overflowY: 'auto', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6 }}>
                    {pdfPreview.map((q, idx) => (
                      <div key={idx} style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: 13, borderLeft: `3px solid ${(q._meta?.confidence || 0) >= 70 ? '#2ecc71' : (q._meta?.confidence || 0) >= 40 ? '#f39c12' : '#e74c3c'}` }}>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 4 }}>
                          <strong>Q{q._meta?.originalNumber || idx + 1}.</strong>
                          <span className="badge">{q.section}</span>
                          <span className="badge">{q.type}</span>
                          <span style={{ fontSize: 10, opacity: 0.5 }}>{q._meta?.confidence}%</span>
                          {q._meta?.hasImage && <span className="badge badge-warning">🖼️ Image</span>}
                          {q._meta?.needsAnswer && <span className="badge badge-warning">❓ No Ans</span>}
                          {q.solution && <span className="badge" style={{ background: 'rgba(46,204,113,0.2)', color: '#2ecc71' }}>💡 Sol</span>}
                        </div>
                        <p style={{ margin: '4px 0', whiteSpace: 'pre-wrap', opacity: 0.9 }}>
                          <LatexRenderer text={q.content?.substring(0, 200)} />
                          {q.content?.length > 200 ? '...' : ''}
                        </p>
                        {q.options?.length > 0 && (
                          <div style={{ marginTop: 4, opacity: 0.7 }}>
                            {q.options.map(o => (
                              <span key={o.label} style={{ marginRight: 12, color: q.correctAnswer?.includes(o.label) ? '#2ecc71' : 'inherit', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                {q.correctAnswer?.includes(o.label) ? '✅' : '○'} {o.label}. <LatexRenderer text={o.content?.substring(0, 60)} />
                              </span>
                            ))}
                          </div>
                        )}
                        {q.type === 'integer' && q.correctAnswer?.length > 0 && (
                          <div style={{ marginTop: 4, fontSize: 12 }}>Answer: <strong style={{ color: '#2ecc71' }}>{q.correctAnswer.join(', ')}</strong></div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* JSON Import Panel */}
          {showJsonImport && (
            <div style={{ marginTop: 16, padding: 20, background: 'rgba(5,150,105,0.08)', borderRadius: 8, border: '1px solid rgba(5,150,105,0.2)' }}>
              <h4 style={{ margin: '0 0 12px', color: '#059669' }}>JSON Import Questions</h4>
              <p style={{ fontSize: 13, opacity: 0.7, margin: '0 0 16px' }}>Upload a JSON file containing an array of question objects. Images can be provided as URLs or Base64 strings.</p>

              <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                <input type="file" accept=".json" onChange={handleJsonPreview} style={{ flex: 1 }} />
              </div>

              {jsonError && <div style={{ marginTop: 12, color: '#ef4444', fontSize: 13 }}>❌ {jsonError}</div>}

              {jsonPreview && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <strong>Detected {jsonPreview.length} questions:</strong>
                    <button className="btn btn-primary" onClick={handleJsonConfirmImport} disabled={jsonLoading} style={{ background: '#059669' }}>
                      {jsonLoading ? '⏳ Importing...' : `✅ Confirm Bulk Import`}
                    </button>
                  </div>
                  <div style={{ maxHeight: 300, overflowY: 'auto', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, background: 'rgba(0,0,0,0.2)' }}>
                    <pre style={{ padding: 12, fontSize: 11, margin: 0 }}>{JSON.stringify(jsonPreview.slice(0, 2), null, 2)}...</pre>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Question List — edit form renders inline below the selected question */}
          <div style={{ marginTop: 16 }}>
            {questions.map((q, idx) => (
              <div key={q._id}>
                {/* Question row */}
                <div style={{ padding: '12px 16px', borderBottom: editingQuestion?._id === q._id ? 'none' : '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', background: editingQuestion?._id === q._id ? 'rgba(79,70,229,0.06)' : 'transparent', borderRadius: editingQuestion?._id === q._id ? '6px 6px 0 0' : 0 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                      <strong>Q{q.order || idx + 1}.</strong>
                      <span className="badge">{q.section}</span>
                      <span className="badge">{q.type}</span>
                      {q.positiveMarks && <span className="badge" style={{ background: 'rgba(46,204,113,0.2)', color: '#2ecc71' }}>+{q.positiveMarks}</span>}
                      {q.negativeMarks && <span className="badge" style={{ background: 'rgba(231,76,60,0.2)', color: '#e74c3c' }}>-{q.negativeMarks}</span>}
                    </div>
                    <div style={{ margin: '4px 0', display: 'block' }}>
                      <LatexRenderer text={q.content} />
                    </div>
                    {q.imageUrl && <img src={q.imageUrl} alt="Question" style={{ maxHeight: 120, maxWidth: '100%', marginTop: 8, border: '1px solid var(--border)' }} />}
                    {q.contentTable && <RenderContentTable table={q.contentTable} />}
                    {q.options?.length > 0 && (
                      <div style={{ marginTop: 4, fontSize: 13, opacity: 0.8 }}>
                        {q.options.map(o => (
                          <span key={o.label} style={{ marginRight: 12, color: q.correctAnswer?.includes(o.label) ? '#2ecc71' : 'inherit', display: 'inline-flex', alignItems: 'center', gap: 4, verticalAlign: 'top' }}>
                            {q.correctAnswer?.includes(o.label) ? '✅' : '○'} {o.label}. <LatexRenderer text={o.content} />
                            {o.imageUrl && <img src={o.imageUrl} alt={`Option ${o.label}`} style={{ maxHeight: 42, maxWidth: 80, border: '1px solid var(--border)' }} />}
                            {o.contentTable && <RenderContentTable table={o.contentTable} />}
                          </span>
                        ))}
                      </div>
                    )}
                    {(q.type === 'integer' || q.type === 'float') && <div style={{ fontSize: 13 }}>Answer: <strong style={{ color: '#2ecc71' }}>{q.correctAnswer?.join(', ')}</strong></div>}
                    {q.type === 'matrix' && q.correctAnswer?.length > 0 && <div style={{ fontSize: 13, opacity: 0.7 }}>Matches: {q.correctAnswer.join(' | ')}</div>}
                    {q.solutionImageUrl && <div style={{ marginTop: 8, fontSize: 12, opacity: 0.75 }}>Solution image: <img src={q.solutionImageUrl} alt="Solution" style={{ maxHeight: 80, maxWidth: 140, marginLeft: 8, border: '1px solid var(--border)', verticalAlign: 'middle' }} /></div>}
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <button className="btn btn-sm" onClick={() => {
                      if (editingQuestion?._id === q._id) {
                        // toggle off
                        setEditingQuestion(null);
                        return;
                      }
                      setEditingQuestion(q);
                      setShowQuestionForm(false);
                      setQForm({
                        section: q.section || 'General',
                        type: q.type || 'single',
                        content: q.content || '',
                        imageUrl: q.imageUrl || '',
                        solutionImageUrl: q.solutionImageUrl || '',
                        matrixRows: q.matrixRows || [],
                        matrixColumns: q.matrixColumns || [],
                        contentTable: q.contentTable || null,
                        options: q.options?.length > 0
                          ? q.options.map(o => ({ ...o, contentTable: o.contentTable || null }))
                          : [
                            { label: 'A', content: '', imageUrl: '', contentTable: null },
                            { label: 'B', content: '', imageUrl: '', contentTable: null },
                            { label: 'C', content: '', imageUrl: '', contentTable: null },
                            { label: 'D', content: '', imageUrl: '', contentTable: null },
                          ],
                        correctAnswer: q.correctAnswer || [],
                        solution: q.solution || '',
                        positiveMarks: q.positiveMarks || '',
                        negativeMarks: q.negativeMarks || '',
                        tags: q.tags?.join(', ') || '',
                        difficulty: q.difficulty || 'medium',
                      });
                    }} title="Edit Question" style={{ background: editingQuestion?._id === q._id ? 'rgba(79,70,229,0.2)' : undefined }}>✏️</button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDeleteQuestion(q._id)} title="Delete Question">🗑</button>
                  </div>
                </div>

                {/* Inline Edit Form — renders immediately below this question */}
                {editingQuestion?._id === q._id && (
                  <form onSubmit={handleAddQuestion} style={{ padding: 16, background: 'rgba(79,70,229,0.06)', border: '1px solid rgba(79,70,229,0.25)', borderTop: 'none', borderRadius: '0 0 6px 6px', marginBottom: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <strong style={{ color: '#818cf8' }}>✏️ Editing Q{q.order || idx + 1}</strong>
                      <button type="button" className="btn btn-sm" onClick={() => setEditingQuestion(null)}>✕ Cancel</button>
                    </div>
                    <div className="form-grid">
                      <div className="form-group">
                        <label>Section</label>
                        {selectedTest?.sections?.length > 0 ? (
                          <select value={qForm.section} onChange={e => setQForm({ ...qForm, section: e.target.value })}>
                            <option value="">Select Section</option>
                            {selectedTest.sections.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                          </select>
                        ) : (
                          <input value={qForm.section} onChange={e => setQForm({ ...qForm, section: e.target.value })} placeholder="Physics, Chemistry..." />
                        )}
                      </div>
                      <div className="form-group">
                        <label>Type</label>
                        <select value={qForm.type} onChange={e => setQForm({ ...qForm, type: e.target.value })}>
                          <option value="single">Single Correct (SCQ)</option>
                          <option value="multiple">Multiple Correct (MCQ)</option>
                          <option value="integer">Integer / Numerical</option>
                          <option value="float">Decimal / Float</option>
                          <option value="matrix">Matrix Match</option>
                          <option value="comprehension_parent">Comprehension (Paragraph)</option>
                          <option value="comprehension_child">Comprehension (Child Question)</option>
                        </select>
                      </div>
                      <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                          <label style={{ margin: 0 }}>Question Text</label>
                          {!qForm.contentTable && (
                            <button type="button" className="btn btn-sm" style={{ padding: '2px 8px', fontSize: 11, background: 'rgba(79,70,229,0.15)', color: '#818cf8', border: 'none', cursor: 'pointer' }} onClick={() => setQForm({ ...qForm, contentTable: { headers: ['Header 1', 'Header 2'], rows: [['Cell 1', 'Cell 2']] } })}>
                              📊 Add Grid/Table to Question
                            </button>
                          )}
                        </div>
                        <textarea value={qForm.content} onChange={e => setQForm({ ...qForm, content: e.target.value })} rows={3} placeholder="Add text, an image, or both." />
                        {qForm.contentTable && (
                          <TableEditor value={qForm.contentTable} onChange={(tbl) => setQForm({ ...qForm, contentTable: tbl })} label="Question Table" />
                        )}
                      </div>
                      <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                        <label>Image URL (optional)</label>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <input style={{ flex: 1 }} value={qForm.imageUrl} onChange={e => setQForm({ ...qForm, imageUrl: e.target.value })} placeholder="https://..." />
                          <label className="btn btn-sm" style={{ margin: 0, cursor: 'pointer' }}>
                            {imageUploading === 'q-edit-img' ? 'Uploading...' : 'Upload'}
                            <input type="file" accept="image/*" style={{ display: 'none' }} disabled={imageUploading === 'q-edit-img'} onChange={e => handleTestImageUpload(e.target.files?.[0], 'q-edit-img', (url) => setQForm(f => ({ ...f, imageUrl: url })))} />
                          </label>
                        </div>
                        {qForm.imageUrl && <img src={qForm.imageUrl} alt="Preview" style={{ maxHeight: 100, maxWidth: '100%', marginTop: 8, border: '1px solid var(--border)' }} />}
                      </div>
                      {(qForm.type === 'single' || qForm.type === 'multiple') && (
                        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                          <label>Options</label>
                          {qForm.options.map((opt, oidx) => (
                            <div key={oidx} style={{ marginBottom: 12, padding: 8, background: 'rgba(255,255,255,0.02)', borderRadius: 6, border: '1px solid rgba(255,255,255,0.05)' }}>
                              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                <strong style={{ width: 24 }}>{opt.label}.</strong>
                                <input style={{ flex: 2 }} value={opt.content} onChange={e => { const o = [...qForm.options]; o[oidx] = { ...o[oidx], content: e.target.value }; setQForm({ ...qForm, options: o }); }} placeholder={`Option ${opt.label} text`} />
                                <label className="btn btn-sm" style={{ margin: 0, cursor: 'pointer' }}>
                                  {imageUploading === `opt-edit-${opt.label}` ? '...' : 'Img'}
                                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleTestImageUpload(e.target.files?.[0], `opt-edit-${opt.label}`, (url) => { const o = [...qForm.options]; o[oidx] = { ...o[oidx], imageUrl: url }; setQForm(f => ({ ...f, options: o })); })} />
                                </label>
                                <button type="button" className="btn btn-sm" style={{ padding: '2px 6px', fontSize: 11, background: opt.contentTable ? 'rgba(129,140,248,0.25)' : 'rgba(255,255,255,0.08)', color: opt.contentTable ? '#818cf8' : 'inherit' }} onClick={() => {
                                  const o = [...qForm.options];
                                  o[oidx] = {
                                    ...o[oidx],
                                    contentTable: o[oidx].contentTable ? null : { headers: ['Header 1', 'Header 2'], rows: [['Cell 1', 'Cell 2']] }
                                  };
                                  setQForm({ ...qForm, options: o });
                                }}>
                                  📊 Table
                                </button>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', flexShrink: 0 }}>
                                  <input type={qForm.type === 'single' ? 'radio' : 'checkbox'} name="editCorrectAnswer" checked={qForm.correctAnswer.includes(opt.label)} onChange={() => {
                                    if (qForm.type === 'single') { setQForm({ ...qForm, correctAnswer: [opt.label] }); }
                                    else { const has = qForm.correctAnswer.includes(opt.label); setQForm({ ...qForm, correctAnswer: has ? qForm.correctAnswer.filter(a => a !== opt.label) : [...qForm.correctAnswer, opt.label] }); }
                                  }} /> Correct
                                </label>
                                {opt.imageUrl && <img src={opt.imageUrl} alt={`Opt ${opt.label}`} style={{ maxHeight: 32, maxWidth: 60, border: '1px solid var(--border)' }} />}
                              </div>
                              {opt.contentTable && (
                                <TableEditor value={opt.contentTable} onChange={(tbl) => {
                                  const o = [...qForm.options];
                                  o[oidx] = { ...o[oidx], contentTable: tbl };
                                  setQForm({ ...qForm, options: o });
                                }} label={`Option ${opt.label} Table`} />
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      {(qForm.type === 'integer' || qForm.type === 'float') && (
                        <div className="form-group">
                          <label>Correct Answer</label>
                          <input type="number" step={qForm.type === 'float' ? '0.01' : '1'} value={qForm.correctAnswer[0] || ''} onChange={e => setQForm({ ...qForm, correctAnswer: [e.target.value] })} />
                        </div>
                      )}
                      {qForm.type === 'matrix' && (
                        <>
                          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                            <label>List I Rows (A. text per line)</label>
                            <textarea rows={3} value={(qForm.matrixRows || []).map(r => `${r.label}. ${r.content}`).join('\n')} onChange={e => { const rows = e.target.value.split('\n').map(line => { const d = line.indexOf('.'); return d > -1 ? { label: line.slice(0, d).trim(), content: line.slice(d + 1).trim() } : { label: '', content: line.trim() }; }); setQForm({ ...qForm, matrixRows: rows }); }} />
                          </div>
                          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                            <label>List II Columns (P. text per line)</label>
                            <textarea rows={3} value={(qForm.matrixColumns || []).map(c => `${c.label}. ${c.content}`).join('\n')} onChange={e => { const cols = e.target.value.split('\n').map(line => { const d = line.indexOf('.'); return d > -1 ? { label: line.slice(0, d).trim(), content: line.slice(d + 1).trim() } : { label: '', content: line.trim() }; }); setQForm({ ...qForm, matrixColumns: cols }); }} />
                          </div>
                          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                            <label>Correct Matches (A-P,Q per line)</label>
                            <textarea rows={3} value={(qForm.correctAnswer || []).join('\n')} onChange={e => setQForm({ ...qForm, correctAnswer: e.target.value.split('\n').map(s => s.trim()).filter(Boolean) })} />
                          </div>
                        </>
                      )}
                      <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                        <label>Solution / Explanation</label>
                        <textarea value={qForm.solution} onChange={e => setQForm({ ...qForm, solution: e.target.value })} rows={2} />
                      </div>
                      <div className="form-group">
                        <label>+ve Marks Override</label>
                        <input type="number" value={qForm.positiveMarks} onChange={e => setQForm({ ...qForm, positiveMarks: e.target.value })} placeholder="Leave blank for section default" />
                      </div>
                      <div className="form-group">
                        <label>-ve Marks Override</label>
                        <input type="number" value={qForm.negativeMarks} onChange={e => setQForm({ ...qForm, negativeMarks: e.target.value })} placeholder="Leave blank for section default" />
                      </div>
                      <div className="form-group">
                        <label>Difficulty</label>
                        <select value={qForm.difficulty} onChange={e => setQForm({ ...qForm, difficulty: e.target.value })}>
                          <option value="easy">Easy</option>
                          <option value="medium">Medium</option>
                          <option value="hard">Hard</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Tags</label>
                        <input value={qForm.tags} onChange={e => setQForm({ ...qForm, tags: e.target.value })} placeholder="Kinematics, Projectile" />
                      </div>
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ marginTop: 12 }}>💾 Update Question</button>
                  </form>
                )}
              </div>
            ))}
            {questions.length === 0 && <p style={{ textAlign: 'center', padding: 24, opacity: 0.5 }}>No questions yet. Add your first question above.</p>}
          </div>
        </div>
      )}
    </div>
  );
}
