<template>
  <div class="scroll-container" ref="scrollContainer">
    <div class="content">
      <!-- Здесь можно добавить любой контент -->
      <p v-for="i in 100" :key="i">Элемент {{ i }}</p>
    </div>
  </div>
  <button @click="scrollToBottom">Опустить вниз</button>
</template>

<script setup>
import { ref } from "vue";

const scrollContainer = ref(null);

const scrollToBottom = () => {
  if (scrollContainer.value) {
    scrollContainer.value.scrollTop = scrollContainer.value.scrollHeight;
  }
};
</script>

<style scoped>
.scroll-container {
  height: 300px; /* Высота контейнера */
  overflow-y: auto; /* Вертикальный скролл */
  border: 1px solid #ccc; /* Рамка для визуального эффекта */
}

.content {
  padding: 10px; /* Отступы внутри контейнера */
}
</style>
