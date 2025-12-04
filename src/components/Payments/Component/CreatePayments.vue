<template>
  <div class="modal-overlay" @click="changeCreatePayments"></div>
  <section v-if="!showInvoiceModal" class="payment-modal">
    <!-- Загрузочный оверлей -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loader-container">
        <div class="spinner"></div>
        <p class="loading-text">{{ loadingText }}</p>
      </div>
    </div>

    <div class="modal-content">
      <!-- Заголовок с шагами -->
      <div class="modal-header">
        <button
          v-if="currentStep > 1"
          @click="goToPreviousStep"
          class="back-btn"
          :disabled="isLoading"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M19 12H5M12 19l-7-7 7-7"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
        </button>

        <div class="steps-indicator">
          <div class="steps">
            <div
              v-for="step in steps"
              :key="step.number"
              :class="[
                'step',
                {
                  active: step.number === currentStep,
                  completed: step.number < currentStep,
                },
              ]"
            >
              <div class="step-number">{{ step.number }}</div>
              <span class="step-label">{{ step.label }}</span>
            </div>
          </div>
        </div>

        <button
          @click="changeCreatePayments"
          class="close-btn"
          :disabled="isLoading"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M18 6L6 18M6 6l12 12"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
        </button>
      </div>

      <!-- Контент шагов -->
      <div class="step-content">
        <AmountStep
          v-if="currentStep === 1"
          :amount="payments.amount"
          :email="payments.email"
          :is-loading="isLoading"
          @update:amount="updateAmount"
          @update:email="updateEmail"
          @next="goToNextStep"
        />

        <PaymentMethodStep
          v-else-if="currentStep === 2"
          :method="payments.value"
          :is-loading="isLoading"
          @update:method="updateMethod"
          @next="goToNextStep"
        />

        <PaymentStep
          v-else-if="currentStep === 3 && payments.value === 'YooKassa'"
          :amount="payments.amount"
          :email="payments.email"
          :is-loading="isLoading"
          @back="goToPreviousStep"
          @payment-success="handlePaymentSuccess"
          @payment-error="handlePaymentError"
        />

        <InvoiceStep
          v-else-if="currentStep === 3 && payments.value === 'Inn'"
          :amount="payments.amount"
          :is-loading="isLoading"
          @back="goToPreviousStep"
          @invoice-generated="handleInvoiceGenerated"
          @invoice-error="handlePaymentError"
        />
      </div>

      <!-- Сообщение об ошибке -->
      <transition name="slide-fade">
        <div v-if="errorMessage" class="error-card">
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
          <div class="error-content">
            <p>{{ errorMessage }}</p>
          </div>
        </div>
      </transition>
    </div>
  </section>

  <!-- Модалка счета -->
  <InvoiceModal
    v-if="showInvoiceModal"
    :amount="payments.amount"
    :invoice-link="invoiceLink"
    @close="closeInvoiceModal"
  />
</template>

<script setup>
import { reactive, ref, computed } from "vue";
import AmountStep from "./steps/AmountStep.vue";
import PaymentMethodStep from "./steps/PaymentMethodStep.vue";
import PaymentStep from "./steps/PaymentStep.vue";
import InvoiceStep from "./steps/InvoiceStep.vue";
import InvoiceModal from "./InvoiceModal.vue";

const props = defineProps({
  changeCreatePayments: {
    type: Function,
    required: true,
  },
});

// Реактивные состояния
const payments = reactive({
  value: "YooKassa",
  amount: null,
  email: "",
});

const currentStep = ref(1);
const isLoading = ref(false);
const loadingText = ref("");
const showInvoiceModal = ref(false);
const invoiceLink = ref("");
const errorMessage = ref("");

// Шаги процесса
const steps = computed(() => [
  { number: 1, label: "Сумма" },
  { number: 2, label: "Способ оплаты" },
  { number: 3, label: payments.value === "YooKassa" ? "Оплата" : "Счет" },
]);

// Методы обновления данных
const updateAmount = (amount) => {
  payments.amount = amount;
};

const updateEmail = (email) => {
  payments.email = email;
};

const updateMethod = (method) => {
  payments.value = method;
};

// Навигация по шагам
const goToNextStep = () => {
  if (currentStep.value < 3) {
    currentStep.value++;
    errorMessage.value = "";
  }
};

const goToPreviousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--;
    errorMessage.value = "";
  }
};

const handlePaymentSuccess = () => {
  props.changeCreatePayments();
};

const handleInvoiceGenerated = (invoiceData) => {
  invoiceLink.value = invoiceData.invoice_link;
  showInvoiceModal.value = true;
};

const handlePaymentError = (error) => {
  errorMessage.value = error;
  isLoading.value = false;
};

const closeInvoiceModal = () => {
  showInvoiceModal.value = false;
  props.changeCreatePayments();
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  z-index: 1000;
}

.payment-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1001;
  background: white;
  border-radius: 20px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
  width: 440px;
  max-height: 85vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(4px);
  border-radius: 20px;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loader-container {
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f4f6;
  border-left: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 12px;
}

.loading-text {
  color: #6b7280;
  font-size: 14px;
  font-weight: 500;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.modal-content {
  padding: 24px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  gap: 12px;
}

.back-btn {
  background: #f3f4f6;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.back-btn:hover:not(:disabled) {
  background: #e5e7eb;
  color: #374151;
}

.close-btn {
  background: #f3f4f6;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.close-btn:hover:not(:disabled) {
  background: #e5e7eb;
  color: #374151;
}

.steps-indicator {
  flex: 1;
}

.steps {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.step-number {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #f3f4f6;
  color: #9ca3af;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.step.active .step-number {
  background: #3b82f6;
  color: white;
}

.step.completed .step-number {
  background: #10b981;
  color: white;
}

.step-label {
  font-size: 12px;
  color: #9ca3af;
  font-weight: 500;
  transition: all 0.3s;
}

.step.active .step-label {
  color: #3b82f6;
}

.step.completed .step-label {
  color: #10b981;
}

.step-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.error-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #dc2626;
  margin-top: 16px;
  flex-shrink: 0;
}

.error-icon {
  color: #dc2626;
}

.error-content p {
  margin: 0;
  font-size: 14px;
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
