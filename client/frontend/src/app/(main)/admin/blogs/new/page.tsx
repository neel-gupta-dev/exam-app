'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, FileText, Send, Eye, Edit3 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function NewBlogPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [slugManual, setSlugManual] = useState(false);
  const [content, setContent] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('');
  const [readTime, setReadTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  // Auto-generate slug from title (unless manually edited)
  useEffect(() => {
    if (!slugManual && title) {
      const generated = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      setSlug(generated);
    }
  }, [title, slugManual]);

  // Pre-fill author from user name
  useEffect(() => {
    if (user?.name && !author) {
      setAuthor(user.name);
    }
  }, [user]);

  // Estimate read time from content
  useEffect(() => {
    if (content) {
      const words = content.split(/\s+/).filter(Boolean).length;
      const minutes = Math.max(1, Math.ceil(words / 200));
      setReadTime(`${minutes} min`);
    }
  }, [content]);

  // Admin guard
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
          <p className="text-on-surface-variant text-sm mb-4">You need writer or admin privileges to publish blog posts.</p>
          <Link href="/" className="text-primary font-medium text-sm hover:underline">← Go Home</Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content || !author) {
      setError('Title, content, and author are required.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const { data } = await api.post('/blogs', {
        title,
        slug: slug || undefined,
        content,
        coverImageUrl: coverImageUrl || '',
        author,
        category: category || 'General',
        readTime: readTime || '5 min',
      });

      router.push(`/blogs/${data.slug}`);
    } catch (err: any) {
      console.error('[Blog] Failed to create blog:', err);
      setError(err.response?.data?.message || 'Failed to publish. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface font-body pb-20">
      {/* Header */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <Link
          href="/blogs"
          className="inline-flex items-center gap-2 text-on-surface-variant hover:text-on-surface transition-colors text-xs font-black uppercase tracking-widest group mb-8"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Blog
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <FileText className="w-6 h-6 text-primary" />
          <h1 className="text-3xl font-heading font-bold text-on-surface tracking-tight">
            Publish New Article
          </h1>
        </div>
        <p className="text-on-surface-variant text-sm">Write in Markdown. Preview before publishing.</p>
      </div>

      <div className="max-w-4xl mx-auto px-6">
        <form onSubmit={handleSubmit} className="space-y-6">
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
              className="w-full bg-surface-container border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all"
              required
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
              Slug
              <span className="font-normal normal-case tracking-normal ml-2 text-on-surface-variant/50">
                (auto-generated from title)
              </span>
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setSlugManual(true);
              }}
              placeholder="the-definitive-guide-to"
              className="w-full bg-surface-container border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface font-mono text-sm placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all"
            />
          </div>

          {/* Author & Category & Read Time */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
                Author *
              </label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Your name"
                className="w-full bg-surface-container border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
                Category
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Strategy, Physics, etc."
                className="w-full bg-surface-container border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
                Read Time
                <span className="font-normal normal-case tracking-normal ml-1 text-on-surface-variant/50">(auto)</span>
              </label>
              <input
                type="text"
                value={readTime}
                onChange={(e) => setReadTime(e.target.value)}
                placeholder="5 min"
                className="w-full bg-surface-container border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all"
              />
            </div>
          </div>

          {/* Cover Image URL */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
              Cover Image URL
              <span className="font-normal normal-case tracking-normal ml-2 text-on-surface-variant/50">
                (external link only)
              </span>
            </label>
            <input
              type="url"
              value={coverImageUrl}
              onChange={(e) => setCoverImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full bg-surface-container border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface font-mono text-sm placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all"
            />
            {coverImageUrl && (
              <div className="mt-3 rounded-xl overflow-hidden border border-outline-variant/10 max-h-48">
                <img
                  src={coverImageUrl}
                  alt="Cover preview"
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          {/* Content with Preview Toggle */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                Content * <span className="font-normal normal-case tracking-normal text-on-surface-variant/50">(Markdown)</span>
              </label>
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary-dim transition-colors"
              >
                {showPreview ? <Edit3 className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                {showPreview ? 'Editor' : 'Preview'}
              </button>
            </div>

            {showPreview ? (
              <div className="bg-surface-container border border-outline-variant/20 rounded-xl p-6 min-h-[400px] prose prose-neutral dark:prose-invert max-w-none
                prose-headings:font-heading prose-headings:font-bold prose-headings:text-on-surface
                prose-p:text-on-surface-variant prose-p:leading-relaxed
                prose-a:text-primary prose-strong:text-on-surface
                prose-blockquote:border-primary/50 prose-blockquote:bg-primary/5 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-xl
                prose-code:bg-surface-variant/50 prose-code:text-primary prose-code:text-sm
                prose-li:text-on-surface-variant prose-li:marker:text-primary
              ">
                {content ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
                ) : (
                  <p className="text-on-surface-variant/40 italic">Nothing to preview yet...</p>
                )}
              </div>
            ) : (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="## Introduction&#10;&#10;Write your article content here in Markdown...&#10;&#10;- Use **bold** for emphasis&#10;- Add `code` inline&#10;- Create [links](https://example.com)"
                rows={20}
                className="w-full bg-surface-container border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface font-mono text-sm placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 resize-y transition-all leading-relaxed"
                required
              />
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="p-4 bg-error/10 border border-error/20 rounded-xl text-error text-sm font-medium">
              {error}
            </div>
          )}

          {/* Submit */}
          <div className="flex items-center justify-end gap-4 pt-4">
            <Link
              href="/blogs"
              className="px-6 py-3 text-on-surface-variant text-sm font-bold hover:text-on-surface transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting || !title || !content || !author}
              className="flex items-center gap-2 px-8 py-3 bg-primary text-on-primary rounded-xl font-bold text-sm uppercase tracking-widest hover:scale-105 transition-all disabled:opacity-40 disabled:hover:scale-100 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Publish
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
