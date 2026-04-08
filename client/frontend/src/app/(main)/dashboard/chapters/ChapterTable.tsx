"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import api from "@/lib/api";
import { Plus, Trash2, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Column {
  id: string;
  name: string;
}

interface Chapter {
  id: string;
  name: string;
  dueDate: string | null;
  progress: Record<string, boolean>;
}

interface TrackerData {
  columns: Column[];
  chapters: Chapter[];
}

export default function ChapterTable({ subject }: { subject: string }) {
  const [data, setData] = useState<TrackerData>({ columns: [], chapters: [] });
  const [loading, setLoading] = useState(true);
  const [savingState, setSavingState] = useState<"idle" | "saving" | "saved">("idle");
  
  // Ref for debouncing
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Track if initial load is done to prevent overwriting
  const isInitialized = useRef(false);

  useEffect(() => {
    fetchData();
  }, [subject]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/chapter-list/${subject}`);
      if (response.data?.data) {
        setData(response.data.data);
      }
      isInitialized.current = true;
    } catch (error) {
      console.error("Failed to fetch chapter list", error);
      toast.error("Failed to load your list");
    } finally {
      setLoading(false);
    }
  };

  const saveData = async (newData: TrackerData, immediate = false) => {
    if (!isInitialized.current) return;
    
    setData(newData);

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    if (immediate) {
      performSave(newData);
    } else {
      setSavingState("saving");
      saveTimeoutRef.current = setTimeout(() => {
        performSave(newData);
      }, 1000); // 1-second debounce
    }
  };

  const performSave = async (dataToSave: TrackerData) => {
    try {
      setSavingState("saving");
      await api.put(`/chapter-list/${subject}`, {
        columns: dataToSave.columns,
        chapters: dataToSave.chapters,
      });
      setSavingState("saved");
      setTimeout(() => setSavingState("idle"), 2000);
    } catch (error) {
      console.error("Save failed", error);
      toast.error("Failed to save changes");
      setSavingState("idle");
    }
  };

  const handleAddChapter = () => {
    const newChapter: Chapter = {
      id: crypto.randomUUID(),
      name: "",
      dueDate: null,
      progress: {},
    };
    saveData({
      ...data,
      chapters: [...data.chapters, newChapter],
    }, true);
  };

  const handleAddColumn = () => {
    if (data.columns.length >= 8) {
      toast.error("Maximum of 8 dynamic columns allowed.");
      return;
    }
    const newColumn: Column = {
      id: `col-${crypto.randomUUID()}`,
      name: "New Column",
    };
    saveData({
      ...data,
      columns: [...data.columns, newColumn],
    }, true);
  };

  const handleUpdateChapterName = (id: string, name: string) => {
    const newChapters = data.chapters.map((ch) =>
      ch.id === id ? { ...ch, name } : ch
    );
    saveData({ ...data, chapters: newChapters }, false); // debounced
  };

  const handleUpdateChapterDate = (id: string, dueDate: string) => {
    const newChapters = data.chapters.map((ch) =>
      ch.id === id ? { ...ch, dueDate } : ch
    );
    saveData({ ...data, chapters: newChapters }, true); // immediate
  };

  const handleToggleProgress = (chapterId: string, colId: string, value: boolean) => {
    const newChapters = data.chapters.map((ch) => {
      if (ch.id === chapterId) {
        return {
          ...ch,
          progress: {
            ...ch.progress,
            [colId]: value,
          },
        };
      }
      return ch;
    });
    saveData({ ...data, chapters: newChapters }, true); // immediate
  };

  const handleUpdateColumnName = (id: string, name: string) => {
    const newCols = data.columns.map((c) =>
      c.id === id ? { ...c, name } : c
    );
    saveData({ ...data, columns: newCols }, false); // debounced
  };

  const handleDeleteChapter = (id: string) => {
    const newChapters = data.chapters.filter((ch) => ch.id !== id);
    saveData({ ...data, chapters: newChapters }, true);
  };

  const handleDeleteColumn = (id: string) => {
    const newCols = data.columns.filter((c) => c.id !== id);
    // Optionally clean up progress maps, but MongoDB Map allows extra keys
    saveData({ ...data, columns: newCols }, true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 text-primary">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full">
      {/* Top Banner (Save State) */}
      <div className="flex justify-between items-center mb-4 px-1">
        <h2 className="text-lg font-montserrat font-semibold text-primary">{subject} Tracker</h2>
        <div className="flex items-center text-sm font-medium">
          {savingState === "saving" && (
            <span className="flex items-center text-on-surface-variant">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
            </span>
          )}
          {savingState === "saved" && (
            <span className="flex items-center text-green-500">
              <Check className="w-4 h-4 mr-1" /> Saved
            </span>
          )}
        </div>
      </div>

      <div className="w-full overflow-x-auto bg-surface-bright rounded-xl border border-outline-variant/30 shadow-sm relative pb-4">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b border-outline-variant/40 bg-surface">
              <th className="p-3 font-interface font-semibold text-on-surface w-64 min-w-[200px]">
                Chapter
              </th>
              <th className="p-3 font-interface font-semibold text-on-surface w-40 min-w-[150px]">
                Due Date
              </th>
              {data.columns.map((col) => (
                <th key={col.id} className="p-3 font-interface font-semibold text-on-surface min-w-[120px] group">
                  <div className="flex items-center justify-between gap-2">
                    <input
                      type="text"
                      className="bg-transparent border-none outline-none font-semibold text-on-surface w-full hover:bg-surface-variant/50 focus:bg-surface-variant focus:ring-1 ring-primary/50 px-1 py-0.5 rounded"
                      value={col.name}
                      onChange={(e) => handleUpdateColumnName(col.id, e.target.value)}
                    />
                    <button 
                      onClick={() => handleDeleteColumn(col.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-error hover:bg-error/10 rounded transition-opacity"
                      title="Delete Column"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </th>
              ))}
              <th className="p-3 w-10"></th>
            </tr>
          </thead>
          <tbody>
            {data.chapters.map((chapter) => (
              <tr key={chapter.id} className="border-b border-outline-variant/20 hover:bg-surface/50 transition-colors">
                <td className="p-2">
                  <input
                    type="text"
                    placeholder="Chapter name..."
                    className="w-full bg-transparent border border-transparent hover:border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary px-3 py-2 rounded-lg text-sm text-on-surface outline-none transition-all"
                    value={chapter.name}
                    onChange={(e) => handleUpdateChapterName(chapter.id, e.target.value)}
                  />
                </td>
                <td className="p-2">
                  <input
                    type="date"
                    className="w-full bg-transparent border border-transparent hover:border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary px-3 py-2 rounded-lg text-sm text-on-surface-variant outline-none transition-all"
                    value={chapter.dueDate ? new Date(chapter.dueDate).toISOString().split('T')[0] : ''}
                    onChange={(e) => handleUpdateChapterDate(chapter.id, e.target.value)}
                  />
                </td>
                {data.columns.map((col) => (
                  <td key={col.id} className="p-3 text-center">
                    <label className="flex items-center justify-center cursor-pointer relative">
                      <input
                        type="checkbox"
                        checked={!!chapter.progress[col.id]}
                        onChange={(e) => handleToggleProgress(chapter.id, col.id, e.target.checked)}
                        className="peer sr-only"
                      />
                      <div className="w-6 h-6 border-2 border-outline-variant rounded bg-surface hover:bg-surface-variant peer-checked:bg-primary peer-checked:border-primary transition-all flex items-center justify-center">
                        <Check className="w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                      </div>
                    </label>
                  </td>
                ))}
                <td className="p-2 text-center">
                  <button 
                    onClick={() => handleDeleteChapter(chapter.id)}
                    className="p-1.5 text-on-surface-variant/50 hover:text-error hover:bg-error/10 rounded-md transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {data.chapters.length === 0 && (
          <div className="py-8 text-center text-sm text-on-surface-variant">
            No chapters added yet. Click below to add one.
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-wrap gap-4">
        <button
          onClick={handleAddChapter}
          className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-xl font-medium text-sm transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Chapter
        </button>
        
        {data.columns.length < 8 && (
          <button
            onClick={handleAddColumn}
            className="flex items-center gap-2 px-4 py-2 bg-secondary/10 text-secondary hover:bg-secondary/20 rounded-xl font-medium text-sm transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Column
          </button>
        )}
      </div>
    </div>
  );
}
