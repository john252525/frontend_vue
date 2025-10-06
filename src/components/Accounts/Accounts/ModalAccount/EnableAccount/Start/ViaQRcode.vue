<template>
  <div class="qr-scanner-container">
    <!-- Заголовок с индикатором статуса -->
    <div class="qr-header">
      <div
        class="status-indicator"
        :class="{
          active: qrCodeData.link && !sessionEnded,
          generating: !qrCodeData.link && !sessionEnded,
          expired: sessionEnded,
        }"
      >
        <div class="status-dot"></div>
        <span class="status-text">
          {{ getStatusText }}
        </span>
      </div>

      <!-- Таймер 20 секунд -->
      <div class="timer-display" v-if="qrCodeData.link && !sessionEnded">
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

      <!-- Таймер 1 минута до конца сессии -->
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
    <div class="qr-main-content">
      <!-- QR-код -->
      <div v-if="qrCodeData.link && !sessionEnded" class="qr-display">
        <div class="qr-frame">
          <div class="qr-corner qr-corner-tl"></div>
          <div class="qr-corner qr-corner-tr"></div>
          <div class="qr-corner qr-corner-bl"></div>
          <div class="qr-corner qr-corner-br"></div>

          <qrcode-vue
            :value="qrCodeData.link"
            :size="180"
            class="qr-code"
            level="H"
          />
        </div>

        <div class="scan-animation">
          <div class="scan-line"></div>
        </div>

        <p class="instruction">Отсканируйте QR-код для авторизации</p>
      </div>

      <!-- Состояние загрузки -->
      <div v-else-if="!sessionEnded" class="loading-state">
        <div class="spinner-container">
          <div class="spinner"></div>
          <div class="spinner-ring"></div>
        </div>
        <p class="loading-text">Генерируем QR-код</p>
      </div>

      <!-- Кнопка перезагрузки после окончания сессии -->
      <div v-else class="reload-state">
        <div class="reload-icon" @click="handleReload">
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46A7.93 7.93 0 0020 12c0-4.42-3.58-8-8-8z"
              fill="currentColor"
            />
            <path
              d="M6.54 5.54L5.09 4.09A7.93 7.93 0 004 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8l1.44 1.44-.6.9z"
              fill="currentColor"
            />
          </svg>
        </div>

        <p class="reload-title">Сессия завершена</p>
        <p class="reload-description">Нажмите чтобы начать заново</p>

        <button class="reload-button" @click="handleReload">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"
            />
          </svg>
          Начать заново
        </button>
      </div>
    </div>

    <!-- Прогресс-бар 1 минуты -->
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
import {
  ref,
  reactive,
  onMounted,
  onUnmounted,
  toRefs,
  computed,
  watch,
} from "vue";
import QrcodeVue from "qrcode.vue";
import axios from "axios";

const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL;

// Props
const props = defineProps({
  selectedItem: {
    type: Object,
    required: true,
  },
});

const { selectedItem } = toRefs(props);
const { source, login, storage } = selectedItem.value;

import { useAccountStore } from "@/stores/accountStore";
const accountStore = useAccountStore();
const token = computed(() => accountStore.getAccountToken);

const qrCodeData = reactive({
  link: "",
});

const intervalId = ref(null);
const isRunning = ref(false);
const timerCount = ref(20);
const sessionTimerCount = ref(60); // 1 минута для сессии
const sessionEnded = ref(false);

let timerInterval = null;
let sessionTimerInterval = null;

