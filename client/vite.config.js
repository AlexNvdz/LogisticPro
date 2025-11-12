import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './', // 👈 importante para Vercel

  server: {
    port: 5173,
    watch: { usePolling: true },
    proxy: {
      '/clients': 'http://localhost:3000',
      '/vehicles': 'http://localhost:3000',
      '/orders': 'http://localhost:3000',
      '/users': 'http://localhost:3000',
      '/db-test': 'http://localhost:3000',
      '/warehouses': 'http://localhost:3000',
      '/drivers': 'http://localhost:3000'
    }
  },

  resolve: {
    alias: { '@': '/src' }
  },

  build: {
    outDir: 'dist',
    sourcemap: false
  }
})