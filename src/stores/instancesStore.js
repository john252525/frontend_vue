import { defineStore } from "pinia";

export const useInstancesStore = defineStore("instancesStore", {
  state: () => ({
    instances: [],      // currently displayed (filtered) set
    allInstances: [],   // full unfiltered set for client-side filtering
    loadedAt: null,
  }),

  getters: {
    getInstances: (state) => state.instances,
    hasInstances: (state) => state.instances.length > 0,
    hasAllInstances: (state) => state.allInstances.length > 0,
    // Кеш считается свежим 5 минут
    isCacheFresh: (state) => {
      if (!state.loadedAt) return false;
      return Date.now() - state.loadedAt < 5 * 60 * 1000;
    },
  },

  actions: {
    setInstances(data) {
      this.instances = data || [];
    },

    setAllInstances(data) {
      this.allInstances = data || [];
      this.loadedAt = Date.now();
      console.log("💾 instancesStore: сохранено всех аккаунтов:", this.allInstances.length);
    },

    updateInstance(index, data) {
      if (this.instances[index] !== undefined) {
        this.instances[index] = { ...this.instances[index], ...data };
      }
    },

    updateInstanceByUuid(uuid, data) {
      const index = this.instances.findIndex((acc) => acc.uuid === uuid);
      if (index !== -1) {
        this.instances[index] = { ...this.instances[index], ...data };
      }
      const allIndex = this.allInstances.findIndex((acc) => acc.uuid === uuid);
      if (allIndex !== -1) {
        this.allInstances[allIndex] = { ...this.allInstances[allIndex], ...data };
      }
    },

    removeInstance(login, source) {
      const before = this.instances.length;
      this.instances = this.instances.filter(
        (acc) => !(acc.login === login && acc.source === source),
      );
      this.allInstances = this.allInstances.filter(
        (acc) => !(acc.login === login && acc.source === source),
      );
      console.log(
        `🗑️ instancesStore: удалён аккаунт ${login}@${source}, осталось ${this.instances.length} из ${before}`,
      );
    },

    clearInstances() {
      this.instances = [];
      this.allInstances = [];
      this.loadedAt = null;
      console.log("🗑️ instancesStore: кеш очищен");
    },
  },

  // Не персистим — данные должны быть свежими при каждой сессии
  persist: false,
});
