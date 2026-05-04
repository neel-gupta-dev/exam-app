'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Share2, Clock, User, Send, MessageCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface Comment {
  _id: string;
  authorName: string;
  text: string;
  createdAt: string;
}

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  content: string;
  coverImageUrl: string;
  author: string;
  category: string;
  readTime: string;
  createdAt: string;
  comments: Comment[];
}

export default function ArticleClient({ slug }: { slug: string }) {
  const { user, token } = useAuth();
  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [scrollProgress, setScrollProgress] = useState(0);

  // Comment state
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [commentError, setCommentError] = useState('');

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const { data } = await api.get(`/blogs/${slug}`);
        setBlog(data);
      } catch (err: any) {
        console.error('[Blog] Failed to fetch blog:', err);
        if (err.response?.status === 404) {
          setError('Article not found.');
        } else {
          setError('Failed to load article. Please try again.');
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchBlog();
  }, [slug]);

  useEffect(() => {
    const handleScroll = () => {
      const height = document.documentElement.scrollHeight - window.innerHeight;
      const progress = height > 0 ? (window.scrollY / height) * 100 : 0;
      setScrollProgress(progress);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setIsSubmitting(true);
    setCommentError('');

    try {
      const { data } = await api.post(`/blogs/${slug}/comments`, {
        text: commentText.trim(),
      });

      // Prepend new comment to list
      setBlog((prev) => {
        if (!prev) return prev;
        return { ...prev, comments: [data, ...prev.comments] };
      });
      setCommentText('');
    } catch (err: any) {
      console.error('[Blog] Failed to submit comment:', err);
      setCommentError(err.response?.data?.message || 'Failed to post comment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const timeAgo = (dateStr: string) => {
    const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return formatDate(dateStr);
  };

  // --- Loading State ---
  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          <span className="text-on-surface-variant text-sm font-medium">Loading article...</span>
        </div>
      </div>
    );
  }

  // --- Error State ---
  if (error || !blog) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-heading font-bold text-on-surface mb-2">
            {error || 'Article not found'}
          </h2>
          <Link
            href="/blogs"
            className="text-primary font-medium text-sm hover:underline"
          >
            ← Back to all articles
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface text-on-surface font-body selection:bg-primary/20 pb-20">
      {/* Scroll Progress Bar */}
      <div className="fixed top-0 left-0 h-1 bg-primary/10 z-[60] w-full">
        <div
          className="h-full bg-primary transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="orb w-[600px] h-[600px] bg-primary/5 top-[-10%] left-[-10%] blur-[120px]" />
        <div className="orb w-[500px] h-[500px] bg-tertiary/5 bottom-[-10%] right-[-10%] blur-[100px]" />
        <div className="mesh-grid absolute inset-0 opacity-10" />
      </div>

      {/* Sticky Nav */}
      <nav className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between sticky top-0 bg-surface/80 backdrop-blur-md z-50 border-b border-outline-variant/10">
        <Link
          href="/blogs"
          className="flex items-center gap-2 text-on-surface-variant hover:text-on-surface transition-colors text-xs font-black uppercase tracking-widest group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back
        </Link>
        <button
          onClick={() => navigator.clipboard.writeText(window.location.href)}
          className="p-2.5 bg-surface-variant/30 border border-outline-variant/20 rounded-xl hover:bg-surface-variant/50 transition-all text-on-surface-variant hover:text-on-surface"
          title="Copy link"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </nav>

      <article className="max-w-3xl mx-auto px-6 pt-12">
        {/* Header */}
        <header className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black uppercase tracking-widest text-primary">
              {blog.category}
            </span>
            <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-on-surface-variant/50">
              <Clock className="w-3 h-3" />
              {blog.readTime}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-heading font-black tracking-tight text-on-surface leading-[1.1] mb-6">
            {blog.title}
          </h1>
          <div className="flex items-center gap-3 text-sm text-on-surface-variant/60">
            <User className="w-4 h-4" />
            <span className="font-medium">{blog.author}</span>
            <span>·</span>
            <span>{formatDate(blog.createdAt)}</span>
          </div>
          <div className="h-px w-full bg-outline-variant/20 mt-8" />
        </header>

        {/* Cover Image */}
        {blog.coverImageUrl && (
          <div className="mb-12 rounded-2xl overflow-hidden border border-outline-variant/10">
            <img
              src={blog.coverImageUrl}
              alt={blog.title}
              className="w-full h-auto max-h-[500px] object-cover"
            />
          </div>
        )}

        {/* Markdown Content */}
        <div className="prose prose-neutral dark:prose-invert max-w-none
          prose-headings:font-heading prose-headings:font-bold prose-headings:text-on-surface prose-headings:tracking-tight
          prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4
          prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
          prose-p:text-on-surface-variant prose-p:leading-relaxed prose-p:text-[16px]
          prose-a:text-primary prose-a:no-underline hover:prose-a:underline
          prose-strong:text-on-surface prose-strong:font-bold
          prose-blockquote:border-primary/50 prose-blockquote:bg-primary/5 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-xl prose-blockquote:not-italic prose-blockquote:text-on-surface-variant
          prose-code:bg-surface-variant/50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-primary prose-code:text-sm prose-code:font-mono
          prose-pre:bg-surface-container-high prose-pre:border prose-pre:border-outline-variant/20 prose-pre:rounded-xl
          prose-li:text-on-surface-variant prose-li:marker:text-primary
          prose-img:rounded-xl prose-img:border prose-img:border-outline-variant/10
          prose-hr:border-outline-variant/20
          prose-table:border-collapse prose-th:bg-surface-variant/30 prose-th:border prose-th:border-outline-variant/20 prose-th:px-4 prose-th:py-2 prose-td:border prose-td:border-outline-variant/20 prose-td:px-4 prose-td:py-2
        ">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {blog.content}
          </ReactMarkdown>
        </div>

        {/* --- Comment Section --- */}
        <section className="mt-20 pt-12 border-t border-outline-variant/20">
          <div className="flex items-center gap-2 mb-8">
            <MessageCircle className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-heading font-bold text-on-surface">
              Comments
              {blog.comments.length > 0 && (
                <span className="ml-2 text-sm font-normal text-on-surface-variant/50">
                  ({blog.comments.length})
                </span>
              )}
            </h3>
          </div>

          {/* Comment Form */}
          {user && token ? (
            <form onSubmit={handleSubmitComment} className="mb-10">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0 mt-0.5">
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="flex-1">
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Share your thoughts..."
                    rows={3}
                    maxLength={2000}
                    className="w-full bg-surface-container border border-outline-variant/20 rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 resize-none transition-all"
                  />
                  {commentError && (
                    <p className="text-error text-xs mt-1">{commentError}</p>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] text-on-surface-variant/40">
                      {commentText.length}/2000
                    </span>
                    <button
                      type="submit"
                      disabled={isSubmitting || !commentText.trim()}
                      className="flex items-center gap-2 px-5 py-2 bg-primary text-on-primary rounded-xl text-xs font-bold uppercase tracking-widest hover:scale-105 transition-all disabled:opacity-40 disabled:hover:scale-100 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <div className="w-3.5 h-3.5 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                      Post
                    </button>
                  </div>
                </div>
              </div>
            </form>
          ) : (
            <div className="mb-10 p-6 bg-surface-container border border-outline-variant/20 rounded-xl text-center">
              <p className="text-on-surface-variant text-sm mb-3">
                Log in to join the discussion.
              </p>
              <Link
                href="/login"
                className="inline-flex px-5 py-2 bg-primary text-on-primary rounded-xl text-xs font-bold uppercase tracking-widest hover:scale-105 transition-all"
              >
                Login
              </Link>
            </div>
          )}

          {/* Comment List */}
          {blog.comments.length === 0 ? (
            <p className="text-on-surface-variant/50 text-sm text-center py-8">
              No comments yet. Be the first to share your thoughts.
            </p>
          ) : (
            <div className="space-y-6">
              {blog.comments.map((comment) => (
                <div
                  key={comment._id}
                  className="flex items-start gap-3 group"
                >
                  <div className="w-8 h-8 rounded-full bg-surface-variant/50 flex items-center justify-center text-on-surface-variant font-bold text-xs shrink-0 mt-0.5">
                    {comment.authorName?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-on-surface">
                        {comment.authorName}
                      </span>
                      <span className="text-[10px] text-on-surface-variant/40">
                        {timeAgo(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-on-surface-variant leading-relaxed">
                      {comment.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </article>

      {/* Footer */}
      <footer className="mt-32 border-t border-outline-variant/10 pt-16 px-6">
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-8">
          <div className="flex items-center gap-3">
            <Image src="/vayl-logo.png" alt="Vayl Logo" width={24} height={24} className="object-contain" />
            <span className="text-xl font-heading font-black tracking-widest text-on-surface uppercase italic">Vayl</span>
          </div>
          <p className="text-xs text-on-surface-variant font-medium opacity-40 max-w-sm text-center italic">
            Part of the Academic Excellence Protocol. Built for the elite aspirant seeking structural mastery.
          </p>
          <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-60">
            <Link href="/" className="hover:text-primary transition-colors">Platform</Link>
            <Link href="/about" className="hover:text-primary transition-colors">Mission</Link>
            <Link href="/contact" className="hover:text-primary transition-colors">Support</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
