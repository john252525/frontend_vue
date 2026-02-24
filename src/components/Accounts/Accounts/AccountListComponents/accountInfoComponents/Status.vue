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
          v-if="accountData.step?.value != 5"
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

        <svg
          v-else
          width="16"
          height="16"
          viewBox="0 0 13 14"
          fill="#475569"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M6.49107 0C6.62368 0 6.75085 0.0526784 6.84462 0.146447C6.93839 0.240215 6.99107 0.367392 6.99107 0.5V6.5C6.99107 6.63261 6.93839 6.75979 6.84462 6.85355C6.75085 6.94732 6.62368 7 6.49107 7C6.35846 7 6.23128 6.94732 6.13751 6.85355C6.04375 6.75979 5.99107 6.63261 5.99107 6.5V0.5C5.99107 0.367392 6.04375 0.240215 6.13751 0.146447C6.23128 0.0526784 6.35846 0 6.49107 0ZM4.45107 1.83C4.47842 1.88975 4.49373 1.9543 4.49612 2.01996C4.49851 2.08563 4.48793 2.15112 4.46499 2.2127C4.44205 2.27427 4.4072 2.33072 4.36243 2.37882C4.31766 2.42692 4.26384 2.46572 4.20407 2.493C3.06341 3.01568 2.13553 3.91232 1.57412 5.03442C1.0127 6.15652 0.851451 7.43673 1.11707 8.663C1.38232 9.88884 2.06003 10.9866 3.03707 11.773C3.64407 12.2609 4.34771 12.6144 5.10147 12.8101C5.85524 13.0058 6.64197 13.0394 7.40965 12.9085C8.17734 12.7775 8.90849 12.4852 9.55479 12.0507C10.2011 11.6162 10.7478 11.0495 11.1588 10.388C11.5698 9.72654 11.8357 8.98536 11.939 8.21347C12.0423 7.44158 11.9805 6.65656 11.7579 5.91031C11.5352 5.16405 11.1567 4.47356 10.6473 3.88447C10.1379 3.29538 9.50934 2.8211 8.80307 2.493C8.68266 2.4373 8.58931 2.33606 8.54355 2.21153C8.49779 2.08701 8.50337 1.94941 8.55907 1.829C8.61476 1.70859 8.71601 1.61524 8.84053 1.56948C8.96506 1.52372 9.10266 1.5293 9.22307 1.585C10.5703 2.20412 11.6645 3.26655 12.3231 4.595C12.9815 5.92317 13.1664 7.4364 12.8472 8.88403C12.528 10.3317 11.7239 11.6268 10.5681 12.555C9.4113 13.4812 7.97317 13.985 6.49131 13.9831C5.00945 13.9813 3.57256 13.474 2.41807 12.545C1.26667 11.6106 0.466374 10.3133 0.148068 8.865C-0.166766 7.41528 0.0237821 5.90148 0.688068 4.575C1.34896 3.24716 2.4473 2.18767 3.79807 1.575C3.85781 1.54765 3.92236 1.53234 3.98803 1.52995C4.0537 1.52756 4.11919 1.53814 4.18077 1.56108C4.24234 1.58402 4.29879 1.61887 4.34689 1.66364C4.39498 1.70841 4.43378 1.76222 4.46107 1.822L4.45107 1.83Z"
            fill="cbd5e1"
          />
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
