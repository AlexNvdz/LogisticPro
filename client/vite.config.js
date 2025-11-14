import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  base: './',
  define: {
    'process.env': {},
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
  resolve: {
    alias: { '@': '/src' },
  },
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
      '/drivers': 'http://localhost:3000',
    },
  },
  
  // --- AÑADIDO ---
  // Esta es la única sección nueva.
  // Le dice a Vite cómo manejar las pruebas.
  test: {
    globals: true, // No necesitas importar 'test', 'expect', etc.
    environment: 'jsdom', // Simula un navegador
    setupFiles: './src/setupTests.js', // Archivo de configuración
  },
  // --- FIN DE LO AÑADIDO ---
})