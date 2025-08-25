import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  server: {
    cors: {
      origin: "http://localhost:3000/",
    },
  },

  build: {
    // generate .vite/manifest.json in outDir
    manifest: true,
    rollupOptions: {
      // overwrite default .html entry
      input: "/src/main.tsx",
    },
  },

  plugins: [react(), tailwindcss()],
});
