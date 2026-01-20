import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // Use relative asset paths so the built site works when served from a subpath
  // or via static hosting that may mount the app under a path.
  base: './',
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    open: true
  }
});
