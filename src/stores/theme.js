import { defineStore } from "pinia";

export const useThemeStore = defineStore("theme", {
  state: () => ({
    isDark: localStorage.getItem("theme") === "dark",
  }),
  actions: {
    toggle() {
      this.isDark = !this.isDark;
      localStorage.setItem("theme", this.isDark ? "dark" : "light");
      document.documentElement.setAttribute(
        "data-theme",
        this.isDark ? "dark" : "light"
      );
    },
  },
});
