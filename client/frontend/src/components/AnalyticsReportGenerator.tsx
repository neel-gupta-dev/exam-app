"use client";

import React, { useRef, useState } from "react";
import { Download, Sparkles, ShieldCheck, BarChart3, Clock, Flame, Trophy } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useAuth } from "@/context/AuthContext";
import { trackReportExport } from "@/lib/analytics";

interface AnalyticsReportProps {
  resources: any[];
  heatmapData: any[];
  stats: {
    label: string;
    value: string;
    unit: string;
    icon: string;
  }[];
  subjectMastery: {
    name: string;
    percent: number;
    count: number;
    color: string;
  }[];
}

export default function AnalyticsReportGenerator({ resources, heatmapData, stats, subjectMastery }: AnalyticsReportProps) {
  const { user } = useAuth();
  const [generating, setGenerating] = useState(false);
  const reportTemplateRef = useRef<HTMLDivElement>(null);

  const handleGeneratePDF = async () => {
    if (!reportTemplateRef.current) return;
    setGenerating(true);
    const toastId = toast.loading("Synthesizing your Vault Analytics Report...");

    try {
      const element = reportTemplateRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#0F0F12"
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Vayl_Analytics_Report_${user?.name.replace(/\s+/g, '_')}.pdf`);
      
      trackReportExport("Analytics Portfolio");
      toast.success("Analytics Report downloaded!", { id: toastId });
    } catch (error) {
      console.error("PDF generation failed:", error);
      toast.error("Failed to generate report.", { id: toastId });
    } finally {
      setGenerating(false);
    }
  };

  const currentLevel = user?.levelData?.currentLevel || 1;
  const progressToNext = user?.levelData?.progressToNext || 0;

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button 
        onClick={handleGeneratePDF}
        disabled={generating}
        className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-lg text-xs font-bold transition-all hover:bg-primary-dim shadow-lg shadow-primary/20 disabled:opacity-50"
      >
        <Download className={`w-4 h-4 ${generating ? 'animate-bounce' : ''}`} />
        {generating ? 'GENERATING...' : 'EXPORT REPORT'}
      </button>

      {/* Hidden PDF Template (Pure CSS - NO TAILWIND COLORS) */}
      <div className="fixed left-[-9999px] top-0 pointer-events-none">
        <div 
          ref={reportTemplateRef}
          style={{ 
            width: "210mm", 
            minHeight: "297mm", 
            backgroundColor: "#0F0F12", 
            color: "#FFFFFF", 
            padding: "20mm",
            fontFamily: "sans-serif",
            boxSizing: "border-box" 
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "64px", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "48px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                <span style={{ fontSize: "1.875rem", fontWeight: "900", color: "#c0c1ff", letterSpacing: "-0.05em" }}>VAYL</span>
                <span style={{ width: "1px", height: "24px", backgroundColor: "rgba(255,255,255,0.2)", margin: "0 8px" }} />
                <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", margin: 0 }}>Vault Analytics Report</h1>
              </div>
              <p style={{ color: "#a3acb7", fontSize: "0.875rem", fontWeight: "500", textTransform: "uppercase", letterSpacing: "0.2em", margin: 0 }}>Personal Intelligence Portfolio</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: "1.25rem", fontWeight: "bold", color: "#FFFFFF", margin: 0 }}>{user?.name}</p>
              <p style={{ fontSize: "0.75rem", color: "#818cf8", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: "4px", margin: 0 }}>Lvl {currentLevel} Scholar</p>
              <p style={{ fontSize: "10px", color: "#a3acb7", fontFamily: "monospace", marginTop: "12px", textTransform: "uppercase", margin: 0 }}>ID: {user?.vaultId || "VAYL-USER"}</p>
            </div>
          </div>

          {/* Realms of Knowledge (Stats) */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "24px", marginBottom: "64px" }}>
            {stats.map((stat, i) => (
              <div key={i} style={{ backgroundColor: "rgba(255,255,255,0.05)", padding: "20px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.05)" }}>
                <p style={{ fontSize: "9px", fontWeight: "bold", color: "#a3acb7", textTransform: "uppercase", letterSpacing: "0.2em", margin: "0 0 8px 0" }}>{stat.label}</p>
                <p style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#FFFFFF", margin: 0, lineHeight: 1 }}>{stat.value} <span style={{ fontSize: "10px", opacity: 0.4, fontWeight: "500", textTransform: "lowercase", fontStyle: "italic" }}>{stat.unit}</span></p>
              </div>
            ))}
          </div>

          {/* Scholarly Progress (Level Card) */}
          <div style={{ backgroundColor: "rgba(192, 193, 255, 0.05)", padding: "40px", borderRadius: "40px", border: "1px solid rgba(255,255,255,0.1)", marginBottom: "64px", position: "relative", overflow: "hidden" }}>
             <div style={{ position: "absolute", top: 0, right: 0, padding: "32px", opacity: 0.1 }}>
               <Trophy style={{ width: "128px", height: "128px", color: "#c0c1ff" }} />
             </div>
             <div style={{ position: "relative", zIndex: 10 }}>
                <h3 style={{ fontSize: "12px", fontWeight: "bold", color: "#c0c1ff", textTransform: "uppercase", letterSpacing: "0.3em", marginBottom: "16px", margin: 0 }}>Scholar Level Evolution</h3>
                <div style={{ display: "flex", alignItems: "flex-end", gap: "12px", marginBottom: "16px" }}>
                  <span style={{ fontSize: "3.75rem", fontWeight: "900", margin: 0 }}>Lvl {currentLevel}</span>
                  <span style={{ fontSize: "1.25rem", color: "#a3acb7", fontWeight: "bold", paddingBottom: "4px", textTransform: "lowercase", letterSpacing: "-0.025em" }}>Mastery Reached</span>
                </div>
                <div style={{ width: "100%", height: "8px", backgroundColor: "rgba(255,255,255,0.05)", borderRadius: "999px", overflow: "hidden", marginBottom: "8px" }}>
                   <div style={{ height: "100%", backgroundColor: "#c0c1ff", width: `${progressToNext}%` }} />
                </div>
                <p style={{ fontSize: "10px", fontWeight: "bold", color: "#a3acb7", textTransform: "uppercase", letterSpacing: "0.1em", margin: 0, lineHeight: 1 }}>
                  Progress to Level {currentLevel + 1}: {Math.round(progressToNext)}% Complete
                </p>
             </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "64px" }}>
            {/* Knowledge Distribution */}
            <div style={{ display: "flex", flexDirection: "column", gap: "48px" }}>
              <section>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
                  <BarChart3 style={{ width: "20px", height: "20px", color: "#c0c1ff" }} />
                  <h3 style={{ fontSize: "12px", fontWeight: "bold", color: "#FFFFFF", textTransform: "uppercase", letterSpacing: "0.3em", margin: 0 }}>Knowledge Distribution</h3>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                  {subjectMastery.map((s, i) => (
                    <div key={i} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                        <span style={{ fontWeight: "bold", color: "#FFFFFF" }}>{s.name}</span>
                        <span style={{ color: "#a3acb7" }}>{s.count} Items ({s.percent}%)</span>
                      </div>
                      <div style={{ width: "100%", height: "4px", backgroundColor: "rgba(255,255,255,0.05)", borderRadius: "999px", overflow: "hidden" }}>
                        <div style={{ height: "100%", backgroundColor: s.color, width: `${s.percent}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
                  <Flame style={{ width: "20px", height: "20px", color: "#fb923c" }} />
                  <h3 style={{ fontSize: "12px", fontWeight: "bold", color: "#FFFFFF", textTransform: "uppercase", letterSpacing: "0.3em", margin: 0 }}>Engagement Consistency</h3>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "8px" }}>
                  {heatmapData.map((d, i) => (
                    <div 
                      key={i} 
                      style={{ aspectRatio: "1/1", borderRadius: "4px", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: "bold", backgroundColor: d.level >= 4 ? "#6366f1" : d.level >= 1 ? "rgba(99,102,241,0.3)" : "rgba(255,255,255,0.05)" }}
                    >
                      {d.displayDay}
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Recent Archives */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
                <Clock style={{ width: "20px", height: "20px", color: "#c0c1ff" }} />
                <h3 style={{ fontSize: "12px", fontWeight: "bold", color: "#FFFFFF", textTransform: "uppercase", letterSpacing: "0.3em", margin: 0 }}>Recent Archive Additions</h3>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {resources.slice(0, 8).map((r, i) => (
                  <div key={i} style={{ backgroundColor: "rgba(255,255,255,0.02)", borderLeft: "2px solid #c0c1ff", padding: "16px", borderRadius: "0 12px 12px 0" }}>
                    <p style={{ fontSize: "10px", fontWeight: "bold", color: "#a3acb7", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px", margin: 0 }}>{r.folderName || "Uncategorized"}</p>
                    <p style={{ fontSize: "14px", fontWeight: "bold", color: "#FFFFFF", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", margin: 0 }}>{r.title}</p>
                    <p style={{ fontSize: "9px", color: "#a3acb7", fontFamily: "monospace", marginTop: "8px", textTransform: "lowercase", margin: 0 }}>{new Date(r.createdAt).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div style={{ marginTop: "96px", paddingTop: "32px", borderTop: "1px solid rgba(255,255,255,0.1)", textAlign: "center" }}>
            <p style={{ fontSize: "10px", fontWeight: "bold", color: "#a3acb7", textTransform: "uppercase", letterSpacing: "0.4em", marginBottom: "8px", fontFamily: "monospace", margin: 0 }}>Verified Vayl Academic Intelligence Portfolio</p>
            <p style={{ fontSize: "9px", color: "#a3acb7", opacity: 0.5, margin: 0 }}>This document summarizes the archival activity of {user?.name} as recorded in the Vayl knowledge system.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
