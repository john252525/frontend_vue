<template>
  <div class="step-container">
    <div class="step-content">
      <div class="form-group">
        <label>Название рассылки:</label>
        <input
          v-model="formData.nameMailing"
          type="text"
          class="form-control"
          :class="{ 'is-invalid': nameError }"
          placeholder="Введите название"
          @input="clearError"
        />
        <span v-if="nameError" class="error-text">{{ nameError }}</span>
      </div>

      <div class="form-group">
        <label>Дни отправки:</label>
        <div class="days-container">
          <label
            v-for="(day, index) in days"
            :key="index"
            class="day-item"
            :class="{ active: formData.selectedDays.includes(index + 1) }"
          >
            <input
              type="checkbox"
              :value="index + 1"
              v-model="formData.selectedDays"
              class="day-checkbox"
              hidden
            />
            {{ day }}
          </label>
        </div>
      </div>

      <div class="form-group">
        <label>Время отправки:</label>
        <div class="time-range">
          <input type="time" v-model="formData.startTime" class="time-input" />
          <span class="time-separator">—</span>
          <input type="time" v-model="formData.endTime" class="time-input" />
        </div>
      </div>

      <div class="form-group">
        <label>Интервал между сообщениями (мин):</label>
        <div class="interval-range">
          <select v-model="formData.startNum" class="interval-select">
            <option v-for="minute in minutes" :value="minute">
              {{ minute }}
            </option>
          </select>
          <span class="interval-separator">—</span>
          <select v-model="formData.endNum" class="interval-select">
            <option v-for="minute in minutes" :value="minute">
              {{ minute }}
            </option>
          </select>
        </div>
      </div>

      <div class="form-group">
        <label>Каналы отправки:</label>
        <div class="channels-selector">
          <label
            v-for="channel in availableChannels"
            :key="channel.id"
            class="channel-item"
            :class="{ active: selectedChannels.includes(channel.id) }"
          >
            <input
              type="checkbox"
              :value="channel.id"
              v-model="selectedChannels"
              class="channel-checkbox"
              hidden
              @change="handleChannelChange"
            />
            <span class="channel-text">{{ channel.name }}</span>
          </label>
        </div>
      </div>

      <div v-if="selectedChannels.length > 1" class="form-group">
        <label>Последовательность отправки:</label>
        <p class="sequence-info">Используйте стрелки для изменения порядка</p>
        <div class="cascade-container">
          <div
            v-for="(channelId, index) in cascadeOrder"
            :key="channelId"
            class="cascade-item"
          >
            <div class="cascade-position">{{ index + 1 }}</div>
            <div class="cascade-name">{{ getChannelName(channelId) }}</div>
            <div class="cascade-buttons">
              <button
                v-if="index > 0"
                @click="moveCascadeUp(index)"
                class="btn-move"
                title="Переместить выше"
              >
                ↑
              </button>
              <button
                v-if="index < cascadeOrder.length - 1"
                @click="moveCascadeDown(index)"
                class="btn-move"
                title="Переместить ниже"
              >
                ↓
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="form-group">
        <label>Дополнительные настройки:</label>
        <div class="options-list">
          <label v-show="getVersion === 2" class="option-item">
            <input
              type="checkbox"
              v-model="formData.autostart"
              class="real-checkbox"
            />
            <span
              class="custom-checkbox"
              :class="{ checked: formData.autostart }"
            ></span>
            Автоматический запуск после создания
          </label>
          <label v-show="getVersion === 2" class="option-item">
            <input
              type="checkbox"
              v-model="formData.ignore_inactive_sources"
              class="real-checkbox"
            />
            <span
              class="custom-checkbox"
              :class="{ checked: formData.ignore_inactive_sources }"
            ></span>
            Не останавливать рассылку, если обнаружены неактивные аккаунты
            мессенджеров
          </label>
          <label class="option-item">
            <input
              type="checkbox"
              v-model="formData.removeDuplicates"
              class="real-checkbox"
            />
            <span
              class="custom-checkbox"
              :class="{ checked: formData.removeDuplicates }"
            ></span>
            Удалять дубликаты номеров
          </label>
          <label class="option-item">
            <input
              type="checkbox"
              v-model="formData.sendOnlyExistingDialogs"
              class="real-checkbox"
            />
            <span
              class="custom-checkbox"
              :class="{ checked: formData.sendOnlyExistingDialogs }"
            ></span>
            Отправлять только в существующие диалоги
          </label>
          <label class="option-item">
            <input
              type="checkbox"
              v-model="formData.sendMessagesRandomOrder"
              class="real-checkbox"
            />
            <span
              class="custom-checkbox"
              :class="{ checked: formData.sendMessagesRandomOrder }"
            ></span>
            Случайный порядок отправки
          </label>
        </div>
      </div>
    </div>

    <div class="step-actions">
      <button @click="$emit('prev')" class="btn-secondary">Назад</button>
      <button @click="submit" class="btn-primary">Создать рассылку</button>
    </div>
  </div>
