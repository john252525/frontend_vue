import axios from "axios";
import { createChatStore } from "@/stores/chatStore/chatStoreFactory";
import debounce from "lodash/debounce";

const apiUrl = import.meta.env.VITE_API_URL;
const apiCheckUrl = import.meta.env.VITE_API_CHECK_BE_CHAT;

// Debounced fetchChats function
const debouncedFetchChats = debounce(async ({ token, accounts }, callback) => {
  const chatStore = createChatStore(
    accounts.map((acc) => `${acc.login}_${acc.source}_${token}`).join("_")
  );

  if (chatStore.isLoading) {
    console.log("Загрузка чатов уже выполняется, пропускаем");
    return callback(null, {
      chats: [],
      chatsNull: false,
      error: "Loading in progress",
    });
  }

  // Check if all accounts already have chats in the store
  const allChatsLoaded = accounts.every((account) => {
    const storeKey = `${account.login}_${account.source}_${token}`;
    const store = createChatStore(storeKey);
    return Object.values(store.chats).length > 0;
  });

  if (allChatsLoaded) {
    console.log("Все чаты уже загружены в сторе");
    return callback(null, { chats: [], chatsNull: false, error: null });
  }

  try {
    chatStore.setLoading(true);
    const response = await axios.post(
      `${apiUrl}/getChats`,
      {
        accounts: accounts.map((acc) => ({
          login: acc.login,
          source: acc.source,
          type: acc.type || "undefined",
          storage: acc.storage || "undefined",
        })),
        token,
      },
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.status === 401) {
      return callback(null, {
        chats: [],
        chatsNull: false,
        error: "Unauthorized",
        needRedirect: true,
      });
    }

    let resultChats = [];
    if (apiUrl === apiCheckUrl) {
      resultChats = response.data.data.chats;
      accounts.forEach((account) => {
        const storeKey = `${account.login}_${account.source}_${token}`;
        const store = createChatStore(storeKey);
        const accountChats = resultChats.filter(
          (chat) =>
            chat.loginUserVizor === account.login &&
            chat.sourceUser === account.source
        );
        store.loadChats(accountChats);
      });
    }

    console.log("Получены данные чатов:", response.data);

    return callback(null, {
      chats: resultChats,
      chatsNull: resultChats.length === 0,
      error: null,
    });
  } catch (error) {
    console.error("Ошибка при загрузке чатов:", error);
    return callback(error, {
      chats: [],
      chatsNull: false,
      error: error.message || "Unknown error",
    });
  } finally {
    chatStore.setLoading(false);
  }
}, 500); // Debounce for 500ms

export const fetchChats = async ({ token, login, source, type, storage }) => {
  return new Promise((resolve) => {
    debouncedFetchChats(
      {
        token,
        accounts: [{ login, source, type, storage }],
      },
      (error, result) => resolve(result)
    );
  });
};
