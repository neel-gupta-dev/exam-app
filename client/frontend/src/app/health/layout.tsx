import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Health Profiler | Vayl',
};

export default function HealthProfilerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
