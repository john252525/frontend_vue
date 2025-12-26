import { defineStore } from "pinia";

export const useMailingVersion = defineStore("mailingVersion", {
  state: () => ({
    version: 1,
  }),
  getters: {
    getVersion: (state) => state.version,
  },
  actions: {
    updateVersion(version) {
      this.version = version;
    },

    // Сбросить к начальным значениям
    resetUserInfo() {
      this.userInfo = {
        storage: "local",
        type: "undefined",
        login: "",
        source: "",
        loading: false,
      };
    },
  },
  persist: true, // Включаем автоматическое сохранение в localStorage (благодаря pinia-plugin-persistedstate)
});
