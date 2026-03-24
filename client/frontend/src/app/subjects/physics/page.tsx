import DashboardLayout from "@/components/DashboardLayout";
import { physicsUnits, physicsResources } from "@/lib/mockData";
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
  MoreVertical,
  Play,
  ExternalLink,
  ChevronDown,
  Grid3X3,
  List,
} from "lucide-react";

const unitIcons: Record<string, React.ReactNode> = {
  cog: <Cog className="w-7 h-7 text-primary" />,
  lightbulb: <Lightbulb className="w-7 h-7 text-primary" />,
  thermometer: <Thermometer className="w-7 h-7 text-primary" />,
};

const resourceIcons: Record<string, React.ReactNode> = {
  "text-red-400": <FileText className="w-5 h-5" />,
  "text-indigo-400": <Video className="w-5 h-5" />,
  "text-orange-400": <ImageIcon className="w-5 h-5" />,
};

export default function PhysicsPage() {
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
          <span className="text-on-surface">Physics</span>
        </nav>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <h2 className="text-6xl font-black tracking-tighter text-on-surface mb-3">Physics</h2>
            <p className="text-on-surface-variant max-w-2xl text-lg leading-relaxed">
              Advanced concepts in classical and modern physics. Curated resources for Semester 2 curriculum and competitive exam preparation.
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
                <p className="text-on-surface-variant text-sm mt-1">You&apos;ve mastered 68% of the core Physics syllabus.</p>
              </div>
              <div className="text-right">
                <span className="text-4xl font-black text-primary">68%</span>
                <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Progress</p>
              </div>
            </div>
            <div className="w-full h-4 bg-surface-variant/30 rounded-full overflow-hidden p-1 border border-outline-variant/10">
              <div className="h-full bg-gradient-to-r from-primary to-primary-dim rounded-full transition-all duration-1000 ease-out" style={{ width: "68%" }} />
            </div>
            <div className="grid grid-cols-4 gap-4 pt-2">
              {[
                { val: "14/20", label: "Units" },
                { val: "128", label: "Flashcards" },
                { val: "12h", label: "Time" },
                { val: "92%", label: "Avg Score" },
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
              Reviewing <span className="text-primary font-bold">Electromagnetism Notes</span> now will boost your exam readiness score by +12%.
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
            Learning Units
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {physicsUnits.map((unit) => (
            <div key={unit.id} className="group bg-surface-container-low p-6 rounded-2xl border border-outline-variant/10 hover:bg-surface-container hover:border-primary/20 transition-all cursor-pointer">
              <div className="flex justify-between items-start mb-6">
                <div className="w-14 h-14 rounded-xl bg-surface-variant flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                  {unitIcons[unit.icon]}
                </div>
                <span className="text-[10px] font-black text-on-surface-variant tracking-widest bg-outline-variant/20 px-2 py-1 rounded">{unit.id}</span>
              </div>
              <h4 className="text-lg font-bold mb-1 group-hover:text-primary transition-colors">{unit.title}</h4>
              <p className="text-sm text-on-surface-variant mb-6">{unit.resources} Resources • {unit.size}</p>
              <div className="flex items-center justify-between">
                <div className="flex -space-x-2">
                  <div className="w-7 h-7 rounded-full bg-outline-variant border-2 border-surface-container-low flex items-center justify-center text-[8px] font-bold">PDF</div>
                  <div className="w-7 h-7 rounded-full bg-primary-container border-2 border-surface-container-low flex items-center justify-center text-[8px] font-bold">MP4</div>
                </div>
                <ChevronRight className="w-5 h-5 text-on-surface-variant group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
          {/* Add Unit */}
          <div className="group border-2 border-dashed border-outline-variant/30 rounded-2xl flex flex-col items-center justify-center p-6 hover:border-primary/50 transition-all cursor-pointer hover:bg-surface-container-low">
            <div className="w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-all group-hover:scale-110">
              <Plus className="w-5 h-5 text-primary" />
            </div>
            <p className="text-sm font-bold text-on-surface">New Unit</p>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mt-1">Organize vault</p>
          </div>
        </div>
      </section>

      {/* Resources Table */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-on-surface flex items-center gap-3">
            <span className="w-2 h-6 bg-primary rounded-full" />
            Recent Resources
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
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Subject Unit</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Last Modified</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {physicsResources.map((res) => (
                <tr key={res.name} className="group hover:bg-surface-container-highest/30 transition-colors cursor-pointer">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg ${res.iconBg} border border-${res.iconColor.replace("text-","")}/20 flex items-center justify-center ${res.iconColor}`}>
                        {resourceIcons[res.iconColor] || <FileText className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-on-surface">{res.name}</p>
                        <p className="text-xs text-on-surface-variant">{res.size}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-tight">{res.unit}</span>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-xs font-medium text-on-surface-variant">{res.type}</p>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-xs text-on-surface-variant">{res.modified}</p>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 hover:bg-surface-variant rounded-lg transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-surface-variant rounded-lg transition-colors">
                        <Download className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-surface-variant rounded-lg transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-6 text-center">
          <button className="text-sm font-bold text-primary hover:text-primary-dim transition-colors flex items-center gap-2 mx-auto">
            View All 142 Resources
            <ChevronDown className="w-5 h-5" />
          </button>
        </div>
      </section>
    </DashboardLayout>
  );
}
