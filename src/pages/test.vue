<template>
  <div>
    <button @click="createYookassaWebhook">Создать YooKassa вебхук</button>
    <div v-if="message">{{ message }}</div>
    <div v-if="error">{{ error }}</div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      message: null,
      error: null,
    };
  },
  methods: {
    async createYookassaWebhook() {
      this.message = null;
      this.error = null;
      try {
        const response = await axios.post(
          "http://213.159.208.139:3000/api/create_yookassa_webhook",
          {}, // передайте тело запроса если требуется
          {
            // передайте headers, если требуется
            // headers: {
            // 'Authorization': 'Bearer your_token',
            // }
          }
        );
        this.message =
          "Вебхук создан успешно: " + JSON.stringify(response.data);
        console.log("Вебхук создан успешно:", response.data);
      } catch (error) {
        console.error("Ошибка при создании вебхука:", error.message, error);
        this.error = `Ошибка при создании вебхука: ${
          error.message
        } ${JSON.stringify(error)}`;
        // Обработайте ошибку.  Можете также добавить сообщение об ошибке
      }
    },
  },
};
</script>
