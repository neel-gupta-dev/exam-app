"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  GraduationCap, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  LayoutDashboard,
  Sparkles,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  BookOpen,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface Course {
  id: string;
  name: string;
  section?: string;
  descriptionHeading?: string;
  alternateLink: string;
}

interface CourseWork {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  alternateLink: string;
  dueDate?: {
    year: number;
    month: number;
    day: number;
  };
  dueTime?: {
    hours: number;
    minutes: number;
  };
  courseName?: string;
}

export default function ClassroomPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [assignments, setAssignments] = useState<CourseWork[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [fetchingAnnouncements, setFetchingAnnouncements] = useState(false);

  // Check connection status on mount
  useEffect(() => {
    if (user?.googleClassroomLinked) {
      setIsConnected(true);
      fetchClassroomData();
    }
  }, [user]);

  const fetchClassroomData = async () => {
    setLoading(true);
    try {
      const [coursesRes, assignmentsRes] = await Promise.all([
        api.get("/classroom/courses"),
        api.get("/classroom/assignments/all")
      ]);
      setCourses(coursesRes.data.courses || []);
      setAssignments(assignmentsRes.data.assignments || []);
    } catch (error: any) {
      console.error("Failed to fetch classroom data", error);
      if (error.response?.status === 401) {
        setIsConnected(false);
      }
    } finally {
      setLoading(false);
    }
  };
  const fetchAnnouncements = async (courseId: string) => {
    setFetchingAnnouncements(true);
    setAnnouncements([]); // Clear current
    try {
      const res = await api.get(`/classroom/announcements/${courseId}`);
      
      // If we got an empty array but the user expects data, it might be a partial fail on backend
      const data = res.data.announcements || [];
      setAnnouncements(data);
      
      if (data.length === 0) {
        toast.info("No recent stream posts found for this class.");
      }
    } catch (error: any) {
      console.error("Failed to fetch announcements", error);
      const errorMessage = error.response?.data?.message || "Could not load class stream";
      toast.error(errorMessage);
    } finally {
      setFetchingAnnouncements(false);
    }
  };

  const handleSelectCourse = (course: Course) => {
    setSelectedCourse(course);
    fetchAnnouncements(course.id);
  };
  const handleConnect = () => {
    // Redirect to Google OAuth flow with classroom scope query param
    window.location.href = `${BACKEND_URL}/auth/google?classroom=true`;
  };

  const formatDueDate = (due?: CourseWork["dueDate"]) => {
    if (!due) return "No due date";
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${months[due.month - 1]} ${due.day}, ${due.year}`;
  };

  if (!isConnected) {
    return (
      <DashboardLayout>
        <div className="max-w-5xl mx-auto py-12 px-6">
          <div className="relative mb-16 overflow-hidden rounded-3xl bg-surface-container border border-outline-variant/10 p-12 text-center">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 blur-[120px] -mr-20 -mt-20 rounded-full" />
            <div className="relative z-10">
              <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-8 border border-primary/20">
                <GraduationCap className="w-10 h-10 text-primary" />
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-on-surface tracking-tight mb-4">
                Bridge the Gap with <span className="text-primary">Google Classroom</span>
              </h1>
              <p className="text-on-surface-variant text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
                Import your assignments, track your deadlines, and turn your school syllabus into a masterpiece. 
                Vayl + Classroom is the ultimate academic powerhouse.
              </p>
              
              <button 
                onClick={handleConnect}
                className="group relative flex items-center gap-3 px-8 py-4 bg-primary text-on-primary rounded-2xl font-bold text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 mx-auto transition-all"
              >
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shrink-0 p-1 shadow-sm">
                   <img src="https://www.gstatic.com/images/branding/product/2x/classroom_48dp.png" alt="Google Classroom" className="w-full h-full object-contain" />
                </div>
                Connect Google Classroom
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <p className="mt-6 text-[10px] text-on-surface-variant font-bold uppercase tracking-[.2em]">
                Secure OAuth2 Connection
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Calendar, title: "Auto-Sync Deadlines", desc: "Your Classroom due dates automatically appear in your Vayl study calendar.", color: "text-blue-400", bg: "bg-blue-400/10" },
              { icon: LayoutDashboard, title: "Unified Overview", desc: "See school assignments alongside personal study goals for a complete overview.", color: "text-purple-400", bg: "bg-purple-400/10" },
              { icon: Clock, title: "Smart Sessions", desc: "Vayl suggests focus timers based on your upcoming Classroom deliverables.", color: "text-orange-400", bg: "bg-orange-400/10" }
            ].map((b, i) => (
              <div key={i} className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-8">
                <div className={`w-12 h-12 rounded-xl ${b.bg} flex items-center justify-center mb-6`}>
                  <b.icon className={`w-6 h-6 ${b.color}`} />
                </div>
                <h3 className="text-xl font-bold text-on-surface mb-3">{b.title}</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto py-10 px-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 text-[10px] font-black uppercase tracking-widest border border-green-500/20">Connected</span>
              <h1 className="text-4xl font-black text-on-surface tracking-tighter">Classroom Hub</h1>
            </div>
            <p className="text-on-surface-variant">Manage your {courses.length} active courses and upcoming deadlines.</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={fetchClassroomData} 
              disabled={loading}
              className="px-5 py-2.5 bg-surface-container-highest hover:bg-surface-bright text-on-surface font-bold rounded-xl border border-outline-variant/10 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Sync Now
            </button>
            <button 
              onClick={handleConnect}
              className="px-5 py-2.5 bg-primary/10 text-primary font-bold rounded-xl border border-primary/20 hover:bg-primary/20 transition-all flex items-center gap-2"
            >
               Manage Connection
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Courses Sidebar */}
          <section className="lg:col-span-1 space-y-6">
            <h3 className="text-sm font-black text-on-surface-variant uppercase tracking-[.2em] px-2 flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Active Courses
            </h3>
            <div className="space-y-3">
              {courses.length === 0 && !loading ? (
                <div className="p-8 text-center bg-surface-container rounded-2xl border border-dashed border-outline-variant/20 text-on-surface-variant italic text-sm">
                  No active courses found.
                </div>
              ) : courses.map(course => (
                <button 
                  key={course.id} 
                  onClick={() => handleSelectCourse(course)}
                  className={`w-full text-left p-5 rounded-2xl border transition-all ${
                    selectedCourse?.id === course.id 
                      ? "bg-primary/10 border-primary shadow-lg shadow-primary/5" 
                      : "bg-surface-container border-outline-variant/10 hover:border-primary/40 hover:bg-surface-container-highest"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className={`font-bold transition-colors ${selectedCourse?.id === course.id ? "text-primary" : "text-on-surface"}`}>
                        {course.name}
                      </h4>
                      {course.section && <p className="text-xs text-on-surface-variant mt-1">{course.section}</p>}
                    </div>
                    <ChevronRight className={`w-4 h-4 transition-all ${selectedCourse?.id === course.id ? "text-primary translate-x-1" : "text-on-surface-variant opacity-0"}`} />
                  </div>
                </button>
              ))}
              {loading && courses.length === 0 && [1,2,3].map(i => (
                <div key={i} className="h-20 rounded-2xl bg-surface-container-highest/20 animate-pulse" />
              ))}
            </div>
          </section>

          {/* Main Area: Deadlines or Announcements */}
          <section className="lg:col-span-2 space-y-6">
            {!selectedCourse ? (
              <>
                <h3 className="text-sm font-black text-on-surface-variant uppercase tracking-[.2em] px-2 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Upcoming Deliverables
                  </span>
                  <span className="text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded-full">{assignments.length} Total</span>
                </h3>

                <div className="space-y-4">
                  {assignments.length === 0 && !loading ? (
                    <div className="flex flex-col items-center justify-center p-20 bg-surface-container rounded-3xl border border-dashed border-outline-variant/20 text-center">
                       <div className="w-16 h-16 rounded-full bg-surface-container-highest flex items-center justify-center mb-6">
                          <CheckCircle2 className="w-8 h-8 text-green-400 opacity-50" />
                       </div>
                       <h4 className="font-bold text-xl mb-2">You're all caught up!</h4>
                       <p className="text-on-surface-variant max-w-xs text-sm">No upcoming assignments found in your connected Google Classroom courses.</p>
                    </div>
                  ) : assignments.map(assignment => (
                    <div key={assignment.id} className="group bg-surface-container-low border border-outline-variant/10 rounded-2xl p-6 hover:bg-surface-container hover:border-outline-variant/40 transition-all flex items-center justify-between">
                       <div className="flex items-center gap-5">
                          <div className="w-12 h-12 rounded-xl bg-primary/10 flex flex-col items-center justify-center text-primary border border-primary/20 shrink-0">
                             <span className="text-[10px] font-black uppercase leading-none mb-1">{assignment.dueDate?.month ? ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"][assignment.dueDate.month - 1] : "N/A"}</span>
                             <span className="text-lg font-black leading-none">{assignment.dueDate?.day || "-"}</span>
                          </div>
                          <div>
                             <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{assignment.courseName || "Unknown Course"}</span>
                             <h4 className="font-bold text-on-surface group-hover:text-primary transition-all line-clamp-1">{assignment.title}</h4>
                             <div className="flex items-center gap-3 mt-1">
                                <span className="flex items-center gap-1 text-xs text-on-surface-variant">
                                   <Clock className="w-3 h-3" />
                                   {formatDueDate(assignment.dueDate)}
                                </span>
                                {assignment.dueTime && (
                                  <span className="text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded font-bold">
                                    Due {assignment.dueTime.hours === 0 ? "12" : assignment.dueTime.hours > 12 ? assignment.dueTime.hours - 12 : assignment.dueTime.hours}:{assignment.dueTime.minutes < 10 ? "0" + assignment.dueTime.minutes : assignment.dueTime.minutes} {assignment.dueTime.hours >= 12 ? "PM" : "AM"}
                                  </span>
                                )}
                             </div>
                          </div>
                       </div>
                       <div className="flex items-center gap-3">
                          <a 
                            href={assignment.alternateLink} 
                            target="_blank" 
                            rel="noreferrer"
                            className="p-3 bg-surface-container-highest hover:bg-surface-bright text-on-surface rounded-xl transition-all border border-outline-variant/20"
                          >
                             <ExternalLink className="w-5 h-5" />
                          </a>
                          <button className="hidden md:flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-xl font-bold text-xs hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20">
                             Create Focus Room
                             <ChevronRight className="w-4 h-4" />
                          </button>
                       </div>
                    </div>
                  ))}
                  {loading && assignments.length === 0 && [1,2,3,4].map(i => (
                    <div key={i} className="h-24 rounded-2xl bg-surface-container-highest/20 animate-pulse" />
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => setSelectedCourse(null)}
                      className="p-2 hover:bg-surface-container rounded-xl text-on-surface-variant transition-colors"
                    >
                      <ArrowRight className="w-5 h-5 rotate-180" />
                    </button>
                    <div>
                      <h2 className="text-2xl font-black text-on-surface tracking-tight">{selectedCourse.name}</h2>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-on-surface-variant">{selectedCourse.section || "No section"}</span>
                        <span className="text-xs text-outline">•</span>
                        <a href={selectedCourse.alternateLink} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                          Open in Classroom <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-sm font-black text-on-surface-variant uppercase tracking-[.2em] px-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    Class Stream
                  </h3>

                  {fetchingAnnouncements ? (
                    [1,2,3].map(i => (
                      <div key={i} className="bg-surface-container/40 p-8 rounded-3xl animate-pulse space-y-4">
                        <div className="h-4 bg-surface-container-highest rounded w-1/3" />
                        <div className="h-20 bg-surface-container-highest rounded w-full" />
                      </div>
                    ))
                  ) : announcements.length === 0 ? (
                    <div className="p-12 text-center bg-surface-container rounded-3xl border border-dashed border-outline-variant/20">
                      <p className="text-on-surface-variant italic">No announcements found in this stream.</p>
                    </div>
                  ) : announcements.map(post => (
                    <div key={post.id} className="relative group bg-surface-container-low border border-outline-variant/10 rounded-3xl p-8 hover:bg-surface-container transition-all">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                            post.vaylType === 'assignment' ? 'bg-orange-500/10 text-orange-400' :
                            post.vaylType === 'material' ? 'bg-blue-500/10 text-blue-400' :
                            'bg-primary/10 text-primary'
                          }`}>
                            {post.vaylType === 'assignment' ? <Clock className="w-4 h-4" /> :
                             post.vaylType === 'material' ? <BookOpen className="w-4 h-4" /> :
                             <Sparkles className="w-4 h-4" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-bold text-on-surface">
                                {post.vaylType === 'assignment' ? 'New Assignment' :
                                 post.vaylType === 'material' ? 'New Material' :
                                 'Class Announcement'}
                              </p>
                              {post.vaylType !== 'announcement' && (
                                <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter ${
                                  post.vaylType === 'assignment' ? 'bg-orange-500/20 text-orange-400' : 'bg-blue-500/20 text-blue-400'
                                }`}>
                                  {post.vaylType}
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-on-surface-variant font-medium">
                              {new Date(post.creationTime).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                            </p>
                          </div>
                        </div>
                        {post.alternateLink && (
                          <a href={post.alternateLink} target="_blank" rel="noreferrer" className="text-on-surface-variant hover:text-primary transition-colors">
                             <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                      
                      <p className="text-on-surface text-sm leading-relaxed whitespace-pre-wrap">{post.text}</p>
                      
                      {(post.materials && post.materials.length > 0) && (
                        <div className="mt-6 pt-6 border-t border-outline-variant/10 flex flex-wrap gap-2">
                          {post.materials.map((m: any, idx: number) => (
                            <div key={idx} className="px-3 py-1.5 bg-surface-container-highest rounded-lg text-[10px] font-bold text-on-surface-variant flex items-center gap-2">
                              {m.driveFile ? <BookOpen className="w-3 h-3" /> : <ExternalLink className="w-3 h-3" />}
                              {m.driveFile?.driveFile?.title || 
                               m.link?.title || 
                               m.youtubeVideo?.title || 
                               m.form?.title || 
                               "Attachment"}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}
