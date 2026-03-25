"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import api from "@/lib/api";
import { Resource } from "@/types";
import {
  ChevronRight,
  Home,
  Share2,
  Upload,
  Sparkles,
  Cog,
  Lightbulb,
  Thermometer,
  Plus,
  FileText,
  Video,
  ImageIcon,
  Eye,
  Download,
  Grid3X3,
  List,
  FolderOpen,
  Trash2
} from "lucide-react";

const unitIcons: Record<string, React.ReactNode> = {
  cog: <Cog className="w-7 h-7 text-primary" />,
  lightbulb: <Lightbulb className="w-7 h-7 text-primary" />,
  thermometer: <Thermometer className="w-7 h-7 text-primary" />,
  folder: <FolderOpen className="w-7 h-7 text-primary" />
};

export default function SubjectPage({ params }: { params: Promise<{ subject: string }> }) {
  const router = useRouter();
  const { subject } = use(params);
  const decodedSubject = decodeURIComponent(subject);
  
  // Capitalize first letter of subject for UI
  const subjectTitle = decodedSubject.charAt(0).toUpperCase() + decodedSubject.slice(1);

  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubjectResources = async () => {
      try {
        const { data } = await api.get(`/resources?folder=${encodeURIComponent(decodedSubject)}&limit=50`);
        setResources(data.resources || []);
      } catch (error) {
        console.error("Failed to fetch subject resources", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSubjectResources();
    
    const handleResourceAdded = () => fetchSubjectResources();
    const handleResourceDeleted = () => fetchSubjectResources();
    window.addEventListener("resourceAdded", handleResourceAdded);
    window.addEventListener("resourceDeleted", handleResourceDeleted);
    return () => {
      window.removeEventListener("resourceAdded", handleResourceAdded);
      window.removeEventListener("resourceDeleted", handleResourceDeleted);
    };
  }, [decodedSubject]);

  const handleDeleteResource = async (id: string) => {
    if (!confirm("Are you sure you want to delete this resource?")) return;
    try {
      await api.delete(`/resources/${id}`);
      window.dispatchEvent(new Event("resourceDeleted"));
    } catch (error) {
      console.error("Failed to delete resource", error);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-8">
          <LoadingSkeleton count={4} />
        </div>
      </DashboardLayout>
    );
  }

  // Dynamic Units based on Resource Types
  const typesCount = resources.reduce((acc, r) => {
    acc[r.type] = (acc[r.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const dynamicUnits = Object.entries(typesCount).map(([type, count], idx) => ({
    id: `0${idx + 1}`,
    title: type,
    resources: count,
    size: "Various",
    icon: idx === 0 ? "cog" : idx === 1 ? "lightbulb" : "folder"
  }));

  // Dynamic Progress based on arbitrary targets for now (since no test endpoints exist)
  const masteryPercent = resources.length === 0 ? 0 : Math.min(Math.round((resources.length / 10) * 100), 100);

  return (
    <DashboardLayout>
      {/* Breadcrumbs */}
      <div className="mb-10">
        <nav className="flex items-center gap-2 text-[11px] font-bold text-on-surface-variant mb-6 tracking-widest uppercase">
          <a href="/" className="hover:text-primary transition-colors flex items-center gap-1">
            <Home className="w-3 h-3" />
            Vault
          </a>
          <ChevronRight className="w-3 h-3" />
          <span className="text-on-surface">{subjectTitle}</span>
        </nav>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <h2 className="text-6xl font-black tracking-tighter text-on-surface mb-3">{subjectTitle}</h2>
            <p className="text-on-surface-variant max-w-2xl text-lg leading-relaxed">
              Curated resources and materials saved for {subjectTitle}.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-5 py-2.5 bg-surface-container-highest hover:bg-surface-bright text-on-surface font-semibold rounded-xl border border-outline-variant/20 transition-all">
              <Share2 className="w-5 h-5" />
              Share
            </button>
            <button className="flex items-center gap-2 px-6 py-2.5 bg-primary text-on-primary font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
              <Upload className="w-5 h-5" />
              Upload Resource
            </button>
          </div>
        </div>
      </div>

      {/* Knowledge Coverage */}
      <section className="mb-12 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-surface-container rounded-2xl p-8 border border-outline-variant/10 shadow-sm flex items-center justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] -mr-20 -mt-20" />
          <div className="relative z-10 space-y-4 w-full">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="font-extrabold text-2xl text-on-surface">Knowledge Coverage</h3>
                <p className="text-on-surface-variant text-sm mt-1">Syllabus collection progress.</p>
              </div>
              <div className="text-right">
                <span className="text-4xl font-black text-primary">{masteryPercent}%</span>
                <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Progress</p>
              </div>
            </div>
            <div className="w-full h-4 bg-surface-variant/30 rounded-full overflow-hidden p-1 border border-outline-variant/10">
              <div className="h-full bg-gradient-to-r from-primary to-primary-dim rounded-full transition-all duration-1000 ease-out" style={{ width: `${masteryPercent}%` }} />
            </div>
            <div className="grid grid-cols-4 gap-4 pt-2">
              {[
                { val: resources.length, label: "Materials" },
                { val: "0", label: "Flashcards" },
                { val: "N/A", label: "Time" },
                { val: "N/A", label: "Avg Score" },
              ].map((stat, i) => (
                <div key={stat.label} className={`text-center ${i > 0 ? "border-l border-outline-variant/20" : ""}`}>
                  <p className="text-lg font-bold">{stat.val}</p>
                  <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-tight">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Smart Recommendation */}
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden">
          <Sparkles className="absolute -right-4 -bottom-4 w-24 h-24 text-primary/10 rotate-12" />
          <div className="relative z-10">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center mb-4">
               <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <h4 className="font-bold text-xl mb-2">Smart Recommendation</h4>
            <p className="text-on-surface-variant text-sm leading-relaxed mb-6">
              Reviewing your recently added notes now will boost your exam readiness score by +12%.
            </p>
            <button className="w-full py-3 bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary font-bold rounded-xl transition-all">
              Start Review
            </button>
          </div>
        </div>
      </section>

      {/* Learning Units */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-on-surface flex items-center gap-3">
            <span className="w-2 h-6 bg-primary rounded-full" />
            Resource Categories
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {dynamicUnits.length === 0 ? (
             <div className="group bg-surface-container-low p-6 rounded-2xl border border-outline-variant/10 text-on-surface-variant italic text-sm">
                No categories found. Start saving {subjectTitle} resources.
             </div>
          ) : dynamicUnits.map((unit) => (
            <div key={unit.id} className="group bg-surface-container-low p-6 rounded-2xl border border-outline-variant/10 hover:bg-surface-container hover:border-primary/20 transition-all cursor-pointer">
              <div className="flex justify-between items-start mb-6">
                <div className="w-14 h-14 rounded-xl bg-surface-variant flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                   {unitIcons[unit.icon]}
                </div>
                <span className="text-[10px] font-black text-on-surface-variant tracking-widest bg-outline-variant/20 px-2 py-1 rounded">{unit.id}</span>
              </div>
              <h4 className="text-lg font-bold mb-1 group-hover:text-primary transition-colors">{unit.title}</h4>
              <p className="text-sm text-on-surface-variant mb-6">{unit.resources} Resources • {unit.size}</p>
              <div className="flex items-center gap-2 text-on-surface-variant group-hover:text-primary transition-colors justify-end">
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
          {/* Add Category */}
          <div className="group border-2 border-dashed border-outline-variant/30 rounded-2xl flex flex-col items-center justify-center p-6 hover:border-primary/50 transition-all cursor-pointer hover:bg-surface-container-low">
            <div className="w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-all group-hover:scale-110">
              <Plus className="w-5 h-5 text-primary" />
            </div>
            <p className="text-sm font-bold text-on-surface">New Category</p>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mt-1">Organize vault</p>
          </div>
        </div>
      </section>

      {/* Resources Table */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-on-surface flex items-center gap-3">
            <span className="w-2 h-6 bg-primary rounded-full" />
            Saved Resources
          </h3>
          <div className="flex bg-surface-container-low p-1 rounded-xl border border-outline-variant/10">
             <button className="p-2 text-on-surface-variant hover:text-on-surface rounded-lg transition-colors">
               <Grid3X3 className="w-5 h-5" />
             </button>
             <button className="p-2 bg-primary/20 rounded-lg text-primary">
               <List className="w-5 h-5" />
             </button>
          </div>
        </div>
        <div className="bg-surface-container-low rounded-2xl border border-outline-variant/10 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant/10 text-on-surface-variant text-[11px] font-black tracking-widest uppercase">
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">URL</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Date Added</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {resources.length === 0 ? (
                 <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-on-surface-variant italic text-sm">
                       No resources found. Click Quick Save to add some.
                    </td>
                 </tr>
              ) : resources.map((res) => {
                const isPdf = res.url.includes('.pdf');
                const isVideo = res.url.includes('youtube') || res.url.includes('mp4');
                const Icon = isPdf ? FileText : isVideo ? Video : ImageIcon;

                return (
                 <tr key={res._id} onClick={() => router.push(`/resource/${res._id}`)} className="group hover:bg-surface-container-highest/30 transition-colors cursor-pointer">
                    <td className="px-6 py-5">
                       <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-400/20 flex items-center justify-center text-indigo-400`}>
                             <Icon className="w-5 h-5" />
                          </div>
                          <div>
                             <p className="text-sm font-bold text-on-surface line-clamp-1 max-w-xs">{res.title}</p>
                             <p className="text-xs text-on-surface-variant">{res.folderName || 'Uncategorized'}</p>
                          </div>
                       </div>
                    </td>
                    <td className="px-6 py-5">
                       <span className="text-[10px] text-on-surface-variant line-clamp-1 max-w-xs">{res.url}</span>
                    </td>
                    <td className="px-6 py-5">
                       <span className="px-3 py-1 bg-surface-bright text-xs font-bold uppercase rounded text-on-surface-variant">
                          {res.type}
                       </span>
                    </td>
                    <td className="px-6 py-5">
                       <p className="text-xs font-medium text-on-surface-variant">
                          {new Date(res.createdAt).toLocaleDateString()}
                       </p>
                    </td>
                    <td className="px-6 py-5">
                       <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <a href={res.url} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="p-2 hover:bg-surface-variant rounded-lg transition-colors">
                             <Eye className="w-4 h-4 text-on-surface-variant hover:text-primary" />
                          </a>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteResource(res._id);
                            }} 
                            className="p-2 hover:bg-error/10 rounded-lg transition-colors"
                          >
                             <Trash2 className="w-4 h-4 text-error/70 hover:text-error" />
                          </button>
                       </div>
                    </td>
                 </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </DashboardLayout>
  );
}
