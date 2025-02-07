<template>
  <div>
    <h1>Chat Application</h1>
    <button @click="getChats">Get Chats</button>
    <button @click="getChatMessages">Get Chat Messages</button>
    <button @click="sendMessage">Send Message</button>

    <div v-if="chats.length">
      <h2>Chats</h2>
      <ul>
        <li v-for="chat in chats" :key="chat.uniq">
          {{ chat.uniq }} - {{ chat.timestamp }}
        </li>
      </ul>
    </div>

    <div v-if="messages.length">
      <h2>Messages</h2>
      <ul>
        <li v-for="message in messages" :key="message.uniq">
          {{ message.payload }}
        </li>
      </ul>
    </div>

    <div v-if="error">{{ error }}</div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      source: "whatsapp",
      token: "9bddaafd-2c8d-4840-96d5-1c19c0bb4bd5",
      login: "helly",
      chats: [],
      messages: [],
      error: null,
    };
  },
  methods: {
    async getChats() {
      try {
        const response = await axios.post(
          `http://localhost:3000/api/getChats`,
          {
            source: this.source,
            token: this.token,
            login: this.login,
          }
        );
        this.chats = response.data;
        this.error = null; // Очистить ошибки
      } catch (err) {
        this.error =
          "Error fetching chats: " + (err.response?.data || err.message);
      }
    },
    async getChatMessages() {
      try {
        const response = await axios.post(
          `http://localhost:3000/api/getChatMessages`,
          {
            source: this.source,
            token: this.token,
            login: this.login,
          }
        );
        this.messages = response.data;
        this.error = null; // Очистить ошибки
      } catch (err) {
        this.error =
          "Error fetching chat messages: " +
          (err.response?.data || err.message);
      }
    },
    async sendMessage() {
      const messageData = {
        source: this.source,
        token: this.token,
        login: this.login,
        message: "Hello, World!", // Здесь можно добавить динамическое сообщение
      };
      try {
        const response = await axios.post(
          `http://localhost:3000/api/sendMessage`,
          messageData
        );
        if (response.data.status === "ok") {
          this.error = null; // Очистить ошибки
          this.messages.push({
            payload: messageData.message,
            uniq: Date.now(),
          }); // Добавить сообщение в список
        } else {
          this.error = "Error sending message: " + response.data.message;
        }
      } catch (err) {
        this.error =
          "Error sending message: " + (err.response?.data || err.message);
      }
    },
  },
};
</script>

<style scoped>
/* Добавьте стили по необходимости */
h1 {
  color: #333;
}
button {
  margin: 5px;
}
ul {
  list-style-type: none;
  padding: 0;
}
</style>
