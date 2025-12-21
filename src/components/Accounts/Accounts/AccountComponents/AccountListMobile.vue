<template>
  <div class="mobile-cards">
    <div
      class="account-card"
      :class="{
        active: item.isPay,
        'disabled-account': item.enable === '0',
      }"
      v-for="(item, index) in instanceData"
      :key="'mobile-' + index"
    >
      <!-- Заголовок карточки -->
      <div class="card-header">
        <div class="account-info">
          <AccountIcon :item="item" />
          <span class="account-login">{{
            item.name || item.login || "-"
          }}</span>
          <DeletedBadge v-if="item.enable === '0'" />
          <div
            v-if="showSubscriptionWarning(item)"
            class="subscription-warning-mobile"
            @click="$emit('open-subscription-modal', item)"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 9V11M12 15H12.01M5.07183 19H18.9282C20.4678 19 21.4301 17.3333 20.6603 16L13.7321 4C12.9623 2.66667 11.0377 2.66667 10.2679 4L3.33975 16C2.56995 17.3333 3.53216 19 5.07183 19Z"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
        </div>
        <button class="action-gear" @click="$emit('open-modal', $event, item)">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle cx="12" cy="12" r="3"></circle>
            <path
              d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"
            ></path>
          </svg>
        </button>
      </div>

      <!-- Контент карточки -->
      <div class="card-content">
        <!-- Статус -->
        <div class="card-row">
          <span class="label">Статус:</span>
          <span class="value">
            <span v-if="item.enable === '0'">
              <StatusBadge status="deleted" type="account" />
            </span>
            <span v-else-if="item.loading && accountStation != 'crm'">
              <LoadingAccount />
            </span>
            <span v-else-if="item.type === 'bulk'">
              <StatusBadge type="bulk" />
            </span>
            <span
              v-else-if="
                item.step && item.type != 'amocrm' && item.source != 'bitrix'
              "
            >
              <StatusBadge :status="item.step.value" type="account" />
            </span>
            <span
              v-else-if="
                item.type === 'amocrm' ||
                item.type === 'bitrix24' ||
                item.type === 'uon'
              "
            >
              <StatusBadge :status="item.enable" type="crm" />
            </span>
            <span v-else>
              <StatusBadge :status="null" type="account" />
            </span>
          </span>
        </div>

        <!-- Подписка -->
        <div class="card-row">
          <span class="label">Подписка:</span>
          <span class="value">
            <span v-if="item.subscription_dt_to === null">
              <span
                v-if="showSubscriptionWarning(item)"
                class="no-subscription-text"
              >
                Не активирована
              </span>
              <span v-else>-</span>
            </span>
            <span v-else class="subscription-date">
              До {{ formatSubscriptionDate(item.subscription_dt_to) }}
            </span>
          </span>
        </div>
      </div>

      <!-- Кнопка оплаты на всю ширину -->
      <div
        class="card-payment"
        v-if="
          item.type != 'amocrm' &&
          item.type != 'bitrix24' &&
          item.type != 'uon' &&
          item.enable !== '0'
        "
      >
        <button class="payment-btn" @click="$emit('change-tariff', item)">
          Активировать
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import AccountIcon from "@/components/Accounts/AccountIcon.vue";
import StatusBadge from "../StatusBadge.vue";
import LoadingAccount from "../LoadingMoadal/LoadingAccount.vue";

defineProps({
  instanceData: {
    type: Array,
    required: true,
  },
  accountStation: {
    type: String,
    required: true,
  },
  showSubscriptionWarning: {
    type: Function,
    required: true,
  },
  formatSubscriptionDate: {
    type: Function,
    required: true,
  },
});

defineEmits(["open-modal", "open-subscription-modal", "change-tariff"]);

const DeletedBadge = {
  template: `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="deleted-badge">
      <path d="M6 6L18 18M6 18L18 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>
  `,
};
</script>

<style scoped>
.mobile-cards {
  display: none;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  padding: 16px;
}

.account-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  min-height: 200px;
  min-width: 0;
  position: relative;
}

.account-card.active {
  animation: pulse-card 2s ease-in-out;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
}

.account-card.disabled-account {
  background: #f8f8f8;
  border-color: #e5e5e5;
}

.account-card.disabled-account .account-info span {
  color: #999;
}

.account-card.disabled-account .card-content {
  opacity: 0.7;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f3f4f6;
  min-width: 0;
  gap: 8px;
}

.account-info {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  flex: 1;
}

.account-login {
  font-weight: 600;
  font-size: 16px;
  color: #1f2937;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}

.action-gear {
  background: oklch(0.65 0.22 267 / 0.1);
  border: none;
  border-radius: 8px;
  padding: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.action-gear:hover {
  background: oklch(0.65 0.22 267 / 0.2);
}

.action-gear svg {
  width: 16px;
  height: 16px;
  color: #5a4fc1;
}

.card-content {
  flex: 1;
  margin-bottom: 12px;
  min-width: 0;
}

.card-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  min-width: 0;
  gap: 8px;
}

.label {
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
  white-space: nowrap;
  flex-shrink: 0;
}

.value {
  font-size: 14px;
  color: #374151;
  font-weight: 500;
  text-align: right;
  min-width: 0;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.subscription-date {
  font-size: 14px;
  color: #059669;
  word-break: break-word;
  line-height: 1.3;
  min-width: 0;
  text-align: right;
}

.no-subscription-text {
  color: #dc2626;
  font-weight: 500;
  font-size: 12px;
}

.card-payment {
  margin-top: auto;
}

.payment-btn {
  width: 100%;
  background: #6732ff;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.payment-btn:hover {
  background: #5a2ae0;
}

.payment-btn:active {
  background: #4d24c0;
}

.deleted-badge {
  color: #ef4444;
  margin-left: 8px;
  flex-shrink: 0;
}

.subscription-warning-mobile {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  color: #f59e0b;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-left: 6px;
  flex-shrink: 0;
}

.subscription-warning-mobile:hover {
  color: #d97706;
  transform: scale(1.1);
}

@keyframes pulse-card {
  0% {
    box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.3);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(76, 175, 80, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(76, 175, 80, 0);
  }
}

@media (max-width: 768px) {
  .mobile-cards {
    display: grid;
  }
}

@media (max-width: 640px) {
  .account-card {
    min-height: 180px;
    padding: 14px;
  }

  .account-login {
    font-size: 15px;
  }

  .label {
    font-size: 13px;
  }

  .value {
    font-size: 13px;
  }

  .subscription-date {
    font-size: 13px;
  }

  .payment-btn {
    padding: 10px;
    font-size: 15px;
  }
}

@media (max-width: 480px) {
  .mobile-cards {
    grid-template-columns: 1fr;
    gap: 10px;
    padding: 10px;
  }

  .account-card {
    padding: 12px;
    min-height: 170px;
  }

  .account-login {
    font-size: 14px;
  }

  .label {
    font-size: 12px;
  }

  .value {
    font-size: 12px;
  }

  .payment-btn {
    padding: 9px;
    font-size: 14px;
  }
}
</style>
