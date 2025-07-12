import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true,
    proxy: {
      "/oauth2": {
        target: "https://oauth2.googleapis.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/oauth2/, ""),
      },
    },
  },
});
