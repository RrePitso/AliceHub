import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      // Alias @shared/schema explicitly to schema.client.ts for frontend-safe imports
      '@shared/schema': path.resolve(__dirname, '../shared/schema.client.ts'),
      // Keep @shared pointing to the whole shared folder for other imports
      '@shared': path.resolve(__dirname, '../shared'),
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

