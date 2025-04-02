<template>
  <div>
    <h1>Имитатор вебхука</h1>
    <button @click="sendWebhook">Отправить вебхук</button>
    <p v-if="response">Ответ от сервера: {{ response }}</p>
    <p v-if="error" style="color: red">Ошибка: {{ error }}</p>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      response: null,
      error: null,
    };
  },
  methods: {
    async sendWebhook() {
      const webhookUrl = "http://localhost:4000/api/webhook";

      const webhookData = {
        outgoing: false,
        text: "Конffffечно, у него!",
        from: "user_id-7373234304",
        to: "79228556998",
        // content: [
        //   {
        //     type: "has_seen",
        //     src: "",
        //   },
        // ],
        content: [],
        item: 9431,
        thread: "user_id-953111621",
        time: 1743515124000000,
        source: "telegram",
        replyTo: null,
        hook_type: "message",
      };

      try {
        const response = await axios.post(webhookUrl, webhookData, {
          params: {
            login: "79228933680", // Замените на ваш логин
            token: "9bddaafd-2c8d-4840-96d5-1c19c0bb4bd5", // Замените на ваш токен
            source: "telegram", // Замените на источник, если нужно
          },
        });
        this.response = response.data;
        this.error = null; // Сброс ошибки
      } catch (error) {
        this.error = error.message;
        this.response = null; // Сброс ответа
      }
    },
  },
};
</script>

<style scoped>
/* Добавьте стили, если нужно */
</style>
