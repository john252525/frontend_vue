import { defineStore } from "pinia";

export const useAccountStore = defineStore("accountStore", {
  state: () => ({
    accountSourse: "",
    accountData: "",
    accountStation: "",
    accountStationText: "",
    accountToken: "",
    crmPlatform: "amocrm",
    crmPlatformText: "AmoCRM",
  }),
  getters: {
    getAccountSource: (state) => state.accountSourse,
    getAccountData: (state) => state.accountData,
    getAccountStation: (state) => state.accountStation,
    getAccountStationText: (state) => state.accountStationText,
    getAccountToken: (state) => state.accountToken,
    getCrmPlatform: (state) => state.crmPlatform,
    getCrmPlatformText: (state) => state.crmPlatformText,

    getAccountInfo: (state) => ({
      accountSourse: state.accountSourse,
      accountData: state.accountData,
      accountStation: state.accountStation,
      accountStationText: state.accountStationText,
      accountToken: state.accountToken,
    }),
  },
  actions: {
    setAccountInfo(accountInfo) {
      this.accountSourse = accountInfo.accountSourse;
      this.accountData = accountInfo.accountData;
      this.accountStation = accountInfo.accountStation;
      this.accountStationText = accountInfo.accountStationText;
      this.accountToken = accountInfo.accountToken;
    },

    // Обновить отдельные поля (опционально)
    setAccountSource(accountSourse) {
      this.accountSourse = accountSourse;
    },
    setCrmPlatform(crmPlatform) {
      this.crmPlatform = crmPlatform;
    },
    setCrmPlatformText(crmPlatformText) {
      this.crmPlatformText = crmPlatformText;
    },
    setAccountData(accountData) {
      this.accountData = accountData;
    },
    setAccountStation(accountStation) {
      this.accountStation = accountStation;
    },
    setAccountStationText(accountStationText) {
      this.accountStationText = accountStationText;
    },
    setAccountToken(accountToken) {
      this.accountToken = accountToken;
    },
    resetAccount() {
      this.accountSourse = "whatsapp";
      this.accountData = "test@mail.ru";
      this.accountStation = "telegram";
      this.accountStationText = "Telegram";
      this.accountToken = "86e0fb94-8f1f-4bfc-9764-320214c1e2f0";
    },
  },
  persist: true, // Включаем автоматическое сохранение в localStorage
});
