import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Vault | Vayl',
};

export default function VaultLayout({ children }: { children: React.ReactNode }) {
  return children;
}
