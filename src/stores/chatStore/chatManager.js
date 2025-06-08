// stores/chatManager.js
import { defineStore } from "pinia";

export const useChatManager = defineStore("chatManager", {
  state: () => ({
    chatStores: {},
  }),
  actions: {
    createChatStore(sourceLoginToken) {
      if (!this.chatStores[sourceLoginToken]) {
        this.chatStores[sourceLoginToken] = createChatStore(sourceLoginToken);
      }
      return this.chatStores[sourceLoginToken];
    },
    getChatStore(sourceLoginToken) {
      return this.chatStores[sourceLoginToken];
    },
  },
  persist: true,
});
