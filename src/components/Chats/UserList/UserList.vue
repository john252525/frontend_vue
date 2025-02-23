<template>
  <ErrorBlock v-if="errorBlock" :changeIncorrectPassword="chaneErrorBlock" />
  <aside class="chat-list">
    <section
      v-if="sortedChats"
      v-for="chat in sortedChats"
      :key="chat.unid"
      class="chat-item"
      @click="selectChat(chat)"
    >
      <div class="chat-user-cont">
        <img
          v-if="chat.avatar"
          class="user-chat-avatar"
          :src="chat.avatar"
          alt=""
        />
        <img
          v-else
          class="user-chat-icon"
          src="/chats/user-chat-icon.svg"
          alt=""
        />
        <div class="chat-info">
          <div class="chat-name">{{ chat.name }}</div>
          <div class="chat-last-message">
            {{ formatLastMessage(chat.lastMessage?.body) }}
          </div>
        </div>
      </div>
      <div class="chat-meta">
        <div class="chat-timestamp">
          {{ formatTimestamp(chat.timestamp) }}
        </div>
        <div class="chat-unread" v-if="chat.unreadCount > 0">
          {{ chat.unreadCount }}
        </div>
      </div>
    </section>
    <section class="loading-chat-list" v-else>
      <Loading />
    </section>
  </aside>
</template>

<script setup>
import axios from "axios";
import { onMounted, ref, computed } from "vue";
import Loading from "./Loading.vue";
import ErrorBlock from "@/components/ErrorBlock/ErrorBlock.vue";
import { useRouter } from "vue-router";

const router = useRouter();
const props = defineProps({
  selectChat: {
    type: Function,
  },
});

const errorBlock = ref(false);
const chats = ref(null);
const userInfo = JSON.parse(localStorage.getItem("userInfo"));

const updateChatTimestamp = (thread, newTimestamp) => {
  // Преобразуем новый временной штамп из наносекунд в секунды
  const newTimestampInSeconds = Math.floor(newTimestamp / 1000000); // Делим на 1 миллион, чтобы получить секунды

  const chat = chats.value.find(
    (chat) => chat.lastMessage.id?.remote === thread
  );

  if (chat) {
    console.log("Новое", newTimestampInSeconds);
    console.log("Старое", chat.timestamp);
    chat.timestamp = newTimestampInSeconds;
    console.log(`Timestamp для ${thread} обновлён на ${newTimestampInSeconds}`);
  } else {
    console.log(`Чат с thread ${thread} не найден`);
  }
};

const updateLastMessage = (thread, newLastMessage) => {
  const chat = chats.value.find(
    (chat) => chat.lastMessage.id?.remote === thread
  );
  if (chat) {
    chat.lastMessage.body = newLastMessage; // Обновляем lastMessage
    console.log(`Последнее сообщение для ${thread} обновлено`);
  } else {
    console.log(`Чат с thread ${thread} не найден`);
  }
};

const test = async () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  console.log("userInfo:", userInfo);

  try {
    const token = localStorage.getItem("accountToken");
    console.log("Token:", token);
    const response = await axios.post(
      `${apiUrl}/getChats`,
      {
        source: userInfo?.source,
        login: userInfo?.login,
      },
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.status === 401) {
      errorBlock.value = true;
      setTimeout(() => {
        localStorage.removeItem("accountToken");
        router.push("/login");
      }, 2000);
      return;
    }

    console.log("Response data:", response);
    chats.value = response.data.data.chats;
    console.log("Chats:", chats.value);
  } catch (error) {
    console.error("Ошибка при получении сообщений:", error);
    if (error.response) {
      console.error("Ошибка сервера:", error.response.data);
    }
  }
};

const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp * 1000); // Убедитесь, что timestamp в секундах
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

const sortedChats = computed(() => {
  if (!chats.value) return [];
  return chats.value.sort((a, b) => b.timestamp - a.timestamp);
});

