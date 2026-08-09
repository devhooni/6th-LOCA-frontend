import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

const rootDir = path.resolve(__dirname);

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ["loca-git-main-gdg-hongik-univ.vercel.app"],
    proxy: {
      '/api': {
        target: 'https://sixth-loca-backend-4-i9yx.onrender.com',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  resolve: {
    alias: {
      "@": rootDir,
    },
  },
});
