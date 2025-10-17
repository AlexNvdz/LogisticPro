import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // proxyea rutas al backend en desarrollo
      '/clients': 'http://localhost:3000',
      '/vehicles': 'http://localhost:3000',
      '/orders': 'http://localhost:3000',
      '/users': 'http://localhost:3000',
      '/db-test': 'http://localhost:3000',
      '/warehouses': 'http://localhost:3000'
    }
  }
})
