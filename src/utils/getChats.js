import axios from "axios";
import { createChatStore } from "@/stores/chatStore/chatStoreFactory";

const apiUrl = import.meta.env.VITE_API_URL;
const apiCheckUrl = import.meta.env.VITE_API_CHECK_BE_CHAT;

export const fetchChats = async ({ token, login, source, type, storage }) => {
  const chatStore = createChatStore(`${login}_${source}_${token}`);
  if (chatStore.isLoading) {
    console.log("Загрузка чатов уже выполняется, пропускаем");
    return;
  }

  const allChats = chatStore.chats;
  const chatsArray = Object.values(allChats);
  if (chatsArray.length > 0) {
    return;
  }

  try {
    chatStore.setLoading(true);
    const response = await axios.post(
      `${apiUrl}/getChats`,
      {
        login: login,
        source: source,
        type: type,
        storage: storage,
      },
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.status === 401) {
      return {
        chats: [],
        chatsNull: false,
        error: "Unauthorized",
        needRedirect: true,
      };
    }

    let resultChats;
    if (apiUrl === apiCheckUrl) {
      resultChats = response.data.data.chats;
      chatStore.loadChats(response.data.data.chats);
    }

    console.log(response.data);

    return {
      chats: resultChats,
      chatsNull: resultChats.length === 0,
      error: null,
    };
  } catch (error) {
    return {
      chats: [],
      chatsNull: false,
      error: error.message || "Unknown error",
    };
  } finally {
    chatStore.setLoading(false); // Снимаем состояние загрузки
  }
};