// Computed properties
const getStatusText = computed(() => {
  if (sessionEnded.value) return "Сессия завершена";
  if (qrCodeData.link) return "QR-код активен";
  return "Генерация QR-кода";
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

// В computed свойствах
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

// Таймеры
const startTimer = () => {
  if (timerInterval) clearInterval(timerInterval);

  timerInterval = setInterval(() => {
    if (timerCount.value > 0) {
      timerCount.value--;
    } else {
      timerCount.value = 20;
      // Автоматически запрашиваем новый QR код
      getQr();
    }
  }, 1000);
};

const startSessionTimer = () => {
  if (sessionTimerInterval) clearInterval(sessionTimerInterval);

  sessionTimerCount.value = 60; // 1 минута = 60 секунд
  sessionTimerInterval = setInterval(() => {
    if (sessionTimerCount.value > 0) {
      sessionTimerCount.value--;
    } else {
      clearInterval(sessionTimerInterval);
    }
  }, 1000);
};

// Обработка перезагрузки
const handleReload = async () => {
  sessionEnded.value = false;
  qrCodeData.link = "";
  await init();
};

// Функция завершения сессии
const endSession = () => {
  sessionEnded.value = true;
  stopEnableByQR();
  if (sessionTimerInterval) clearInterval(sessionTimerInterval);
};

// Основные функции API
const getQr = async () => {
  try {
    const params = {
      source: source,
      login: login,
      ...(storage && { storage: storage }),
    };

    const response = await axios.post(`${FRONTEND_URL}getQr`, params, {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Authorization: `Bearer ${token.value}`,
      },
    });

    if (response.data.status === "ok") {
      qrCodeData.link = response.data.value;
    } else {
      // Если ошибка, продолжаем попытки
      console.log("Ошибка получения QR, пробуем снова...");
    }
  } catch (error) {
    console.error("Ошибка при получении QR-кода:", error);
  }
};

const startEnableByQR = async () => {
  if (isRunning.value) return;

  await getQr();
  startTimer();
  startSessionTimer();

  isRunning.value = true;

  // Интервал для автоматического обновления QR каждые 20 секунд
  intervalId.value = setInterval(async () => {
    if (!isRunning.value) {
      clearInterval(intervalId.value);
      return;
    }
    await getQr();
  }, 20000);
};

const stopEnableByQR = () => {
  if (intervalId.value) {
    clearInterval(intervalId.value);
  }
  if (timerInterval) {
    clearInterval(timerInterval);
  }

  isRunning.value = false;
};

const init = async () => {
  try {
    await startEnableByQR();
  } catch (error) {
    console.error("Error in initialization:", error);
  }
};

onMounted(() => {
  init();
});

onUnmounted(() => {
  stopEnableByQR();
  if (sessionTimerInterval) clearInterval(sessionTimerInterval);
});

// Экспортируем функции
defineExpose({
  stopEnableByQR: () => stopEnableByQR(),
  endSession,
});
</script>

<style scoped>
.qr-scanner-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 20px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  position: relative;
  overflow: hidden;
  max-width: 320px;
  margin: 0 auto;
}

.qr-header {
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

.qr-main-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  width: 100%;
}

.qr-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  position: relative;
}

.qr-frame {
  position: relative;
  padding: 16px;
  background: white;
  border-radius: 14px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #f1f5f9;
}

.qr-corner {
  position: absolute;
  width: 16px;
  height: 16px;
  border: 2px solid #3b82f6;
}

.qr-corner-tl {
  top: 0;
  left: 0;
  border-right: none;
  border-bottom: none;
  border-radius: 6px 0 0 0;
}

.qr-corner-tr {
  top: 0;
  right: 0;
  border-left: none;
  border-bottom: none;
  border-radius: 0 6px 0 0;
}

.qr-corner-bl {
  bottom: 0;
  left: 0;
  border-right: none;
  border-top: none;
  border-radius: 0 0 0 6px;
}

.qr-corner-br {
  bottom: 0;
  right: 0;
  border-left: none;
  border-top: none;
  border-radius: 0 0 6px 0;
}

.qr-code {
  border-radius: 6px;
}

.scan-animation {
  position: absolute;
  top: 16px;
  left: 16px;
  right: 16px;
  height: 180px;
  overflow: hidden;
}

.scan-line {
  height: 2px;
  background: linear-gradient(90deg, transparent, #3b82f6, transparent);
  animation: scan 3s ease-in-out infinite;
}

.instruction {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
  text-align: center;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 30px 20px;
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

.reload-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 20px;
  text-align: center;
}

.reload-icon {
  width: 64px;
  height: 64px;
  color: #3b82f6;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 50%;
  padding: 8px;
}

.reload-icon:hover {
  background: #f1f5f9;
  transform: scale(1.05);
  color: #2563eb;
}

.reload-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.reload-description {
  font-size: 13px;
  color: #64748b;
  margin: 0;
}

.reload-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.reload-button:hover {
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

@keyframes scan {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(178px);
  }
}

@media (max-width: 480px) {
  .qr-scanner-container {
    padding: 16px;
    gap: 16px;
  }

  .qr-header {
    flex-direction: column;
    gap: 10px;
  }
}
</style>
