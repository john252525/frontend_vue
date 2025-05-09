import { defineStore } from "pinia";

export const useRequestsStore = defineStore("requests", {
  state: () => ({
    requests: [],
    isRecording: true,
  }),

  actions: {
    addRequest(request) {
      if (!this.isRecording) return;

      // Ограничиваем количество хранимых запросов
      if (this.requests.length >= 500) {
        this.requests.shift();
      }

      this.requests.push({
        ...request,
        id: Date.now() + Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toISOString(),
      });
    },

    clearRequests() {
      this.requests = [];
    },

    toggleRecording() {
      this.isRecording = !this.isRecording;
    },
  },

  getters: {
    getRequests: (state) => state.requests,
    getRequestsCount: (state) => state.requests.length,
    getSuccessCount: (state) =>
      state.requests.filter((r) => r.status >= 200 && r.status < 300).length,
    getErrorCount: (state) =>
      state.requests.filter((r) => r.status >= 400).length,
    getAverageDuration: (state) => {
      if (state.requests.length === 0) return 0;
      const total = state.requests.reduce((sum, req) => sum + req.duration, 0);
      return Math.round(total / state.requests.length);
    },
  },
});
