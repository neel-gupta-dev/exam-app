import { Metadata } from "next";

export async function generateMetadata(
  props: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const params = await props.params;
  return {
    title: `${params.slug.replace(/-/g, " ")} | Vayl Notes`,
    description: `View ${params.slug} on Vayl Notes`,
  };
}

export default async function PdfViewerPage(
  props: { params: Promise<{ slug: string }> }
) {
  const params = await props.params;
  const { slug } = params;

  // The PDF file is expected to be in public/notes/pdfs/[slug].pdf
  // Since public is mapped to the root, the path for the iframe is /notes/pdfs/[slug].pdf
  const pdfUrl = `/notes/pdfs/${slug}.pdf`;

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      {/* Header bar */}
      <div className="flex items-center justify-between p-4 bg-surface-bright border-b border-surface-variant z-10 shadow-sm relative">
        <h1 className="text-xl md:text-2xl font-montserrat font-semibold text-primary capitalize">
          {slug.replace(/-/g, " ")}
        </h1>
        <div className="flex gap-4">
          <a
            href="/"
            className="px-4 py-2 bg-secondary/10 text-secondary border border-secondary/20 rounded-md font-interface font-medium hover:bg-secondary/20 transition-colors"
          >
            Home
          </a>
          <a 
            href={pdfUrl} 
            download={`${slug}.pdf`}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-md font-interface font-medium hover:bg-primary-dim transition-colors shadow-md"
          >
            <span className="material-symbols-outlined text-sm">download</span>
            <span className="hidden sm:inline">Download</span>
          </a>
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="flex-1 w-full bg-surface-variant flex items-center justify-center p-2 sm:p-4">
        <div className="w-full h-full max-w-6xl mx-auto rounded-lg overflow-hidden shadow-lg border border-outline-variant/30 bg-surface">
          <iframe 
            src={pdfUrl} 
            className="w-full h-full border-none" 
            title={`Document: ${slug}`}
          />
        </div>
      </div>
    </div>
  );
}
