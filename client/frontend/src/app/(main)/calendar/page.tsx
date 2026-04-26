'use client';

import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  MoreHorizontal,
  CloudSync,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import CalendarEventModal from '@/components/CalendarEventModal';
import { API_BASE_URL } from '@/config/env';

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarPage() {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  // Fetch events for the current week
  const fetchEvents = async () => {
    if (!user?.googleCalendarLinked) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 7);

      const { data } = await api.get(`/calendar/events?timeMin=${startOfWeek.toISOString()}&timeMax=${endOfWeek.toISOString()}`);
      if (data.success) {
        setEvents(data.events);
      }
    } catch (error) {
      console.error('Failed to fetch events:', error);
      toast.error('Could not sync with Google Calendar');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [currentDate, user]);

  const handlePrevWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const navigateToGoogleAuth = () => {
    window.location.href = `${API_BASE_URL || 'http://localhost:5000'}/auth/google?calendar=true`;
  };

  const getWeekDays = () => {
    const days = [];
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

    for (let i = 0; i < 7; i++) {
        const day = new Date(startOfWeek);
        day.setDate(startOfWeek.getDate() + i);
        days.push(day);
    }
    return days;
  };

  const weekDays = getWeekDays();

  return (
    <div className="flex-1 bg-surface p-8 overflow-y-auto no-scrollbar">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-headline font-extrabold text-on-surface tracking-tight mb-2">
            Strategic Calendar
          </h1>
          <div className="flex items-center gap-2 text-on-surface-variant font-medium">
            <CalendarIcon className="w-4 h-4" />
            <span>{currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-surface-container-low p-1.5 rounded-2xl border border-outline-variant/10 shadow-lg shadow-black/20">
          <button onClick={handlePrevWeek} className="p-2.5 hover:bg-surface-bright rounded-xl transition-all text-on-surface-variant hover:text-on-surface">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={handleToday} className="px-5 py-2 hover:bg-surface-bright rounded-xl transition-all text-sm font-bold text-on-surface-variant hover:text-on-surface tracking-wide">
            Today
          </button>
          <button onClick={handleNextWeek} className="p-2.5 hover:bg-surface-bright rounded-xl transition-all text-on-surface-variant hover:text-on-surface">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          {user?.googleCalendarLinked ? (
             <button 
              onClick={() => {
                setSelectedEvent(null);
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2 px-6 py-3.5 bg-primary text-on-primary font-headline font-bold rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Plus className="w-5 h-5" />
              Event
            </button>
          ) : (
            <button 
              onClick={navigateToGoogleAuth}
              className="flex items-center gap-2 px-6 py-3.5 bg-primary-container text-primary-fixed font-headline font-bold rounded-2xl shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <CloudSync className="w-5 h-5" />
              Connect Google Calendar
            </button>
          )}
        </div>
      </div>

      {!user?.googleCalendarLinked ? (
        <div className="glass-card flex flex-col items-center justify-center p-20 rounded-3xl text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mb-8 border border-primary/20 shadow-2xl shadow-primary/10">
                <CloudSync className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl font-headline font-bold text-on-surface mb-4">No Calendar Connected</h2>
            <p className="text-on-surface-variant max-w-sm mb-10 leading-relaxed text-sm">
                Connect your Google Calendar to manage your study blocks, exams, and personal schedule directly from Vayl.
            </p>
            <button 
                onClick={navigateToGoogleAuth}
                className="px-10 py-4 bg-primary text-on-primary font-bold rounded-2xl shadow-xl shadow-primary/20 hover:-translate-y-1 transition-all"
            >
                Start Synchronization
            </button>
        </div>
      ) : (
        <div className="relative">
          {/* Calendar Grid Container */}
          <div className="glass-card rounded-3xl overflow-hidden border border-outline-variant/10 shadow-2xl">
            {/* Header / Week Days */}
            <div className="grid grid-cols-[80px_repeat(7,1fr)] bg-surface-container-high/50 border-b border-outline-variant/10 backdrop-blur-md">
                <div className="py-4"></div>
                {weekDays.map((day, i) => {
                    const isToday = day.toDateString() === new Date().toDateString();
                    return (
                        <div key={i} className="py-4 text-center border-l border-outline-variant/10">
                            <div className={`text-[10px] font-bold uppercase tracking-[0.2em] mb-1 ${isToday ? 'text-primary' : 'text-on-surface-variant'}`}>
                                {DAYS[day.getDay()]}
                            </div>
                             <div className={`text-xl font-headline font-extrabold ${isToday ? 'text-primary' : 'text-on-surface'}`}>
                                 {day.getDate()}
                             </div>
                        </div>
                    );
                })}
            </div>

            {/* Time Grid Sub-container */}
            <div className="grid grid-cols-[80px_repeat(7,1fr)] relative min-h-[1200px]">
                {/* Time Indicators */}
                <div className="bg-surface-container-low/20">
                     {HOURS.map(hour => (
                        <div key={hour} className="h-[60px] flex items-start justify-center pt-2">
                             <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider tabular-nums">
                                {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour-12} PM`}
                             </span>
                        </div>
                    ))}
                </div>

                {/* Day Columns */}
                {weekDays.map((day, dayIndex) => (
                    <div key={dayIndex} className="relative border-l border-outline-variant/5">
                        {/* Grid Lines */}
                        {HOURS.map(hour => (
                            <div key={hour} className="h-[60px] border-b border-outline-variant/5"></div>
                        ))}

                        {/* Events in this day */}
                        {events.filter(e => {
                            const start = new Date(e.start.dateTime || e.start.date);
                            return start.toDateString() === day.toDateString();
                        }).map((event, eventIdx) => {
                            const start = new Date(event.start.dateTime || event.start.date);
                            const end = new Date(event.end.dateTime || event.end.date);
                            const top = (start.getHours() * 60 + start.getMinutes());
                            const duration = Math.max(30, (end.getTime() - start.getTime()) / (1000 * 60));
                            
                            return (
                                <motion.div
                                    key={event.id || eventIdx}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    onClick={() => {
                                      setSelectedEvent(event);
                                      setIsModalOpen(true);
                                    }}
                                    className="absolute left-1 right-1 bg-primary/20 border border-primary/40 rounded-lg p-2 overflow-hidden cursor-pointer hover:bg-primary/30 transition-colors z-10"
                                    style={{ 
                                        top: `${top}px`, 
                                        height: `${duration}px`,
                                        opacity: loading ? 0.5 : 1
                                    }}
                                >
                                     <div className="text-[10px] font-bold text-primary-fixed-dim truncate mb-0.5 leading-tight">
                                        {event.summary || 'Study Session'}
                                    </div>
                                    {duration > 40 && (
                                        <div className="flex items-center gap-1 text-[9px] text-primary-fixed truncate opacity-80">
                                            <Clock className="w-2.5 h-2.5 shrink-0" />
                                            {start.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                ))}
            </div>
          </div>
          
          {loading && (
            <div className="absolute inset-0 bg-surface-container-lowest/20 backdrop-blur-[1px] flex items-center justify-center z-20">
              <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            </div>
          )}
        </div>
      )}

      {/* Event Modal */}
      <CalendarEventModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        event={selectedEvent}
        onSuccess={fetchEvents}
      />
    </div>
  );
}
