<template>
  <div class="invoice-step">
    <div class="step-content">
      <!-- Компактный блок ИНН -->
      <section class="inn-section compact">
        <div class="section-header compact">
          <div class="section-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <polyline
                points="14,2 14,8 20,8"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M16 13H8"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
              <path
                d="M16 17H8"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
              <path
                d="M10 9H8"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
          </div>
          <h3 class="section-title">{{ t("invoiceStep.invoiceDetails") }}</h3>
        </div>

        <div class="form-group compact">
          <label class="form-label">{{ t("invoiceStep.innLabel") }}</label>

          <!-- Лоадер загрузки ИНН -->
          <div v-if="loadingInn" class="inn-loading compact">
            <div class="inn-loader"></div>
            <span>{{ t("invoiceStep.loadingInn") }}</span>
          </div>

          <!-- Если ИНН загружен и не редактируется -->
          <div
            v-else-if="innFromBackend && !isEditingInn"
            class="input-with-action"
          >
            <input
              v-model.trim="innValue"
              type="text"
              :placeholder="t('invoiceStep.innPlaceholder')"
              maxlength="12"
              class="form-input compact"
              :disabled="true"
            />
            <button
              type="button"
              @click="enableInnEditing"
              class="edit-inn-btn"
              :disabled="isLoading"
              :title="t('invoiceStep.changeInn')"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path
                  d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
                  stroke="currentColor"
                  stroke-width="2"
                  fill="none"
                />
                <path
                  d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
                  stroke="currentColor"
                  stroke-width="2"
                  fill="none"
                />
              </svg>
            </button>
          </div>

          <!-- Если ИНН пустой или редактируется -->
          <div v-else class="input-with-action">
            <input
              v-model.trim="innValue"
              type="text"
              :placeholder="t('invoiceStep.innPlaceholder')"
              maxlength="12"
              class="form-input compact"
              :class="{ 'input-error': innError }"
              :disabled="isLoading"
              @input="validateInnOnInput"
            />
          </div>

          <div v-if="innError" class="error-text compact">{{ innError }}</div>

          <div v-if="innFromBackend && !isEditingInn" class="inn-info compact">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M20 6L9 17l-5-5"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                fill="none"
              />
            </svg>
            <span>{{ t("invoiceStep.innLoadedFromProfile") }}</span>
          </div>

          <div
            v-else-if="!innFromBackend && !loadingInn"
            class="inn-empty-message compact"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <span>{{ t("invoiceStep.enterAndSaveInn") }}</span>
          </div>
        </div>

        <!-- Компактная кнопка сохранить ИНН -->
        <button
          v-if="!innFromBackend || isEditingInn"
          type="button"
          @click="saveInn"
          class="btn btn-success save-inn-btn compact"
          :disabled="!isInnValid || isLoading"
        >
          <span v-if="savingInn" class="btn-loading">
            <div class="btn-spinner"></div>
            {{ t("invoiceStep.saving") }}
          </span>
          <span v-else class="btn-content">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path
                d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"
                stroke="currentColor"
                stroke-width="2"
                fill="none"
              />
            </svg>
            {{
              innFromBackend ? t("invoiceStep.update") : t("invoiceStep.save")
            }}
          </span>
        </button>
      </section>

      <!-- Компактная сводка счета -->
      <div class="invoice-summary compact" v-if="innSaved">
        <div class="summary-header compact">
          <div class="summary-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
          <h3 class="summary-title">
            {{ t("invoiceStep.invoiceDetailsTitle") }}
          </h3>
        </div>

        <div class="summary-details compact">
          <div class="detail-item compact">
            <span class="detail-label">{{ t("invoiceStep.amount") }}:</span>
            <span class="detail-value">{{ amount }} ₽</span>
          </div>
          <div class="detail-item compact">
            <span class="detail-label">{{ t("invoiceStep.inn") }}:</span>
            <span class="detail-value">{{ innValue }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="step-actions">
      <button
        @click="generateInvoice"
        class="btn btn-primary"
        :disabled="!canGenerateInvoice || isLoading"
      >
        <span v-if="generatingInvoice" class="btn-loading">
          <div class="btn-spinner"></div>
          {{ t("invoiceStep.generating") }}
        </span>
        <span v-else class="btn-content">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          {{ t("invoiceStep.getInvoice") }}
        </span>
      </button>
    </div>

    <!-- Улучшенный обработчик ошибок -->
    <transition name="slide-fade">
      <div v-if="localError" class="error-card enhanced-error">
        <div class="error-header">
          <div class="error-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
          <h4 class="error-title">{{ t("invoiceStep.errorGenerating") }}</h4>
          <button @click="clearError" class="error-close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M18 6L6 18M6 6l12 12"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
          </button>
        </div>
        <div class="error-content">
          <p>{{ localError }}</p>
        </div>
        <div class="error-actions" v-if="showRetry">
          <button @click="generateInvoice" class="btn btn-sm btn-primary">
            {{ t("invoiceStep.tryAgain") }}
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import axios from "axios";
import { useAccountStore } from "@/stores/accountStore";
import useFrontendLogger from "@/composables/useFrontendLogger";

const { t } = useI18n();
const { sendLog } = useFrontendLogger();
const accountStore = useAccountStore();
const token = accountStore.getAccountToken;

const FRONTEND_URL = import.meta.env.VITE_INVOICES_URL;

const props = defineProps({
  amount: {
    type: Number,
    required: true,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["back", "invoice-generated", "invoice-error"]);

// Состояния ИНН
const innValue = ref("");
const innError = ref("");
const innFromBackend = ref(null);
const isEditingInn = ref(false);
const loadingInn = ref(false);
const savingInn = ref(false);
const generatingInvoice = ref(false);
const innSaved = ref(false);
const localError = ref("");
const showRetry = ref(false);

const handleSendLog = async (location, method, params, results, answer) => {
  try {
    await sendLog(location, method, params, results, answer);
  } catch (err) {
    console.error("error", err);
  }
};

const clearError = () => {
  localError.value = "";
  showRetry.value = false;
};

// Валидация ИНН
const validateInn = (inn) => {
  if (!inn) return t("invoiceStep.errors.innRequired");
  if (!/^\d+$/.test(inn)) return t("invoiceStep.errors.innOnlyDigits");
  if (inn.length < 10) return t("invoiceStep.errors.innMinLength");
  if (inn.length > 12) return t("invoiceStep.errors.innMaxLength");
  if (inn.length !== 10 && inn.length !== 12)
    return t("invoiceStep.errors.inn10or12");
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
  innSaved.value = false;
};

const canGenerateInvoice = computed(() => {
  return (
    innSaved.value &&
    innFromBackend.value &&
    props.amount >= 10 &&
    props.amount <= 50000
  );
});

// API функции
const loadInn = async () => {
  loadingInn.value = true;
  try {
    const response = await axios.get(`${FRONTEND_URL}getInn`, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 8000,
    });

    if (response.data.ok && response.data.data.inn) {
      innValue.value = response.data.data.inn;
      innSaved.value = true;
      innFromBackend.value = response.data.data.inn;
    } else {
      innFromBackend.value = "";
      innSaved.value = false;
      isEditingInn.value = true;
    }
  } catch (error) {
    console.error("error", error);
    innFromBackend.value = "";
    innSaved.value = false;
    isEditingInn.value = true;

    if (error.code === "ECONNABORTED") {
      localError.value = t("invoiceStep.errors.innLoadTimeoutError");
    } else {
      localError.value = t("invoiceStep.errors.innLoadError");
    }
    showRetry.value = true;
  } finally {
    loadingInn.value = false;
  }
};

const saveInn = async () => {
  innError.value = validateInn(innValue.value);
  if (innError.value) return;

  savingInn.value = true;
  clearError();

  try {
    const response = await axios.get(`${FRONTEND_URL}saveInn`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { inn: innValue.value },
      timeout: 8000,
    });

    if (response.data.ok) {
      innSaved.value = true;
      innFromBackend.value = innValue.value;
      isEditingInn.value = false;
      await handleSendLog(
        "payment",
        "saveInn",
        { inn: innValue.value },
        response.data,
        response.data
      );
    } else {
      throw new Error(
        response.data.message || t("invoiceStep.errors.saveFailed")
      );
    }
  } catch (error) {
    console.error("error", error);
    let errorMsg = t("invoiceStep.errors.innSaveError");

    if (error.code === "ECONNABORTED") {
      errorMsg = t("invoiceStep.errors.innSaveTimeoutError");
    } else if (error.response) {
      errorMsg = error.response.data?.message || errorMsg;
    }

    localError.value = errorMsg;
    showRetry.value = true;
    emit("invoice-error", errorMsg);
  } finally {
    savingInn.value = false;
  }
};

const generateInvoice = async () => {
  if (!canGenerateInvoice.value) return;

  clearError();

  if (!props.amount || props.amount < 10) {
    localError.value = t("invoiceStep.errors.minAmount");
    showRetry.value = true;
    return;
  }

  if (props.amount > 50000) {
    localError.value = t("invoiceStep.errors.maxAmount");
    showRetry.value = true;
    return;
  }

  generatingInvoice.value = true;
  try {
    const response = await axios.post(
      `${FRONTEND_URL}generateInvoice`,
      { amount: props.amount },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        timeout: 15000,
      }
    );

    if (response.data.ok) {
      await handleSendLog(
        "payment",
        "generateInvoice",
        { amount: props.amount },
        response.data,
        response.data
      );
      emit("invoice-generated", response.data.data);
    } else {
      throw new Error(
        response.data.message || t("invoiceStep.errors.generateFailed")
      );
    }
  } catch (error) {
    console.error("Error in generateInvoice:", error);

    let errorMsg = t("invoiceStep.errors.generateError");

    if (error.code === "ECONNABORTED") {
      errorMsg = t("invoiceStep.errors.generateTimeoutError");
    } else if (error.response) {
      errorMsg =
        error.response.data?.message ||
        `${t("invoiceStep.errors.serverError")}: ${error.response.status}`;
    } else if (error.request) {
      errorMsg = t("invoiceStep.errors.connectionError");
    }

    localError.value = errorMsg;
    showRetry.value = true;
    emit("invoice-error", errorMsg);
  } finally {
    generatingInvoice.value = false;
  }
};

