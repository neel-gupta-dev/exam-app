import fs from "fs";
import path from "path";

export interface PdfDocument {
  id: string;
  slug: string;
  title: string;
  dateAdded: string;
  timestamp: number;
}

export async function getPdfs(): Promise<PdfDocument[]> {
  const pdfsDirectory = path.join(process.cwd(), "public", "notes", "pdfs");
  
  if (!fs.existsSync(pdfsDirectory)) {
    return [];
  }

  try {
    const files = await fs.promises.readdir(pdfsDirectory);
    
    // Filter out only .pdf files map to metadata
    const pdfFiles = await Promise.all(
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

          // Format date as "April 8, 2026"
          const dateAdded = stats.mtime.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          });

          return {
            id: slug,
            slug,
            title,
            dateAdded,
            timestamp: stats.mtime.getTime(),
          };
        })
    );

    // Sort by most recent first
    return pdfFiles.sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error("Error reading PDF directory:", error);
    return [];
  }
}
