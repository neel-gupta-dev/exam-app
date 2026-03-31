import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Get Started | Vayl',
};

export default function GetStartedLayout({ children }: { children: React.ReactNode }) {
  return children;
}