onMounted(() => {
  loadInn();
});
</script>

<style scoped>
.invoice-step {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.step-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Компактные стили для ИНН блока */
.inn-section.compact {
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.section-header.compact {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.section-header.compact .section-icon {
  color: #6b7280;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #374151;
  margin: 0;
}

.form-group.compact {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 13px;
  font-weight: 500;
  color: #374151;
}

.input-with-action {
  position: relative;
  display: flex;
  align-items: center;
}

.form-input.compact {
  width: 100%;
  padding: 10px 12px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;
  background: white;
  box-sizing: border-box;
}

.form-input.compact:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input.compact:disabled {
  background: #f9fafb;
  color: #6b7280;
  cursor: not-allowed;
}

.input-error {
  border-color: #ef4444;
}

.edit-inn-btn {
  position: absolute;
  right: 6px;
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.edit-inn-btn:hover:not(:disabled) {
  background: #f3f4f6;
  color: #374151;
}

.inn-loading.compact {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: #f3f4f6;
  border-radius: 6px;
  font-size: 12px;
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

.inn-empty-message.compact {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px;
  background: #fffbeb;
  border: 1px solid #fcd34d;
  border-radius: 6px;
  font-size: 12px;
  color: #92400e;
}

.inn-info.compact {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #059669;
}

.error-text.compact {
  font-size: 11px;
  color: #ef4444;
}

.save-inn-btn.compact {
  margin-top: 8px;
  padding: 8px 12px;
  font-size: 13px;
  border-radius: 8px;
}

/* Компактная сводка счета */
.invoice-summary.compact {
  background: #f0f9ff;
  border-radius: 12px;
  padding: 12px;
  border: 1px solid #e0f2fe;
}

.summary-header.compact {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.summary-details.compact {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.detail-item.compact {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 4px;
}

.detail-item.compact:last-child {
  padding-bottom: 0;
}

.detail-label {
  font-size: 13px;
  color: #6b7280;
}

.detail-value {
  font-size: 13px;
  font-weight: 500;
  color: #374151;
}

.step-actions {
  display: flex;
  gap: 16px;
  margin-top: auto;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 20px;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  flex: 1;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.btn-outline {
  background: transparent;
  color: #6b7280;
  border: 2px solid #e5e7eb;
}

.btn-outline:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #d1d5db;
  transform: translateY(-1px);
}

.btn-success {
  background: #10b981;
  color: white;
}

.btn-success:hover:not(:disabled) {
  background: #059669;
  transform: translateY(-1px);
}

.btn-sm {
  padding: 8px 16px;
  font-size: 13px;
  border-radius: 8px;
}

.btn-loading {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* Улучшенный обработчик ошибок */
.enhanced-error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 12px;
  padding: 0;
  overflow: hidden;
}

.error-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #fef2f2;
  border-bottom: 1px solid #fecaca;
}

.error-icon {
  color: #dc2626;
  flex-shrink: 0;
}

.error-title {
  font-size: 14px;
  font-weight: 600;
  color: #dc2626;
  margin: 0;
  flex: 1;
}

.error-close {
  background: none;
  border: none;
  color: #dc2626;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.error-close:hover {
  background: #fecaca;
}

.error-content {
  padding: 16px;
}

.error-content p {
  margin: 0;
  font-size: 14px;
  color: #b91c1c;
  line-height: 1.4;
}

.error-actions {
  padding: 0 16px 16px;
  display: flex;
  justify-content: flex-end;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.2s ease-in;
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
