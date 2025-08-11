<template>
  <div class="step-container">
    <div class="step-content">
      <div class="form-group message-text">
        <label>Введите текст сообщения:</label>
        <textarea
          v-model="localFormData.messageText"
          class="form-control"
          :class="{ 'input-error': showMessageError }"
          rows="6"
          placeholder="В тексте можно использовать данные из загружаемой базы.
Пример: %G% (где G - другой столбец)"
        ></textarea>
        <transition name="fade">
          <div v-if="showMessageError" class="error-message">
            Введите текст сообщения
          </div>
        </transition>
      </div>

      <div class="form-group">
        <label>Добавить вложение:</label>
        <div class="file-upload-wrapper">
          <label class="file-upload-label">
            {{
              localFormData.imageFile
                ? localFormData.imageFile.name
                : "Выберите изображение"
            }}
            <input
              type="file"
              @change="handleImageUpload"
              accept="image/*"
              class="file-input"
            />
          </label>
          <button
            v-if="localFormData.imageFile"
            @click="clearImage"
            class="file-clear-btn"
          >
            &times;
          </button>
        </div>
      </div>
    </div>

    <div class="step-actions">
      <button @click="$emit('prev')" class="btn-secondary">Назад</button>
      <button
        @click="validateAndNext"
        class="btn-primary"
        :class="{ 'btn-disabled': !isStepValid }"
      >
        Далее: Настройки
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

const showMessageError = ref(false);

const localFormData = reactive({
  messageText: formData.messageText,
  imageFile: formData.imageFile,
  imagePreview: formData.imagePreview,
});

const isStepValid = computed(() => {
  return localFormData.messageText.trim() !== "";
});

watch(
  localFormData,
  (newValue) => {
    updateFormData(newValue);
  },
  { deep: true }
);

watch(
  () => localFormData.messageText,
  () => {
    updateStepCompletion(props.currentStep, isStepValid.value);
  },
  { immediate: true }
);

const handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      localFormData.imageFile = file;
      localFormData.imagePreview = e.target.result;
    };
    reader.readAsDataURL(file);
  }
};

const clearImage = () => {
  localFormData.imageFile = null;
  localFormData.imagePreview = null;
};

const validateAndNext = () => {
  if (!isStepValid.value) {
    showMessageError.value = true;
    return;
  }

  showMessageError.value = false;
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

.form-group.message-text {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.form-group.message-text textarea {
  flex: 1;
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

.image-preview {
  margin-top: 12px;
  max-height: 200px;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
}

.image-preview img {
  width: 100%;
  height: auto;
  display: block;
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

  .image-preview {
    max-height: 150px;
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
