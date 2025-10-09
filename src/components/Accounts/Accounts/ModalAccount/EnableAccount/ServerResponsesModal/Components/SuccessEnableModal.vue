<template>
  <div class="auth-success-container">
    <!-- Анимированный фон с конфетти -->
    <div class="confetti-background">
      <div
        class="confetti-piece"
        v-for="n in 30"
        :key="n"
        :style="getConfettiStyle(n)"
      ></div>
    </div>

    <!-- Основной контент -->
    <div class="success-content">
      <!-- Анимированная иконка успеха -->
      <div class="success-animation">
        <div class="checkmark-container">
          <svg class="checkmark" viewBox="0 0 52 52">
            <circle class="checkmark-circle" cx="26" cy="26" r="25" />
            <path
              class="checkmark-check"
              fill="none"
              d="M14.1 27.2l7.1 7.2 16.7-16.8"
            />
          </svg>
        </div>

        <!-- Светящийся эффект -->
        <div class="glow-effect"></div>
      </div>

      <!-- Текст успеха -->
      <div class="success-text">
        <h2 class="success-title">Аккаунт успешно привязан!</h2>
        <p class="success-description">
          Теперь вы можете использовать все функции приложения
        </p>
      </div>

      <!-- Детали аккаунта в стиле летающих карточек -->
      <div class="account-cards">
        <div class="account-card card-login" :style="getCardStyle(0)">
          <div class="card-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
              />
            </svg>
          </div>
          <div class="card-content">
            <span class="card-label">Логин</span>
            <span class="card-value">{{ accountInfo.login }}</span>
          </div>
        </div>

        <div class="account-card card-source" :style="getCardStyle(1)">
          <div class="card-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 16H9v-6h2v6zm4 0h-2v-6h2v6z"
              />
            </svg>
          </div>
          <div class="card-content">
            <span class="card-label">Источник</span>
            <span class="card-value">{{ accountInfo.source }}</span>
          </div>
        </div>

        <div
          class="account-card card-storage"
          v-if="accountInfo.storage"
          :style="getCardStyle(2)"
        >
          <div class="card-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V6h5.17l2 2H20v10z"
              />
            </svg>
          </div>
          <div class="card-content">
            <span class="card-label">Хранилище</span>
            <span class="card-value">{{ accountInfo.storage }}</span>
          </div>
        </div>
      </div>

      <!-- Статус и действия -->
      <div class="status-section">
        <div class="status-indicator">
          <div class="status-pulse"></div>
          <div class="status-dot"></div>
          <span class="status-text">Аккаунт активен</span>
        </div>

        <div class="action-buttons">
          <button class="btn btn-primary" @click="handleContinue">
            <span>Продолжить</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
            </svg>
          </button>

          <button class="btn btn-outline" @click="handleViewDetails">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"
              />
            </svg>
            <span>Детали</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

// Props для получения информации об аккаунте
const props = defineProps({
  accountInfo: {
    type: Object,
    default: () => ({
      login: "user@example.com",
      source: "Telegram",
      storage: "Основное",
    }),
  },
});

// Emits для событий
const emit = defineEmits(["continue", "view-details"]);

// Стили для конфетти (летящих в разные стороны)
const getConfettiStyle = (index) => {
  const colors = [
    "#10b981",
    "#3b82f6",
    "#8b5cf6",
    "#f59e0b",
    "#ef4444",
    "#06b6d4",
    "#84cc16",
  ];
  const shapes = ["rect", "circle", "rect", "circle", "rect"];

  // Разные направления полета
  const directions = [
    { x: -1, y: -1 }, // верх-лево
    { x: 1, y: -1 }, // верх-право
    { x: -1, y: 1 }, // низ-лево
    { x: 1, y: 1 }, // низ-право
    { x: 0, y: -1 }, // прямо вверх
    { x: -1, y: 0 }, // прямо влево
    { x: 1, y: 0 }, // прямо вправо
  ];

  const direction = directions[index % directions.length];
  const size = 8 + Math.random() * 12;

  return {
    "--confetti-color": colors[index % colors.length],
    "--confetti-shape": shapes[index % shapes.length],
    "--confetti-size": `${size}px`,
    "--confetti-delay": `${index * 0.1}s`,
    "--confetti-duration": `${1 + Math.random() * 1}s`,
    "--confetti-distance-x": `${100 * direction.x}vw`,
    "--confetti-distance-y": `${100 * direction.y}vh`,
    "--confetti-rotation": `${Math.random() * 720}deg`,
  };
};

// Стили для карточек с разной анимацией
const getCardStyle = (index) => {
  const delays = ["0.2s", "0.4s", "0.6s"];
  const rotations = ["-5deg", "3deg", "-3deg"];

  return {
    "animation-delay": delays[index],
    transform: `rotate(${rotations[index]})`,
  };
};

// Обработчики событий
const handleContinue = () => {
  emit("continue");
};

const handleViewDetails = () => {
  emit("view-details");
};

// Запуск анимаций при монтировании
onMounted(() => {
  // Анимации запускаются автоматически через CSS
});
</script>

