<template>
  <!-- <div class="chat-app">
    <div class="header">
      <h1>Чат приложение (Pinia demo)</h1>
      <div class="controls">
        <input v-model="newToken" placeholder="Введите токен" />
        <button @click="initStore">Инициализировать хранилище</button>
      </div>
    </div>

    <div class="content">
      <div class="sidebar">
        <h2>Чаты</h2>
        <div v-for="(chat, id) in chats" :key="id" class="chat-item">
          <h3>{{ chat.title }}</h3>
          <p>Участники: {{ chat.participants.join(", ") }}</p>
          <button @click="selectChat(id)">Открыть</button>
        </div>

        <div class="add-chat">
          <h3>Добавить чат</h3>
          <input v-model="newChat.title" placeholder="Название чата" />
          <input
            v-model="newChat.participants"
            placeholder="Участники (через запятую)"
          />
          <button @click="addNewChat">Добавить</button>
        </div>
      </div>

      <div class="chat-area">
        <div v-if="selectedChat" class="messages">
          <h2>{{ chats[selectedChat]?.title }}</h2>
          <div v-for="(msg, index) in messages" :key="index" class="message">
            <strong>{{ msg.sender }}:</strong> {{ msg.text }}
            <small>{{ new Date(msg.timestamp).toLocaleTimeString() }}</small>
          </div>
        </div>
        <div v-else class="empty-chat">
          <p>Выберите чат для просмотра сообщений</p>
        </div>

        <div v-if="selectedChat" class="message-input">
          <input
            v-model="newMessage"
            placeholder="Введите сообщение"
            @keyup.enter="sendMessage"
          />
          <button @click="sendMessage">Отправить</button>
        </div>
      </div>
    </div>
  </div> -->
</template>

<script setup>
// import { ref, computed } from "vue";
// import { storeToRefs } from "pinia";
// import {
//   addChatsToStore,
//   addMessagesToThread,
//   createThreadInStore,
// } from "@/stores/chatStore/chatHelpers";

// const newToken = ref("user123_token");
// const newChat = ref({
//   title: "",
//   participants: "",
// });
// const selectedChat = ref(null);
// const newMessage = ref("");
// const currentToken = ref(null);

// // Доступ к хранилищу через ваш созданный store
// const currentStore = computed(() => {
//   if (!currentToken.value) return null;
//   return useChatStore(currentToken.value)();
// });

// const { chats, messages } = storeToRefs(currentStore.value || {});

// function initStore() {
//   if (!newToken.value) return;
//   currentToken.value = newToken.value;

//   // Инициализация с тестовыми данными
//   addChatsToStore(currentToken.value, {
//     chat1: {
//       id: "chat1",
//       title: "Основной чат",
//       participants: ["user1", "user2"],
//       createdAt: new Date(),
//     },
//     chat2: {
//       id: "chat2",
//       title: "Технические вопросы",
//       participants: ["user1", "user3"],
//       createdAt: new Date(),
//     },
//   });

//   // Тестовые сообщения
//   createThreadInStore(currentToken.value, "chat1", [
//     {
//       id: "1",
//       text: "Привет! Как дела?",
//       sender: "user1",
//       timestamp: Date.now() - 10000,
//     },
//     {
//       id: "2",
//       text: "Привет! Все отлично!",
//       sender: "user2",
//       timestamp: Date.now() - 5000,
//     },
//   ]);
// }

// function selectChat(chatId) {
//   selectedChat.value = chatId;
//   newMessage.value = "";
// }

// function addNewChat() {
//   if (!newChat.value.title || !newChat.value.participants) return;

//   const chatId = `chat${Date.now()}`;
//   const participants = newChat.value.participants
//     .split(",")
//     .map((p) => p.trim())
//     .filter((p) => p);

//   addChatsToStore(currentToken.value, {
//     [chatId]: {
//       id: chatId,
//       title: newChat.value.title,
//       participants,
//       createdAt: new Date(),
//     },
//   });

//   createThreadInStore(currentToken.value, chatId);

//   newChat.value.title = "";
//   newChat.value.participants = "";
// }

// function sendMessage() {
//   if (!newMessage.value || !selectedChat.value) return;

//   addMessagesToThread(currentToken.value, selectedChat.value, [
//     {
//       id: Date.now().toString(),
//       text: newMessage.value,
//       sender: "Я",
//       timestamp: Date.now(),
//       status: "sent",
//     },
//   ]);

//   newMessage.value = "";
// }
</script>

<style scoped>
.chat-app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  font-family: Arial, sans-serif;
}

.header {
  padding: 1rem;
  background: #2c3e50;
  color: white;
}

.controls {
  margin-top: 1rem;
  display: flex;
  gap: 0.5rem;
}

.content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.sidebar {
  width: 300px;
  padding: 1rem;
  background: #f5f5f5;
  overflow-y: auto;
  border-right: 1px solid #ddd;
}

.chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.messages {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
}

.message {
  margin-bottom: 1rem;
  padding: 0.5rem;
  background: #f0f0f0;
  border-radius: 4px;
}

.message small {
  display: block;
  color: #666;
  font-size: 0.8rem;
}

.message-input {
  padding: 1rem;
  display: flex;
  gap: 0.5rem;
  border-top: 1px solid #ddd;
}

input {
  padding: 0.5rem;
  flex: 1;
  border: 1px solid #ddd;
  border-radius: 4px;
}

button {
  padding: 0.5rem 1rem;
  background: #2c3e50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background: #1a252f;
}

.chat-item {
  margin-bottom: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.add-chat {
  margin-top: 2rem;
  padding: 1rem;
  background: white;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.empty-chat {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
}
</style>
