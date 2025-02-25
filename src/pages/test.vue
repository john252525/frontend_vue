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
        text: "куыыss1hjbvыыssss",
        content: [{ type: "reaction", src: "😀" }],
        hook_type: "add_message_reaction",
        item: "3EB009238C051FCF60849A",
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
<!-- <template>
  <div class="modal">
    <div class="modal-content">
      <span class="close" @click="$emit('close')">&times;</span>
      <h2>Эмодзи по категориям</h2>
      <div v-for="(items, category) in emojis" :key="category">
        <h3>{{ category.charAt(0).toUpperCase() + category.slice(1) }}</h3>
        <div>
          <span v-for="item in items" :key="item.name">
            {{ item.emoji }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      emojis: {}, // Начальное значение для эмодзи
    };
  },
  async mounted() {
    try {
      const response = await fetch("/emojis.json"); // Загружаем JSON файл
      if (!response.ok) {
        throw new Error("Сеть не отвечает");
      }
      const data = await response.json();
      this.emojis = data.emojis; // Сохраняем все категории эмодзи в состоянии компонента
    } catch (error) {
      console.error("Ошибка при загрузке эмодзи:", error);
    }
  },
};
</script>

<style>
.modal {
  display: block;
  position: fixed;
  z-index: 1;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: rgba(0, 0, 0, 0.4);
}

.modal-content {
  background-color: #fefefe;
  margin: 15% auto;
  padding: 20px;
  border: 1px solid #888;
  width: 80%;
}

.close {
  color: #aaa;
  float: right;
  font-size: 28px;
  font-weight: bold;
}

.close:hover,
.close:focus {
  color: black;
  text-decoration: none;
  cursor: pointer;
}
</style> -->
