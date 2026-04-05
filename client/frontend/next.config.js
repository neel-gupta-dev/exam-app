/** @type {import('next').NextConfig} */

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
    ],
  },
  reactCompiler: true,
  cacheComponents: true,
  typescript: {
    ignoreBuildErrors: true,
  },

  /**
   * No API proxy rewrites needed.
   * The frontend now calls https://api.vayl.in directly.
   * CORS is handled by the backend's *.vayl.in allow-rule.
   */

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
          },
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.google-analytics.com https://www.clarity.ms https://va.vercel-scripts.com https://cdn.jsdelivr.net https://accounts.google.com https://*.google.com https://*.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' blob: data: https://lh3.googleusercontent.com https://*.googleusercontent.com https://www.google-analytics.com https://www.clarity.ms; font-src 'self' data: https://fonts.gstatic.com https://cdn.jsdelivr.net; connect-src 'self' http://localhost:5000 https://api.vayl.in https://api.ipify.org https://www.google-analytics.com https://*.google-analytics.com https://www.clarity.ms https://*.vercel-analytics.com https://cdn.jsdelivr.net https://accounts.google.com https://*.google.com https://*.googleapis.com; frame-src 'self' https://accounts.google.com https://www.google.com; base-uri 'self'; form-action 'self' https://*.google.com; frame-ancestors 'none'; object-src 'none';",
          },
          {
            key: "Link",
            value: "<https://fonts.googleapis.com>; rel=preconnect, <https://fonts.gstatic.com>; rel=preconnect; crossorigin, <https://www.google-analytics.com>; rel=dns-prefetch, <https://va.vercel-scripts.com>; rel=dns-prefetch, <https://www.clarity.ms>; rel=dns-prefetch, <https://cdn.jsdelivr.net>; rel=dns-prefetch, <https://lh3.googleusercontent.com>; rel=dns-prefetch",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;