import { MetadataRoute } from 'next'

/**
 * Dynamic Sitemap Generator for Notes Subdomain (notes.vayl.in)
 * Automatically generates sitemap.xml for SEO and discovery of study notes.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  // Use specific subdomain URL
  const baseUrl = 'https://notes.vayl.in';

  // Define routes specifically for the notes subdomain
  // As you add sub-folders like subjects or pyqs, add them here
  const routes = [
    '',
    // '/subjects',
    // '/pyqs',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'daily' as const, // Notes change more frequently
    priority: route === '' ? 1 : 0.8,
  }));

  return routes;
}
