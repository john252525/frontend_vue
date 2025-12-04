<template>
  <div class="warning-modal-overlay" @click="close">
    <div class="warning-modal" @click.stop>
      <div class="warning-modal-header">
        <div class="warning-icon">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 9V11M12 15H12.01M5.07183 19H18.9282C20.4678 19 21.4301 17.3333 20.6603 16L13.7321 4C12.9623 2.66667 11.0377 2.66667 10.2679 4L3.33975 16C2.56995 17.3333 3.53216 19 5.07183 19Z"
              stroke="#F59E0B"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
        <h2 class="warning-title">Требуется активация подписки</h2>
        <button class="close-button" @click="close">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M18 6L6 18M6 6L18 18"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      </div>

      <div class="warning-modal-content">
        <div class="account-info">
          <div class="account-icon">
            <AccountIcon :item="item" />
          </div>
          <div class="account-details">
            <h3 class="account-name">
              {{ item.name || item.login || "Аккаунт" }}
            </h3>
          </div>
        </div>

        <div class="warning-message">
          <p class="message-text">
            Для полноценной работы аккаунта необходимо:
          </p>
          <ul class="requirements-list">
            <li class="requirement-item">
              <span class="check-icon">✓</span>
              Приобрести подписку
            </li>
            <li class="requirement-item">
              <span class="check-icon">✓</span>
              Активировать аккаунт
            </li>
          </ul>
          <p class="additional-info">
            Без выполнения этих условий функционал аккаунта будет ограничен.
          </p>
        </div>

        <div class="warning-actions">
          <button class="action-button secondary" @click="close">
            Понятно
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from "vue";
import AccountIcon from "../AccountIcon.vue";

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["close"]);

const close = () => {
  emit("close");
};

const activateSubscription = () => {
  // Здесь будет логика перехода к активации подписки
  console.log("Активация подписки для:", props.item);
  close();
};

const getAccountType = (type) => {
  const types = {
    whatsapp: "WhatsApp",
    telegram: "Telegram",
    bulk: "Рассылки",
    amocrm: "AmoCRM",
    bitrix24: "Bitrix24",
  };
  return types[type] || type;
};
</script>

<style scoped>
.warning-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.warning-modal {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  max-width: 480px;
  width: 100%;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.warning-modal-header {
  display: flex;
  align-items: center;
  padding: 24px 24px 16px;
  border-bottom: 1px solid #f3f4f6;
  position: relative;
}

.warning-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: #fef3c7;
  border-radius: 12px;
  margin-right: 16px;
}

.warning-title {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  flex: 1;
}

.close-button {
  background: none;
  border: none;
  padding: 8px;
  border-radius: 8px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}

.close-button:hover {
  background: #f3f4f6;
  color: #374151;
}

.warning-modal-content {
  padding: 24px;
}

.account-info {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
}

.account-icon {
  margin-right: 12px;
}

.account-details {
  flex: 1;
}

.account-name {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 4px 0;
}

.account-type {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

.warning-message {
  margin-bottom: 24px;
}

.message-text {
  font-size: 16px;
  color: #374151;
  margin: 0 0 16px 0;
  line-height: 1.5;
}

.requirements-list {
  list-style: none;
  padding: 0;
  margin: 0 0 16px 0;
}

.requirement-item {
  display: flex;
  align-items: center;
  padding: 8px 0;
  font-size: 14px;
  color: #374151;
}

.check-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background: #10b981;
  color: white;
  border-radius: 50%;
  font-size: 12px;
  margin-right: 12px;
  flex-shrink: 0;
}

.additional-info {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
  line-height: 1.5;
  padding: 12px 16px;
  background: #fef3c7;
  border-radius: 8px;
  border-left: 4px solid #f59e0b;
}

.warning-actions {
  display: flex;
  gap: 12px;
}

.action-button {
  flex: 1;
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.action-button.primary {
  background: #6732ff;
  color: white;
}

.action-button.primary:hover {
  background: #5a2ae0;
}

.action-button.secondary {
  background: #f3f4f6;
  color: #374151;
}

.action-button.secondary:hover {
  background: #e5e7eb;
}

@media (max-width: 640px) {
  .warning-modal-overlay {
    padding: 16px;
  }

  .warning-modal {
    max-width: 100%;
  }

  .warning-modal-header {
    padding: 20px 20px 12px;
  }

  .warning-modal-content {
    padding: 20px;
  }

  .warning-actions {
    flex-direction: column;
  }
}
</style>
