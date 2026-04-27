import { useState } from 'react';
import api from '../api';
import { Upload, AlertCircle, CheckCircle } from 'lucide-react';

export default function CutoffsManagement() {
  const [file, setFile] = useState(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [counseling, setCounseling] = useState('CSAB');
  const [round, setRound] = useState(1);
  const [instituteType, setInstituteType] = useState('NIT');
  
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState(null); // { type: 'error' | 'success', message: '' }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setStatus({ type: 'error', message: 'Please select an Excel file to upload.' });
      return;
    }

    setUploading(true);
    setStatus(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('year', year);
    formData.append('counseling', counseling);
    formData.append('round', round);
    formData.append('instituteType', instituteType);

    try {
      const res = await api.post('/admin/cutoffs/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setStatus({ type: 'success', message: res.data.message });
      setFile(null); // Reset file
      document.getElementById('file-upload').value = '';
    } catch (err) {
      console.error(err);
      setStatus({ 
        type: 'error', 
        message: err.response?.data?.message || 'Failed to upload cutoffs. Please check the file format.' 
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Cutoffs Management</h1>
      </div>

      <div className="bg-[#1e293b] p-6 rounded-xl border border-[#334155] max-w-2xl">
        <h2 className="text-xl font-semibold text-white mb-4">Upload New Cutoffs</h2>
        <p className="text-slate-400 text-sm mb-6">
          Upload JoSAA or CSAB Excel sheets. Ensure the columns match the expected format (Institute, Academic Program Name, Quota, Seat Type, Gender, Opening Rank, Closing Rank).
        </p>

        {status && (
          <div className={`p-4 rounded-lg mb-6 flex items-start space-x-3 ${status.type === 'error' ? 'bg-red-500/10 border border-red-500/50 text-red-400' : 'bg-emerald-500/10 border border-emerald-500/50 text-emerald-400'}`}>
            {status.type === 'error' ? <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" /> : <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />}
            <span>{status.message}</span>
          </div>
        )}

        <form onSubmit={handleUpload} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Year</label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Counseling Type</label>
              <select
                value={counseling}
                onChange={(e) => setCounseling(e.target.value)}
                className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="CSAB">CSAB</option>
                <option value="JoSAA">JoSAA</option>
                <option value="JAC">JAC Delhi</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Round Number</label>
              <input
                type="number"
                value={round}
                onChange={(e) => setRound(e.target.value)}
                min="1"
                max="10"
                className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Institute Type</label>
              <select
                value={instituteType}
                onChange={(e) => setInstituteType(e.target.value)}
                className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="NIT">NIT</option>
                <option value="IIIT">IIIT</option>
                <option value="IIT">IIT</option>
                <option value="GFTI">GFTI</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Excel File (.xlsx)</label>
            <input
              id="file-upload"
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileChange}
              className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-4 py-2 text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-500/10 file:text-blue-400 hover:file:bg-blue-500/20"
              required
            />
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            {uploading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Upload className="w-5 h-5" />
                <span>Upload Data</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
