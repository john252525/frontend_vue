<template>
  <ModalFrame :text="textModal" :close="closeModal" :item="accountData">
    <div class="modal-body">
      <div class="info-sections">
        <div class="info-section">
          <h4 class="section-title">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M12 8v4l2 2"></path>
            </svg>
            Статус
          </h4>
          <div class="status-grid">
            <div class="status-item">
              <span class="status-label">Состояние:</span>
              <span
                class="status-value"
                :class="getStatusClass(accountData.step)"
              >
                {{ getStatusText(accountData.step) }}
              </span>
            </div>
            <div class="status-item">
              <span class="status-label">Включен:</span>
              <span
                class="status-value"
                :class="accountData.enabled ? 'status-on' : 'status-off'"
              >
                {{ accountData.enabled ? "Да" : "Нет" }}
              </span>
            </div>
            <div class="status-item" v-if="accountData.last_activity">
              <span class="status-label">Активность:</span>
              <span class="status-value">{{
                formatDateTime(accountData.last_activity)
              }}</span>
            </div>
          </div>
          <div class="action-section">
            <div class="action-buttons-grid">
              <button
                class="action-button"
                @click="emitAction('toggle')"
                :class="accountData.enabled ? 'warning' : 'success'"
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
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="16"></line>
                  <line x1="8" y1="12" x2="16" y2="12"></line>
                </svg>
                {{ accountData.enabled ? "Выключить" : "Включить" }}
              </button>

              <button class="action-button" @click="emitAction('reset')">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"
                  ></path>
                  <path d="M3 3v5h5"></path>
                </svg>
                Сбросить
              </button>
              <button class="action-button" @click="emitAction('change-proxy')">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <circle cx="12" cy="12" r="4"></circle>
                </svg>
                Сменить прокси
              </button>

              <button class="action-button" @click="emitAction('reset')">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"
                  ></path>
                  <path d="M3 3v5h5"></path>
                </svg>
                Сбросить
              </button>
            </div>
          </div>
        </div>

        <!-- Подписка -->
        <div class="info-section">
          <h4 class="section-title">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            Подписка
          </h4>
          <div class="subscription-info">
            <div class="subscription-item">
              <span class="subscription-label">Статус:</span>
              <span
                class="subscription-value"
                :class="
                  accountData.subscription_dt_to
                    ? 'subscription-active'
                    : 'subscription-expired'
                "
              >
                {{ accountData.subscription_dt_to ? "Активна" : "Неактивна" }}
              </span>
            </div>
            <div
              class="subscription-item"
              v-if="accountData.subscription_dt_to"
            >
              <span class="subscription-label">Действует до:</span>
              <span class="subscription-value">{{
                formatDate(accountData.subscription_dt_to)
              }}</span>
            </div>
            <div
              class="subscription-item"
              v-if="accountData.subscription_days_left !== undefined"
            >
              <span class="subscription-label">Осталось дней:</span>
              <span
                class="subscription-value"
                :class="getDaysLeftClass(accountData.subscription_days_left)"
              >
                {{ accountData.subscription_days_left }}
              </span>
            </div>
          </div>
          <div class="action-section">
            <div class="action-buttons-grid">
              <button
                class="action-button primary"
                @click="emitAction('extend')"
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
                  <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                </svg>
                Продлить
              </button>
            </div>
          </div>
        </div>

        <!-- Аккаунт -->
        <div class="info-section">
          <h4 class="section-title">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            Аккаунт
          </h4>
          <div class="account-details">
            <div class="detail-item">
              <span class="detail-label">Логин:</span>
              <span class="detail-value">{{ accountData.name }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Создан:</span>
              <span class="detail-value">{{
                formatDateTime(accountData.created_at)
              }}</span>
            </div>
          </div>
          <div class="action-section">
            <div class="action-buttons-grid">
              <button class="action-button" @click="emitAction('rename')">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                  <path d="M15 5l4 4" />
                </svg>
                Сменить имя
              </button>

              <button
                class="action-button danger"
                @click="emitAction('delete')"
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
                  <path d="M3 6h18"></path>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
                  <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
                Удалить
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </ModalFrame>
</template>

<script setup>
import { ref, computed } from "vue";
import AccountIcon from "../../AccountIcon.vue";
import ModalFrame from "@/components/GlobalModal/ModalFrame.vue";

const props = defineProps({
  accountData: {
    type: Object,
    required: true,
    default: () => ({}),
  },
  isVisible: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(["close", "action"]);

const textModal = ref({
  title: "Информация об аккаунте",
  close: "Закрыть",
});

const closeModal = () => {
  emit("close");
};

const emitAction = (actionType) => {
  emit("action", actionType, props.accountData);
};

// Вспомогательные функции
const getStatusClass = (status) => {
  if (!status) return "status-offline";
  const statusValue = status.value || status.code || status;
  const statusString =
    typeof statusValue === "number" ? statusValue.toString() : statusValue;
  if (typeof statusString !== "string") return "status-offline";

  const statusMap = {
    active: "status-online",
    online: "status-online",
    offline: "status-offline",
    error: "status-error",
    loading: "status-loading",
    connected: "status-online",
    disconnected: "status-offline",
    success: "status-online",
    failed: "status-error",
    pending: "status-loading",
    running: "status-online",
    stopped: "status-offline",
  };

  return statusMap[statusString.toLowerCase()] || "status-offline";
};

const getStatusText = (status) => {
  if (!status) return "Неизвестно";
  const statusValue = status.value || status.code || status;
  const statusMap = {
    active: "Активен",
    online: "В сети",
    offline: "Не в сети",
    error: "Ошибка",
    loading: "Загрузка",
    connected: "Подключен",
    disconnected: "Отключен",
    success: "Успешно",
    failed: "Ошибка",
    pending: "Ожидание",
    running: "Работает",
    stopped: "Остановлен",
  };

  const text = statusMap[String(statusValue).toLowerCase()];
  return text || String(statusValue);
};

const formatDate = (dateString) => {
  if (!dateString) return "Не указано";
  try {
    return new Date(dateString).toLocaleDateString("ru-RU");
  } catch (e) {
    return dateString;
  }
};

const formatDateTime = (dateString) => {
  if (!dateString) return "Не указано";
  try {
    return new Date(dateString).toLocaleString("ru-RU");
  } catch (e) {
    return dateString;
  }
};

const getDaysLeftClass = (days) => {
  if (days > 7) return "days-many";
  if (days > 3) return "days-few";
  return "days-critical";
};

const formatUptime = (seconds) => {
  if (!seconds) return "Неизвестно";
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  return `${days}д ${hours}ч`;
};

const hasStatistics = (account) => {
  return (
    account.messages_sent ||
    account.contacts_count ||
    account.groups_count ||
    account.uptime
  );
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: white;
  border-radius: 16px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 24px;
  border-bottom: 1px solid #e2e8f0;
  background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
  border-radius: 16px 16px 0 0;
}

.account-header {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.account-avatar {
  position: relative;
}

.account-status {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 12px;
  height: 12px;
  border: 2px solid white;
  border-radius: 50%;
}

.account-status.status-online {
  background: #22c55e;
}
.account-status.status-offline {
  background: #94a3b8;
}
.account-status.status-error {
  background: #ef4444;
}
.account-status.status-loading {
  background: #3b82f6;
}

.account-title h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
  line-height: 1.3;
}

.account-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 4px;
}

.account-type {
  font-size: 13px;
  color: white;
  background: #3b82f6;
  padding: 4px 10px;
  border-radius: 20px;
  font-weight: 500;
}

.account-id {
  font-size: 12px;
  color: #64748b;
}

.close-button {
  background: #f1f5f9;
  border: none;
  padding: 8px;
  cursor: pointer;
  border-radius: 8px;
  color: #64748b;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.close-button:hover {
  background: #e2e8f0;
  color: #475569;
}

.modal-body {
  padding: 0;
}

.info-sections {
  padding: 24px;
}

.info-section {
  margin-bottom: 24px;
}

.info-section:last-child {
  margin-bottom: 0;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 16px 0;
}

.section-title svg {
  color: #64748b;
}

.status-grid,
.subscription-info,
.account-details,
.connection-info,
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.status-item,
.subscription-item,
.detail-item,
.connection-item,
.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.status-label,
.subscription-label,
.detail-label,
.connection-label,
.stat-label {
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.status-value,
.subscription-value,
.detail-value,
.connection-value,
.stat-value {
  font-size: 14px;
  color: #334155;
  font-weight: 500;
}

.status-value {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  display: inline-block;
  width: fit-content;
}

.status-online {
  background: #dcfce7;
  color: #166534;
}
.status-offline {
  background: #f1f5f9;
  color: #64748b;
}
.status-error {
  background: #fee2e2;
  color: #b91c1c;
}
.status-loading {
  background: #dbeafe;
  color: #1d4ed8;
}

.status-on {
  color: #22c55e;
  font-weight: 600;
}
.status-off {
  color: #ef4444;
  font-weight: 600;
}

.subscription-active {
  color: #166534;
  font-weight: 600;
}
.subscription-expired {
  color: #dc2626;
  font-weight: 600;
}

.days-many {
  color: #166534;
}
.days-few {
  color: #ca8a04;
}
.days-critical {
  color: #dc2626;
  font-weight: 600;
}

.action-section {
  padding: 20px 0px;
}

.action-buttons-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 12px;
}

.action-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  color: #475569;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
}

.action-button:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.action-button.primary {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.action-button.primary:hover {
  background: #2563eb;
  border-color: #2563eb;
}

.action-button.success {
  background: #dcfce7;
  color: #166534;
  border-color: #bbf7d0;
}

.action-button.success:hover {
  background: #bbf7d0;
}

.action-button.warning {
  background: #fef3c7;
  color: #92400e;
  border-color: #fde68a;
}

.action-button.warning:hover {
  background: #fde68a;
}

.action-button.danger {
  background: #fef2f2;
  color: #dc2626;
  border-color: #fecaca;
}

.action-button.danger:hover {
  background: #fecaca;
}

.action-button svg {
  flex-shrink: 0;
  width: 16px;
  height: 16px;
}

@media (max-width: 768px) {
  .modal-content {
    margin: 10px;
    max-width: none;
  }

  .modal-header {
    padding: 20px;
    flex-direction: column;
    gap: 16px;
  }

  .info-sections {
    padding: 20px;
  }

  .action-section {
    padding: 20px;
  }

  .status-grid,
  .subscription-info,
  .account-details,
  .connection-info,
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .action-buttons-grid {
    grid-template-columns: 1fr;
  }

  .account-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}

@media (max-width: 480px) {
  .modal-overlay {
    padding: 10px;
  }

  .modal-content {
    margin: 0;
    border-radius: 12px;
  }

  .modal-header {
    padding: 16px;
  }

  .info-sections {
    padding: 16px;
  }

  .action-section {
    padding: 16px;
  }
}
</style>
