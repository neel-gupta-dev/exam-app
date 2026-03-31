import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Calendar | Vayl',
};

export default function CalendarLayout({ children }: { children: React.ReactNode }) {
  return children;
}
