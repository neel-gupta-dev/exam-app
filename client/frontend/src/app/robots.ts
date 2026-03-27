import { MetadataRoute } from 'next'

/**
 * Dynamic Robots.txt Generator for Vayl
 * Configures crawler access and points to the sitemap.
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://vayl.in';
  
  return {
    rules: {
      userAgent: '*',
      allow: [
        '/', 
        '/about', 
        '/contact', 
        '/privacy-policy', 
        '/terms', 
        '/login', 
        '/signup',
        '/p/' // Allow public profiles
      ],
      disallow: [
        '/dashboard/', 
        '/api/',
        '/_next/',
        '/static/'
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