</template>

<script setup>
import { inject, ref, watch, computed } from "vue";
import { useMailingVersion } from "@/stores/mailingVersion";

const props = defineProps({
  currentStep: Number,
});

const emit = defineEmits(["submit", "prev", "step-completed"]);

const mailingVersion = useMailingVersion();
const getVersion = computed(() => mailingVersion.getVersion);

const formData = inject("formData");
const updateFormData = inject("updateFormData");
const updateStepCompletion = inject("updateStepCompletion");

const days = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const minutes = Array.from({ length: 60 }, (_, i) => i + 1);

// --- Валидация ---
const nameError = ref("");

const validateForm = () => {
  const name = formData.nameMailing?.trim() || "";

  if (name.length === 0) {
    nameError.value = "Введите название рассылки";
    return false;
  }

  if (name.length > 20) {
    nameError.value = "Максимальная длина названия — 20 символов";
    return false;
  }

  if (selectedChannels.value.length === 0) {
    alert("Выберите хотя бы один канал отправки!");
    return false;
  }

  nameError.value = "";
  return true;
};

const clearError = () => {
  if (nameError.value) nameError.value = "";
};
// -----------------

// Доступные каналы
const availableChannels = [
  { id: "telegram", name: "Telegram" },
  { id: "whatsapp", name: "WhatsApp" },
  { id: "max", name: "MAX" },
];

const selectedChannels = ref(
  formData.selectedChannels || ["telegram", "whatsapp"],
);

const cascadeOrder = ref(
  selectedChannels.value.length > 0 ? [...selectedChannels.value] : [],
);

function getChannelName(channelId) {
  const channel = availableChannels.find((c) => c.id === channelId);
  return channel ? channel.name : channelId;
}

function handleChannelChange() {
  const newOrder = cascadeOrder.value.filter((id) =>
    selectedChannels.value.includes(id),
  );

  selectedChannels.value.forEach((id) => {
    if (!newOrder.includes(id)) {
      newOrder.push(id);
    }
  });

  cascadeOrder.value = newOrder;
  updateCascade();
}

function moveCascadeUp(index) {
  if (index > 0) {
    const temp = cascadeOrder.value[index];
    cascadeOrder.value[index] = cascadeOrder.value[index - 1];
    cascadeOrder.value[index - 1] = temp;
    updateCascade();
  }
}

function moveCascadeDown(index) {
  if (index < cascadeOrder.value.length - 1) {
    const temp = cascadeOrder.value[index];
    cascadeOrder.value[index] = cascadeOrder.value[index + 1];
    cascadeOrder.value[index + 1] = temp;
    updateCascade();
  }
}

function updateCascade() {
  const cascadeString = cascadeOrder.value.join(",");
  updateFormData({
    selectedChannels: selectedChannels.value,
    cascade: cascadeString,
  });
}

watch(
  selectedChannels,
  () => {
    handleChannelChange();
  },
  { deep: true },
);

const submit = () => {
  if (!validateForm()) return;

  updateStepCompletion(props.currentStep, true);
  emit("submit");
};
</script>

<style scoped>
/* Ваши существующие стили без изменений + добавил стили для ошибок */

.step-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.step-content {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
  padding-right: 8px;
}

.step-content::-webkit-scrollbar {
  width: 6px;
}

.step-content::-webkit-scrollbar-track {
  background: transparent;
}

