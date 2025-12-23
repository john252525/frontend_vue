<template>
  <div class="inn-settings">
    <div class="settings-header">
      <h3 class="settings-title">{{ t("innSettings.title") }}</h3>
      <p class="settings-description">
        {{ t("innSettings.description") }}
      </p>
    </div>

    <div class="settings-content">
      <!-- Лоадер загрузки ИНН -->
      <div v-if="loadingInn" class="inn-loading">
        <div class="inn-loader"></div>
        <span>{{ t("innSettings.loading") }}</span>
      </div>

      <!-- Если ИНН загружен и не редактируется -->
      <div
        v-else-if="innFromBackend && !isEditingInn"
        class="input-with-action"
      >
        <input
          v-model.trim="innValue"
          type="text"
          :placeholder="t('innSettings.placeholder')"
          maxlength="12"
          class="form-input"
          :disabled="true"
        />
        <button
          type="button"
          @click="enableInnEditing"
          class="edit-inn-btn"
          :disabled="isSaving"
          :title="t('innSettings.changeInn')"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
              stroke="currentColor"
              stroke-width="2"
            />
            <path
              d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
              stroke="currentColor"
              stroke-width="2"
            />
          </svg>
        </button>
      </div>

      <!-- Если ИНН пустой или редактируется -->
      <div v-else class="input-with-action">
        <input
          v-model.trim="innValue"
          type="text"
          :placeholder="t('innSettings.placeholder')"
          maxlength="12"
          class="form-input"
          :class="{ 'input-error': innError }"
          :disabled="isSaving"
          @input="validateInnOnInput"
        />
      </div>

      <div v-if="innError" class="error-text">{{ innError }}</div>

      <div v-if="innFromBackend && !isEditingInn" class="inn-info success">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path
            d="M20 6L9 17l-5-5"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <span>{{ t("innSettings.innLoaded") }}</span>
      </div>

      <div v-else-if="!innFromBackend && !loadingInn" class="inn-info info">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <span>{{ t("innSettings.enterAndSave") }}</span>
      </div>
    </div>

    <!-- Кнопка сохранить ИНН -->
    <div class="action-buttons">
      <button
        v-if="!innFromBackend || isEditingInn"
        type="button"
        @click="saveInn"
        class="btn btn-primary"
        :disabled="!isInnValid || isSaving"
      >
        <span v-if="isSaving" class="btn-loading">
          <div class="btn-spinner"></div>
          {{ t("innSettings.saving") }}
        </span>
        <span v-else>
          {{ innFromBackend ? t("innSettings.update") : t("innSettings.save") }}
        </span>
      </button>

      <button
        v-if="isEditingInn"
        type="button"
        @click="cancelEditing"
        class="btn btn-secondary"
        :disabled="isSaving"
      >
        {{ t("innSettings.cancel") }}
      </button>
    </div>

    <!-- Сообщение об ошибке -->
    <transition name="slide-fade">
      <div v-if="message" :class="['alert', `alert-${message.type}`]">
        {{ message.text }}
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import axios from "axios";
import { useAccountStore } from "@/stores/accountStore";

const { t } = useI18n();
const accountStore = useAccountStore();
const VITE_INVOICES_URL = import.meta.env.VITE_INVOICES_URL;

const innValue = ref("");
const innError = ref("");
const innFromBackend = ref(null);
const isEditingInn = ref(false);
const loadingInn = ref(false);
const isSaving = ref(false);
const message = ref(null);
const initialInnValue = ref("");

// Создаём axios instance с конфигурацией
const apiClient = axios.create({
  baseURL: VITE_INVOICES_URL,
});

