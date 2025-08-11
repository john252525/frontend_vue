<template>
  <div class="step-container">
    <div class="step-content">
      <div class="form-group">
        <label>Введите номера:</label>
        <textarea
          v-model="localFormData.inputText"
          class="form-control"
          :class="{ 'input-error': showContactError }"
          rows="4"
          placeholder="79111111111;ольга
79111111111;иван"
        ></textarea>
        <transition name="fade">
          <div v-if="showContactError" class="error-message">
            Необходимо указать номера
          </div>
        </transition>
      </div>

      <div class="form-group">
        <label>Колонка в базе:</label>
        <select v-model="localFormData.selectedLetter" class="form-control">
          <option v-for="letter in alphabet" :key="letter" :value="letter">
            {{ letter }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label>Или загрузите файл:</label>
        <div class="file-upload-wrapper">
          <label
            class="file-upload-label"
            :class="{ 'input-error': showFileError }"
          >
            {{
              localFormData.otherFile
                ? localFormData.otherFile.name
                : "Выберите файл"
            }}
            <input
              type="file"
              @change="handleOtherFileUpload"
              class="file-input"
            />
          </label>
          <button
            v-if="localFormData.otherFile"
            @click="clearOtherFile"
            class="file-clear-btn"
          >
            &times;
          </button>
        </div>
        <transition name="fade">
          <div v-if="showFileError" class="error-message">
            Необходим файл или номера
          </div>
        </transition>
      </div>
    </div>

    <div class="step-actions">
      <button
        @click="$emit('prev')"
        class="btn-secondary"
        :disabled="currentStep === 0"
      >
        Назад
      </button>
      <button
        @click="validateAndNext"
        class="btn-primary"
        :class="{ 'btn-disabled': !isStepValid }"
      >
        Далее: Сообщение
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch, computed, inject } from "vue";

const props = defineProps({
  currentStep: {
    type: Number,
    required: true,
  },
});

const emit = defineEmits(["next", "prev", "step-completed"]);

const formData = inject("formData");
const updateFormData = inject("updateFormData");
const updateStepCompletion = inject("updateStepCompletion");

const alphabet = Array.from({ length: 26 }, (_, i) =>
  String.fromCharCode(65 + i)
);
const showContactError = ref(false);
const showFileError = ref(false);

const localFormData = reactive({
  inputText: formData.inputText,
  selectedLetter: formData.selectedLetter,
  otherFile: formData.otherFile,
});

const isStepValid = computed(() => {
  return (
    localFormData.inputText.trim() !== "" || localFormData.otherFile !== null
  );
});

watch(
  localFormData,
  (newValue) => {
    updateFormData(newValue);
  },
  { deep: true }
);

watch(
  [() => localFormData.inputText, () => localFormData.otherFile],
  () => {
    updateStepCompletion(props.currentStep, isStepValid.value);
  },
  { immediate: true }
);

const handleOtherFileUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    localFormData.otherFile = file;
  }
};

const clearOtherFile = () => {
  localFormData.otherFile = null;
};

const validateAndNext = () => {
  if (!isStepValid.value) {
    showContactError.value = localFormData.inputText.trim() === "";
    showFileError.value = localFormData.otherFile === null;
    return;
  }

  showContactError.value = false;
  showFileError.value = false;
  emit("step-completed", props.currentStep);
  emit("next");
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

textarea.form-control {
  min-height: 120px;
  resize: none;
}

.input-error {
  border-color: #ef4444 !important;
}

.error-message {
  height: 20px;
  display: flex;
  align-items: center;
  color: #ef4444;
  font-size: 13px;
  margin-top: 6px;
}

.file-upload-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.file-upload-label {
  flex: 1;
  padding: 10px 12px;
  border: 1px dashed #cbd5e0;
  border-radius: 6px;
  background: #f8fafc;
  font-size: 14px;
  color: #4b5563;
  cursor: pointer;
  transition: all 0.2s;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-upload-label:hover {
  border-color: #9ca3af;
}

.file-input {
  display: none;
}

.file-clear-btn {
  background: none;
  border: none;
  color: #9ca3af;
  font-size: 18px;
  cursor: pointer;
  padding: 0 4px;
  line-height: 1;
}

.file-clear-btn:hover {
  color: #6b7280;
}

.step-actions {
  display: flex;
  justify-content: space-between;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
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

.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary:not(:disabled):hover {
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

.btn-disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background-color: #cbd5e1 !important;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .form-group label {
    font-size: 13px;
  }

  .form-control {
    padding: 8px 10px;
    font-size: 13px;
  }

  textarea.form-control {
    min-height: 100px;
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
</style>
