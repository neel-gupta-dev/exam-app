'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Clock, 
  AlignLeft, 
  Trash2, 
  Save, 
  Calendar as CalendarIcon,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import { toast } from 'sonner';

interface CalendarEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: any | null; // null means "Create mode"
  onSuccess: () => void;
}

export default function CalendarEventModal({ 
  isOpen, 
  onClose, 
  event, 
  onSuccess 
}: CalendarEventModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    summary: '',
    description: '',
    start: '',
    end: '',
    timeZone: 'UTC'
  });

  useEffect(() => {
    if (event) {
      // Edit mode
      setFormData({
        summary: event.summary || '',
        description: event.description || '',
        start: new Date(event.start.dateTime || event.start.date).toISOString().slice(0, 16),
        end: new Date(event.end.dateTime || event.end.date).toISOString().slice(0, 16),
        timeZone: event.start.timeZone || 'UTC'
      });
    } else {
      // Create mode - default to current time + 1 hour
      const now = new Date();
      now.setMinutes(0, 0, 0);
      const startStr = now.toISOString().slice(0, 16);
      now.setHours(now.getHours() + 1);
      const endStr = now.toISOString().slice(0, 16);
      
      setFormData({
        summary: '',
        description: '',
        start: startStr,
        end: endStr,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
      });
    }
  }, [event, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (event) {
        // Update
        await api.patch(`/calendar/events/${event.id}`, formData);
        toast.success('Event updated successfully');
      } else {
        // Create
        await api.post('/calendar/events', formData);
        toast.success('Study session synced to Google Calendar');
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to save event:', error);
      toast.error('Failed to sync event with Google');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!event) return;
    if (!confirm('Are you sure you want to delete this event from your Google Calendar?')) return;

    setLoading(true);
    try {
      await api.delete(`/calendar/events/${event.id}`);
      toast.success('Event removed from calendar');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to delete event:', error);
      toast.error('Failed to remove event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100]"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 flex items-center justify-center p-6 z-[110] pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-lg bg-surface-container-highest border border-outline-variant/20 rounded-3xl overflow-hidden shadow-2xl pointer-events-auto flex flex-col"
            >
              {/* Header */}
              <div className="px-8 py-6 flex justify-between items-center bg-surface-container-high/40 border-b border-outline-variant/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 text-primary shadow-xl shadow-primary/5">
                    <CalendarIcon className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-headline font-bold text-white tracking-tight">
                    {event ? 'Edit Strategic Session' : 'Plan Study Session'}
                  </h2>
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-surface-bright rounded-xl transition-all text-on-surface-variant hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                {/* Summary */}
                <div className="space-y-2">
                  <label className="px-1 text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em]">Summary</label>
                  <input
                    type="text"
                    required
                    value={formData.summary}
                    onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                    placeholder="e.g., Organic Chemistry Deep Work"
                    className="w-full px-5 py-4 bg-surface-container-low border border-outline-variant/10 rounded-2xl focus:outline-none focus:border-primary/40 focus:bg-surface-bright text-on-surface text-sm font-medium transition-all shadow-inner"
                  />
                </div>

                {/* Time Range */}
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                    <label className="px-1 text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] flex items-center gap-1.5">
                        <Clock className="w-3 h-3" /> Start
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={formData.start}
                      onChange={(e) => setFormData({ ...formData, start: e.target.value })}
                      className="w-full px-5 py-4 bg-surface-container-low border border-outline-variant/10 rounded-2xl focus:outline-none focus:border-primary/40 focus:bg-surface-bright text-on-surface text-sm font-medium transition-all shadow-inner"
                    />
                  </div>
                   <div className="space-y-2">
                    <label className="px-1 text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] flex items-center gap-1.5">
                        <Clock className="w-3 h-3" /> End
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={formData.end}
                      onChange={(e) => setFormData({ ...formData, end: e.target.value })}
                      className="w-full px-5 py-4 bg-surface-container-low border border-outline-variant/10 rounded-2xl focus:outline-none focus:border-primary/40 focus:bg-surface-bright text-on-surface text-sm font-medium transition-all shadow-inner"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="px-1 text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] flex items-center gap-1.5">
                    <AlignLeft className="w-3 h-3" /> Description
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Details about this strategic block..."
                    className="w-full px-5 py-4 bg-surface-container-low border border-outline-variant/10 rounded-2xl focus:outline-none focus:border-primary/40 focus:bg-surface-bright text-on-surface text-sm font-medium transition-all shadow-inner resize-none"
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4 pt-6 mt-10 border-t border-outline-variant/10">
                  {event && (
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={loading}
                      className="flex-1 flex items-center justify-center gap-2 py-4 bg-error/10 text-error font-bold rounded-2xl border border-error/20 hover:bg-error hover:text-on-error transition-all disabled:opacity-50"
                    >
                      <Trash2 className="w-5 h-5" />
                      Delete
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-[2] flex items-center justify-center gap-2 py-4 bg-primary text-on-primary font-bold rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-on-primary/20 border-t-on-primary rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        {event ? 'Update Session' : 'Save to Google'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