// Добавляем интерцептор для токена
apiClient.interceptors.request.use((config) => {
  const token = accountStore.getAccountToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Валидация ИНН
const validateInn = (inn) => {
  if (!inn) return t("innSettings.errors.required");
  if (!/^\d+$/.test(inn)) return t("innSettings.errors.onlyDigits");
  if (inn.length < 10) return t("innSettings.errors.minLength");
  if (inn.length > 12) return t("innSettings.errors.maxLength");
  if (inn.length !== 10 && inn.length !== 12)
    return t("innSettings.errors.length10or12");
  return "";
};

const isInnValid = computed(() => {
  return innValue.value && !validateInn(innValue.value);
});

const validateInnOnInput = () => {
  innError.value = validateInn(innValue.value);
};

const enableInnEditing = () => {
  isEditingInn.value = true;
  message.value = null;
};

const cancelEditing = () => {
  innValue.value = initialInnValue.value;
  isEditingInn.value = false;
  innError.value = "";
  message.value = null;
};

// Загрузка ИНН
const loadInn = async () => {
  loadingInn.value = true;
  message.value = null;

  try {
    const response = await apiClient.get("getInn", {
      timeout: 8000,
    });

    if (response.data.ok && response.data.data?.inn) {
      innValue.value = response.data.data.inn;
      initialInnValue.value = response.data.data.inn;
      innFromBackend.value = response.data.data.inn;
    } else {
      innFromBackend.value = null;
      isEditingInn.value = true;
    }
  } catch (error) {
    console.error("Ошибка при загрузке ИНН:", error);
    innFromBackend.value = null;
    isEditingInn.value = true;

    let errorMsg = t("innSettings.errors.loadFailed");
    if (error.code === "ECONNABORTED") {
      errorMsg = t("innSettings.errors.loadTimeout");
    } else if (error.response) {
      errorMsg = error.response.data?.message || errorMsg;
    }

    showMessage(errorMsg, "error");
  } finally {
    loadingInn.value = false;
  }
};

// Сохранение ИНН
const saveInn = async () => {
  innError.value = validateInn(innValue.value);
  if (innError.value) return;

  isSaving.value = true;
  message.value = null;

  try {
    const response = await apiClient.post(
      "saveInn",
      {
        inn: innValue.value,
      },
      {
        timeout: 8000,
      }
    );

    if (response.data.ok) {
      innFromBackend.value = innValue.value;
      initialInnValue.value = innValue.value;
      isEditingInn.value = false;
      showMessage(t("innSettings.messages.saved"), "success");
    } else {
      throw new Error(
        response.data.message || t("innSettings.errors.saveFailed")
      );
    }
  } catch (error) {
    console.error("Ошибка при сохранении ИНН:", error);

    let errorMsg = t("innSettings.errors.saveFailed");

    if (error.code === "ECONNABORTED") {
      errorMsg = t("innSettings.errors.saveTimeout");
    } else if (error.response) {
      errorMsg = error.response.data?.message || errorMsg;
    }

    showMessage(errorMsg, "error");
  } finally {
    isSaving.value = false;
  }
};

const showMessage = (text, type) => {
  message.value = { text, type };
  if (type === "success") {
    setTimeout(() => {
      message.value = null;
    }, 3000);
  }
};

onMounted(() => {
  loadInn();
});
</script>

<style scoped>
.inn-settings {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.settings-header {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.settings-title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #1a1a1a;
}

.settings-description {
  margin: 0;
  font-size: 0.875rem;
  color: #666;
}

.settings-content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.input-with-action {
  position: relative;
  display: flex;
  align-items: center;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 0.95rem;
  transition: all 0.2s;
  background: white;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input:disabled {
  background: #f9fafb;
  color: #6b7280;
  cursor: not-allowed;
}

.form-input.input-error {
  border-color: #ef4444;
}

.edit-inn-btn {
  position: absolute;
  right: 0.5rem;
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.375rem;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.edit-inn-btn:hover:not(:disabled) {
  background: #f3f4f6;
  color: #374151;
}

.edit-inn-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.inn-loading {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: #f3f4f6;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.inn-loader {
  width: 14px;
  height: 14px;
  border: 2px solid #e5e7eb;
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.error-text {
  font-size: 0.8125rem;
  color: #ef4444;
}

.inn-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8125rem;
  padding: 0.75rem;
  border-radius: 0.375rem;
}

.inn-info.success {
  background: #d1fae5;
  border: 1px solid #a7f3d0;
  color: #065f46;
}

.inn-info.info {
  background: #fef3c7;
  border: 1px solid #fde68a;
  color: #78350f;
}

.action-buttons {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.btn {
  padding: 0.625rem 1.25rem;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.9375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background-color: #3b82f6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #2563eb;
}

.btn-secondary {
  background-color: #f0f0f0;
  color: #1a1a1a;
  border: 1px solid #e0e0e0;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #e8e8e8;
}

.btn-loading {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* Alert Messages */
.alert {
  padding: 0.75rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  animation: slideIn 0.2s ease;
}

.alert-success {
  background-color: #d1fae5;
  border: 1px solid #6ee7b7;
  color: #065f46;
}

.alert-error {
  background-color: #fee2e2;
  border: 1px solid #fca5a5;
  color: #991b1b;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.slide-fade-enter-active {
  transition: all 0.2s ease;
}

.slide-fade-leave-active {
  transition: all 0.2s ease;
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

/* Responsive */
@media (max-width: 640px) {
  .action-buttons {
    flex-direction: column;
    width: 100%;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
