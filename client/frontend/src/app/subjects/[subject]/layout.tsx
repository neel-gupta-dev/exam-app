import { Metadata } from 'next';

type Props = {
  params: Promise<{ subject: string }>;
  children: React.ReactNode;
};

export async function generateMetadata({ params }: { params: Promise<{ subject: string }> }): Promise<Metadata> {
  const { subject } = await params;
  const decodedSubject = decodeURIComponent(subject);
  const subjectTitle = decodedSubject.charAt(0).toUpperCase() + decodedSubject.slice(1);

  return {
    title: `${subjectTitle} | Vayl`,
  };
}

export default function SubjectLayout({ children }: Props) {
  return children;
}
