'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, BookOpen, Clock, User } from 'lucide-react';
import api from '@/lib/api';

interface BlogPreview {
  _id: string;
  title: string;
  slug: string;
  coverImageUrl: string;
  author: string;
  category: string;
  readTime: string;
  createdAt: string;
  snippet: string;
}

function BlogCardSkeleton() {
  return (
    <div className="glass-card rounded-3xl border border-outline-variant/20 overflow-hidden animate-pulse">
      <div className="h-48 bg-surface-variant/30" />
      <div className="p-8 space-y-4">
        <div className="h-3 w-20 bg-surface-variant/40 rounded-full" />
        <div className="h-6 w-3/4 bg-surface-variant/40 rounded-lg" />
        <div className="h-4 w-full bg-surface-variant/20 rounded-lg" />
        <div className="h-4 w-2/3 bg-surface-variant/20 rounded-lg" />
        <div className="flex justify-between pt-4">
          <div className="h-3 w-16 bg-surface-variant/30 rounded-full" />
          <div className="h-3 w-24 bg-surface-variant/30 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export default function BlogHub() {
  const [blogs, setBlogs] = useState<BlogPreview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const { data } = await api.get('/blogs');
        setBlogs(data);
      } catch (err: any) {
        console.error('[Blog] Failed to fetch blogs:', err);
        setError('Failed to load articles. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface font-body selection:bg-primary/20 pb-20">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="orb w-[800px] h-[800px] bg-primary/5 top-[-10%] right-[-10%] blur-[120px]" />
        <div className="orb w-[600px] h-[600px] bg-tertiary/5 bottom-[-10%] left-[-10%] blur-[100px]" />
        <div className="mesh-grid absolute inset-0 opacity-15" />
      </div>

      {/* Nav */}
      <nav className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group relative">
          <div className="w-10 h-10 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Image src="/vayl-logo.png" alt="Vayl Logo" width={32} height={32} className="object-contain" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-heading font-black tracking-widest text-on-surface uppercase italic">Vayl</span>
          </div>
        </Link>
        <div className="flex items-center gap-8">
          <Link href="/login" className="text-xs font-interface font-black uppercase tracking-widest text-on-surface-variant hover:text-on-surface transition-colors">Login</Link>
          <Link href="/signup" className="bg-primary text-on-primary px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest hover:scale-105 transition-transform">Deploy Vault</Link>
        </div>
      </nav>

      {/* Header */}
      <header className="pt-20 pb-16 px-6 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-8">
          <BookOpen className="w-3.5 h-3.5 text-primary" />
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">Blog</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-heading font-black tracking-tightest leading-[0.9] text-on-surface mb-8">
          Insights & <span className="text-primary italic">Strategies.</span>
        </h1>
        <p className="text-on-surface-variant max-w-2xl mx-auto text-lg leading-relaxed opacity-80 font-medium italic">
          High-authority studies, strategies, and cognitive frameworks for the elite aspirant.
        </p>
      </header>

      {/* Blog Grid */}
      <main className="max-w-6xl mx-auto px-6">
        {error && (
          <div className="text-center py-16">
            <p className="text-error font-medium">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2 bg-primary/10 text-primary rounded-xl text-sm font-bold hover:bg-primary/20 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {isLoading && (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2">
            {[...Array(4)].map((_, i) => <BlogCardSkeleton key={i} />)}
          </div>
        )}

        {!isLoading && !error && blogs.length === 0 && (
          <div className="text-center py-24">
            <BookOpen className="w-12 h-12 text-on-surface-variant/30 mx-auto mb-4" />
            <p className="text-on-surface-variant text-lg font-medium">No articles published yet.</p>
            <p className="text-on-surface-variant/60 text-sm mt-1">Check back soon for new content.</p>
          </div>
        )}

        {!isLoading && !error && blogs.length > 0 && (
          <div className="grid gap-8 md:grid-cols-2">
            {blogs.map((blog) => (
              <Link
                key={blog._id}
                href={`/blogs/${blog.slug}`}
                className="group relative"
              >
                <div className="h-full glass-card rounded-3xl border border-outline-variant/20 overflow-hidden hover:translate-y-[-6px] transition-all duration-500 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5">
                  {/* Cover Image */}
                  {blog.coverImageUrl && (
                    <div className="relative h-48 overflow-hidden bg-surface-variant/20">
                      <img
                        src={blog.coverImageUrl}
                        alt={blog.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-surface/80 to-transparent" />
                    </div>
                  )}

                  <div className="p-8 flex flex-col justify-between flex-1">
                    <div>
                      {/* Category & Read Time */}
                      <div className="flex items-center gap-3 mb-4">
                        <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black uppercase tracking-widest text-primary">
                          {blog.category}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-on-surface-variant/50">
                          <Clock className="w-3 h-3" />
                          {blog.readTime}
                        </span>
                      </div>

                      {/* Title */}
                      <h2 className="text-2xl font-heading font-bold text-on-surface mb-3 group-hover:text-primary transition-colors leading-tight">
                        {blog.title}
                      </h2>

                      {/* Snippet */}
                      <p className="text-on-surface-variant leading-relaxed text-sm line-clamp-3">
                        {blog.snippet}...
                      </p>
                    </div>

                    {/* Footer */}
                    <div className="mt-6 flex items-center justify-between pt-4 border-t border-outline-variant/10">
                      <div className="flex items-center gap-2 text-xs text-on-surface-variant/60">
                        <User className="w-3.5 h-3.5" />
                        <span className="font-medium">{blog.author}</span>
                        <span className="mx-1">·</span>
                        <span>{formatDate(blog.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-primary font-bold text-xs uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                        Read <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* CTA Section */}
      <section className="mt-32 max-w-4xl mx-auto px-6 text-center">
        <div className="glass-card p-12 rounded-[3.5rem] border border-outline-variant/10 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          <h2 className="text-2xl font-heading font-bold text-on-surface mb-4 tracking-tight">Access the Full Architecture.</h2>
          <p className="text-on-surface-variant leading-relaxed opacity-70 mb-10 max-w-lg mx-auto text-sm">
            Thousands more resources, focus analytics, and personalized flashcards exist inside the Digital Vault.
          </p>
          <Link
            href="/signup"
            className="inline-flex py-4 px-10 bg-primary text-on-primary rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl"
          >
            Request Full Access
          </Link>
        </div>
      </section>
    </div>
  );
}
