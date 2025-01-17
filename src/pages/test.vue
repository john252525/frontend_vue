<template>
  <div class="app-container">
    <header class="app-header">
      <!-- Ваш контент хедера -->
      <p>Это хедер</p>
    </header>
    <div class="app-content">
      <aside class="chat-list-aside">
        <div class="chat-list-scroll">
          <!-- Здесь будет список чатов -->
          <ul>
            <li v-for="chat in chats" :key="chat.id" class="chat-item">
              {{ chat.name }}
            </li>
          </ul>
        </div>
      </aside>

      <main class="chat-main">
        <div class="chat-messages-scroll">
          <!-- Здесь будут сообщения -->
          <div
            v-for="message in messages"
            :key="message.id"
            class="chat-message"
          >
            <p>{{ message.text }}</p>
          </div>
        </div>

        <div class="message-input-container">
          <input
            type="text"
            placeholder="Написать сообщение..."
            v-model="newMessage"
            @keydown.enter="sendMessage"
            class="message-input"
          />
          <button @click="sendMessage" class="send-button">Отправить</button>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  height: 50vh;
  overflow: hidden; /* отключаем скролл */
}

.app-content {
  display: grid;
  grid-template-columns: 250px 1fr; /* Боковая панель и основная область */
  flex: 1;
}

/* Боковая панель чатов */
.chat-list-aside {
  background-color: #f0f0f0; /* Цвет фона боковой панели */
  border-right: 1px solid #ddd; /* Разделительная линия */
  display: flex;
  flex-direction: column;
}

.chat-list-scroll {
  overflow-y: auto;
  padding: 10px;
  flex: 1;
}

.chat-item {
  padding: 10px;
  cursor: pointer;
  border-bottom: 1px solid #ddd;
}

.chat-item:hover {
  background-color: #e0e0e0;
}

/* Основная область чата */
.chat-main {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.chat-messages-scroll {
  flex: 1; /* Занимает свободное пространство */
  overflow-y: auto;
  padding: 10px;
}

.chat-message {
  background-color: #e0f7fa;
  padding: 10px;
  border-radius: 5px;
  margin-bottom: 10px;
}

/* Блок ввода сообщений */
.message-input-container {
  display: flex;
  padding: 10px;
  border-top: 1px solid #ddd; /* Разделительная линия */
}

.message-input {
  flex: 1; /* Занимает всё свободное место */
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  margin-right: 10px;
}

.send-button {
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 5px;
  cursor: pointer;
}

.send-button:hover {
  background-color: #367c39;
}

/* Адаптив под мобильные устройства */
@media (max-width: 768px) {
  .app-container {
    grid-template-columns: 1fr; /* Боковая панель убирается */
  }

  .chat-list-aside {
    display: none; /* Скрываем боковую панель на мобильных */
  }

  .chat-main {
    height: calc(100vh - 40px);
  }
}
</style>

<script>
export default {
  data() {
    return {
      chats: [
        { id: 1, name: "Chat 1" },
        { id: 2, name: "Chat 2" },
        { id: 3, name: "Chat 3" },
      ],
      messages: [
        { id: 1, text: "Привет" },
        { id: 2, text: "Как дела?" },
      ],
      newMessage: "",
    };
  },
  methods: {
    sendMessage() {
      if (this.newMessage.trim() !== "") {
        this.messages.push({
          id: this.messages.length + 1,
          text: this.newMessage,
        });
        this.newMessage = "";
      }
    },
  },
};
</script>
