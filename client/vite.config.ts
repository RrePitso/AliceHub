import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      "@shared": path.resolve(__dirname, "../shared")
    },
  },
  server: {
    fs: {
      allow: ['..'], // allow access to parent folder
    },
  },
  build: {
    rollupOptions: {
      external: ['drizzle-orm'],
      // same allow for build time
      // Not always necessary but can help
    },
  },
});

