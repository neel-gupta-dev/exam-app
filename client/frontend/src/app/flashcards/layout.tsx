import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Flashcards | Vayl',
};

export default function FlashcardsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
