import { Suspense } from 'react';
import ArticleClient from './ArticleClient';
import { ARTICLES } from '@/lib/articles';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = ARTICLES[slug as keyof typeof ARTICLES];
  if (!article) return { title: 'Article Not Found | Vayl' };
  return {
    title: `${article.title} | Vayl`,
    description: article.takeaways?.[0] ?? 'Read this article on Vayl.',
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-surface flex items-center justify-center text-primary font-bold">
          Loading Article...
        </div>
      }
    >
      <ArticleClient slug={slug} />
    </Suspense>
  );
}
