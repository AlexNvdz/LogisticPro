import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc"; // ✅ usa SWC, no Babel (elimina eval)

export default defineConfig({
  base: "./", // ✅ necesario para Vercel
  plugins: [react()],
  esbuild: {
    legalComments: "none", // ✅ evita evals de comentarios
  },
  define: {
    "process.env": {}, // ✅ evita errores con variables vacías
  },
  build: {
    outDir: "dist",
    sourcemap: false, // ✅ evita evals en producción
  },
  resolve: {
    alias: { "@": "/src" },
  },
  server: {
    port: 5173,
    watch: { usePolling: true },
    proxy: {
      "/clients": "http://localhost:3000",
      "/vehicles": "http://localhost:3000",
      "/orders": "http://localhost:3000",
      "/users": "http://localhost:3000",
      "/db-test": "http://localhost:3000",
      "/warehouses": "http://localhost:3000",
      "/drivers": "http://localhost:3000",
    },
  },
});
