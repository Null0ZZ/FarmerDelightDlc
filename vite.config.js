import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
    // Use absolute paths for root deployment
    base: '/',
    plugins: [react()],
    server: {
        host: true,
        port: 5173,
        open: true
    }
});
