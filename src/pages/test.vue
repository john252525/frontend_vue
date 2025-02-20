<template>
  <div>
    <h1>События в реальном времени</h1>
    <div v-for="(event, index) in events" :key="index">
      Новое событие: {{ event }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

const events = ref([]); // Массив для хранения событий

onMounted(() => {
  // Создаем новый объект EventSource и указываем URL для подключения
  const eventSource = new EventSource(
    "https://hellychat.apitter.com/api/events"
  );

  // Обработчик для получения событий
  eventSource.onmessage = (event) => {
    // Добавляем полученные события в массив
    events.value.push(event.data);
  };

  // Обработчик ошибок
  eventSource.onerror = (error) => {
    console.error("Ошибка SSE:", error);
    eventSource.close(); // Закрываем соединение при ошибке
  };
});
</script>

<style scoped>
/* Добавьте стили по вашему усмотрению */
</style>
