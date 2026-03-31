import { Metadata } from 'next';
import { ARTICLES } from '@/lib/articles';

type Props = {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = ARTICLES[slug as keyof typeof ARTICLES];

  if (!article) {
    return {
      title: 'Article Not Found',
    };
  }

  return {
    title: `${article.title} | Vayl`,
    description: article.content.replace(/<[^>]*>/g, '').substring(0, 160),
  };
}

export default function ArticleLayout({ children }: Props) {
  return children;
}
