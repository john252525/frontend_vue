<template>
  <div class="chat-list">
    <div
      v-for="chat in chats"
      :key="chat.phone"
      class="chat-item"
      @click="selectChat(chat)"
    >
      <div class="chat-info">
        <div class="chat-name">{{ chat.name }}</div>
        <div class="chat-last-message">
          {{ formatLastMessage(chat.lastMessage?.body) }}
        </div>
      </div>
      <div class="chat-meta">
        <div class="chat-timestamp">{{ formatTimestamp(chat.timestamp) }}</div>
        <div class="chat-unread" v-if="chat.unreadCount > 0">
          {{ chat.unreadCount }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import axios from "axios";
import { onMounted, ref } from "vue";

const props = defineProps({
  selectChat: {
    type: Function,
  },
});

const chats = ref(null);
const userInfo = JSON.parse(localStorage.getItem("userInfo"));
const test = async () => {
  try {
    const response = await axios.post(
      "https://b2288.apitter.com/instances/getChats",
      {
        source: userInfo.source,
        login: userInfo.login,
      },
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: `Bearer ${localStorage.getItem("accountToken")}`,
        },
      }
    );

    const messages = response.data.data.chats;
    console.log(messages);
    chats.value = response.data.data.chats;
    console.log(chats.value);
  } catch (error) {
    console.error("Ошибка при получении сообщений:", error);
    if (error.response) {
      console.error("Ошибка сервера:", error.response.data);
    }
  }
};

const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

onMounted(test);

const formatLastMessage = (message) => {
  const maxLength = 30; // Максимальная длина строки
  if (message && message.length > maxLength) {
    return message.slice(0, maxLength) + "..."; // Обрезаем и добавляем многоточие
  }
  return message || "Нет сообщений";
};
</script>

<style scoped>
.chat-list {
  width: 450px; /* Ширина списка чатов */
  border-right: 1px solid #eaeaea; /* Разделитель */
  overflow-y: auto;
  overflow-x: hidden;
  height: 93vh; /* Высота на весь экран */
}

.chat-item {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0; /* Разделитель между чатами */
}

.chat-item:hover {
  background-color: #f7f7f7; /* Цвет при наведении */
}

.chat-info {
  flex-grow: 1; /* Занимает оставшееся пространство */
}

.chat-name {
  font-weight: bold; /* Жирный текст для имени */
}

.chat-last-message {
  color: #888; /* Цвет для последнего сообщения */
  white-space: nowrap; /* Запрет на перенос строки */
  overflow: hidden; /* Скрыть переполнение */
  text-overflow: ellipsis; /* Добавить многоточие в конце */
}

.chat-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end; /* Выравнивание по правому краю */
}

.chat-timestamp {
  font-size: 12px; /* Размер шрифта для времени */
  color: #888; /* Цвет для времени */
}

.chat-unread {
  background-color: #007bff; /* Цвет фона для непрочитанных сообщений */
  color: white; /* Цвет текста для непрочитанных сообщений */
  border-radius: 12px; /* Закругление углов */
  padding: 2px 6px; /* Отступы */
  font-size: 12px; /* Размер шрифта для непрочитанных сообщений */
}

/* Стилизация скроллбара для вебkit-браузеров (Chrome, Safari) */
.chat-list::-webkit-scrollbar {
  width: 8px; /* Ширина скроллбара */
}

.chat-list::-webkit-scrollbar-track {
  background: #f0f0f0; /* Цвет фона трека скроллбара */
  border-radius: 200px; /* Закругление углов трека */
}

.chat-list::-webkit-scrollbar-thumb {
  background: #6d8196; /* Цвет скроллбара */
  border-radius: 200px; /* Закругление углов скроллбара */
}

.chat-list::-webkit-scrollbar-thumb:hover {
  background: #9ea6af; /* Цвет скроллбара при наведении */
  border-radius: 200px; /* Закругление углов скроллбара */
}

/* Стили для Firefox */
.chat-list {
  scrollbar-width: thin; /* Тонкий скроллбар */
  scrollbar-color: #c2c2c2 #f0f0f0; /* Цвет скроллбара и трека */
}
</style>
