<template>
  <div class="error-container">
    <div class="error-icon">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
    </div>

    <div class="error-content">
      <h3 class="error-title">Ошибка подключения</h3>

      <p class="error-message">
        <template v-if="typeError === 'code'">
          Не получилось связать ваш аккаунт через код. Попробуйте другой способ
          подключения.
        </template>
        <template v-else-if="typeError === 'qrCode'">
          Не удалось подключиться через QR-код. Возможно, код устарел или
          произошла ошибка сканирования.
        </template>
        <template v-else>
          Произошла ошибка сервера. Пожалуйста, попробуйте позже или выберите
          другой способ подключения.
        </template>
      </p>

      <div class="account-info" v-if="accountLogin">
        <span class="account-label">Аккаунт:</span>
        <span class="account-login">{{ accountLogin }}</span>
      </div>
    </div>

    <div class="error-actions">
      <button
        class="action-button code-button"
        @click="$emit('connectWithCode')"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M17 7l-10 10"></path>
          <path d="M8 7l9 0l0 9"></path>
        </svg>
        Связать через код
      </button>

      <button class="action-button qr-button" @click="$emit('connectWithQR')">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <rect x="3" y="3" width="6" height="6"></rect>
          <rect x="15" y="3" width="6" height="6"></rect>
          <rect x="3" y="15" width="6" height="6"></rect>
          <rect x="15" y="15" width="6" height="6"></rect>
        </svg>
        Связать через QR
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  typeError: {
    type: String,
    default: "", // 'code', 'qrCode', или пустая строка для общей ошибки
  },
  accountLogin: {
    type: String,
    default: "",
  },
});

defineEmits(["connectWithCode", "connectWithQR", "cancel"]);
</script>

<style scoped>
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  /* padding: 24px; */
  background: white;
  border-radius: 12px;
  /* border: 1px solid #e5e7eb; */
  /* box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); */
  max-width: 400px;
  margin: 0 auto;
}

.error-icon {
  color: #ef4444;
  margin-bottom: 16px;
}

.error-content {
  text-align: center;
  margin-bottom: 24px;
}

.error-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 12px 0;
}

.error-message {
  color: #6b7280;
  font-size: 14px;
  line-height: 1.5;
  margin: 0 0 16px 0;
}

.account-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #f8fafc;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

.account-label {
  font-weight: 600;
  color: #374151;
  font-size: 12px;
}

.account-login {
  color: #6b7280;
  font-size: 12px;
  font-weight: 500;
}

.error-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.action-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
}

.code-button {
  background: #f8fafc;
  color: #3b82f6;
}

.code-button:hover {
  background: #eff6ff;
  border-color: #3b82f6;
}

.qr-button {
  background: #f8fafc;
  color: #10b981;
}

.qr-button:hover {
  background: #ecfdf5;
  border-color: #10b981;
}

.cancel-button {
  background: #f8fafc;
  color: #6b7280;
}

.cancel-button:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
}

.action-button svg {
  flex-shrink: 0;
}

@media (max-width: 480px) {
  .error-container {
    padding: 20px;
    margin: 16px;
  }

  .error-title {
    font-size: 16px;
  }

  .error-message {
    font-size: 13px;
  }

  .action-button {
    padding: 8px 12px;
    font-size: 13px;
  }
}
</style>
