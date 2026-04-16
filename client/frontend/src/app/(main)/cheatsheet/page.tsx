"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import api from "@/lib/api";

type SubjectType = "chemistry" | "physics" | "mathematics";

interface CheatsheetBlock {
  type: "formula" | "table" | "grid" | "text";
  label: string;
  items: any; // Can be array of formula strings, or table data, or grid items
  accentColor?: string;
}

interface CheatsheetSection {
  _id: string;
  subject: SubjectType;
  title: string;
  order: number;
  accentColor: "yellow" | "orange" | "teal" | "purple";
  blocks: CheatsheetBlock[];
}

export default function CheatsheetPage() {
  const [data, setData] = useState<Record<SubjectType, CheatsheetSection[]>>({
    chemistry: [],
    physics: [],
    mathematics: [],
  });
  const [activeTab, setActiveTab] = useState<SubjectType>("chemistry");
  const [loading, setLoading] = useState(true);
  const [openSectionId, setOpenSectionId] = useState<string | null>(null);

  useEffect(() => {
    const fetchCheatsheet = async () => {
      try {
        const res = await api.get("/cheatsheet");
        setData(res.data);
        setLoading(false);
      } catch (error) {
        console.error("Failed to load cheatsheet:", error);
        setLoading(false);
      }
    };
    fetchCheatsheet();
  }, []);

  const toggleSection = (id: string) => {
    setOpenSectionId(openSectionId === id ? null : id);
  };

  // Map database colors to Tailwind classes
  const getColors = (colorName: string) => {
    switch (colorName) {
      case "yellow": return { text: "text-amber-500", border: "border-amber-500", bg: "bg-amber-500", bgSoft: "bg-amber-500/10" };
      case "orange": return { text: "text-orange-500", border: "border-orange-500", bg: "bg-orange-500", bgSoft: "bg-orange-500/10" };
      case "teal":   return { text: "text-teal-400", border: "border-teal-400", bg: "bg-teal-400", bgSoft: "bg-teal-400/10" };
      case "purple": return { text: "text-purple-400", border: "border-purple-400", bg: "bg-purple-400", bgSoft: "bg-purple-400/10" };
      default:       return { text: "text-amber-500", border: "border-amber-500", bg: "bg-amber-500", bgSoft: "bg-amber-500/10" };
    }
  };

  // Render a specific block based on its type
  const renderBlock = (block: CheatsheetBlock, blockIndex: number) => {
    const defaultColor = getColors(block.accentColor || "yellow");

    if (block.type === "formula") {
      return (
        <div key={blockIndex} className="mb-4">
          {block.label && <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 ${defaultColor.text}`}>{block.label}</h4>}
          <div className="space-y-2">
            {block.items.map((item: any, i: number) => {
              const itemColor = getColors(item.color || block.accentColor || "yellow");
              return (
                <div key={i} className={`p-3 rounded-lg border-l-4 bg-surface-variant font-mono text-sm break-words ${itemColor.border}`}>
                  {item.text}
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    if (block.type === "table") {
      return (
        <div key={blockIndex} className="mb-4 overflow-x-auto">
          {block.label && <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 ${defaultColor.text}`}>{block.label}</h4>}
          {block.items.map((table: any, tIdx: number) => (
            <table key={tIdx} className="w-full text-left text-sm mb-4 border border-outline-variant/30 rounded-lg overflow-hidden">
              <thead className="bg-surface-variant text-xs uppercase text-on-surface-variant">
                <tr>
                  {table.headers?.map((h: string, i: number) => (
                    <th key={i} className="px-3 py-2 border-b border-outline-variant/30">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.rows?.map((row: string[], rIdx: number) => (
                  <tr key={rIdx} className="hover:bg-surface-variant/50 transition-colors">
                    {row.map((cell: string, cIdx: number) => (
                      <td key={cIdx} className="px-3 py-2 border-b border-outline-variant/30 font-mono text-on-surface">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ))}
        </div>
      );
    }

    if (block.type === "grid") {
      return (
        <div key={blockIndex} className="mb-4">
          {block.label && <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 ${defaultColor.text}`}>{block.label}</h4>}
          {block.items.map((gridGroup: any, gIdx: number) => (
            <div key={gIdx} className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
              {gridGroup.map((item: any, i: number) => (
                <div key={i} className="border border-outline-variant/30 bg-surface-variant p-2 rounded-lg text-center flex flex-col justify-center">
                  <div className="text-[10px] text-on-surface-variant uppercase tracking-wider mb-1">{item.key}</div>
                  <div className={`font-mono text-sm font-bold ${defaultColor.text}`}>{item.value}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
      );
    }

    return null; // Fallback
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full w-full max-w-4xl mx-auto animate-fade-in relative z-10 pb-20">
        
        {/* Header */}
        <div className="mb-6 mt-4">
          <h1 className="text-3xl font-black font-heading text-on-surface tracking-tight mb-2">
            Formula Vault
          </h1>
          <p className="text-sm font-interface text-on-surface-variant">
            High-yield formulas, constants, and equations.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-6 border-b border-outline-variant/30 pb-1 overflow-x-auto hide-scrollbar">
          {(["chemistry", "physics", "mathematics"] as SubjectType[]).map((subj) => (
            <button
              key={subj}
              onClick={() => setActiveTab(subj)}
              className={`px-5 py-2.5 rounded-t-xl font-interface font-semibold text-sm transition-all capitalize whitespace-nowrap ${
                activeTab === subj
                  ? "bg-surface-variant text-primary border-b-2 border-primary"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/50 border-b-2 border-transparent"
              }`}
            >
              {subj}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center p-10">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-3">
            {data[activeTab]?.length === 0 ? (
              <div className="text-center p-10 bg-surface-variant/30 rounded-xl border border-outline-variant/20 border-dashed">
                <p className="text-on-surface-variant font-mono text-sm">No formulas found for this subject.</p>
              </div>
            ) : (
              data[activeTab]?.map((section) => {
                const isOpen = openSectionId === section._id;
                const colors = getColors(section.accentColor);

                return (
                  <div key={section._id} className="bg-surface border border-outline-variant/30 rounded-xl overflow-hidden transition-all duration-200 hover:border-outline-variant/60 shadow-sm">
                    {/* Accordion Header */}
                    <button
                      onClick={() => toggleSection(section._id)}
                      className="w-full px-5 py-4 flex items-center justify-between text-left focus:outline-none"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-2 h-2 rounded-full ${colors.bg}`}></span>
                        <h3 className="font-heading font-bold text-on-surface">{section.title}</h3>
                      </div>
                      <div className={`transform transition-transform duration-200 text-on-surface-variant ${isOpen ? "rotate-90" : ""}`}>
                        ▶
                      </div>
                    </button>

                    {/* Accordion Body */}
                    {isOpen && (
                      <div className="px-5 pb-5 pt-0 border-t border-outline-variant/20 mt-1">
                        <div className="pt-4">
                          {section.blocks.map((block, idx) => renderBlock(block, idx))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
