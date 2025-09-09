<template>
  <div class="modal-overlay" @click="changeInfoMailing"></div>
  
  <section v-if="!station.message" class="info-modal">
    <div  class="modal-content">
      <!-- Заголовок с кнопкой закрытия -->
      <div class="modal-header">
        <h2 class="modal-title">
          {{ t("information.title") }}
        </h2>
        <button class="close-btn" @click="changeInfoMailing" aria-label="Close">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- Информация о рассылке -->
      <div class="info-grid">
        <div class="info-item">
          <span class="info-label">{{ t("information.status.title") }}</span>
          <span :class="['status-badge', statusClass]">
            {{ statusText }}
          </span>
        </div>

        <div class="info-item">
          <span class="info-label">{{ t("information.name") }}</span>
          <span class="info-value">{{ selectedItem.name }}</span>
        </div>

        <div class="info-item">
          <span class="info-label">{{ t("information.weekDay") }}</span>
          <span class="info-value">{{ formattedWeekDays }}</span>
        </div>

        <div class="info-item">
          <span class="info-label">{{ t("information.time") }}</span>
          <span class="info-value">
            {{ selectedItem.options.hours.min }}-{{ selectedItem.options.hours.max }}
          </span>
        </div>

        <div class="info-item">
          <span class="info-label">{{ t("information.timeout.title") }}</span>
          <span class="info-value">
            {{ formattedDelayInterval }} {{ t("information.timeout.min") }}
          </span>
        </div>

        <div class="info-item">
          <span class="info-label">{{ t("information.message") }}</span>
          <button class="message-btn" @click="changeStationMessage">
            {{ selectedItem.recipients }}
          </button>
        </div>
      </div>

      <!-- Кнопка редактирования -->
      <button class="edit-btn" @click="changeisEditMailing">
        {{ t("information.button") }}
      </button>
    </div>
    
  </section>
  <MessageLise
      v-if="station.message"
      :changeStationMessage="changeStationMessage"
      :selectedItem="selectedItem"
    />
</template>

<script setup>
import { reactive, computed } from "vue";
import MessageLise from "./MessageLise.vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const props = defineProps({
  selectedItem: {
    type: Object,
    required: true
  },
  changeInfoMailing: {
    type: Function,
    required: true
  },
  changeisEditMailing: {
    type: Function,
    required: true
  },
});

const station = reactive({
  message: false,
});

const changeStationMessage = () => {
  station.message = !station.message;
};

const weekDaysMap = {
  1: "пн", 2: "вт", 3: "ср", 4: "чт", 
  5: "пт", 6: "сб", 7: "вс"
};

// Computed properties
const formattedWeekDays = computed(() => {
  if (!props.selectedItem?.options?.days) return "";
  
  const days = Object.keys(props.selectedItem.options.days)
    .map(Number)
    .sort((a, b) => a - b)
    .map(day => weekDaysMap[day]);
  
  return days.join(", ");
});

const formattedDelayInterval = computed(() => {
  if (!props.selectedItem?.options?.delay) return "";
  
  const { min, max } = props.selectedItem.options.delay;
  const minMinutes = Math.round(min / 60);
  const maxMinutes = Math.round(max / 60);
  
  return `${minMinutes} - ${maxMinutes}`;
});

const statusText = computed(() => {
  const states = {
    0: t("information.status.noActive"),
    1: t("information.status.active"),
    2: t("mailingList.status.completed")
  };
  return states[props.selectedItem.state] || '';
});

const statusClass = computed(() => {
  return props.selectedItem.state === 0 ? 'status-inactive' : 
         props.selectedItem.state === 1 ? 'status-active' : 'status-completed';
});
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 100;
}

.info-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: var(--modalBg, #ffffff);
  border-radius: 12px;
  padding: 0;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  z-index: 101;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-content {
  padding: 20px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid var(--border-color, #e8e8e8);
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--modalColor, #1a1a1a);
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  padding: 6px;
  cursor: pointer;
  border-radius: 6px;
  color: var(--text-secondary, #666);
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: var(--bg-hover, #f5f5f5);
  color: var(--text-primary, #1a1a1a);
}

.info-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.info-item {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  align-items: center;
  padding: 10px 0;
}

.info-item:not(:last-child) {
  border-bottom: 1px solid var(--border-color, #f0f0f0);
}

.info-label {
  font-weight: 500;
  color: var(--text-secondary, #666);
  font-size: 14px;
  word-break: break-word;
}

.info-value {
  color: var(--text-primary, #1a1a1a);
  font-size: 14px;
  text-align: right;
  word-break: break-word;
}

.status-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  display: inline-block;
  text-align: center;
}

.status-active {
  background: #e8f5e8;
  color: #2e7d32;
}

.status-inactive {
  background: #ffebee;
  color: #d32f2f;
}

.status-completed {
  background: #e3f2fd;
  color: #1976d2;
}

.message-btn {
  background: none;
  border: none;
  color: var(--primary-color, #1976d2);
  text-decoration: underline;
  cursor: pointer;
  font-size: 14px;
  padding: 0;
  transition: color 0.2s ease;
  text-align: right;
  word-break: break-word;
}

.message-btn:hover {
  color: var(--primary-hover, #1565c0);
}

.edit-btn {
  width: 100%;
  padding: 12px 20px;
  background: oklch(0.541 0.198 267);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.edit-btn:hover {
  background: oklch(0.541 0.198 267);
  opacity: 0.9;
  transform: translateY(-1px);
}

/* Адаптивность для мобильных устройств */
@media (max-width: 768px) {
  .info-modal {
    width: 95%;
    max-width: none;
    border-radius: 10px;
  }
  
  .modal-content {
    padding: 16px;
  }
  
  .modal-header {
    margin-bottom: 16px;
    padding-bottom: 12px;
  }
  
  .modal-title {
    font-size: 16px;
  }
  
  .info-item {
    grid-template-columns: 1fr;
    gap: 6px;
    padding: 8px 0;
  }
  
  .info-value {
    text-align: left;
  }
  
  .message-btn {
    text-align: left;
  }
  
  .edit-btn {
    padding: 10px 16px;
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .info-modal {
    width: 100%;
    height: 100%;
    max-height: none;
    border-radius: 0;
    top: 0;
    left: 0;
    transform: none;
  }
  
  .modal-content {
    padding: 20px 16px;
  }
  
  .info-grid {
    gap: 10px;
  }
  
  .info-label {
    font-size: 13px;
  }
  
  .info-value {
    font-size: 13px;
  }
  
  .status-badge {
    font-size: 10px;
    padding: 3px 8px;
  }
}

/* Для очень маленьких экранов */
@media (max-width: 320px) {
  .modal-content {
    padding: 16px 12px;
  }
  
  .modal-title {
    font-size: 15px;
  }
  
  .info-label,
  .info-value {
    font-size: 12px;
  }
}
</style>