onMounted(test);

const formatLastMessage = (message) => {
  const maxLength = 20;
  if (message && message.length > maxLength) {
    return message.slice(0, maxLength) + "...";
  }
  return message || "Нет сообщений";
};

const audio = ref(null);

onMounted(() => {
  // Создаем аудио объект при монтировании компонента
  audio.value = new Audio("/chats/newMessage.mp3");

  const connectEventSource = () => {
    const eventSource = new EventSource(
      "https://hellychat.apitter.com/api/events"
    );

    // Получаем массив идентификаторов из localStorage или создаем новый
    const receivedMessageIds =
      JSON.parse(localStorage.getItem("receivedMessageIds")) || [];

    eventSource.onmessage = (event) => {
      const eventData = JSON.parse(event.data);

      console.log(eventData);

      // Проверяем тип события
      if (eventData.hook_type === "message") {
        // Проверка на уникальность сообщения
        if (!receivedMessageIds.includes(eventData.item)) {
          // Сохраняем идентификатор в localStorage
          receivedMessageIds.push(eventData.item);
          localStorage.setItem(
            "receivedMessageIds",
            JSON.stringify(receivedMessageIds)
          );
          updateLastMessage(eventData.thread, eventData.text);
          updateChatTimestamp(eventData.thread, eventData.time);

          // Проигрываем звук
          playSound();
        }
      }
    };

    eventSource.onerror = (error) => {
      console.error("Ошибка соединения:", error);
      eventSource.close(); // Закрываем текущее соединение
      // Пытаемся переподключиться через 3 секунды
      setTimeout(() => {
        console.log("Попытка переподключения...");
        connectEventSource();
      }, 3000);
    };

    eventSource.onopen = () => {
      console.log("Соединение установлено");
    };
  };

  // Инициализация соединения
  connectEventSource();
});

// Функция для проигрывания звука
const playSound = () => {
  if (audio.value) {
    audio.value.play().catch((error) => {
      console.error("Ошибка при проигрывании звука:", error);
    });
  }
};
</script>

<style scoped>
.chat-list {
  width: 450px;
  border-right: 1px solid #eaeaea;
  overflow-y: auto;
  overflow-x: hidden;
  height: 100vh;
  position: relative;
}

.loading-chat-list {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 94vh;
}

.chat-item {
  display: flex;
  justify-content: space-between;
  padding: 12px;
  cursor: pointer;
  background-color: #f9f9f9;
  transition: background-color 0.3s ease;
}

.chat-item:hover {
  background-color: #f0f0f0;
}

.chat-info {
  flex-grow: 1;
  font-size: 14px;
  display: flex;
  flex-direction: column;
}

.chat-user-cont {
  display: flex;
  align-items: center;
  gap: 12px;
}

.chat-name {
  font-size: 16px;
  font-weight: 400;
  margin-bottom: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-last-message {
  color: #888;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-meta {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.chat-timestamp {
  position: absolute;
  font-size: 12px;
  color: #888;
}

.chat-unread {
  position: absolute;
  background-color: #007bff;
  color: white;
  border-radius: 12px;
  padding: 2px 6px;
  font-size: 12px;
  bottom: 0;
}

.chat-list::-webkit-scrollbar {
  width: 6px;
}

.chat-list::-webkit-scrollbar-track {
  background-color: #f9f9f9;
}

.user-chat-avatar {
  width: 44px;
  border-radius: 100px;
}

.chat-list::-webkit-scrollbar-thumb {
  background: rgb(209, 209, 209);
  border-radius: 5px;
}

.krig {
  width: 45px;
  height: 45px;
  background-color: red;
  border-radius: 100px;
}

@media (max-width: 1200px) {
  .chat-list {
    width: 350px;
  }
}

@media (max-width: 900px) {
  .chat-list {
    width: 300px;
  }
}

@media (max-width: 768px) {
  .chat-list {
    width: 100%;
  }
}
</style>
