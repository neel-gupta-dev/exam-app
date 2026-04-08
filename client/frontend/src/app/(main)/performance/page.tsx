"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  BarChart2, 
  Plus, 
  Trash2, 
  FileText, 
  TrendingUp, 
  Clock, 
  GraduationCap,
  History,
  Info
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import BragSheetGenerator from "@/components/BragSheetGenerator";
import { event as trackEvent } from "@/lib/analytics";
import DemoSignupModal from "@/components/DemoSignupModal";

interface TestMark {
  _id: string;
  subject: string;
  testName: string;
  score: number;
  total: number;
  percentage: number;
  date: string;
  comments?: string;
}

export default function PerformancePage() {
  const { user } = useAuth();
  const [marks, setMarks] = useState<TestMark[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const isDemo = !user;

  // Demo data — realistic academic record for Alex Chen
  const DEMO_MARKS: TestMark[] = [
    { _id: 'dm1', subject: 'AP Biology', testName: 'Chapter 5 Cell Division', score: 89, total: 100, percentage: 89, date: new Date(Date.now() - 2 * 86400000).toISOString() },
    { _id: 'dm2', subject: 'AP Chemistry', testName: 'Midterm Exam', score: 74, total: 100, percentage: 74, date: new Date(Date.now() - 9 * 86400000).toISOString() },
    { _id: 'dm3', subject: 'SAT Math', testName: 'Practice Test #3', score: 740, total: 800, percentage: 92.5, date: new Date(Date.now() - 15 * 86400000).toISOString(), comments: 'Algebra strong, need to work on geometry' },
    { _id: 'dm4', subject: 'AP Physics', testName: 'Kinematics Unit Test', score: 82, total: 100, percentage: 82, date: new Date(Date.now() - 22 * 86400000).toISOString() },
  ];

  const [newMark, setNewMark] = useState({
    subject: "",
    testName: "",
    score: "",
    total: "",
    date: new Date().toISOString().split('T')[0],
    comments: ""
  });

  useEffect(() => {
    if (isDemo) {
      setMarks(DEMO_MARKS);
      setLoading(false);
      return;
    }
    fetchMarks();
  }, [isDemo]);

  const fetchMarks = async () => {
    try {
      const { data } = await api.get("/performance/marks");
      setMarks(data);
    } catch (error) {
      toast.error("Failed to load performance data");
    } finally {
      setLoading(false);
    }
  };

  const handleAddMark = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isDemo) { setShowDemoModal(true); return; }
    if (!newMark.subject || !newMark.testName || !newMark.score || !newMark.total) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const { data } = await api.post("/performance/marks", {
        ...newMark,
        score: Number(newMark.score),
        total: Number(newMark.total)
      });
      setMarks([data, ...marks]);
      setShowAddModal(false);
      
      // Track performance record creation
      trackEvent({
        action: "performance_record_added",
        category: "academic_growth",
        label: `${data.subject} • ${data.percentage.toFixed(0)}%`,
        value: data.percentage
      });

      setNewMark({
        subject: "",
        testName: "",
        score: "",
        total: "",
        date: new Date().toISOString().split('T')[0],
        comments: ""
      });
      toast.success("Test mark added successfully!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to add record");
    }
  };

  const handleDeleteMark = async (id: string) => {
    if (isDemo) { setShowDemoModal(true); return; }
    if (!confirm("Are you sure you want to delete this record?")) return;
    try {
      await api.delete(`/performance/marks/${id}`);
      setMarks(marks.filter(m => m._id !== id));
      toast.success("Record deleted");

      // Track performance record deletion
      trackEvent({
        action: "performance_record_deleted",
        category: "academic_growth",
      });
    } catch (error) {
      toast.error("Failed to delete record");
    }
  };

  const calculateAverage = () => {
    if (marks.length === 0) return 0;
    const totalPct = marks.reduce((acc, curr) => acc + curr.percentage, 0);
    return (totalPct / marks.length).toFixed(1);
  };

  const handleAddClick = () => {
    if (isDemo) { setShowDemoModal(true); return; }
    setShowAddModal(true);
  };

  return (
    <>
    <DashboardLayout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-heading font-black tracking-tighter text-on-surface mb-2">
              Academic Performance
            </h1>
            <p className="text-on-surface-variant text-sm font-medium">
              Track your grades, analyze trends, and build your admissions brag sheet.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleAddClick}
              className="flex items-center gap-2 bg-primary text-on-primary px-5 py-2.5 rounded-xl font-bold hover:scale-105 transition-all shadow-lg shadow-primary/20"
            >
              <Plus className="w-5 h-5" />
              Add Record
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="glass-card p-6 rounded-2xl border-white/5 bg-surface-container-low flex items-center gap-5">
            <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-400">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Avg. Score</p>
              <p className="text-2xl font-heading font-black text-on-surface">{calculateAverage()}%</p>
            </div>
          </div>
          <div className="glass-card p-6 rounded-2xl border-outline-variant/10 bg-surface-container-low flex items-center gap-5">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
              <History className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Tests Logged</p>
              <p className="text-2xl font-heading font-black text-on-surface">{marks.length}</p>
            </div>
          </div>
        </div>

        {/* Brag Sheet Section */}
        <div className="mb-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
          <BragSheetGenerator marks={marks} />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* History List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between mb-4 px-2">
              <h2 className="text-lg font-heading font-bold text-on-surface flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Score History
              </h2>
            </div>
            
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
              </div>
            ) : marks.length === 0 ? (
              <div className="glass-card p-12 rounded-[2rem] border-white/5 text-center flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center mb-6">
                  <BarChart2 className="w-8 h-8 text-on-surface-variant opacity-20" />
                </div>
                <h3 className="text-xl font-bold text-on-surface mb-2">No records found</h3>
                <p className="text-on-surface-variant text-sm max-w-xs mb-8">
                  Start tracking your academic journey by adding your first test mark.
                </p>
                <button 
                  onClick={() => setShowAddModal(true)}
                  className="bg-primary/10 text-primary px-6 py-2 rounded-xl font-bold hover:bg-primary/20 transition-colors"
                >
                  Log Your First Grade
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {marks.map((mark) => (
                  <div key={mark._id} className="glass-card p-5 rounded-2xl border-white/5 hover:border-white/10 transition-all group relative">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
                            {mark.subject}
                          </span>
                          <span className="text-xs text-on-surface-variant font-medium">
                            {new Date(mark.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                        <h4 className="text-on-surface font-bold text-lg leading-tight mb-1">{mark.testName}</h4>
                        {mark.comments && <p className="text-xs text-on-surface-variant italic truncate max-w-md">"{mark.comments}"</p>}
                      </div>
                      
                      <div className="text-right pr-10">
                        <p className="text-2xl font-black font-heading text-on-surface">{mark.percentage.toFixed(0)}%</p>
                        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{mark.score} / {mark.total}</p>
                      </div>

                      <button 
                        onClick={() => handleDeleteMark(mark._id)}
                        className="absolute right-4 opacity-0 group-hover:opacity-100 p-2 text-on-surface-variant hover:text-red-400 transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Guide */}
          <div className="space-y-6">
            <div className="glass-card p-6 rounded-[2rem] border-white/5 bg-primary/5">
              <h3 className="text-on-surface font-bold flex items-center gap-2 mb-4">
                <Info className="w-5 h-5 text-primary" />
                Why track performance?
              </h3>
              <ul className="space-y-4">
                {[
                  { title: "Admission Insight", desc: "Show consistent growth rather than just static grades." },
                  { title: "Subject Mastery", desc: "Identify which focus areas need more study time." },
                  { title: "One-Click Brag Sheet", desc: "Automate your resume for college recommendations." }
                ].map((item, i) => (
                  <li key={i} className="space-y-1">
                    <p className="text-sm font-bold text-on-surface leading-tight">{item.title}</p>
                    <p className="text-[11px] text-on-surface-variant leading-relaxed">{item.desc}</p>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="glass-card p-6 rounded-[2rem] border-white/5 text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-surface-container-high flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-indigo-400" />
              </div>
              <h4 className="text-on-surface font-bold mb-2">Visualize Your Path</h4>
              <p className="text-xs text-on-surface-variant mb-6">Graphs and deeper subject analytics are generated automatically as you add more records.</p>
              <div className="w-full h-1 bg-surface-container-high rounded-full overflow-hidden">
                <div className="h-full bg-primary w-[45%]" />
              </div>
            </div>
          </div>
        </div>

        {/* Add Record Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="glass-card w-full max-w-md p-8 rounded-[2.5rem] border-white/10 shadow-2xl relative">
              <h2 className="text-2xl font-heading font-black text-on-surface mb-6">Add Test Record</h2>
              <form onSubmit={handleAddMark} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] ml-1">Subject</label>
                  <input 
                    type="text" 
                    placeholder="e.g. AP Calculus"
                    className="w-full bg-surface-container-high border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary/50 transition-colors"
                    value={newMark.subject}
                    onChange={e => setNewMark({...newMark, subject: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] ml-1">Test Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Unit 1 Final"
                    className="w-full bg-surface-container-high border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary/50 transition-colors"
                    value={newMark.testName}
                    onChange={e => setNewMark({...newMark, testName: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] ml-1">Score</label>
                    <input 
                      type="number" 
                      placeholder="0"
                      className="w-full bg-surface-container-high border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary/50 transition-colors"
                      value={newMark.score}
                      onChange={e => setNewMark({...newMark, score: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] ml-1">Total</label>
                    <input 
                      type="number" 
                      placeholder="100"
                      className="w-full bg-surface-container-high border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary/50 transition-colors"
                      value={newMark.total}
                      onChange={e => setNewMark({...newMark, total: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] ml-1">Date</label>
                  <input 
                    type="date" 
                    className="w-full bg-surface-container-high border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors"
                    value={newMark.date}
                    onChange={e => setNewMark({...newMark, date: e.target.value})}
                  />
                </div>
                <div className="pt-4 flex gap-3">
                  <button 
                    type="button" 
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 bg-surface-container-high text-on-surface-variant py-3 rounded-xl font-bold hover:bg-surface-bright transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 bg-primary text-on-primary py-3 rounded-xl font-bold hover:scale-[1.02] transition-all shadow-lg shadow-primary/20"
                  >
                    Save Record
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
    <DemoSignupModal
      isOpen={showDemoModal}
      onClose={() => setShowDemoModal(false)}
      feature="Performance Tracking"
    />
    </>
  );
}
