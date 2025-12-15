<template>
  <div class="payment-step">
    <div class="step-content">
      <div class="payment-summary">
        <div class="summary-header">
          <div class="summary-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect
                x="2"
                y="5"
                width="20"
                height="14"
                rx="2"
                stroke="currentColor"
                stroke-width="2"
              />
              <path d="M2 10h20" stroke="currentColor" stroke-width="2" />
              <path
                d="M6 15h4"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
          </div>
          <h3 class="summary-title">Оплата через YooKassa</h3>
        </div>

        <div class="summary-details">
          <div class="detail-item">
            <span class="detail-label">Сумма:</span>
            <span class="detail-value">{{ amount }} ₽</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Email для чека:</span>
            <span class="detail-value">{{ email }}</span>
          </div>
        </div>

        <div class="payment-security">
          <div class="security-badge">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
                stroke="currentColor"
                stroke-width="2"
              />
            </svg>
            <span>Безопасная оплата через YooKassa</span>
          </div>
        </div>
      </div>
    </div>

    <div class="step-actions">
      <!-- <button @click="$emit('back')" class="btn btn-outline" :disabled="isLoading">
        Назад
      </button> -->
      <button
        @click="processPayment"
        class="btn btn-primary"
        :disabled="isLoading"
      >
        <span v-if="isLoading" class="btn-loading">
          <div class="btn-spinner"></div>
          Переходим к оплате...
        </span>
        <span v-else class="btn-content"> Перейти к оплате </span>
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
          <h4 class="error-title">Ошибка оплаты</h4>
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
          <button @click="processPayment" class="btn btn-sm btn-primary">
            Попробовать снова
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref } from "vue";
import axios from "axios";
import { useAccountStore } from "@/stores/accountStore";
import useFrontendLogger from "@/composables/useFrontendLogger";

const { sendLog } = useFrontendLogger();
const accountStore = useAccountStore();
const token = accountStore.getAccountToken;

const apiUrl = import.meta.env.VITE_PAY_URL;

const props = defineProps({
  amount: {
    type: Number,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["back", "payment-success", "payment-error"]);

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

const processPayment = async () => {
  clearError();

  // Валидация
  if (!props.amount || props.amount < 10) {
    localError.value = "Минимальная сумма оплаты - 10 руб.";
    showRetry.value = true;
    return;
  }

  if (props.amount > 50000) {
    localError.value = "Максимальная сумма оплаты - 50,000 руб.";
    showRetry.value = true;
    return;
  }

  try {
    const response = await axios.post(
      `${apiUrl}/payment/create`,
      {
        amount: props.amount,
        currency: "RUB",
        type: "+",
        domain: `https://${window.location.hostname}/Payments`,
        email: props.email,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000, // 10 секунд таймаут
      }
    );

    if (response.data) {
      await handleSendLog(
        "payment",
        "create_payment",
        {
          amount: props.amount,
          currency: "RUB",
          email: props.email,
        },
        response.data,
        response.data
      );
    }

    if (response.data.success) {
      const paymentUrl = response.data.confirmation_url;
      window.location.href = paymentUrl;
      emit("payment-success");
    } else {
      const errorMsg =
        response.data.message || "Неизвестная ошибка при создании платежа";
      localError.value = errorMsg;
      showRetry.value = true;
      emit("payment-error", errorMsg);
    }
  } catch (error) {
    console.error("Payment error:", error);

    let errorMsg = "Ошибка сети";

    if (error.code === "ECONNABORTED") {
      errorMsg = "Превышено время ожидания. Проверьте соединение.";
    } else if (error.response) {
      errorMsg =
        error.response.data?.message ||
        `Ошибка сервера: ${error.response.status}`;
    } else if (error.request) {
      errorMsg =
        "Не удалось соединиться с сервером. Проверьте интернет-соединение.";
    }

    localError.value = errorMsg;
    showRetry.value = true;
    emit("payment-error", errorMsg);
  }
};
</script>

<style scoped>
.payment-step {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.step-content {
  flex: 1;
}

.payment-summary {
  background: #f8fafc;
  border-radius: 16px;
  padding: 20px;
  border: 1px solid #e2e8f0;
}

.summary-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.summary-icon {
  color: #3b82f6;
}

.summary-title {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.summary-details {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 20px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 1px solid #e5e7eb;
}

.detail-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.detail-label {
  font-size: 14px;
  color: #6b7280;
}

.detail-value {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.payment-security {
  display: flex;
  justify-content: center;
}

.security-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: white;
  border-radius: 12px;
  font-size: 13px;
  color: #059669;
  border: 1px solid #d1fae5;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
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
