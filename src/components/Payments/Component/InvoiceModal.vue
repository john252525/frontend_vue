<template>
  <div class="modal-overlay" @click="$emit('close')"></div>
  <section class="invoice-modal">
    <div class="invoice-modal-content">
      <div class="modal-header">
        <h2 class="modal-title">Счет готов к оплате</h2>
        <button @click="$emit('close')" class="close-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M18 6L6 18M6 6l12 12"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      </div>

      <div class="invoice-success">
        <div class="success-icon-large">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" fill="#10b981" />
            <path
              d="M9 12l2 2 4-4"
              stroke="white"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
        <div class="success-message">
          <h3>Счет успешно сгенерирован</h3>
          <p>Вы можете просмотреть или скачать счет для оплаты</p>
        </div>
      </div>

      <div class="invoice-details">
        <div class="detail-item">
          <span class="detail-label">Сумма:</span>
          <span class="detail-value">{{ amount }} ₽</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Дата создания:</span>
          <span class="detail-value">{{
            new Date().toLocaleDateString("ru-RU")
          }}</span>
        </div>
      </div>

      <!-- Статус сохранения -->
      <div v-if="saveStatus.show" class="save-status" :class="saveStatus.type">
        <div class="status-content">
          <span v-if="saveStatus.loading" class="status-loading">
            <div class="status-spinner"></div>
          </span>
          <span v-else class="status-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path
                v-if="saveStatus.type === 'success'"
                d="M20 6L9 17l-5-5"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                v-else
                d="M18 6L6 18M6 6l12 12"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </span>
          <span class="status-text">{{ saveStatus.message }}</span>
        </div>
      </div>

      <div class="invoice-actions-modal">
        <button @click="openInvoiceInNewTab" class="btn btn-outline btn-large">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
              stroke="currentColor"
              stroke-width="2"
              fill="none"
            />
            <circle
              cx="12"
              cy="12"
              r="3"
              stroke="currentColor"
              stroke-width="2"
              fill="none"
            />
          </svg>
          Посмотреть счет
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import { useAccountStore } from "@/stores/accountStore";

const accountStore = useAccountStore();
const token = accountStore.getAccountToken;

const props = defineProps({
  amount: {
    type: Number,
    required: true,
  },
  invoiceLink: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["close"]);

const saveStatus = ref({
  show: false,
  loading: false,
  type: "loading", // loading, success, error
  message: "",
});

// Функция для сохранения чека в историю
const saveCheckToHistory = async () => {
  saveStatus.value = {
    show: true,
    loading: true,
    type: "loading",
    message: "Сохранение в историю...",
  };

  try {
    const response = await axios.post(
      "https://api22.developtech.ru/api/saveCheck",
      {
        amount: props.amount,
        checkUrl: props.invoiceLink,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Успешное сохранение
    saveStatus.value = {
      show: true,
      loading: false,
      type: "success",
      message: "Сохранено в историю",
    };

    // Скрываем сообщение через 2 секунды
    setTimeout(() => {
      saveStatus.value.show = false;
    }, 2000);
  } catch (error) {
    console.error("Ошибка при сохранении чека:", error);

    // Ошибка сохранения
    saveStatus.value = {
      show: true,
      loading: false,
      type: "error",
      message: "Ошибка сохранения",
    };

    // Скрываем сообщение через 3 секунды
    setTimeout(() => {
      saveStatus.value.show = false;
    }, 3000);
  }
};

const openInvoiceInNewTab = () => {
  if (props.invoiceLink) {
    window.open(props.invoiceLink, "_blank");
  }
};

// Автоматически сохраняем чек при открытии модального окна
onMounted(() => {
  saveCheckToHistory();
});
</script>

<style scoped>
.invoice-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1002;
  background: white;
  border-radius: 20px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
  width: 400px;
  max-height: 90vh;
  overflow: hidden;
}

.invoice-modal-content {
  padding: 24px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.modal-title {
  font-size: 20px;
  font-weight: 600;
  color: #111827;
  margin: 0;
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
}

.close-btn:hover {
  background: #e5e7eb;
  color: #374151;
}

.invoice-success {
  text-align: center;
  margin-bottom: 24px;
}

.success-icon-large {
  margin-bottom: 16px;
}

.success-message h3 {
  font-size: 18px;
  font-weight: 600;
  color: #065f46;
  margin: 0 0 8px 0;
}

.success-message p {
  font-size: 14px;
  color: #047857;
  margin: 0;
}

.invoice-details {
  background: #f8fafc;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.detail-item:not(:last-child) {
  border-bottom: 1px solid #e5e7eb;
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

/* Стили для статуса сохранения */
.save-status {
  padding: 8px 12px;
  border-radius: 6px;
  margin-bottom: 16px;
  font-size: 13px;
  transition: all 0.3s ease;
}

.save-status.loading {
  background-color: #fef3c7;
  color: #92400e;
  border: 1px solid #fbbf24;
}

.save-status.success {
  background-color: #d1fae5;
  color: #065f46;
  border: 1px solid #10b981;
}

.save-status.error {
  background-color: #fee2e2;
  color: #991b1b;
  border: 1px solid #ef4444;
}

.status-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-loading {
  display: flex;
  align-items: center;
}

.status-spinner {
  width: 12px;
  height: 12px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.status-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-text {
  font-weight: 500;
}

.invoice-actions-modal {
  display: flex;
  flex-direction: column;
  gap: 12px;
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

.btn-outline {
  background: transparent;
  color: #3b82f6;
  border: 2px solid #3b82f6;
}

.btn-outline:hover:not(:disabled) {
  background: #3b82f6;
  color: white;
}

.btn-large {
  padding: 14px 20px;
  font-size: 16px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
