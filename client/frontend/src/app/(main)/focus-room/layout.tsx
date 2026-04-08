import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Focus Room | Vayl',
};

export default function FocusRoomLayout({ children }: { children: React.ReactNode }) {
  return children;
}
