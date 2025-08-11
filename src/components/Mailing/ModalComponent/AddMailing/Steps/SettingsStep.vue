<template>
  <div class="step-container">
    <div class="step-content">
      <div class="form-group">
        <label>Название рассылки:</label>
        <input
          v-model="formData.nameMailing"
          type="text"
          class="form-control"
          placeholder="Моя рассылка"
        />
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
        <label>Дополнительные настройки:</label>
        <div class="options-list">
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
import { inject } from "vue";

const props = defineProps({
  currentStep: Number,
});

const emit = defineEmits(["submit", "prev", "step-completed"]);

const formData = inject("formData");
const updateStepCompletion = inject("updateStepCompletion");

const days = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const minutes = Array.from({ length: 60 }, (_, i) => i + 1);

const submit = () => {
  updateStepCompletion(props.currentStep, true);
  emit("submit");
};
</script>

<style scoped>
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
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 8px;
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

.form-control:focus {
  border-color: #6366f1;
  outline: none;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  background: white;
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
}

.day-item.active {
  background: #4f46e5;
  color: white;
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
}

.time-separator,
.interval-separator {
  color: #9ca3af;
  font-size: 14px;
}

.options-list {
  display: flex;
  flex-direction: column;
}

.option-item {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 14px;
  color: #334155;
  padding: 8px 0;
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
  border: 1px solid #d1d5db;
  border-radius: 4px;
  margin-right: 10px;
  background: white;
  transition: all 0.2s;
}

.custom-checkbox.checked {
  background: #4f46e5;
  border-color: #4f46e5;
}

.custom-checkbox.checked::after {
  content: "";
  position: absolute;
  left: 5px;
  top: 2px;
  width: 4px;
  height: 8px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.step-actions {
  display: flex;
  justify-content: right;
  padding-top: 20px;
  gap: 12px;
  margin-top: 20px;
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
}

.btn-secondary {
  background: white;
  border: 1px solid #e5e7eb;
  color: #4b5563;
}

.btn-secondary:hover {
  background: #f9fafb;
}

.btn-primary {
  background: #4f46e5;
  border: none;
  color: white;
}

.btn-primary:hover {
  background: #4338ca;
}

@media (max-width: 768px) {
  .form-group label {
    font-size: 13px;
  }

  .days-container {
    grid-template-columns: repeat(4, 1fr);
  }

  .day-item {
    padding: 6px;
    font-size: 12px;
  }

  .time-input,
  .interval-select {
    padding: 6px 10px;
    font-size: 13px;
  }

  .option-item {
    font-size: 13px;
  }

  .step-actions {
    padding-top: 16px;
  }

  .btn-secondary,
  .btn-primary {
    padding: 8px 16px;
    font-size: 13px;
    min-width: 100px;
  }
}

@media (max-width: 480px) {
  .days-container {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
