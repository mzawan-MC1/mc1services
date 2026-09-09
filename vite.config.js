import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: true
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
    extensions: ['.mjs', '.js', '.jsx', '.ts', '.tsx', '.json']
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          if (id.includes('@supabase')) return 'supabase-vendor'
          if (id.includes('framer-motion')) return 'motion-vendor'
          if (id.includes('@tanstack')) return 'query-vendor'
          if (id.includes('lucide-react')) return 'icons-vendor'
          if (id.includes('@radix-ui')) return 'ui-vendor'
          if (id.includes('react') || id.includes('scheduler')) return 'react-vendor'
          return undefined
        },
      },
    },
  },})
