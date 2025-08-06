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
    allSource: [],
    source: ["telegram", "whatsapp", "crm"],
    group: ["messenger", "crm"],
    type: ["amocrm", "bitrix24"],
    filterState: {
      telegram: true,
      whatsapp: true,
      crm: true,
      amocrm: true,
      bitrix24: true,
    },
  }),
  getters: {
    getAccountSource: (state) => state.accountSourse,
    getAccountData: (state) => state.accountData,
    getAccountStation: (state) => state.accountStation,
    getAccountStationText: (state) => state.accountStationText,
    getAccountToken: (state) => state.accountToken,
    getCrmPlatform: (state) => state.crmPlatform,
    getCrmPlatformText: (state) => state.crmPlatformText,
    getAllSource: (state) => state.allSource,
    // Новые геттеры
    getSource: (state) => state.source,
    getGroup: (state) => state.group,
    getType: (state) => state.type,
    getFilterState: (state) => state.filterState,

    getAccountInfo: (state) => ({
      accountSourse: state.accountSourse,
      accountData: state.accountData,
      accountStation: state.accountStation,
      accountStationText: state.accountStationText,
      accountToken: state.accountToken,
      source: state.source,
      group: state.group,
      type: state.type,
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

    setAllSource(allSource) {
      this.allSource = allSource;
    },
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
    // Новые actions для работы с фильтрами
    setSource(source) {
      this.source = source;
    },
    setGroup(group) {
      this.group = group;
    },
    setType(type) {
      this.type = type;
    },
    setFilterState(filterState) {
      this.filterState = filterState;
    },
    updateFilters({ source, group, type }) {
      this.source = source;
      this.group = group;
      this.type = type;
    },
    resetAccount() {
      this.accountSourse = "whatsapp";
      this.accountData = "test@mail.ru";
      this.accountStation = "telegram";
      this.accountStationText = "Telegram";
      this.accountToken = "86e0fb94-8f1f-4bfc-9764-320214c1e2f0";
    },
    // Сброс фильтров
    resetFilters() {
      this.source = [];
      this.group = [];
      this.type = [];
      this.filterState = {
        telegram: false,
        whatsapp: false,
        crm: false,
        amocrm: false,
        bitrix24: false,
      };
    },
  },
  persist: true,
});
