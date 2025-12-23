<template>
  <div class="amount-step">
    <form @submit.prevent="handleSubmit" class="payment-form">
      <!-- Поле суммы -->
      <div class="form-group">
        <label class="form-label">{{
          t("amountStep.replenishmentAmount")
        }}</label>
        <div class="input-wrapper">
          <input
            v-model="localAmount"
            type="number"
            :placeholder="t('amountStep.enterAmount')"
            min="1"
            max="50000"
            step="1"
            class="form-input"
            :class="{ 'input-error': amountError }"
            :disabled="isLoading"
            @input="handleAmountInput"
          />
          <span class="input-currency">₽</span>
        </div>
        <div class="amount-hints">
          <span class="hint">{{ t("amountStep.min") }}: 10 ₽</span>
          <span class="hint">{{ t("amountStep.max") }}: 50,000 ₽</span>
        </div>
        <div v-if="amountError" class="error-text">{{ amountError }}</div>
      </div>

      <!-- Поле email -->
      <div class="form-group">
        <label class="form-label">{{ t("amountStep.emailForReceipt") }}</label>
        <div class="input-wrapper">
          <input
            v-model.trim="localEmail"
            type="email"
            :placeholder="t('amountStep.enterEmail')"
            class="form-input"
            :class="{ 'input-error': emailError }"
            :disabled="isLoading"
            @input="handleEmailInput"
          />
          <span class="input-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
                stroke="currentColor"
                stroke-width="2"
                fill="none"
              />
              <polyline
                points="22,6 12,13 2,6"
                stroke="currentColor"
                stroke-width="2"
                fill="none"
              />
            </svg>
          </span>
        </div>
        <div v-if="emailError" class="error-text">{{ emailError }}</div>
        <div class="email-hint">
          <span class="hint">{{ t("amountStep.emailHint") }}</span>
        </div>
      </div>

      <!-- Кнопка продолжения -->
      <button
        type="submit"
        class="btn btn-primary action-btn"
        :disabled="isLoading"
      >
        <span class="btn-content">
          {{ t("amountStep.continue") }}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M5 12h14M12 5l7 7-7 7"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
        </span>
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const props = defineProps({
  amount: {
    type: Number,
    default: null,
  },
  email: {
    type: String,
    default: "",
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:amount", "update:email", "next"]);

const localAmount = ref(props.amount || "");
const localEmail = ref(props.email || "");
const emailError = ref("");
const amountError = ref("");

// Валидация суммы
const validateAmount = (amount) => {
  if (!amount || amount === "" || amount === 0)
    return t("amountStep.errors.enterAmount");
  const numAmount = Number(amount);
  if (isNaN(numAmount)) return t("amountStep.errors.amountMustBeNumber");
  if (numAmount < 10) return t("amountStep.errors.minAmount");
  if (numAmount > 50000) return t("amountStep.errors.maxAmount");
  if (!Number.isInteger(numAmount)) return t("amountStep.errors.wholeNumber");
  return "";
};

// Валидация email
const validateEmail = (email) => {
  if (!email) return t("amountStep.errors.emailRequired");
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return t("amountStep.errors.invalidEmail");
  return "";
};

// Обработчик ввода суммы
const handleAmountInput = () => {
  amountError.value = ""; // Сбрасываем ошибку при вводе
  emit("update:amount", localAmount.value ? Number(localAmount.value) : null);
};

// Обработчик ввода email
const handleEmailInput = () => {
  emailError.value = ""; // Сбрасываем ошибку при вводе
  emit("update:email", localEmail.value);
};

const handleSubmit = () => {
  // Валидация суммы
  const amountValidation = validateAmount(localAmount.value);
  if (amountValidation) {
    amountError.value = amountValidation;
    return;
  }

  // Валидация email
  const emailValidation = validateEmail(localEmail.value);
  if (emailValidation) {
    emailError.value = emailValidation;
    return;
  }

  // Если все валидно, переходим к следующему шагу
  emit("next");
};

// Синхронизация с родительским компонентом
watch(
  () => props.amount,
  (value) => {
    if (value !== null && value !== undefined) {
      localAmount.value = value;
    }
  }
);

watch(
  () => props.email,
  (value) => {
    if (value !== null && value !== undefined) {
      localEmail.value = value;
    }
  }
);
</script>

<style scoped>
.amount-step {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.payment-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
  flex: 1;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.input-wrapper {
  position: relative;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 16px;
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

.input-error {
  border-color: #ef4444;
}

.input-currency {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
  font-weight: 500;
}

.input-icon {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
}

.amount-hints {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #9ca3af;
}

.btn-content {
  display: flex;
  align-items: center;
  gap: 4px;
}

.email-hint {
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
}

.error-text {
  font-size: 12px;
  color: #ef4444;
  margin-top: 4px;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  width: 100%;
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
}

.action-btn {
  margin-top: auto;
}
</style>
