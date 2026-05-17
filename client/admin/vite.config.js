import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// In production this MUST match the ADMIN_PATH env var on Railway
const ADMIN_PATH = process.env.ADMIN_PATH || '/sys-9f3k-ctrl';

export default defineConfig({
  plugins: [react()],
  // base sets the public URL prefix for all assets in the production build
  base: process.env.NODE_ENV === 'production' ? ADMIN_PATH + '/' : '/',
  build: {
    // Build inside the Vite project first; a postbuild script copies this to server/admin-static.
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    port: 3001,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  }
})

