import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import { copyFileSync } from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Plugin to copy _redirects file for Netlify
const copyRedirectsPlugin = () => ({
  name: 'copy-redirects',
  closeBundle() {
    const src = path.resolve(__dirname, 'client/_redirects');
    const dest = path.resolve(__dirname, 'client/dist/_redirects');
    copyFileSync(src, dest);
    console.log('✅ _redirects file copied to dist/');
  }
});

export default defineConfig({
  plugins: [react(), copyRedirectsPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client/src"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "client/dist"),
    emptyOutDir: true,
  },
  server: {
    host: "0.0.0.0",
    port: 5000,
    strictPort: true,
    hmr: {
      clientPort: 5000,
    },
  },
});
