import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite"; // Важно: импорт из vite
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    port: 5000,
    host: "0.0.0.0",
  },
});
