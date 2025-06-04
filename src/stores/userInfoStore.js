import { defineStore } from "pinia";

export const useUserInfoStore = defineStore("userInfo", {
  state: () => ({
    userInfo: {
      storage: "local",
      type: "undefined",
      login: "",
      source: "",
      loading: false,
    },
  }),
  getters: {
    // Геттер для получения всего объекта userInfo
    getUserInfo: (state) => state.userInfo,
  },
  actions: {
    // Обновить весь объект userInfo сразу
    setUserInfo(newUserInfo) {
      this.userInfo = newUserInfo;
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
