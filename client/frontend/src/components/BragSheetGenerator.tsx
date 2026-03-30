"use client";

import React, { useRef, useState } from "react";
import { FileText, Download, Sparkles, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useAuth } from "@/context/AuthContext";
import { trackReportExport } from "@/lib/analytics";

interface BragSheetProps {
  marks: any[];
}

export default function BragSheetGenerator({ marks }: BragSheetProps) {
  const { user } = useAuth();
  const [generating, setGenerating] = useState(false);
  const reportTemplateRef = useRef<HTMLDivElement>(null);

  const calculateTotalFocusHours = () => {
    if (!user?.totalActiveSeconds) return 0;
    return (user.totalActiveSeconds / 3600).toFixed(1);
  };

  const getTopSubjects = () => {
    if (marks.length === 0) return [{ name: "General Studies", avg: 0 }];
    const subjectAverges: Record<string, number> = {};
    const subjectCounts: Record<string, number> = {};

    marks.forEach(m => {
      subjectAverges[m.subject] = (subjectAverges[m.subject] || 0) + m.percentage;
      subjectCounts[m.subject] = (subjectCounts[m.subject] || 0) + 1;
    });

    return Object.keys(subjectAverges)
      .map(s => ({ name: s, avg: subjectAverges[s] / subjectCounts[s] }))
      .sort((a, b) => b.avg - a.avg)
      .slice(0, 3);
  };

  const handleGeneratePDF = async () => {
    if (!reportTemplateRef.current) return;
    setGenerating(true);
    const toastId = toast.loading("Generating your Admissions Brag Sheet...");

    try {
      // Ensure the hidden template is rendered for capture
      const element = reportTemplateRef.current;
      const canvas = await html2canvas(element, {
        scale: 2, // Higher resolution
        useCORS: true,
        logging: false,
        backgroundColor: "#0F0F12" // Match platform dark theme
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
      pdf.save(`Vayl_Brag_Sheet_${user?.name.replace(/\s+/g, '_')}.pdf`);
      
      trackReportExport("Brag Sheet");
      toast.success("Brag Sheet downloaded successfully!", { id: toastId });
    } catch (error) {
      console.error("PDF generation failed:", error);
      toast.error("Failed to generate PDF. Please try again.", { id: toastId });
    } finally {
      setGenerating(false);
    }
  };

  const topSubjects = getTopSubjects();

  return (
    <div className="space-y-6">
      {/* Action Card */}
      <div className="glass-card p-8 rounded-[2.5rem] border-white/5 bg-gradient-to-br from-indigo-500/10 via-primary/5 to-transparent relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform duration-700">
          <Sparkles className="w-24 h-24 text-primary" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
              <ShieldCheck className="w-6 h-6" />
            </span>
            <h3 className="text-2xl font-heading font-black text-on-surface tracking-tighter">Verified Brag Sheet</h3>
          </div>
          
          <p className="text-on-surface-variant text-sm max-w-lg mb-8 leading-relaxed">
            Generate a professional, structured overview of your academic achievements. Includes focus consistency, subject mastery, and authenticated test records for your college counselor.
          </p>
          
          <button 
            onClick={handleGeneratePDF}
            disabled={generating}
            className="flex items-center gap-3 bg-primary text-on-primary px-8 py-3.5 rounded-2xl font-black text-sm hover:scale-105 transition-all shadow-xl shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generating ? (
              <span className="animate-pulse">Generating Portfolio...</span>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Download Admissions Portfolio
              </>
            )}
          </button>
        </div>
      </div>

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
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "40px", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "30px" }}>
            <div>
              <h1 style={{ fontSize: "3rem", fontWeight: "bold", margin: "0 0 8px 0", letterSpacing: "-0.04em" }}>{user?.name}</h1>
              <p style={{ fontSize: "1.25rem", color: "#818cf8", fontWeight: "500", textTransform: "uppercase", letterSpacing: "0.2em", margin: 0 }}>{user?.targetExam?.[0] || "Academic"} Candidate • {user?.targetYear}</p>
              <p style={{ color: "#a3acb7", marginTop: "16px", fontSize: "0.875rem", maxWidth: "400px", lineHeight: "1.6" }}>{user?.bio || "Dedicated student utilizing high-fidelity focus and structured study sessions to achieve academic excellence."}</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "flex-end", marginBottom: "4px" }}>
                <span style={{ fontSize: "1.875rem", fontWeight: "900", color: "#c0c1ff" }}>VAYL</span>
                <span style={{ fontSize: "10px", fontWeight: "bold", color: "#a3acb7", textTransform: "uppercase", letterSpacing: "0.1em", backgroundColor: "rgba(255,255,255,0.08)", padding: "4px 12px", borderRadius: "100px", whiteSpace: "nowrap" }}>Verified Portfolio</span>
              </div>
              <p style={{ fontSize: "10px", color: "#a3acb7", fontFamily: "monospace", textTransform: "uppercase", margin: "8px 0 0 0" }}>Vault ID: {user?.vaultId || "VAYL-USER"}</p>
            </div>
          </div>

          {/* Stats Bar */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "32px", marginBottom: "64px" }}>
            <div style={{ backgroundColor: "rgba(255,255,255,0.05)", padding: "24px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.05)" }}>
              <p style={{ fontSize: "10px", fontWeight: "bold", color: "#a3acb7", textTransform: "uppercase", letterSpacing: "0.2em", margin: "0 0 8px 0" }}>Deep Work Duration</p>
              <p style={{ fontSize: "2.25rem", fontWeight: "bold", color: "#FFFFFF", margin: 0 }}>{calculateTotalFocusHours()} <span style={{ fontSize: "0.875rem", fontWeight: "500", opacity: 0.4 }}>Hours</span></p>
            </div>
            <div style={{ backgroundColor: "rgba(255,255,255,0.05)", padding: "24px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.05)" }}>
              <p style={{ fontSize: "10px", fontWeight: "bold", color: "#a3acb7", textTransform: "uppercase", letterSpacing: "0.2em", margin: "0 0 8px 0" }}>Academic Consistency</p>
              <p style={{ fontSize: "2.25rem", fontWeight: "bold", color: "#FFFFFF", margin: 0 }}>{user?.currentStreak || 0} <span style={{ fontSize: "0.875rem", fontWeight: "500", opacity: 0.4 }}>Day Streak</span></p>
            </div>
            <div style={{ backgroundColor: "rgba(255,255,255,0.05)", padding: "24px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.05)" }}>
              <p style={{ fontSize: "10px", fontWeight: "bold", color: "#a3acb7", textTransform: "uppercase", letterSpacing: "0.2em", margin: "0 0 8px 0" }}>Flashcard Mastery</p>
              <p style={{ fontSize: "2.25rem", fontWeight: "bold", color: "#FFFFFF", margin: 0 }}>{user?.analytics?.resourceCount || 0} <span style={{ fontSize: "0.875rem", fontWeight: "500", opacity: 0.4 }}>Sets</span></p>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "64px" }}>
            {/* Left: Academic Record */}
            <div style={{ display: "flex", flexDirection: "column", gap: "48px" }}>
              <section>
                <h3 style={{ fontSize: "12px", fontWeight: "bold", color: "#c0c1ff", textTransform: "uppercase", letterSpacing: "0.3em", marginBottom: "24px" }}>Subject Proficiency</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                  {topSubjects.map((s: any, i) => (
                    <div key={i} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                        <span style={{ fontWeight: "bold", color: "#FFFFFF" }}>{s.name}</span>
                        <span style={{ color: "#a3acb7" }}>{s.avg.toFixed(0)}% Mastery</span>
                      </div>
                      <div style={{ width: "100%", height: "6px", backgroundColor: "rgba(255,255,255,0.05)", borderRadius: "999px", overflow: "hidden" }}>
                        <div style={{ height: "100%", backgroundColor: "#c0c1ff", width: `${s.avg}%` }} />
                      </div>
                    </div>
                  ))}
                  {topSubjects.length === 0 && (
                    <p style={{ color: "#a3acb7", fontSize: "14px", fontStyle: "italic" }}>Start logging test marks to see proficiency analytics.</p>
                  )}
                </div>
              </section>
            </div>

            {/* Right: Goals & Context */}
            <div style={{ display: "flex", flexDirection: "column", gap: "48px" }}>
              <section style={{ backgroundColor: "rgba(192, 193, 255, 0.05)", padding: "32px", borderRadius: "24px", border: "1px solid rgba(192, 193, 255, 0.2)" }}>
                <h3 style={{ fontSize: "14px", fontWeight: "900", color: "#FFFFFF", marginBottom: "8px", textTransform: "uppercase" }}>Vayl Certification</h3>
                <p style={{ fontSize: "12px", color: "#a3acb7", lineHeight: "1.6", marginBottom: "24px", margin: 0 }}>
                  This report was generated using Vayl's performance tracking algorithms. All focus hours, flashcard sessions, and test records are authenticated via the Vayl platform's verified student identity system.
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "48px", height: "48px", borderRadius: "50%", border: "2px solid rgba(192, 193, 255, 0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ width: "100%", height: "100%", borderRadius: "50%", backgroundColor: "#c0c1ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <FileText style={{ width: "20px", height: "20px", color: "#2724b8" }} />
                    </div>
                  </div>
                  <div>
                    <p style={{ fontSize: "10px", fontWeight: "bold", color: "#FFFFFF", textTransform: "uppercase", letterSpacing: "0.1em", margin: 0 }}>Official ID</p>
                    <p style={{ fontSize: "9px", color: "#c0c1ff", fontFamily: "monospace", textTransform: "uppercase", margin: "4px 0 0 0" }}>{user?.vaultId || "STUDENT-VERIFIED"}</p>
                  </div>
                </div>
              </section>
            </div>
          </div>
          
          {/* Footer */}
          <div style={{ marginTop: "96px", paddingTop: "32px", borderTop: "1px solid rgba(255,255,255,0.1)", textAlign: "center" }}>
            <p style={{ fontSize: "10px", fontWeight: "bold", color: "#a3acb7", textTransform: "uppercase", letterSpacing: "0.4em", margin: 0 }}>Generated on {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
