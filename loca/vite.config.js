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
        target: "https://sixth-loca-backend-9.onrender.com",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq) => {
            // Spring Boot CORS filter checks Origin and Referer headers
            proxyReq.setHeader("Origin", "https://loca-hongik.vercel.app");
            proxyReq.setHeader("Referer", "https://loca-hongik.vercel.app/");
          });
        },
      },
    },
  },
});

