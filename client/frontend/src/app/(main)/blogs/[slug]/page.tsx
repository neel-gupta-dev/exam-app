import { Suspense } from 'react';
import ArticleClient from './ArticleClient';

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
