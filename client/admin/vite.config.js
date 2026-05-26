import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Use relative paths so the admin panel works with ANY ADMIN_PATH
// without needing a rebuild. The server injects the correct base at runtime.

export default defineConfig({
  plugins: [react()],
  // './' makes all asset references relative — they resolve correctly
  // no matter what ADMIN_PATH the server is configured with.
  base: './',
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
