<template>
  <span class="status-indicator" :class="statusClass" :title="statusTitle">
    <span class="status-circle"></span>
  </span>
</template>

<script setup>
import { toRefs, computed } from "vue";

const props = defineProps({
  status: {
    type: [Number, String],
    default: null,
  },
  type: {
    type: String,
    default: "account",
  },
});

const { status, type } = toRefs(props);

const normalizedStatus = computed(() => {
  // Приводим статус к числу для сравнения
  if (status.value === null || status.value === undefined) return null;
  return Number(status.value);
});

const statusClass = computed(() => {
  // Для bulk всегда зеленый
  if (type.value === "bulk") return "status-active";

  if (type.value === "crm") {
    console.log(
      "CRM Status:",
      normalizedStatus.value,
      "Type:",
      typeof normalizedStatus.value
    );
    return normalizedStatus.value === 1 ? "status-active" : "status-inactive";
  } else {
    // Для обычных аккаунтов
    if (normalizedStatus.value === 5) return "status-active";
    if (normalizedStatus.value === null) return "status-inactive";
    return "status-pending";
  }
});

const statusTitle = computed(() => {
  if (type.value === "bulk") return "Оплата рассылок активна";

  if (type.value === "crm") {
    return normalizedStatus.value === 1 ? "CRM активна" : "CRM неактивна";
  } else {
    if (normalizedStatus.value === 5) return "Аккаунт активен";
    if (normalizedStatus.value === null) return "Аккаунт неактивен";
    return "Аккаунт в процессе";
  }
});
</script>

<style scoped>
.status-indicator {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: 50%;
  transition: all 0.2s ease;
  cursor: default;
}

.status-circle {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  transition: all 0.2s ease;
}

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
    transform: scale(1.1);
    opacity: 0.7;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.status-indicator:hover .status-circle {
  transform: scale(1.2);
}
</style>
