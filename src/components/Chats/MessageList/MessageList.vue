<template>
  <section class="message-section">
    <header class="user-info-section">
      <h2 class="name-user">{{ chatInfo.name }}</h2>
    </header>
    <div class="messages">
      <div
        v-for="message in messages"
        :key="message.item"
        :class="['message', message.outgoing ? 'outgoing' : 'incoming']"
      >
        <div class="message-content">
          <p class="message-text">{{ message.text }}</p>
          <div class="message-time">{{ message.time }}</div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, watch, toRefs } from "vue";
import axios from "axios";
const props = defineProps({
  chatInfo: {
    type: Object,
  },
});
const { chatInfo } = toRefs(props);
const messages = ref(null);
const test = async () => {
  console.log(localStorage.getItem("accountToken"));
  try {
    const response = await axios.post(
      "https://b2288.apitter.com/instances/getChatMessages",
      {
        source: "whatsapp",
        login: "helly",
        to: chatInfo.value.phone,
      },
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: `Bearer ${localStorage.getItem("accountToken")}`,
        },
      }
    );
    console.log(response.data);
    if (response.data.ok === true) {
      messages.value = response.data.data.messages;
      console.log(response.data);
    } else {
      console.log(response.data.ok);
    }
  } catch (error) {
    console.error("Ошибка при создании аккаунта:", error);
    if (error.response) {
      console.error("Ошибка сервера:", error.response.data);
    }
  }
};
const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp / 1000); // Преобразуем миллисекунды в секунды
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

// Форматирование текста сообщения (обрезка длинных сообщений)
const formatMessageText = (text) => {
  const maxLength = 50; // Максимальная длина строки
  return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
};

watch(
  () => chatInfo.value,
  (newPhone) => {
    test();
  }
);

onMounted(test);
</script>

<style scoped>
.messages {
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 10px;
  overflow-y: auto; /* Прокрутка, если сообщений много */
  height: 90vh; /* Высота на весь экран */
}

.message-section {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.user-info-section {
  width: 100%;
  height: 40px;
  /* border-bottom: 1px solid #ebebeb; */
  display: flex;
  align-items: center;
  justify-content: center;
}

.name-user {
  font-size: 16px;
  font-weight: 500;
}

.message {
  margin: 5px 15px;
  max-width: 70%; /* Максимальная ширина сообщения */
  border-radius: 10px; /* Закругление углов */
  padding: 10px;
  position: relative; /* Для абсолютного позиционирования времени */
}

.outgoing {
  align-self: flex-end; /* Выравнивание вправо для исходящих сообщений */
  background-color: #e1ffc7; /* Цвет фона для исходящих сообщений */
}

.incoming {
  align-self: flex-start; /* Выравнивание влево для входящих сообщений */
  background-color: #f1f1f1; /* Цвет фона для входящих сообщений */
}

.message-content {
  display: flex;
  flex-direction: column;
}

.message-time {
  font-size: 12px; /* Размер шрифта для времени */
  color: #888; /* Цвет для времени */
  margin-top: 5px; /* Отступ сверху */
}
</style>
