<template>
  <div class="app-container">
    <div class="chat-container">
      <div class="message-section">
        <div class="messages" v-if="messages.length">
          <div
            v-for="(message, index) in messages"
            :key="index"
            :class="['message', message.outgoing ? 'outgoing' : 'incoming']"
          >
            <div class="message-content">
              <p class="message-text">{{ message.text }}</p>
              <div class="message-time">
                {{ formatTimestamp(message.time) }}
              </div>
            </div>
          </div>
        </div>
        <div v-else class="no-messages">Нет сообщений</div>
      </div>
      <div class="input-section">
        <input
          v-model="newMessage"
          @keyup.enter="sendMessage"
          placeholder="Введите сообщение..."
          class="message-input"
        />
        <button @click="sendMessage" class="send-button">Отправить</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.app-header {
  height: 40px;
  background-color: #f0f0f0;
  padding: 10px;
  border-bottom: 1px solid #ddd;
}

.chat-container {
  width: 400px; /* Ширина блока */
  display: flex;
  flex-direction: column;
  flex: 1;
  border: 1px solid #ccc; /* Граница блока */
  border-radius: 10px; /* Закругление углов */
  overflow: hidden; /* Скрыть переполнение */
}

.message-section {
  flex: 1; /* Занимает оставшееся пространство */
  display: flex;
  flex-direction: column;
  overflow-y: auto; /* Прокрутка по вертикали */
  padding: 10px;
  background-color: #f9f9f9; /* Цвет фона */
}

.messages {
  display: flex;
  flex-direction: column;
}

.message {
  margin: 5px 0; /* Отступы между сообщениями */
  max-width: 70%; /* Максимальная ширина сообщения */
  position: relative;
}

.outgoing {
  align-self: flex-end; /* Сообщения пользователя справа */
  background-color: #d1ffd1; /* Цвет фона для исходящих сообщений */
  border-radius: 10px 10px 0 10px; /* Закругление углов */
}

.incoming {
  align-self: flex-start; /* Сообщения собеседника слева */
  background-color: #f1f1f1; /* Цвет фона для входящих сообщений */
  border-radius: 10px 10px 10px 0; /* Закругление углов */
}

.message-content {
  padding: 10px; /* Внутренние отступы для содержимого сообщения */
}

.message-text {
  margin: 0; /* Убираем отступы */
}

.message-time {
  font-size: 0.8em; /* Размер шрифта для времени */
  color: #888; /* Цвет для времени */
  margin-top: 5px; /* Отступ сверху */
}

/* Адаптив под мобильные устройства */
@media (max-width: 768px) {
  .chat-container {
    width: 100%;
  }
  .chat-container {
    height: calc(100vh - 40px);
  }
}
</style>

<script setup>
import { ref } from "vue";

const messages = ref([]);
const newMessage = ref("");

// Функция для форматирования времени
const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

// Функция для отправки сообщения
const sendMessage = () => {
  if (newMessage.value.trim()) {
    messages.value.push({
      text: newMessage.value,
      outgoing: true,
      time: Date.now(),
    });
    newMessage.value = ""; // Очистка поля ввода

    // Имитируем ответ собеседника
    setTimeout(() => {
      messages.value.push({
        text: `Ответ на: "${messages.value[messages.value.length - 1].text}"`,
        outgoing: false,
        time: Date.now(),
      });
    }, 1000);
  }
};
</script>
