<template>
  <section v-if="dsds" class="loading-section-true">
    <h2 class="title">
      <img src="/account/gal.svg" alt="" /> Операция успешно выполнена
    </h2>
    <div class="timer-bar" :style="{ width: timerWidth }"></div>
  </section>
  <button @click="startTimer">dasdasdas</button>
</template>

<script setup>
import { toRefs, ref, defineProps, onMounted, onUnmounted, watch } from "vue";

const props = defineProps({
  stationLoading: {
    type: Object,
    required: true,
  },
});

const { stationLoading } = toRefs(props);

const dsds = ref(false);

// Реактивные переменные для таймера
const remainingTime = ref(5); // Таймер на 5 секунд
const timerWidth = ref("100%"); // Начальная ширина полоски
let interval = null;

const startTimer = () => {
  remainingTime.value = 5; // Сброс таймера на 5 секунд
  timerWidth.value = "100%"; // Сброс ширины полоски

  interval = setInterval(() => {
    remainingTime.value -= 1; // Уменьшаем оставшееся время
    const widthPercentage = (remainingTime.value / 5) * 100; // Вычисляем ширину полоски
    timerWidth.value = `${widthPercentage}%`;

    if (remainingTime.value <= 0) {
      clearInterval(interval);
      timerWidth.value = "0%"; // Сброс ширины полоски
    }
  }, 1000); // Обновляем каждую секунду
};

onMounted(() => {
  if (stationLoading.modalStation) {
    startTimer();
  }
});
</script>

<style scoped>
.loading-section-true {
  border: 0.5px solid #79f8c1;
  border-radius: 5px;
  width: 314px;
  height: 60px;
  box-shadow: -4px 4px 8px 0 rgba(0, 0, 0, 0.06),
    0 0 4px 0 rgba(85, 255, 195, 0.04);
  background: #deecd2;
  position: fixed;
  z-index: 100;
  top: 5px;
  right: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.title {
  font-weight: 600;
  font-size: 16px;
  color: #1b632b;
  display: flex;
  align-items: center;
  gap: 6px;
}

.timer-bar {
  position: absolute; /* Изменено на absolute для правильного позиционирования */
  height: 10px; /* Высота полоски таймера */
  background-color: rgba(255, 255, 255, 0.7); /* Цвет полоски таймера */
  transition: width 1s linear; /* Плавное изменение ширины */
  bottom: 10px; /* Позиционирование полоски внизу секции */
  left: 0; /* Начало полоски от левого края */
}

.loading-section-true,
.fade-leave-active {
  transition: opacity 0.5s ease;
}
.loading-section-true,
.fade-leave-to {
  opacity: 0;
}

.loading-section-true {
  animation: fadeIn 0.5s forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@media (max-width: 1000px) {
  .loading-section {
    width: 250px;
    height: 25px;
    top: 90px;
    right: 15px;
  }

  .loading-section-true {
    width: 250px;
    height: 25px;
    top: 90px;
    right: 15px;
  }
}

@media (max-width: 550px) {
  .loading-section {
    width: 150px;
    height: 20px;
    top: 90px;
    right: 15px;
  }

  .loading-section-true {
    width: 150px;
    height: 20px;
    top: 90px;
    right: 15px;
  }

  .title {
    font-size: 14px;
    font-weight: 600;
    color: rgb(51, 51, 51);
  }
}
</style>

Найти еще
