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
    <div class="subscription-item" v-if="accountData.subscription_dt_to">
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
      <button class="action-button primary" @click="emitAction('extend')">
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
</template>

<script setup>
const props = defineProps({
  accountData: {
    type: Object,
    required: true,
    default: () => ({}),
  },
});

const getDaysLeftClass = (days) => {
  if (days > 7) return "days-many";
  if (days > 3) return "days-few";
  return "days-critical";
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

.action-button.primary {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.action-button.primary:hover {
  background: #2563eb;
  border-color: #2563eb;
}

.subscription-active {
  color: #166534;
  font-weight: 600;
}
.subscription-expired {
  color: #dc2626;
  font-weight: 600;
}
</style>
