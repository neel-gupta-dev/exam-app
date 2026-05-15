import fs from "fs";
import path from "path";

export interface PdfDocument {
  id: string;
  slug: string;
  title: string;
  dateAdded: string;
  timestamp: number;
  cloudinaryUrl?: string; // Added to support cloud hosted files
}

/**
 * Fetch hybrid PDF documents from both the local filesystem AND the dynamic Cloudinary MongoDB backend.
 * Merges and sorts them by most recent first.
 * Recovers gracefully if the backend is offline during static generation.
 */
export async function getPdfs(): Promise<PdfDocument[]> {
  const allPdfs: PdfDocument[] = [];

  // ─── 1. LOAD LOCAL FILESYSTEM PDFS ───────────────────────────────────
  const pdfsDirectory = path.join(process.cwd(), "public", "notes", "pdfs");
  
  if (fs.existsSync(pdfsDirectory)) {
    try {
      const files = await fs.promises.readdir(pdfsDirectory);
      const localPdfFiles = await Promise.all(
        files
          .filter((file) => file.endsWith(".pdf"))
          .map(async (file) => {
            const filePath = path.join(pdfsDirectory, file);
            const stats = await fs.promises.stat(filePath);
            const slug = file.replace(/\.pdf$/, "");
            
            // Format the title (e.g., sample-doc -> Sample Doc)
            const title = slug
              .split("-")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ");

            const dateAdded = stats.mtime.toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            });

            return {
              id: `local_${slug}`,
              slug,
              title,
              dateAdded,
              timestamp: stats.mtime.getTime(),
            };
          })
      );
      allPdfs.push(...localPdfFiles);
    } catch (error) {
      console.error("[getPdfs] Error reading local PDF directory:", error);
    }
  }

  // ─── 2. LOAD DYNAMIC CLOUDINARY PDFS FROM BACKEND ───────────────────
  const isProd = process.env.NODE_ENV === 'production';
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || (isProd ? '' : 'http://localhost:5000');

  if (apiUrl) {
    try {
      // Fetch from /api/study-materials or /study-materials depending on endpoint configuration
      const res = await fetch(`${apiUrl}/api/study-materials`, {
        next: { revalidate: 30 }, // Caches ISR for 30s
        headers: {
          'Accept': 'application/json'
        }
      });

      if (res.ok) {
        const remoteMaterials = await res.json();
        if (Array.isArray(remoteMaterials)) {
          const mappedRemote = remoteMaterials.map((item: any) => {
            const date = new Date(item.createdAt || Date.now());
            return {
              id: item._id,
              slug: item.slug,
              title: item.title,
              cloudinaryUrl: item.cloudinaryUrl,
              timestamp: date.getTime(),
              dateAdded: date.toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              }),
            };
          });
          allPdfs.push(...mappedRemote);
        }
      }
    } catch (error) {
      // Silently fail without crashing the app build if the backend is offline or unreachable
      console.warn("[getPdfs] Failed to connect to dynamic API. Operating in filesystem-only mode.");
    }
  }

  // ─── 3. DEDUPLICATE & SORT ───────────────────────────────────────────
  // If the same slug exists locally and remotely, prefer the remote (Cloudinary) version
  const slugMap = new Map<string, PdfDocument>();
  allPdfs.forEach((pdf) => {
    const existing = slugMap.get(pdf.slug);
    // If duplicate, prefer remote (which contains a cloudinaryUrl)
    if (!existing || pdf.cloudinaryUrl) {
      slugMap.set(pdf.slug, pdf);
    }
  });

  // Sort by most recent first
  return Array.from(slugMap.values()).sort((a, b) => b.timestamp - a.timestamp);
}
