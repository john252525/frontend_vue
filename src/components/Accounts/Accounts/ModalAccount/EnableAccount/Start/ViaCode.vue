<template>
  <div class="code-auth-container">
    <!-- Заголовок -->
    <div class="header">
      <div
        class="status-indicator"
        :class="{
          active: userCode && !sessionEnded,
          generating: !userCode && !sessionEnded,
          expired: sessionEnded,
        }"
      >
        <div class="status-dot"></div>
        <span class="status-text">
          {{ getStatusText }}
        </span>
      </div>

      <!-- Таймер 20 секунд -->
      <div class="timer-display" v-if="userCode && !sessionEnded">
        <div class="modern-timer">
          <svg class="timer-svg" width="44" height="44">
            <circle cx="22" cy="22" r="20" class="timer-bg"></circle>
            <circle
              cx="22"
              cy="22"
              r="20"
              class="timer-progress"
              :style="timerProgressStyle"
            ></circle>
          </svg>
          <span class="timer-text">{{ timerCount }}s</span>
        </div>
        <span class="timer-label">до обновления</span>
      </div>

      <!-- Таймер 1 минута сессии -->
      <div class="timer-display" v-if="!sessionEnded">
        <div class="modern-timer session">
          <svg class="timer-svg" width="44" height="44">
            <circle cx="22" cy="22" r="20" class="timer-bg session"></circle>
            <circle
              cx="22"
              cy="22"
              r="20"
              class="timer-progress session"
              :style="sessionTimerProgressStyle"
            ></circle>
          </svg>
          <span class="timer-text">{{ sessionTimerCount }}s</span>
        </div>
        <span class="timer-label">до конца сессии</span>
      </div>
    </div>

    <!-- Основной контент -->
    <div class="main-content">
      <!-- Отображение кода -->
      <div v-if="userCode && !sessionEnded" class="code-display">
        <div class="code-card">
          <div class="code-title">Код подтверждения</div>
          <div class="code-value">{{ userCode }}</div>
          <div class="code-hint">Введите этот код в приложении WhatsApp</div>
        </div>

        <div class="code-instruction">
          <div class="instruction-step">
            <span class="step-number">1</span>
            <span class="step-text">Откройте WhatsApp на вашем телефоне</span>
          </div>
          <div class="instruction-step">
            <span class="step-number">2</span>
            <span class="step-text"
              >Перейдите в Настройки → Linked devices</span
            >
          </div>
          <div class="instruction-step">
            <span class="step-number">3</span>
            <span class="step-text"
              >Введите код: <strong>{{ userCode }}</strong></span
            >
          </div>
        </div>
      </div>

      <!-- Состояние загрузки -->
      <div v-else-if="!sessionEnded" class="loading-state">
        <div class="spinner-container">
          <div class="spinner"></div>
          <div class="spinner-ring"></div>
        </div>
        <p class="loading-text">Запрашиваем код подтверждения</p>
      </div>

      <!-- Сессия завершена -->
      <div v-else class="session-ended">
        <div class="ended-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
            />
          </svg>
        </div>
        <p class="ended-title">Сессия завершена</p>
        <p class="ended-description">Время действия кода истекло</p>
        <button class="retry-button" @click="handleRetry">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"
            />
          </svg>
          Попробовать снова
        </button>
      </div>
    </div>

    <!-- Прогресс-бар сессии -->
    <div class="session-progress" v-if="!sessionEnded">
      <div class="progress-bar">
        <div class="progress-fill" :style="sessionProgressStyle"></div>
      </div>
      <span class="progress-text"
        >Сессия: {{ Math.floor(sessionTimerCount / 60) }}:{{
          (sessionTimerCount % 60).toString().padStart(2, "0")
        }}</span
      >
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, computed, watch } from "vue";
import axios from "axios";

const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL;

const props = defineProps({
  selectedItem: {
    type: Object,
    required: true,
  },
  startFunction: {
    type: Function,
    required: true,
  },
});

const { source, login, storage } = props.selectedItem;

import { useAccountStore } from "@/stores/accountStore";
const accountStore = useAccountStore();
const token = computed(() => accountStore.getAccountToken);

