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
  // Restore your build overrides
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;