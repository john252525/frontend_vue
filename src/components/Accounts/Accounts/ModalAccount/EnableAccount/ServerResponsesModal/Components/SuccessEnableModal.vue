<template>
  <div class="auth-success-container">
    <!-- Анимированный фон -->
    <div class="background-effects">
      <div class="floating-circle circle-1"></div>
      <div class="floating-circle circle-2"></div>
      <div class="floating-circle circle-3"></div>
      <div class="floating-particle particle-1"></div>
      <div class="floating-particle particle-2"></div>
      <div class="floating-particle particle-3"></div>
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

        <!-- Конфетти эффект -->
        <div class="confetti">
          <div
            class="confetti-piece"
            v-for="n in 20"
            :key="n"
            :style="getConfettiStyle(n)"
          ></div>
        </div>
      </div>

      <!-- Текст успеха -->
      <div class="success-text">
        <h2 class="success-title">Аккаунт успешно привязан!</h2>
        <p class="success-description">
          Теперь вы можете использовать все функции приложения
        </p>
      </div>

      <!-- Детали аккаунта -->
      <div class="account-details" v-if="accountInfo">
        <div class="detail-item">
          <div class="detail-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
              />
            </svg>
          </div>
          <span class="detail-label">Логин:</span>
          <span class="detail-value">{{ accountInfo.login }}</span>
        </div>

        <div class="detail-item">
          <div class="detail-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 16H9v-6h2v6zm4 0h-2v-6h2v6z"
              />
            </svg>
          </div>
          <span class="detail-label">Источник:</span>
          <span class="detail-value">{{ accountInfo.source }}</span>
        </div>

        <div class="detail-item" v-if="accountInfo.storage">
          <div class="detail-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V6h5.17l2 2H20v10z"
              />
            </svg>
          </div>
          <span class="detail-label">Хранилище:</span>
          <span class="detail-value">{{ accountInfo.storage }}</span>
        </div>
      </div>

      <!-- Статус и действия -->
      <div class="status-actions">
        <div class="status-badge">
          <div class="status-dot active"></div>
          <span>Активный</span>
        </div>

        <div class="action-buttons">
          <button class="btn btn-primary" @click="handleContinue">
            <span>Продолжить</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
            </svg>
          </button>

          <button class="btn btn-secondary" @click="handleViewDetails">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"
              />
            </svg>
            <span>Детали</span>
          </button>
        </div>
      </div>

      <!-- Прогресс следующих шагов -->
      <div class="next-steps">
        <h4 class="steps-title">Что дальше?</h4>
        <div class="steps-list">
          <div class="step-item completed">
            <div class="step-icon">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
            </div>
            <span class="step-text">Привязка аккаунта</span>
          </div>

          <div class="step-item current">
            <div class="step-icon">2</div>
            <span class="step-text">Настройка профиля</span>
          </div>

          <div class="step-item">
            <div class="step-icon">3</div>
            <span class="step-text">Начало работы</span>
          </div>
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

