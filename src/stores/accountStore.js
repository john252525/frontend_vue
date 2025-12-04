import { defineStore } from "pinia";

export const useAccountStore = defineStore("accountStore", {
  state: () => ({
    accountRefreshToken: "",
    accountSourse: "",
    loading: false, // ИЗМЕНИЛ: было isLoading, стало loading
    accountData: "",
    accountStation: "",
    accountStationText: "",
    accountToken: "",
    crmPlatform: "amocrm",
    crmPlatformText: "AmoCRM",
    allSource: [],
    add_deleted: false,
    source: ["telegram", "whatsapp", "crm"],
    group: ["messenger", "crm", "bulk"],
    type: ["amocrm", "bitrix24", "uon", "bulk"],
    filterState: {
      telegram: true,
      whatsapp: true,
      crm: true,
      amocrm: true,
      bitrix24: true,
      uon: true,
      bulk: true,
    },
  }),
  getters: {
    getAddDeleted: (state) => state.add_deleted,
    getAccountSource: (state) => state.accountSourse,
    getAccountData: (state) => state.accountData,
    getAccountStation: (state) => state.accountStation,
    getAccountStationText: (state) => state.accountStationText,
    getAccountRefreshToken: (state) => state.accountRefreshToken,
    getAccountToken: (state) => state.accountToken,
    getCrmPlatform: (state) => state.crmPlatform,
    getCrmPlatformText: (state) => state.crmPlatformText,
    getAllSource: (state) => state.allSource,
    getSource: (state) => state.source,
    getGroup: (state) => state.group,
    getType: (state) => state.type,
    getFilterState: (state) => state.filterState,
    // ИЗМЕНИЛ: геттер для состояния загрузки
    isLoading: (state) => state.loading,

    getAccountInfo: (state) => ({
      accountSourse: state.accountSourse,
      accountData: state.accountData,
      accountStation: state.accountStation,
      accountStationText: state.accountStationText,
      accountToken: state.accountToken,
      source: state.source,
      group: state.group,
      type: state.type,
      add_deleted: state.add_deleted,
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

    // ИЗМЕНИЛ: action для управления состоянием загрузки
    setLoading(loading) {
      console.log("🏪 Store: setLoading(", loading, ")");
      this.loading = loading; // ИЗМЕНИЛ: было this.isLoading
    },

    setAddDeleted(value) {
      this.add_deleted = value;
    },

    setAccountRefreshToken(value) {
      this.accountRefreshToken = value;
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
        uon: false,
      };
      this.add_deleted = false;
    },
  },
  persist: true,
});
