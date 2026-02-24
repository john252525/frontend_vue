<template>
  <div
    class="status-container"
    ref="trigger"
    @mouseenter="handleMouseEnter"
    @mouseleave="hideTooltip"
  >
    <span class="status-indicator" :class="statusClass">
      <span class="status-circle"></span>
    </span>

    <Teleport to="body">
      <transition name="fade">
        <div v-if="isHovered" class="custom-tooltip" :style="tooltipStyle">
          <div class="tooltip-header">
            <span class="tooltip-dot" :class="statusClass"></span>
            <span class="tooltip-title">{{ statusTitle }}</span>
          </div>
          <div class="tooltip-content">
            <p v-if="type === 'crm'">CRM-система активна</p>
            <p v-else-if="type === 'bulk'">Аккаунт рассылки активен</p>
            <p v-else>{{ statusSubtitle }}</p>

            <span v-if="type != 'bulk'" class="tooltip-hint"
              >Нажмите для подробностей</span
            >
          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, toRefs, computed, nextTick } from "vue";

const props = defineProps({
  status: { type: [Number, String], default: null },
  type: { type: String, default: "account" },
});

const { status, type } = toRefs(props);
const isHovered = ref(false);
const trigger = ref(null);
const tooltipStyle = ref({});

// Логика нормализации статуса
const normalizedStatus = computed(() => {
  if (status.value === null || status.value === undefined) return null;
  return Number(status.value);
});

// Определяем CSS класс для цветов
const statusClass = computed(() => {
  if (type.value === "bulk") return "status-active";

  if (type.value === "crm") {
    return normalizedStatus.value === 1 ? "status-active" : "status-inactive";
  } else {
    // Логика для аккаунтов
    if (normalizedStatus.value === 5) return "status-active";
    // Все статусы авторизации (2.2, 2.22 и т.д.) помечаем как ожидание/предупреждение
    const pendingStatuses = [2.2, 2.22];
    if (pendingStatuses.includes(normalizedStatus.value))
      return "status-pending";

    return normalizedStatus.value === null
      ? "status-inactive"
      : "status-pending";
  }
});

// Главный заголовок в тултипе
const statusTitle = computed(() => {
  if (type.value === "bulk") return "Аккаунт активен";
  if (type.value === "crm")
    return normalizedStatus.value === 1 ? "CRM онлайн" : "CRM отключена";

  if (normalizedStatus.value === 5) return "Аккаунт активен";
  if ([2.2, 2.22].includes(normalizedStatus.value)) return "Аккаунт не активен";
  return "Статус аккаунта";
});

const statusSubtitle = computed(() => {
  if (normalizedStatus.value === 5) return "Сессия установлена и работает";
  if (normalizedStatus.value === 2.2) return "Требуется авторизация по QR-коду";
  if (normalizedStatus.value === 2.22) return "Требуется авторизация по коду";
  return "Аккаунт находится в процессе обработки";
});

// Расчет позиции тултипа
const handleMouseEnter = async () => {
  if (!trigger.value) return;

  const rect = trigger.value.getBoundingClientRect();

  // Устанавливаем координаты (центрируем по горизонтали, прижимаем сверху)
  tooltipStyle.value = {
    top: `${rect.top - 12}px`,
    left: `${rect.left + rect.width / 2}px`,
  };

  isHovered.value = true;
};

const hideTooltip = () => {
  isHovered.value = false;
};
</script>

<style scoped>
.status-container {
  display: inline-flex;
  align-items: center;
  line-height: 0;
}

.status-indicator {
  display: inline-flex;
  padding: 4px;
  cursor: pointer;
  border-radius: 50%;
  transition: background-color 0.2s ease;
}

.status-indicator:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.status-circle {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  transition: transform 0.2s ease;
}

.status-indicator:hover .status-circle {
  transform: scale(1.1);
}

/* Цвета индикаторов */
.status-active .status-circle {
  background-color: #10b981;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
}

.status-inactive .status-circle {
  background-color: #ef4444;
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2);
}

.status-pending .status-circle {
  background-color: #f59e0b;
  box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.2);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.15);
    opacity: 0.8;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>

<style>
/* Глобальные стили для тултипа, так как он находится в body */
.custom-tooltip {
  position: fixed;
  z-index: 10000;
  width: 240px;
  background: #1e293b; /* Глубокий темный цвет */
  color: #ffffff;
  padding: 14px;
  border-radius: 10px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
  pointer-events: none;
  transform: translate(-50%, -100%); /* Сдвиг вверх на свою высоту */
  will-change: transform, opacity;
}

/* Треугольник внизу тултипа */
.custom-tooltip::after {
  content: "";
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border-width: 6px;
  border-style: solid;
  border-color: #1e293b transparent transparent transparent;
}

.tooltip-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.tooltip-title {
  font-size: 14px;
  font-weight: 600;
  color: #f8fafc;
}

.tooltip-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

/* Цвета точек внутри тултипа */
.tooltip-dot.status-active {
  background-color: #10b981;
}
.tooltip-dot.status-inactive {
  background-color: #ef4444;
}
.tooltip-dot.status-pending {
  background-color: #f59e0b;
}

.tooltip-content {
  font-size: 13px;
  color: #cbd5e1;
  line-height: 1.5;
}

.tooltip-hint {
  display: block;
  margin-top: 10px;
  padding-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 11px;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

/* Анимация плавного появления */
.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translate(-50%, -95%);
}
</style>
