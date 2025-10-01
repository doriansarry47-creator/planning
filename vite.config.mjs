import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": resolve(fileURLToPath(new URL('./client/src', import.meta.url))),
      "@shared": resolve(fileURLToPath(new URL('./shared', import.meta.url))),
      "@assets": resolve(fileURLToPath(new URL('./attached_assets', import.meta.url))),
    },
  },
  root: resolve(fileURLToPath(new URL('./client', import.meta.url))),
  build: {
    outDir: "../public",
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu']
        }
      }
    },
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: false,
    chunkSizeWarningLimit: 1000
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production')
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});