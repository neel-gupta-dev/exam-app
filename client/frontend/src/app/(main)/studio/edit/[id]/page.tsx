'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, FileText, Send, Save, ArrowUpRight } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import TipTapEditor from '@/components/TipTapEditor';

export default function BlogEditor() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const isNew = id === 'new';

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [slugManual, setSlugManual] = useState(false);
  const [content, setContent] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('');
  const [readTime, setReadTime] = useState('');
  const [isPublished, setIsPublished] = useState(false);

  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch existing post if not new
  useEffect(() => {
    if (!isNew && !authLoading) {
      api.get(`/blogs/id/${id}`)
        .then(({ data }) => {
          setTitle(data.title);
          setSlug(data.slug);
          setSlugManual(true);
          setContent(data.content);
          setCoverImageUrl(data.coverImageUrl);
          setAuthor(data.author);
          setCategory(data.category);
          setReadTime(data.readTime);
          setIsPublished(data.isPublished);
          setIsLoading(false);
        })
        .catch(() => {
          setError('Failed to load post.');
          setIsLoading(false);
        });
    }
  }, [id, isNew, authLoading]);

  // Auto-generate slug from title (unless manually edited)
  useEffect(() => {
    if (!slugManual && title && isNew) {
      const generated = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      setSlug(generated);
    }
  }, [title, slugManual, isNew]);

  // Pre-fill author from user name for new posts
  useEffect(() => {
    if (user?.name && !author && isNew) {
      setAuthor(user.name);
    }
  }, [user, author, isNew]);

  // Estimate read time from HTML content
  useEffect(() => {
    if (content && isNew) {
      // Very basic text extraction for word count
      const text = content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      const words = text.split(/\s+/).filter(Boolean).length;
      const minutes = Math.max(1, Math.ceil(words / 200));
      setReadTime(`${minutes} min`);
    }
  }, [content, isNew]);

  // Guard
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || (user.role !== 'admin' && user.role !== 'writer')) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center text-center">
        <div>
          <h2 className="text-2xl font-bold mb-2 text-on-surface">Access Denied</h2>
          <Link href="/" className="text-primary hover:underline text-sm">Go Home</Link>
        </div>
      </div>
    );
  }

  const handleSave = async (publish: boolean) => {
    if (!title || !content || !author) {
      setError('Title, content, and author are required.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    const payload = {
      title,
      slug: slug || undefined,
      content,
      coverImageUrl: coverImageUrl || '',
      author,
      category: category || 'General',
      readTime: readTime || '5 min',
      isPublished: publish,
    };

    try {
      if (isNew) {
        const { data } = await api.post('/blogs', payload);
        if (publish) {
          router.push(`/blogs/${data.slug}`);
        } else {
          router.push(`/studio/edit/${data._id}`);
        }
      } else {
        const { data } = await api.put(`/blogs/${id}`, payload);
        setIsPublished(data.isPublished);
        setSuccess(publish ? 'Post published successfully!' : 'Draft saved successfully!');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface font-body pb-20">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/studio"
            className="inline-flex items-center gap-2 text-on-surface-variant hover:text-on-surface transition-colors text-xs font-black uppercase tracking-widest group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
          </Link>
          
          {!isNew && isPublished && (
            <Link 
              href={`/blogs/${slug}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 text-primary text-xs font-bold uppercase tracking-widest hover:text-primary-dim"
            >
              View Live <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        <div className="flex items-center gap-3 mb-2">
          <FileText className="w-6 h-6 text-primary" />
          <h1 className="text-3xl font-heading font-bold text-on-surface tracking-tight">
            {isNew ? 'New Draft' : 'Edit Post'}
          </h1>
        </div>
        <p className="text-on-surface-variant text-sm mb-8">
          {isPublished ? 'This post is currently live on the site.' : 'This post is a draft and is hidden from the public.'}
        </p>

        <div className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="The Definitive Guide to..."
              className="w-full bg-surface-container border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all text-xl font-heading font-bold"
              required
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
              Slug
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setSlugManual(true);
              }}
              placeholder="the-definitive-guide"
              className="w-full bg-surface-container border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface font-mono text-sm placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all"
            />
          </div>

          {/* Author & Category & Read Time */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Author *</label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full bg-surface-container border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Category</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-surface-container border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Read Time</label>
              <input
                type="text"
                value={readTime}
                onChange={(e) => setReadTime(e.target.value)}
                className="w-full bg-surface-container border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all"
              />
            </div>
          </div>

          {/* Cover Image URL */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
              Cover Image URL
            </label>
            <input
              type="url"
              value={coverImageUrl}
              onChange={(e) => setCoverImageUrl(e.target.value)}
              placeholder="https://..."
              className="w-full bg-surface-container border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all"
            />
            {coverImageUrl && (
              <div className="mt-3 rounded-xl overflow-hidden border border-outline-variant/10 max-h-48">
                <img src={coverImageUrl} alt="Cover preview" className="w-full h-48 object-cover" onError={(e) => {(e.target as HTMLImageElement).style.display = 'none';}} />
              </div>
            )}
          </div>

          {/* Editor */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
              Content *
            </label>
            <TipTapEditor content={content} onChange={setContent} />
          </div>

          {/* Status Messages */}
          {error && <div className="p-4 bg-error/10 border border-error/20 rounded-xl text-error text-sm font-medium">{error}</div>}
          {success && <div className="p-4 bg-success/10 border border-success/20 rounded-xl text-success text-sm font-medium">{success}</div>}

          {/* Actions */}
          <div className="flex items-center justify-end gap-4 pt-8">
            <button
              type="button"
              onClick={() => handleSave(false)}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-3 bg-surface-variant/30 text-on-surface hover:bg-surface-variant/50 border border-outline-variant/20 rounded-xl font-bold text-sm uppercase tracking-widest transition-all disabled:opacity-40"
            >
              <Save className="w-4 h-4" />
              Save Draft
            </button>
            <button
              type="button"
              onClick={() => handleSave(true)}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-8 py-3 bg-primary text-on-primary rounded-xl font-bold text-sm uppercase tracking-widest hover:scale-105 transition-all disabled:opacity-40 shadow-lg shadow-primary/20"
            >
              <Send className="w-4 h-4" />
              Publish Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
