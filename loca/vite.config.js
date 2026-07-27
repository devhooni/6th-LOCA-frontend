import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": rootDir,
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "https://sixth-loca-backend-3-12qz.onrender.com",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});

