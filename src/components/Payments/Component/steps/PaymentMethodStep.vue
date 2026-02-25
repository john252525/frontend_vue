<template>
  <div class="payment-method-step">
    <div class="step-content">
      <div class="methods-section">
        <div class="section-header">
          <div class="section-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
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
          <h3 class="section-title">
            {{ t("paymentMethodStep.paymentMethod") }}
          </h3>
        </div>

        <div class="methods-grid">
          <div
            :class="[
              'method-card',
              {
                'method-active': localMethod === 'YooKassa',
                'method-disabled': isLoading,
              },
            ]"
            @click="!isLoading && selectMethod('YooKassa')"
          >
            <div class="method-icon">
              <div class="icon-wrapper">
                <svg width="24" height="24" viewBox="0 0 95 64" fill="none">
                  <path
                    clip-rule="evenodd"
                    d="m26.4424 31.7092c.0477-17.4683 14.4906-31.7092 32.6397-31.7092 17.9726 0 32.8465 14.288 32.6399 31.7959 0 17.5079-14.6673 31.7959-32.6399 31.7959-17.9431 0-32.5917-14.0406-32.6397-31.7088v23.6592h-11.5685l-14.8739-46.2852h26.4424zm20.4514.0867c0 6.4397 5.5777 11.8732 12.1883 11.8732 6.8172 0 12.1884-5.4335 12.1884-11.8732s-5.5777-11.8731-12.1884-11.8731c-6.6106 0-12.1883 5.4334-12.1883 11.8731z"
                    fill="#0070f0"
                    fill-rule="evenodd"
                  />
                </svg>
              </div>
            </div>
            <div class="method-info">
              <h4>YooKassa</h4>
              <p>{{ t("paymentMethodStep.yookassaMethods") }}</p>
            </div>
            <div class="method-check">
              <div class="checkmark"></div>
            </div>
          </div>

          <div
            :class="[
              'method-card',
              {
                'method-active': localMethod === 'Inn',
                'method-disabled': isLoading,
              },
            ]"
            @click="!isLoading && selectMethod('Inn')"
          >
            <div class="method-icon">
              <div class="icon-wrapper">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M9 12h6"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                  />
                  <path
                    d="M9 16h6"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                  />
                </svg>
              </div>
            </div>
            <div class="method-info">
              <h4>{{ t("paymentMethodStep.invoicePayment") }}</h4>
              <p>{{ t("paymentMethodStep.invoicePaymentDesc") }}</p>
            </div>
            <div class="method-check">
              <div class="checkmark"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Кнопка продолжения -->
    <button
      @click="handleContinue"
      class="btn btn-primary action-btn"
      :disabled="!localMethod || isLoading"
    >
      <span class="btn-content">
        {{ t("paymentMethodStep.continue") }}
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
  </div>
</template>

<script setup>
import { ref, watch, computed } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const props = defineProps({
  method: {
    type: String,
    default: "YooKassa",
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:method", "next"]);

const getPermission = computed(() => {
  return window.location.hostname != "whatsapi.developtech.ru" ||
    window.location.hostname != "app.whatsapi.ru"
    ? false
    : true;
});

const localMethod = ref(props.method);

const selectMethod = (method) => {
  localMethod.value = method;
  emit("update:method", method);
};

const handleContinue = () => {
  if (localMethod.value) {
    emit("next");
  }
};

// Синхронизация с родительским компонентом
watch(localMethod, (value) => {
  emit("update:method", value);
});
</script>

<style scoped>
.payment-method-step {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.step-content {
  flex: 1;
}

.methods-section {
  margin-bottom: 20px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.section-icon {
  color: #6b7280;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  margin: 0;
}

.methods-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.method-card {
  display: flex;
  align-items: center;
  padding: 12px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  background: white;
  gap: 12px;
}

.method-card:hover:not(.method-disabled) {
  border-color: #9ca3af;
  transform: translateY(-1px);
}

.method-active {
  border-color: #3b82f6;
  background: #f0f9ff;
}

.method-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.method-icon {
  flex-shrink: 0;
}

.icon-wrapper {
  width: 40px;
  height: 40px;
  background: #f8fafc;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.method-info {
  flex: 1;
}

.method-info h4 {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 2px 0;
}

.method-info p {
  font-size: 12px;
  color: #6b7280;
  margin: 0;
}

.method-check {
  flex-shrink: 0;
}

.checkmark {
  width: 20px;
  height: 20px;
  border: 2px solid #d1d5db;
  border-radius: 50%;
  position: relative;
  transition: all 0.2s;
}

.method-active .checkmark {
  border-color: #3b82f6;
  background: #3b82f6;
}

.method-active .checkmark::after {
  content: "";
  position: absolute;
  left: 6px;
  top: 7px;
  width: 6px;
  height: 3px;
  border: 2px solid white;
  border-top: none;
  border-right: none;
  transform: rotate(-45deg);
}

.btn-content {
  display: flex;
  align-items: center;
  gap: 4px;
}

.action-btn {
  margin-top: auto;
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
</style>