// Стили для конфетти
const getConfettiStyle = (index) => {
  const colors = ["#10b981", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444"];
  const rotations = [0, 45, 90, 135];

  return {
    "--confetti-color": colors[index % colors.length],
    "--confetti-rotation": `${rotations[index % rotations.length]}deg`,
    "--confetti-delay": `${index * 0.1}s`,
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
  // Можно добавить дополнительные анимации при появлении
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
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 24px;
  position: relative;
  overflow: hidden;
}

/* Анимированный фон */
.background-effects {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.floating-circle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.1;
  animation: float 6s ease-in-out infinite;
}

.circle-1 {
  width: 120px;
  height: 120px;
  background: #10b981;
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.circle-2 {
  width: 80px;
  height: 80px;
  background: #3b82f6;
  top: 60%;
  right: 10%;
  animation-delay: 2s;
}

.circle-3 {
  width: 60px;
  height: 60px;
  background: #8b5cf6;
  bottom: 20%;
  left: 20%;
  animation-delay: 4s;
}

.floating-particle {
  position: absolute;
  width: 8px;
  height: 8px;
  background: #64748b;
  border-radius: 50%;
  opacity: 0.3;
  animation: float 4s ease-in-out infinite;
}

.particle-1 {
  top: 30%;
  right: 20%;
  animation-delay: 1s;
}
.particle-2 {
  top: 70%;
  left: 30%;
  animation-delay: 3s;
}
.particle-3 {
  bottom: 30%;
  right: 30%;
  animation-delay: 5s;
}

/* Основной контент */
.success-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
  max-width: 480px;
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
  width: 120px;
  height: 120px;
}

.checkmark-container {
  width: 80px;
  height: 80px;
}

.checkmark {
  width: 100%;
  height: 100%;
  animation: scaleIn 0.5s ease-out;
}

.checkmark-circle {
  stroke: #10b981;
  stroke-width: 2;
  stroke-dasharray: 166;
  stroke-dashoffset: 166;
  stroke-miterlimit: 10;
  fill: none;
  animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
}

.checkmark-check {
  transform-origin: 50% 50%;
  stroke: #10b981;
  stroke-width: 2;
  stroke-dasharray: 48;
  stroke-dashoffset: 48;
  animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.6s forwards;
}

/* Конфетти */
.confetti {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.confetti-piece {
  position: absolute;
  width: 8px;
  height: 16px;
  background: var(--confetti-color);
  top: 0;
  opacity: 0;
  animation: confettiDrop 1s ease-out 1 forwards;
  animation-delay: var(--confetti-delay);
}

.confetti-piece:nth-child(odd) {
  transform: rotate(var(--confetti-rotation));
}

.confetti-piece:nth-child(even) {
  transform: rotate(calc(var(--confetti-rotation) + 22.5deg));
}

/* Текст успеха */
.success-text {
  text-align: center;
}

.success-title {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 12px 0;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.success-description {
  font-size: 16px;
  color: #64748b;
  margin: 0;
  line-height: 1.5;
}

/* Детали аккаунта */
.account-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  background: white;
  padding: 20px;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
}

.detail-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: #f1f5f9;
  border-radius: 8px;
  color: #475569;
}

.detail-label {
  font-size: 14px;
  font-weight: 600;
  color: #475569;
  min-width: 80px;
}

.detail-value {
  font-size: 14px;
  color: #1e293b;
  font-weight: 500;
}

/* Статус и действия */
.status-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 20px 0;
  border-top: 1px solid #f1f5f9;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #f0fdf4;
  border: 1px solid #dcfce7;
  border-radius: 20px;
  color: #166534;
  font-size: 14px;
  font-weight: 600;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #22c55e;
}

.status-dot.active {
  animation: pulse 2s infinite;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
}

.btn-secondary {
  background: white;
  color: #475569;
  border: 1px solid #e2e8f0;
}

.btn-secondary:hover {
  background: #f8fafc;
  transform: translateY(-1px);
}

/* Следующие шаги */
.next-steps {
  width: 100%;
  background: white;
  padding: 24px;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
}

.steps-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 16px 0;
}

.steps-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.step-item.completed {
  background: #f0fdf4;
  color: #166534;
}

.step-item.current {
  background: #eff6ff;
  color: #1e40af;
  border: 1px solid #dbeafe;
}

.step-item:not(.completed):not(.current) {
  color: #64748b;
  background: #f8fafc;
}

.step-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  font-size: 12px;
  font-weight: 700;
}

.step-item.completed .step-icon {
  background: #22c55e;
  color: white;
}

.step-item.current .step-icon {
  background: #3b82f6;
  color: white;
}

.step-item:not(.completed):not(.current) .step-icon {
  background: #cbd5e1;
  color: #64748b;
}

.step-text {
  font-size: 14px;
  font-weight: 500;
}

/* Анимации */
@keyframes float {
  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
  }
}

@keyframes scaleIn {
  0% {
    transform: scale(0);
    opacity: 0;
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

@keyframes confettiDrop {
  0% {
    opacity: 1;
    transform: translateY(0) rotate(0deg);
  }
  100% {
    opacity: 0;
    transform: translateY(400px) rotate(720deg);
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* Адаптивность */
@media (max-width: 640px) {
  .auth-success-container {
    padding: 24px 16px;
    min-height: 500px;
  }

  .success-content {
    gap: 24px;
  }

  .success-title {
    font-size: 24px;
  }

  .status-actions {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .action-buttons {
    justify-content: center;
  }

  .account-details {
    padding: 16px;
  }
}
</style>