.step-content::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.step-content::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 4px; /* Уменьшил отступ для текста ошибки */
  font-size: 14px;
  font-weight: 500;
  color: #334155;
}

.form-control {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.2s;
  background: #f8fafc;
  box-sizing: border-box;
}

/* Стили валидации */
.form-control.is-invalid {
  border-color: #ef4444;
  background: #fef2f2;
}

.form-control.is-invalid:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.error-text {
  color: #ef4444;
  font-size: 12px;
  margin-top: 4px;
  font-weight: 400;
}

.days-container {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
}

.day-item {
  padding: 8px;
  text-align: center;
  border-radius: 6px;
  background: #f8fafc;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid transparent;
  user-select: none;
}

.day-item:hover {
  border-color: #6366f1;
  background: #f1f5f9;
}

.day-item.active {
  background: #6366f1;
  color: white;
  border-color: #4f46e5;
}

.day-checkbox {
  display: none;
}

.time-range,
.interval-range {
  display: flex;
  align-items: center;
  gap: 10px;
}

.time-input,
.interval-select {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  background: #f8fafc;
  cursor: pointer;
  transition: all 0.2s;
}

.time-input:focus,
.interval-select:focus {
  border-color: #6366f1;
  outline: none;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  background: white;
}

.time-separator,
.interval-separator {
  color: #cbd5e1;
  font-size: 14px;
  font-weight: 500;
}

.channels-selector {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
  gap: 10px;
}

.channel-item {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
  border: 2px solid #e2e8f0;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  background: #f8fafc;
  user-select: none;
}

.channel-item:hover {
  border-color: #cbd5e1;
  background: #f1f5f9;
}

.channel-item.active {
  border-color: #6366f1;
  background: #eef2ff;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1);
}

.channel-checkbox {
  display: none;
}

.channel-text {
  font-size: 13px;
  font-weight: 500;
  color: #334155;
  text-align: center;
}

.channel-item.active .channel-text {
  color: #6366f1;
  font-weight: 600;
}

.sequence-info {
  margin: 0;
  font-size: 12px;
  color: #9ca3af;
  margin-bottom: 10px;
}

.cascade-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 10px;
  background: #f8fafc;
}

.cascade-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  transition: all 0.2s;
}

.cascade-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border-color: #cbd5e1;
}

.cascade-position {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: #6366f1;
  color: white;
  border-radius: 50%;
  font-weight: 600;
  font-size: 12px;
  flex-shrink: 0;
}

.cascade-name {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
  color: #334155;
}

.cascade-buttons {
  display: flex;
  gap: 4px;
}

.btn-move {
  width: 28px;
  height: 28px;
  padding: 0;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  background: white;
  color: #334155;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.btn-move:hover {
  background: #eef2ff;
  border-color: #6366f1;
  color: #6366f1;
}

.btn-move:active {
  transform: scale(0.95);
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.option-item {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 14px;
  color: #334155;
  padding: 8px 0;
  user-select: none;
}

.option-item:hover {
  color: #6366f1;
}

.real-checkbox {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.custom-checkbox {
  position: relative;
  display: inline-block;
  width: 16px;
  height: 16px;
  min-width: 16px;
  border: 2px solid #e2e8f0;
  border-radius: 4px;
  margin-right: 10px;
  background: white;
  transition: all 0.2s;
}

.custom-checkbox.checked {
  background: #6366f1;
  border-color: #6366f1;
}

.custom-checkbox.checked::after {
  content: "";
  position: absolute;
  left: 4px;
  top: 1px;
  width: 4px;
  height: 8px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.step-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 16px;
  margin-top: 20px;
  border-top: 1px solid #e2e8f0;
  flex-shrink: 0;
}

.btn-secondary,
.btn-primary {
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-secondary {
  background: white;
  border: 1px solid #e5e7eb;
  color: #4b5563;
}

.btn-secondary:hover {
  background: #f9fafb;
  border-color: #cbd5e1;
}

.btn-primary {
  background: #6366f1;
  color: white;
}

.btn-primary:hover {
  background: #4f46e5;
}

@media (max-width: 768px) {
  .step-actions {
    flex-direction: column-reverse;
  }
  .btn-secondary,
  .btn-primary {
    width: 100%;
  }
}
</style>
