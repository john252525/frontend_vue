<template>
  <aside class="chat-list">
    <section
      v-if="chats"
      v-for="chat in chats"
      :key="chat.phone"
      class="chat-item"
      @click="selectChat(chat)"
    >
      <div class="chat-user-cont">
        <img class="user-chat-icon" src="/chats/user-chat-icon.svg" alt="" />
        <div class="chat-info">
          <div class="chat-name">{{ chat.name }}</div>
          <div class="chat-last-message">
            {{ formatLastMessage(chat.lastMessage?.body) }}
          </div>
        </div>
      </div>
      <div class="chat-meta">
        <div class="chat-timestamp">{{ formatTimestamp(chat.timestamp) }}</div>
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
import { onMounted, ref } from "vue";
import Loading from "./Loading.vue";
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
  const maxLength = 20;
  if (message && message.length > maxLength) {
    return message.slice(0, maxLength) + "...";
  }
  return message || "Нет сообщений";
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
  padding: 10px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
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
  font-size: 15px;
  font-weight: 600;
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
  background-color: #007bff;
  color: white;
  border-radius: 12px;
  padding: 2px 6px;
  font-size: 12px;
}

.chat-list::-webkit-scrollbar {
  width: 6px;
}

.chat-list::-webkit-scrollbar-track {
  background-color: #f9f9f9;
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
