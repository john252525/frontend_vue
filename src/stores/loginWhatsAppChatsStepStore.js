import { defineStore } from "pinia";

export const useLoginWhatsAppChatsStepStore = defineStore(
  "loginWhatsAppChatsStep",
  {
    state: () => ({
      loginWhatsAppChatsStep: [], // Инициализируем пустым массивом
    }),
    getters: {
      // Геттер для получения всего массива
      getLoginWhatsAppChatsStep: (state) => state.loginWhatsAppChatsStep,
    },
    actions: {
      // Добавить новый объект в массив (или обновить существующий)
      addOrUpdateChat(chatData) {
        const existingIndex = this.loginWhatsAppChatsStep.findIndex(
          (chat) =>
            chat.login === chatData.login && chat.source === chatData.source
        ); // Поиск по login и source
        if (existingIndex !== -1) {
          // Если элемент существует, обновим его
          this.loginWhatsAppChatsStep[existingIndex] = chatData;
        } else {
          // Если элемента нет, добавим его
          this.loginWhatsAppChatsStep.push(chatData);
        }
      },

      // Удалить элемент из массива по login и source
      removeChat(login, source) {
        this.loginWhatsAppChatsStep = this.loginWhatsAppChatsStep.filter(
          (chat) => !(chat.login === login && chat.source === source)
        ); // Фильтруем, исключая элемент с указанными login и source
      },

      // Очистить весь массив
      clearChats() {
        this.loginWhatsAppChatsStep = [];
      },
    },
    persist: true, // Используем pinia-plugin-persistedstate для сохранения
  }
);
