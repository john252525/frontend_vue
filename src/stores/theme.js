import { defineStore } from "pinia";

const STORAGE_KEY = "themeMode"; // "light" | "dark" | "system"

const getSystemPrefersDark = () =>
  typeof window !== "undefined" &&
  window.matchMedia &&
  window.matchMedia("(prefers-color-scheme: dark)").matches;

export const useThemeStore = defineStore("theme", {
  state: () => ({
    mode: localStorage.getItem(STORAGE_KEY) || "system",
    systemPrefersDark: getSystemPrefersDark(),
  }),

  getters: {
    // Итоговая тема с учётом системной, если выбран режим "system"
    isDark: (state) =>
      state.mode === "system" ? state.systemPrefersDark : state.mode === "dark",
  },

  actions: {
    applyTheme() {
      document.documentElement.setAttribute(
        "data-theme",
        this.isDark ? "dark" : "light",
      );
    },

    setMode(mode) {
      this.mode = mode;
      localStorage.setItem(STORAGE_KEY, mode);
      this.applyTheme();
    },

    // Инициализация при старте приложения: применяет тему и следит
    // за изменением системной темы, пока выбран режим "system"
    init() {
      this.applyTheme();

      if (typeof window === "undefined" || !window.matchMedia) return;

      const media = window.matchMedia("(prefers-color-scheme: dark)");
      media.addEventListener("change", (event) => {
        this.systemPrefersDark = event.matches;
        if (this.mode === "system") {
          this.applyTheme();
        }
      });
    },
  },
});
