import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";

export default defineConfig({
  plugins: [vue(), vueDevTools()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    port: 5000,
    host: "0.0.0.0",
    // Добавляем заголовки для dev-сервера
    headers: {
      "Content-Type": "application/javascript",
    },
  },
  build: {
    outDir: "../frontend_vue/dist",
    assetsDir: "assets",
    rollupOptions: {
      output: {
        // Улучшенный формат имен файлов
        assetFileNames: "assets/[name]-[hash].[ext]",
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
      },
    },
    // Включаем минификацию
    minify: "terser",
  },
  // Критически важное изменение:
  base: "/", // Убираем точку (используем абсолютные пути)
});
