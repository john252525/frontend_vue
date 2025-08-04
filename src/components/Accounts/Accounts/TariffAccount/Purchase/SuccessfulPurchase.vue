<template>
  <div class="purchase-card success-card">
    <div class="confetti">
      <div
        class="confetti-item"
        v-for="i in 12"
        :key="i"
        :style="confettiStyle(i)"
      ></div>
    </div>

    <div class="icon-wrapper">
      <svg class="checkmark" viewBox="0 0 52 52">
        <circle class="checkmark-circle" cx="26" cy="26" r="25" />
        <path
          class="checkmark-check"
          fill="none"
          d="M14.1 27.2l7.1 7.2 16.7-16.8"
        />
      </svg>
    </div>

    <h2 class="title">Оплата прошла успешно!</h2>

    <div class="purchase-details">
      <div class="detail-item">
        <span class="detail-label">Тариф:</span>
        <span class="detail-value">{{ tariff.name }}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Сумма:</span>
        <span class="detail-value"
          >{{ tariff.price }} {{ tariff.currency }}</span
        >
      </div>
      <div class="detail-item">
        <span class="detail-label">Период:</span>
        <span class="detail-value">{{ getPeriodText(tariff.period) }}</span>
      </div>
    </div>

    <div class="success-message">
      <p>Доступ к тарифу активирован. Наслаждайтесь использованием!</p>
    </div>

    <button class="action-btn" @click="changeTariffStation">
      <span>Продолжить!</span>
      <svg viewBox="0 0 24 24" width="20">
        <path
          fill="currentColor"
          d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"
        />
      </svg>
    </button>
  </div>
</template>

<script setup>
import { defineProps } from "vue";

defineProps({
  tariff: {
    type: Object,
    required: true,
  },
  close: {
    type: Function,
    required: true,
  },
  changeTariffStation: {
    type: Function,
  },
});

const getPeriodText = (period) => {
  const periods = {
    "1m": "1 месяц",
    "3m": "3 месяца",
    "1y": "1 год",
  };
  return periods[period] || period;
};

const confettiStyle = (i) => {
  const colors = ["#4CAF50", "#8BC34A", "#CDDC39", "#FFEB3B"];
  return {
    backgroundColor: colors[i % colors.length],
    transform: `rotate(${i * 30}deg)`,
    left: `${Math.random() * 100}%`,
    animationDelay: `${i * 0.1}s`,
  };
};
</script>

<style scoped>
.purchase-card {
  position: relative;
  max-width: 420px;
  margin: 0 auto;
  padding: 40px 30px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  text-align: center;
  overflow: hidden;
}

.success-card {
  border-top: 4px solid #4caf50;
}

.confetti {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.confetti-item {
  position: absolute;
  width: 8px;
  height: 8px;
  opacity: 0;
  animation: confetti-fall 3s ease-in-out infinite;
}

@keyframes confetti-fall {
  0% {
    opacity: 0;
    transform: translateY(-100px) rotate(0deg);
  }
  20% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translateY(500px) rotate(360deg);
  }
}

.icon-wrapper {
  margin: 0 auto 25px;
  width: 80px;
  height: 80px;
}

.checkmark {
  width: 100%;
  height: 100%;
}

.checkmark-circle {
  stroke: #4caf50;
  stroke-width: 2;
  fill: none;
  animation: circle-anim 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
}

.checkmark-check {
  stroke: #4caf50;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 48;
  stroke-dashoffset: 48;
  animation: check-anim 0.3s 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
}

@keyframes circle-anim {
  0% {
    stroke-dasharray: 0 150;
    stroke-dashoffset: 0;
  }
  100% {
    stroke-dasharray: 150 150;
    stroke-dashoffset: 0;
  }
}

@keyframes check-anim {
  100% {
    stroke-dashoffset: 0;
  }
}

.title {
  font-size: 24px;
  font-weight: 700;
  color: #2e7d32;
  margin-bottom: 25px;
}

.purchase-details {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 25px;
  text-align: left;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

.detail-item:last-child {
  margin-bottom: 0;
}

.detail-label {
  color: #6c757d;
  font-weight: 500;
}

.detail-value {
  color: #212529;
  font-weight: 600;
}

.success-message {
  color: #495057;
  line-height: 1.5;
  margin-bottom: 30px;
  padding: 0 10px;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #4caf50;
  color: white;
  border: none;
  padding: 14px 28px;
  border-radius: 50px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
}

.action-btn:hover {
  background: #3d8b40;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
}

.action-btn:active {
  transform: translateY(0);
}
</style>
