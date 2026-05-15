import { Metadata } from "next";

export async function generateMetadata(
  props: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const params = await props.params;
  const formattedTitle = params.slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return {
    metadataBase: new URL("https://vayl.in"),
    alternates: {
      canonical: `/notes/doc/${params.slug}`,
    },
    title: `${formattedTitle} | Vayl Notes`,
    description: `Free downloadable PDF notes for ${formattedTitle}. Enhance your JEE/NEET preparation with Vayl study material.`,
  };
}

export default async function PdfViewerPage(
  props: { params: Promise<{ slug: string }> }
) {
  const params = await props.params;
  const { slug } = params;

  // The PDF file is expected to be in public/notes/pdfs/[slug].pdf
  // Append toolbar relative params for better built-in viewer experience
  const pdfUrl = `/notes/pdfs/${slug}.pdf`;
  const embedUrl = `${pdfUrl}#toolbar=1&navpanes=0&scrollbar=1&view=FitH`;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-surface">
      {/* Header bar */}
      <div className="flex items-center justify-between p-3 md:p-4 bg-surface-bright border-b border-surface-variant z-10 shadow-sm shrink-0">
        <h1 className="text-lg md:text-xl font-montserrat font-semibold text-primary capitalize truncate mr-4">
          {slug.replace(/-/g, " ")}
        </h1>
        <div className="flex gap-2 md:gap-3 shrink-0">
          <a
            href="https://vayl.in"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 md:px-4 md:py-2 text-on-surface/70 hover:text-primary font-interface text-sm md:text-base font-medium transition-colors"
          >
            Home
          </a>
          <a 
            href="https://vayl.in/signup" 
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-secondary/10 text-secondary border border-secondary/20 rounded-md font-interface text-sm md:text-base font-medium hover:bg-secondary/20 transition-colors shadow-sm"
          >
            Signup
          </a>
          <a 
            href={pdfUrl} 
            download={`${slug}.pdf`}
            className="flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-primary text-on-primary rounded-md font-interface text-sm md:text-base font-medium hover:bg-primary-dim transition-colors shadow-md"
          >
            <span className="material-symbols-outlined text-sm md:text-base">download</span>
            <span className="hidden xs:inline">Download</span>
          </a>
        </div>
      </div>

      {/* PDF Viewer - Full Size */}
      <div className="flex-1 w-full bg-surface-variant relative">
        <iframe 
          src={embedUrl} 
          className="absolute inset-0 w-full h-full border-none" 
          title={`Document: ${slug}`}
        />
      </div>
    </div>
  );
}
