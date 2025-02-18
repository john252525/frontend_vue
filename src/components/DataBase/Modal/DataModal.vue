<template>
  <div @click="close" class="black-fon"></div>
  <section class="chats-data-modal">
    <div ref="jsonContainer" class="json-container"></div>
  </section>
</template>

<script setup>
import { ref, onMounted, toRefs } from "vue";
import JSONFormatter from "json-formatter-js";

// Определяем свойства компонента
const props = defineProps({
  data: {
    type: Object,
    required: true, // Убедитесь, что данные обязательны
  },
  close: {
    type: Function,
    required: true,
  },
});

// Достаем данные из props
const { data } = toRefs(props);
const jsonContainer = ref(null);

onMounted(() => {
  // Создаем форматтер для JSON
  const formatter = new JSONFormatter(data.value);
  // Добавляем отформатированные данные в контейнер
  jsonContainer.value.appendChild(formatter.render());
});
</script>

<style scoped>
.chats-data-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
  border-radius: 5px;
  width: 400px;
  height: 600px;
  background: #fff;
  display: flex;
  align-items: center;
  /* justify-content: center; */
  /* flex-direction: column; */
  overflow: hidden;
}

.black-fon {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5); /* Полупрозрачный черный фон */
  z-index: 5; /* Под модальным окном */
}

.chats-data-modal.fade-enter-active,
.chats-data-modal.fade-leave-active {
  transition: opacity 0.5s ease;
}
.chats-data-modal.fade-enter,
.chats-data-modal.fade-leave-to {
  opacity: 0;
}

.chats-data-modal {
  animation: fadeIn 0.5s forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translate(-50%, -48%);
  }
  to {
    opacity: 1;
  }
}

@media (max-width: 430px) {
  .chats-data-modal {
    width: 300px;
    height: 600px;
  }
}
</style>
