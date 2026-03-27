import { MetadataRoute } from 'next'

/**
 * Dynamic Sitemap Generator for Vayl
 * Automatically generates sitemap.xml for SEO and Adsense crawlers.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://vayl-app.vercel.app';

  // List of public-facing routes that should be indexed
  const routes = [
    '',
    '/about',
    '/contact',
    '/privacy-policy',
    '/terms',
    '/login',
    '/signup',
    '/blogs',
    '/blogs/the-jee-2026-roadmap',
    '/blogs/deep-work-for-aspirants',
    '/blogs/mastering-organic-chemistry',
    '/blogs/physics-high-yield-mechanics',
    '/blogs/exam-anxiety-protocol',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  return routes;
}
