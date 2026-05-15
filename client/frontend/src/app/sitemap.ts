import { MetadataRoute } from 'next'
import { getPdfs } from './notes/lib/getPdfs'

/**
 * Dynamic Sitemap Generator for Vayl
 * Automatically generates sitemap.xml for SEO and Adsense crawlers.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://vayl.in';
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  // Base static routes
  const staticRoutes = [
    { path: '', priority: 1.0 },
    { path: '/about', priority: 0.8 },
    { path: '/contact', priority: 0.8 },
    { path: '/privacy-policy', priority: 0.5 },
    { path: '/terms', priority: 0.5 },
    { path: '/login', priority: 0.7 },
    { path: '/signup', priority: 0.7 },
    { path: '/blogs', priority: 0.9 },
    { path: '/notes', priority: 1.0 }, // Prioritize notes root
  ];

  const routes: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly',
    priority: route.priority,
  }));

  // Fetch dynamic blogs
  try {
    const res = await fetch(`${apiUrl}/blogs`, { next: { revalidate: 3600 } });
    if (res.ok) {
      const data = await res.json();
      const blogs = Array.isArray(data) ? data : data.blogs || [];

      blogs.forEach((blog: any) => {
        routes.push({
          url: `${baseUrl}/blogs/${blog.slug}`,
          lastModified: new Date(blog.updatedAt || blog.createdAt || new Date()).toISOString(),
          changeFrequency: 'monthly',
          priority: 0.9, // Priority of 0.9 for blog posts as requested
        });
      });
    }
  } catch (error) {
    console.error('[Sitemap] Failed to fetch dynamic blogs:', error);
  }

  // Fetch dynamic PDF notes
  try {
    const pdfs = await getPdfs();
    pdfs.forEach((pdf) => {
      routes.push({
        url: `${baseUrl}/notes/doc/${pdf.slug}`,
        lastModified: new Date(pdf.timestamp).toISOString(),
        changeFrequency: 'weekly',
        priority: 0.9,
      });
    });
  } catch (error) {
    console.error('[Sitemap] Failed to fetch dynamic PDFs:', error);
  }

  return routes;
}