const userCode = ref("");
const sessionEnded = ref(false);
const timerCount = ref(20);
const sessionTimerCount = ref(60);
const isRunning = ref(false);

let timerInterval = null;
let sessionTimerInterval = null;
let authCodeInterval = null;
let infoInterval = null;

// Computed properties
const getStatusText = computed(() => {
  if (sessionEnded.value) return "Сессия завершена";
  if (userCode.value) return "Код активен";
  return "Запрос кода";
});

const timerProgressStyle = computed(() => {
  const progress = ((20 - timerCount.value) / 20) * 100;
  return {
    "stroke-dashoffset": `calc(126px - (126px * ${progress}) / 100)`,
  };
});

const sessionTimerProgressStyle = computed(() => {
  const progress = ((60 - sessionTimerCount.value) / 60) * 100;
  return {
    "stroke-dashoffset": `calc(126px - (126px * ${progress}) / 100)`,
  };
});

const sessionProgressStyle = computed(() => {
  const progress = ((60 - sessionTimerCount.value) / 60) * 100;
  return {
    width: `${progress}%`,
  };
});

// Наблюдатель за сессией
watch(sessionTimerCount, (newVal) => {
  if (newVal <= 0) {
    endSession();
  }
});

// Запрос кода авторизации
const getAuthCode = async () => {
  const params = {
    source: source,
    login: login,
    storage: storage,
  };

  try {
    const response = await axios.post(`${FRONTEND_URL}getAuthCode`, params, {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Authorization: `Bearer ${token.value}`,
      },
    });

    if (response.data.status === "ok") {
      userCode.value = response.data.authCode;
      return true;
    } else if (response.data.error?.message === "Auth code is undefined") {
      return false;
    }
  } catch (error) {
    console.error("Error in getAuthCode:", error);
    return false;
  }
};

// Параллельный запрос getInfo
const getInfo = async () => {
  const params = {
    source: source,
    login: login,
    storage: storage,
  };

  try {
    const response = await axios.post(`${FRONTEND_URL}getInfo`, params, {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Authorization: `Bearer ${token.value}`,
      },
    });

    if (response.data.status === "ok") {
      console.log("Info received:", response.data);
      if (response.data.step) {
        if (response.data.step?.value === 5) {
          console.log("Авторизован");
        }
      }
    }
  } catch (error) {
    console.error("Error in getInfo:", error);
  }
};

// Таймеры
const startTimer = () => {
  if (timerInterval) clearInterval(timerInterval);

  timerInterval = setInterval(() => {
    if (timerCount.value > 0) {
      timerCount.value--;
    } else {
      timerCount.value = 20;

      getAuthCode();
    }
  }, 1000);
};

const startSessionTimer = () => {
  if (sessionTimerInterval) clearInterval(sessionTimerInterval);

  sessionTimerCount.value = 60;
  sessionTimerInterval = setInterval(() => {
    if (sessionTimerCount.value > 0) {
      sessionTimerCount.value--;
    } else {
      clearInterval(sessionTimerInterval);
    }
  }, 1000);
};

// Запуск процесса
const startAuthProcess = async () => {
  if (isRunning.value) return;

  isRunning.value = true;

  // Первый запрос кода
  await getAuthCode();
  startTimer();
  startSessionTimer();

  // Интервал для обновления кода каждые 20 секунд
  authCodeInterval = setInterval(async () => {
    if (!isRunning.value) {
      clearInterval(authCodeInterval);
      return;
    }
    await getAuthCode();
  }, 20000);

  // Параллельный интервал для getInfo каждые 15 секунд
  infoInterval = setInterval(async () => {
    if (!isRunning.value) {
      clearInterval(infoInterval);
      return;
    }
    await getInfo();
  }, 15000);
};

// Завершение сессии
const endSession = () => {
  sessionEnded.value = true;
  isRunning.value = false;

  if (timerInterval) clearInterval(timerInterval);
  if (sessionTimerInterval) clearInterval(sessionTimerInterval);
  if (authCodeInterval) clearInterval(authCodeInterval);
  if (infoInterval) clearInterval(infoInterval);
};

