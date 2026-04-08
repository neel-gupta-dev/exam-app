import { MetadataRoute } from 'next'

/**
 * Dynamic Robots.txt Generator for Notes Subdomain (notes.vayl.in)
 * Configures crawler access for the notes section.
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://notes.vayl.in';
  
  return {
    rules: {
      userAgent: '*',
      allow: [
        '/',
        // '/subjects/',
        // '/pyqs/',
      ],
      disallow: [
        '/api/',
        '/_next/',
        '/static/'
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