<style scoped>
.auth-success-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 600px;
  padding: 40px 24px;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  border-radius: 24px;
  position: relative;
  overflow: hidden;
}

/* Конфетти фон */
.confetti-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  overflow: hidden;
}

/* Основной контент */
.success-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 40px;
  max-width: 440px;
  width: 100%;
  position: relative;
  z-index: 1;
}

/* Анимация успеха */
.success-animation {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 140px;
  height: 140px;
}

.checkmark-container {
  width: 100px;
  height: 100px;
  position: relative;
  z-index: 2;
}

.checkmark {
  width: 100%;
  height: 100%;
  animation: scaleIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
}

.checkmark-circle {
  stroke: #10b981;
  stroke-width: 3;
  stroke-dasharray: 166;
  stroke-dashoffset: 166;
  stroke-miterlimit: 10;
  fill: none;
  animation: stroke 0.8s cubic-bezier(0.65, 0, 0.45, 1) forwards;
  filter: drop-shadow(0 0 8px rgba(16, 185, 129, 0.4));
}

.checkmark-check {
  transform-origin: 50% 50%;
  stroke: #10b981;
  stroke-width: 3;
  stroke-dasharray: 48;
  stroke-dashoffset: 48;
  animation: stroke 0.4s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards;
}

.glow-effect {
  position: absolute;
  width: 160px;
  height: 160px;
  background: radial-gradient(
    circle,
    rgba(16, 185, 129, 0.2) 0%,
    transparent 70%
  );
  border-radius: 50%;
  animation: pulseGlow 2s ease-in-out infinite;
}

/* Текст успеха */
.success-text {
  text-align: center;
}

.success-title {
  font-size: 32px;
  font-weight: 800;
  color: white;
  margin: 0 0 16px 0;
  text-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.success-description {
  font-size: 18px;
  color: #94a3b8;
  margin: 0;
  line-height: 1.6;
  font-weight: 500;
}

/* Карточки аккаунта */
.account-cards {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
}

.account-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 24px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  animation: cardSlideUp 0.6s ease-out forwards;
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.3s ease;
}

.account-card:hover {
  transform: translateY(-2px) rotate(var(--rotation, 0deg));
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.2);
}

.card-login {
  --rotation: -1deg;
}

.card-source {
  --rotation: 1deg;
}

.card-storage {
  --rotation: -0.5deg;
}

.card-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
  border-radius: 12px;
  color: white;
  flex-shrink: 0;
}

.card-source .card-icon {
  background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
}

.card-storage .card-icon {
  background: linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%);
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.card-label {
  font-size: 14px;
  font-weight: 600;
  color: #cbd5e1;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.card-value {
  font-size: 16px;
  font-weight: 700;
  color: white;
}

/* Секция статуса */
.status-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  width: 100%;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 24px;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: 20px;
  position: relative;
}

.status-pulse {
  position: absolute;
  width: 100%;
  height: 100%;
  background: rgba(16, 185, 129, 0.2);
  border-radius: 20px;
  animation: statusPulse 2s ease-in-out infinite;
}

.status-dot {
  width: 8px;
  height: 8px;
  background: #10b981;
  border-radius: 50%;
  position: relative;
  z-index: 1;
  animation: dotPulse 1.5s ease-in-out infinite;
}

.status-text {
  font-size: 14px;
  font-weight: 600;
  color: #10b981;
  position: relative;
  z-index: 1;
}

.action-buttons {
  display: flex;
  gap: 16px;
}

.btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 28px;
  border: none;
  border-radius: 14px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.btn::before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
  transition: left 0.5s ease;
}

.btn:hover::before {
  left: 100%;
}

.btn-primary {
  background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
  color: white;
  box-shadow: 0 8px 24px rgba(16, 185, 129, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(16, 185, 129, 0.4);
}

.btn-outline {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
}

.btn-outline:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
  border-color: rgba(255, 255, 255, 0.3);
}

/* Анимации */
@keyframes confettiFly {
  0% {
    opacity: 1;
    transform: translate(0, 0) rotate(0deg);
  }
  100% {
    opacity: 0;
    transform: translate(var(--confetti-distance-x), var(--confetti-distance-y))
      rotate(var(--confetti-rotation));
  }
}

@keyframes scaleIn {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  70% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes stroke {
  100% {
    stroke-dashoffset: 0;
  }
}

@keyframes pulseGlow {
  0%,
  100% {
    opacity: 0.6;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.1);
  }
}

@keyframes cardSlideUp {
  0% {
    opacity: 0;
    transform: translateY(30px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes statusPulse {
  0%,
  100% {
    opacity: 0.5;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.05);
  }
}

@keyframes dotPulse {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(16, 185, 129, 0);
  }
}

/* Адаптивность */
@media (max-width: 640px) {
  .auth-success-container {
    padding: 24px 16px;
    min-height: 500px;
  }

  .success-content {
    gap: 32px;
  }

  .success-title {
    font-size: 28px;
  }

  .success-description {
    font-size: 16px;
  }

  .account-card {
    padding: 16px 20px;
  }

  .action-buttons {
    flex-direction: column;
    width: 100%;
  }

  .btn {
    justify-content: center;
  }
}
</style>