// Повторная попытка
const handleRetry = async () => {
  sessionEnded.value = false;
  userCode.value = "";
  await startAuthProcess();
};

// Остановка процесса
const stopAuthProcess = () => {
  endSession();
};

onMounted(() => {
  startAuthProcess();
});

onUnmounted(() => {
  stopAuthProcess();
});

// Экспортируем функции для управления извне
defineExpose({
  stopAuthProcess,
  restartAuthProcess: handleRetry,
});
</script>

<style scoped>
.code-auth-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  max-width: 400px;
  margin: 0 auto;
}

/* Заголовок */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-bottom: 4px;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: white;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #94a3b8;
  transition: all 0.3s ease;
}

.status-indicator.active .status-dot {
  background: #10b981;
  animation: pulse 2s infinite;
}

.status-indicator.generating .status-dot {
  background: #f59e0b;
  animation: pulse 1s infinite;
}

.status-indicator.expired .status-dot {
  background: #ef4444;
}

.status-text {
  font-size: 13px;
  font-weight: 600;
  color: #475569;
}

/* Таймеры */
.modern-timer {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
}

.timer-svg {
  transform: rotate(-90deg);
}

.timer-bg {
  fill: none;
  stroke: #f1f5f9;
  stroke-width: 2;
}

.timer-bg.session {
  stroke: #fef3c7;
}

.timer-progress {
  fill: none;
  stroke: #3b82f6;
  stroke-width: 2;
  stroke-dasharray: 126px;
  stroke-dashoffset: 126px;
  stroke-linecap: round;
  transition: stroke-dashoffset 0.3s ease;
}

.timer-progress.session {
  stroke: #f59e0b;
}

.timer-text {
  position: absolute;
  font-size: 10px;
  font-weight: 700;
  color: #1e293b;
}

.timer-label {
  font-size: 11px;
  color: #64748b;
  white-space: nowrap;
}

/* Основной контент */
.main-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Отображение кода */
.code-display {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.code-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.code-title {
  font-size: 14px;
  color: #64748b;
  margin-bottom: 12px;
  font-weight: 500;
}

.code-value {
  font-size: 32px;
  font-weight: 700;
  color: #1e293b;
  letter-spacing: 8px;
  margin-bottom: 8px;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.code-hint {
  font-size: 13px;
  color: #64748b;
}

.code-instruction {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.instruction-step {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: white;
  border-radius: 8px;
  border: 1px solid #f1f5f9;
}

.step-number {
  width: 24px;
  height: 24px;
  background: #3b82f6;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
}

.step-text {
  font-size: 13px;
  color: #475569;
}

/* Состояние загрузки */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 40px 20px;
}

.spinner-container {
  position: relative;
  width: 50px;
  height: 50px;
}

.spinner {
  width: 100%;
  height: 100%;
  border: 3px solid #e2e8f0;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.spinner-ring {
  position: absolute;
  top: -6px;
  left: -6px;
  right: -6px;
  bottom: -6px;
  border: 2px solid transparent;
  border-top: 2px solid #60a5fa;
  border-radius: 50%;
  animation: spin 1.5s linear infinite reverse;
}

.loading-text {
  font-size: 14px;
  color: #475569;
  font-weight: 500;
  margin: 0;
}

/* Сессия завершена */
.session-ended {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 40px 20px;
  text-align: center;
}

.ended-icon {
  color: #94a3b8;
  opacity: 0.7;
}

.ended-title {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.ended-description {
  font-size: 14px;
  color: #64748b;
  margin: 0;
}

.retry-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.retry-button:hover {
  background: #2563eb;
  transform: translateY(-1px);
}

/* Прогресс-бар сессии */
.session-progress {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 10px;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: #f1f5f9;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #10b981, #f59e0b);
  border-radius: 3px;
  transition: width 1s linear;
}

.progress-text {
  font-size: 11px;
  color: #64748b;
  text-align: center;
}

/* Анимации */
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Адаптивность */
@media (max-width: 480px) {
  .code-auth-container {
    padding: 16px;
    gap: 16px;
  }

  .header {
    flex-direction: column;
    gap: 10px;
  }

  .code-value {
    font-size: 28px;
    letter-spacing: 6px;
  }
}
</style>
