/// //<reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    watch: { usePolling: true }, // ayuda a detectar cambios en Windows/WSL
    proxy: {
      '/clients': 'http://localhost:3000',
      '/vehicles': 'http://localhost:3000',
      '/orders': 'http://localhost:3000',
      '/users': 'http://localhost:3000',
      '/db-test': 'http://localhost:3000',
      '/warehouses': 'http://localhost:3000',
      '/drivers': 'http://localhost:3000' // <- importante
    }
  },
  resolve: {
    alias: { '@': '/src' } // opcional pero útil
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  }
});