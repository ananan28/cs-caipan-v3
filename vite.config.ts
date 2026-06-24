import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
  },
  build: {
    rollupOptions: {
      external: [],
    },
  },
  esbuild: {
    logOverride: { 'ts-1085': 'silent' },
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
