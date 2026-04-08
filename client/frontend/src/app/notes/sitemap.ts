import { MetadataRoute } from 'next'
import { getPdfs } from './lib/getPdfs'

/**
 * Dynamic Sitemap Generator for Notes Subdomain (notes.vayl.in)
 * Automatically generates sitemap.xml for SEO and discovery of study notes.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Use specific subdomain URL
  const baseUrl = 'https://notes.vayl.in';

  // Define static routes specifically for the notes subdomain
  const routes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'daily', // Notes change more frequently
      priority: 1,
    }
  ];

  // Get dynamic PDFs
  const pdfs = await getPdfs();
  
  // Add dynamic PDF routes
  const pdfRoutes: MetadataRoute.Sitemap = pdfs.map((pdf) => ({
    url: `${baseUrl}/doc/${pdf.slug}`,
    lastModified: new Date(pdf.timestamp).toISOString(),
    changeFrequency: 'weekly',
    priority: 0.9,
  }));

  return [...routes, ...pdfRoutes];
}
