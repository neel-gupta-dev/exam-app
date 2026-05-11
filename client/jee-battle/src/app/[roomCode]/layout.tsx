import type { Metadata } from 'next';

type Props = {
  params: Promise<{ roomCode: string }>;
  children: React.ReactNode;
};

export async function generateMetadata({ params }: { params: Promise<{ roomCode: string }> }): Promise<Metadata> {
  const { roomCode } = await params;
  const uppercaseCode = roomCode.toUpperCase();
  
  const ogImageUrl = `https://battle.vayl.in/api/og?roomCode=${uppercaseCode}&players=1v1%20Match`;

  return {
    title: `Room ${uppercaseCode} | JEE Battle`,
    description: `Join room ${uppercaseCode} to compete in a live 1v1 JEE Battle.`,
    openGraph: {
      title: `Room ${uppercaseCode} | JEE Battle`,
      description: `Join room ${uppercaseCode} to compete in a live 1v1 JEE Battle.`,
      images: [{ url: ogImageUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `Room ${uppercaseCode} | JEE Battle`,
      description: `Join room ${uppercaseCode} to compete in a live 1v1 JEE Battle.`,
      images: [ogImageUrl],
    },
  };
}

import MathProvider from "@/components/MathProvider";

export default async function BattleRoomLayout({ children, params }: Props) {
  const { roomCode } = await params;
  const uppercaseCode = roomCode.toUpperCase();

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "Quiz",
    "name": `JEE Battle - Room ${uppercaseCode}`,
    "description": `A live 1v1 competitive quiz for JEE aspirants.`,
    "provider": {
      "@type": "Organization",
      "name": "Vayl",
      "sameAs": "https://battle.vayl.in"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
      <MathProvider>
        {children}
      </MathProvider>
    </>
  );
}
