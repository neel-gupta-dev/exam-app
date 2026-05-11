import { Metadata } from 'next';

type Props = {
  params: Promise<{ subject: string }>;
  children: React.ReactNode;
};

export async function generateMetadata({ params }: { params: Promise<{ subject: string }> }): Promise<Metadata> {
  const { subject } = await params;
  const decodedSubject = decodeURIComponent(subject);
  const subjectTitle = decodedSubject.charAt(0).toUpperCase() + decodedSubject.slice(1);

  // Dynamic OpenGraph Image
  const ogImageUrl = `https://vayl.in/api/og?title=${encodeURIComponent(`${subjectTitle} Resources`)}&type=Course`;

  return {
    title: `${subjectTitle} Resources for JEE/NEET | Vayl`,
    description: `Master ${subjectTitle} with Vayl's Mistake Vault and Deep Focus Room. Curated resources and materials saved for ${subjectTitle}.`,
    openGraph: {
      title: `${subjectTitle} Resources for JEE/NEET | Vayl`,
      description: `Curated resources and materials saved for ${subjectTitle}.`,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title: `${subjectTitle} Resources for JEE/NEET | Vayl`,
      description: `Curated resources and materials saved for ${subjectTitle}.`,
      images: [ogImageUrl]
    }
  };
}

export default async function SubjectLayout({ children, params }: Props) {
  const { subject } = await params;
  const decodedSubject = decodeURIComponent(subject);
  const subjectTitle = decodedSubject.charAt(0).toUpperCase() + decodedSubject.slice(1);

  // Generate Course / EducationalResource Schema
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": `${subjectTitle} Foundation`,
    "description": `Comprehensive study materials and resources for ${subjectTitle}.`,
    "provider": {
      "@type": "Organization",
      "name": "Vayl",
      "sameAs": "https://vayl.in"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
      {children}
    </>
  );
}
