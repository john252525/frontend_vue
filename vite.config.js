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
  },
  // Добавьте эти настройки:
  build: {
    outDir: "../frontend_vue/dist", // Явно указываем путь
    assetsDir: "assets", // Все ассеты в папку assets
    rollupOptions: {
      output: {
        assetFileNames: "assets/[name].[ext]", // Формат имен файлов
        chunkFileNames: "assets/[name].js",
        entryFileNames: "assets/[name].js",
      },
    },
  },
  // Для корректных MIME-типов в dev-режиме
  base: "./",
});
