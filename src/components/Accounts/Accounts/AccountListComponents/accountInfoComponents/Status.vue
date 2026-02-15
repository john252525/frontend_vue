<template>
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
        :class="getStatusClass(accountData.step?.value)"
      >
        {{ getStatusText(accountData.step?.value) }}
      </span>
    </div>
    <div class="status-item">
      <span class="status-label">Сообщение:</span>
      <span class="status-value-message">
        {{ getMessageText(accountData.step?.value) }}
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
        @click="changeStatus(accountData)"
        :class="accountData.step?.value === 5 ? 'warning' : 'success'"
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
        {{ accountData.step?.value === 5 ? "Выключить" : "Включить" }}
      </button>

      <button
        class="action-button"
        @click="createRequest(accountData, '/getNewProxy')"
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
          <circle cx="12" cy="12" r="4"></circle>
        </svg>
        Сменить прокси
      </button>

      <button class="action-button" @click="openResetAccountModal">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
          <path d="M3 3v5h5"></path>
        </svg>
        Сбросить
      </button>

      <button class="action-button" @click="changeEditNameModal">
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

      <button class="action-button danger" @click="deleteAccount">
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
</template>

<script setup>
const props = defineProps({
  accountData: {
    type: Object,
    required: true,
    default: () => ({}),
  },
  createRequest: {
    type: Function,
  },
  changeEditNameModal: {
    type: Function,
  },
  changeForceStopItemData: {
    type: Function,
  },
  openResetAccountModal: {
    type: Function,
  },
  deleteAccount: {
    type: Function,
  },
});

const changeStatus = async (item) => {
  if (props.accountData.step?.value === 5) {
    const result = await props.createRequest(item, "/forceStop");

    if (result === true) {
      console.log("success force");
      props.changeForceStopItemData(item);
      props.accountData.step = null;
    }
  } else {
    return;
  }
};

const getStatusClass = (status) => {
  switch (status) {
    case 5:
      return "status-online";
    default:
      return "status-error";
  }
};

const getStatusText = (status) => {
  switch (status) {
    case 5:
      return "Активен";
    default:
      return "Не активен";
  }
};

const getMessageText = (status) => {
  switch (status) {
    case 5:
      return "Аккаунт готов к использованию";
    case 2.2:
      return "Требуется авторизация по QR-коду";
    case 2.22:
      return "Требуется авторизация по коду";
    default:
      return "Требуется авторизация";
  }
};
</script>

<style scoped>
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
  grid-template-columns: 1fr;
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

.status-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.status-value {
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

.status-value-message {
  font-size: 12px;
  font-weight: 500;
}

.status-online {
  background: #dcfce7;
  color: #166534;
}

.status-error {
  background: #fee2e2;
  color: #b91c1c;
}

.status-on {
  color: #22c55e;
  font-weight: 600;
}
.status-off {
  color: #ef4444;
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

.action-button.success {
  background: #dcfce7;
  color: #166534;
  border-color: #bbf7d0;
}

.action-button.success:hover {
  background: #bbf7d0;
}

.action-button.danger {
  background: #fef2f2;
  color: #dc2626;
  border-color: #fecaca;
}

.action-button.danger:hover {
  background: #fecaca;
}

.action-button.warning {
  background: #fef3c7;
  color: #92400e;
  border-color: #fde68a;
}

.action-button.warning:hover {
  background: #fde68a;
}

.action-button svg {
  flex-shrink: 0;
  width: 16px;
  height: 16px;
}
</style>
