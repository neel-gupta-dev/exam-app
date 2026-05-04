'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FileText, Edit3, Trash2, Plus, ArrowLeft } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface BlogSummary {
  _id: string;
  title: string;
  slug: string;
  isPublished: boolean;
  author: string;
  updatedAt: string;
}

export default function StudioDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [blogs, setBlogs] = useState<BlogSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBlogs = async () => {
      if (!user) return;
      try {
        const { data } = await api.get('/blogs/all');
        setBlogs(data);
      } catch (err: any) {
        setError('Failed to load posts.');
      } finally {
        setLoading(false);
      }
    };
    if (!authLoading) {
      fetchBlogs();
    }
  }, [user, authLoading]);

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await api.delete(`/blogs/${id}`);
      setBlogs((prev) => prev.filter((b) => b._id !== id));
    } catch (err: any) {
      alert('Failed to delete post.');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || (user.role !== 'admin' && user.role !== 'writer')) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-heading font-bold text-on-surface mb-2">Access Denied</h2>
          <p className="text-on-surface-variant text-sm mb-4">You need writer privileges to access the Studio.</p>
          <Link href="/" className="text-primary font-medium text-sm hover:underline">← Go Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface text-on-surface font-body pb-20">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <Link
          href="/blogs"
          className="inline-flex items-center gap-2 text-on-surface-variant hover:text-on-surface transition-colors text-xs font-black uppercase tracking-widest group mb-8"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Blogs
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-heading font-bold text-on-surface tracking-tight">
              Writer Studio
            </h1>
          </div>
          <Link
            href="/studio/edit/new"
            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-on-primary rounded-xl font-bold text-sm uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-primary/20"
          >
            <Plus className="w-4 h-4" />
            New Post
          </Link>
        </div>

        {error && (
          <div className="p-4 bg-error/10 border border-error/20 rounded-xl text-error text-sm font-medium mb-6">
            {error}
          </div>
        )}

        <div className="bg-surface-container border border-outline-variant/20 rounded-2xl overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-12 flex justify-center">
              <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          ) : blogs.length === 0 ? (
            <div className="p-12 text-center text-on-surface-variant">
              <p>No posts found. Start writing your first masterpiece!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-outline-variant/20 bg-surface-variant/20">
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant">Title</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant">Status</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant">Author</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant">Last Edited</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {blogs.map((blog) => (
                    <tr key={blog._id} className="hover:bg-surface-variant/10 transition-colors group">
                      <td className="px-6 py-4">
                        <p className="font-heading font-bold text-on-surface line-clamp-1">{blog.title}</p>
                        <p className="text-xs text-on-surface-variant/60 font-mono mt-1">/{blog.slug}</p>
                      </td>
                      <td className="px-6 py-4">
                        {blog.isPublished ? (
                          <span className="px-2.5 py-1 rounded-full bg-success/10 text-success text-[10px] font-black uppercase tracking-wider border border-success/20">
                            Published
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-secondary/10 text-secondary text-[10px] font-black uppercase tracking-wider border border-secondary/20">
                            Draft
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-on-surface-variant">{blog.author}</td>
                      <td className="px-6 py-4 text-sm text-on-surface-variant">
                        {new Date(blog.updatedAt).toLocaleDateString('en-IN', {
                          year: 'numeric', month: 'short', day: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link
                            href={`/studio/edit/${blog._id}`}
                            className="p-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(blog._id, blog.title)}
                            className="p-2 bg-error/10 text-error hover:bg-error/20 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
