<template>
  <div>
    <h1>Отправка вебхука</h1>
    <button @click="sendWebhook">Отправить вебхук</button>
    <p v-if="responseMessage">{{ responseMessage }}</p>
    <p v-if="errorMessage" style="color: red">{{ errorMessage }}</p>
  </div>
</template>

<script>
import axios from "axios";
const timestampInMicroseconds = 1740396250000000;
const timestampInSeconds = timestampInMicroseconds / 1000000;
console.log(timestampInSeconds);

const formatTimestamp = (timestamp) => {
  let seconds;

  // Проверяем, в каком формате передан timestamp
  if (timestamp > 1_000_000_000) {
    // Если больше 1 миллиарда, значит это микросекунды
    seconds = timestamp / 1_000_000; // Переводим в секунды
  } else {
    seconds = timestamp;
  }

  const date = new Date(seconds * 1000); // Умножаем на 1000 для перевода в миллисекунды
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

console.log(formatTimestamp(1740425496));
export default {
  data() {
    return {
      responseMessage: "",
      errorMessage: "",
    };
  },
  methods: {
    async sendWebhook() {
      const message = {
        time: 1740422296000000,
        thread: "79198670001@c.us",
        outgoing: true,
        replyTo: null,
        text: "куыыss1hjbvыыsss",
        content: [{ type: "server", src: "" }],
        hook_type: "message",
        item: "3sEB09C8Ess089ss0C2s684C28C0",
      };

      try {
        const response = await axios.post(
          "http://localhost:4000/api/webhook",
          message
        );
        this.responseMessage = "Вебхук успешно отправлен: " + response.data;
        this.errorMessage = ""; // очищаем сообщение об ошибке
      } catch (error) {
        this.errorMessage = "Ошибка при отправке вебхука: " + error.message;
        this.responseMessage = ""; // очищаем сообщение об успехе
      }
    },
  },
};
</script>

<style scoped>
/* Добавьте стили, если необходимо */
</style>

Найти еще
