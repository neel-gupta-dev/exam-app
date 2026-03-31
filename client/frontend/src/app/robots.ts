import { MetadataRoute } from 'next'

/**
 * Dynamic Robots.txt Generator for Vayl
 * Configures crawler access and points to the sitemap.
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://vayl-app.vercel.app';
  
  return {
    rules: {
      userAgent: [
        '*', 
        'GPTBot', 
        'ChatGPT-User', 
        'ClaudeBot', 
        'Perplexity-free-crawler', 
        'CCBot',
        'Google-Assistant-SDK',
        'AnthropicAI'
      ],
      allow: [
        '/', 
        '/about', 
        '/contact', 
        '/privacy-policy', 
        '/terms', 
        '/login', 
        '/signup',
        '/p/', // Allow public profiles
        '/blogs' // Allow blog access for LLM context
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
