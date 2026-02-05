import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import Markdown from "unplugin-vue-markdown/vite";

export default defineConfig({
  plugins: [
    // 1. Настраиваем vue, чтобы он "видел" .md файлы как компоненты
    vue({
      include: [/\.vue$/, /\.md$/],
    }),

    // 2. Добавляем сам плагин Markdown
    Markdown({
      // Здесь можно добавить опции, например, классы для обертки
      wrapperClasses: "markdown-body",
    }),
  ],
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
