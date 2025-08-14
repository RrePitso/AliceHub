import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@shared/schema': path.resolve(__dirname, 'src/shared/schema.client.ts'),
      // do NOT alias the full shared folder
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
      // You can add other externals here if needed
    },
  },
});

