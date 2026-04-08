import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About | Vayl',
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}

