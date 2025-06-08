// stores/chatStoreFactory.js
import { defineStore } from "pinia";

export const createChatStore = (sourceLoginToken) => {
  return defineStore(`${sourceLoginToken}`, {
    state: () => ({
      chats: {},
      messages: {},
    }),
    actions: {
      loadChats(chatsData) {
        this.chats = { ...this.chats, ...chatsData };
      },

      loadMessages(threadId, messages) {
        if (!this.messages[threadId]) {
          this.messages[threadId] = [];
        }
        this.messages[threadId] = messages;
      },

      // Добавляет новые сообщения в тред
      addMessages(threadId, newMessages) {
        if (!this.messages[threadId]) {
          this.messages[threadId] = [];
        }
        this.messages[threadId].push(...newMessages);
      },
    },
    persist: {
      key: `${sourceLoginToken}`,
    },
  })();
};
