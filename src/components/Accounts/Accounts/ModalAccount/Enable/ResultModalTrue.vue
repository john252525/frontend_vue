<template>
  <div class="activation-success-modal">
    <!-- Конфити-бэкграунд -->
    <div class="confetti-container">
      <div
        v-for="(c, i) in confetti"
        :key="i"
        class="confetti"
        :style="c.style"
      ></div>
    </div>

    <!-- Основное содержимое -->
    <div class="success-animation">
      <svg class="checkmark" viewBox="0 0 52 52">
        <circle class="checkmark-circle" cx="26" cy="26" r="25" />
        <path
          class="checkmark-check"
          fill="none"
          d="M14.1 27.2l7.1 7.2 16.7-16.8"
        />
      </svg>
    </div>

    <div class="modal-content">
      <h2 class="modal-title">{{ t("result.true") }}</h2>
      <p class="modal-text">Ваш аккаунт успешно активирован!</p>

      <button class="action-button" @click="closeAll">Продолжить</button>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from "vue-i18n";
import { ref, onMounted } from "vue";

const props = defineProps({
  changeEnableStation: {
    type: Function,
  },
  changeChallengeRequired: {
    type: Function,
  },
});

const { t } = useI18n();

const confetti = ref([]);

const closeAll = () => {
  props.changeChallengeRequired();
  props.changeEnableStation();
};

const createConfetti = () => {
  const colors = [
    "#4CAF50",
    "#8BC34A",
    "#CDDC39",
    "#FFEB3B",
    "#FFC107",
    "#FF9800",
    "#FF5722",
    "#E91E63",
    "#9C27B0",
  ];
  const shapes = ["circle", "rectangle", "triangle"];

  for (let i = 0; i < 80; i++) {
    confetti.value.push({
      style: {
        backgroundColor: colors[Math.floor(Math.random() * colors.length)],
        left: `${Math.random() * 100}%`,
        top: `${-10 - Math.random() * 20}%`,
        width: `${6 + Math.random() * 10}px`,
        height: `${6 + Math.random() * 10}px`,
        transform: `rotate(${Math.random() * 360}deg)`,
        animationDuration: `${3 + Math.random() * 4}s`,
        animationDelay: `${Math.random() * 0.5}s`,
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        opacity: 0.8,
      },
    });
  }
};

onMounted(() => {
  createConfetti();
});
</script>

<style scoped>
.activation-success-modal {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  width: 100%;
  position: relative;
  overflow: hidden;
}

.confetti-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.confetti {
  position: absolute;
  opacity: 0;
  animation: confettiFall linear forwards;
}

.confetti.circle {
  border-radius: 50%;
}

.confetti.triangle {
  width: 0;
  height: 0;
  background-color: transparent !important;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-bottom: 16px solid currentColor;
}

.success-animation {
  margin: 0 auto 25px;
  width: 80px;
  height: 80px;
  position: relative;
  z-index: 2;
}

.checkmark {
  width: 100%;
  height: 100%;
  position: relative;
  z-index: 2;
}

.checkmark-circle {
  stroke: #e0f7e9;
  stroke-width: 3;
  fill: none;
  animation: circleAnimation 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
}

.checkmark-check {
  stroke: #4caf50;
  stroke-width: 4;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 48;
  stroke-dashoffset: 48;
  animation: checkmarkAnimation 0.6s cubic-bezier(0.65, 0, 0.45, 1) 0.4s
    forwards;
}

.modal-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 2;
}

.modal-title {
  font-size: 20px;
  font-weight: 600;
  color: #2e7d32;
  margin-bottom: 12px;
  animation: fadeIn 0.5s 0.6s both;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.modal-text {
  font-size: 15px;
  color: #616161;
  margin-bottom: 25px;
  line-height: 1.5;
  animation: fadeIn 0.5s 0.7s both;
}

.action-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 24px;
  background: linear-gradient(to right, #4caf50, #66bb6a);
  color: white;
  border: none;
  border-radius: 30px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
  animation: fadeIn 0.5s 0.8s both;
  position: relative;
  z-index: 2;
}

.action-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
  background: linear-gradient(to right, #43a047, #5cb85c);
}

.action-button:active {
  transform: translateY(0);
}

.arrow-icon {
  width: 16px;
  height: 16px;
  margin-left: 8px;
  transition: transform 0.3s ease;
}

.action-button:hover .arrow-icon {
  transform: translateX(3px);
}

/* Анимации */
@keyframes circleAnimation {
  0% {
    stroke-dasharray: 166;
    stroke-dashoffset: 166;
    stroke-width: 3;
  }
  100% {
    stroke-dasharray: 166;
    stroke-dashoffset: 0;
    stroke-width: 3;
  }
}

@keyframes checkmarkAnimation {
  from {
    stroke-dashoffset: 48;
  }
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes confettiFall {
  0% {
    opacity: 1;
    transform: translateY(0) rotate(0deg);
  }
  100% {
    opacity: 0;
    transform: translateY(100vh) rotate(360deg);
  }
}

/* Эффект "пульсации" для иконки успеха */
@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

.success-animation {
  animation: pulse 1.5s infinite 1s;
}
</style>
