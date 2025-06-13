// stores/chatStoreFactory.js
import { getActivePinia, defineStore } from "pinia";

export const createChatStore = (sourceLoginToken) => {
  const storeId = `chat_${sourceLoginToken}`;
  const pinia = getActivePinia();

  // Проверяем, существует ли уже такое хранилище
  if (pinia._s.has(storeId)) {
    console.log(
      `Хранилище ${storeId} уже существует, возвращаем существующий экземпляр`
    );
    return pinia._s.get(storeId);
  }

  return defineStore(storeId, {
    state: () => ({
      chats: {}, // { [chatId]: chatData }
      messages: {}, // { [threadId]: message[] }
      isLoading: false,
    }),
    actions: {
      loadChats(chatsData) {
        // Проверяем каждый чат перед добавлением
        Object.entries(chatsData).forEach(([chatId, chatData]) => {
          if (!this.chats[chatId]) {
            this.chats[chatId] = chatData;
          } else {
            console.log(`Чат ${chatId} уже существует, обновляем данные`);
            this.chats[chatId] = { ...this.chats[chatId], ...chatData };
          }
        });
      },

      loadMessages(threadId, messages) {
        if (!this.messages[threadId]) {
          this.messages[threadId] = [...messages];
        } else {
          console.log(`Тред ${threadId} уже существует, заменяем сообщения`);
          this.messages[threadId] = [...messages];
        }
      },

      addMessages(threadId, newMessages) {
        if (!this.messages[threadId]) {
          this.messages[threadId] = [...newMessages];
        } else {
          // Проверка на дубликаты сообщений
          const existingIds = new Set(this.messages[threadId].map((m) => m.id));
          const uniqueMessages = newMessages.filter(
            (m) => !existingIds.has(m.id)
          );

          if (uniqueMessages.length < newMessages.length) {
            console.log(
              `Найдено ${
                newMessages.length - uniqueMessages.length
              } дубликатов сообщений`
            );
          }

          this.messages[threadId].push(...uniqueMessages);
        }
      },
      setLoading(loading) {
        this.isLoading = loading;
      },

      async safeAddOrUpdateChat(data) {
        if (this.isLoading) {
          console.log("Операция уже выполняется, пропускаем запрос");
          return false;
        }

        this.setLoading(true);
        try {
          return await this.addOrUpdateChat(data);
        } finally {
          this.setLoading(false);
        }
      },

      // Основной метод добавления/обновления чата
      async addOrUpdateChat(data) {
        try {
          const { login, source, storage, type } = data;

          this.chats[login] = {
            source: source || this.chats[login]?.source || "undefined",
            storage: storage || this.chats[login]?.storage || "undefined",
            type: type || this.chats[login]?.type || "undefined",
          };

          return true;
        } catch (error) {
          console.error("Error in addOrUpdateChat:", error);
          return false;
        }
      },

      // Новый метод для проверки существования чата
      hasChat(chatId) {
        return !!this.chats[chatId];
      },

      // Новый метод для проверки существования треда
      hasThread(threadId) {
        return !!this.messages[threadId];
      },
    },
    persist: {
      key: storeId,
      // Рекомендуемые настройки для persistedstate
      paths: ["chats", "messages"],
      beforeRestore: (ctx) => {
        console.log(`Восстанавливаем хранилище ${ctx.store.$id}`);
      },
      afterRestore: (ctx) => {
        console.log(`Хранилище ${ctx.store.$id} восстановлено`);
      },
    },
  })();
};
