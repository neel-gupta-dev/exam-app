import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react' // (Or vue/svelte plugin if you use those)

export default defineConfig({
  plugins: [react()],
  server: {
    // 👇 This is the critical line for Docker
    host: true, // or '0.0.0.0'
    port: 5173, // The default Vite port
    strictPort: true, 
    watch: {
      // 👇 Required for Windows/Mac Docker to instantly detect file changes
      usePolling: true, 
    }
  }
})