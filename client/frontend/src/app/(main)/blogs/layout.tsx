import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Insights | Vayl',
};

export default function BlogsLayout({ children }: { children: React.ReactNode }) {
  return children;
}

