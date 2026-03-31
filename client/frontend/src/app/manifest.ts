import { MetadataRoute } from 'next';

/**
 * PWA Manifest Configuration
 * This file dynamically generates the manifest.webmanifest file.
 * It allows Vayl to be "installed" on mobile and desktop devices.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Vayl | The Silent Architect of Academic Success',
    short_name: 'Vayl',
    description: 'The premium study operating system designed for elite aspirants. Manage high-yield resources, master concepts with deep focus, and track your academic journey with precision.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0b0e11', // Matches --surface in globals.css (Scholar Dark)
    theme_color: '#0b0e11',
    icons: [
      {
        src: '/vayl-logo.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/vayl-logo.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  };
}
