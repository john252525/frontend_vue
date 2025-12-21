<template>
  <div class="table-container desktop-view">
    <table class="table">
      <thead class="table-header">
        <tr>
          <th class="table-login">АККАУНТ</th>
          <th class="table-step">СТАТУС</th>
          <th class="table-sub">ПОДПИСКА</th>
          <th class="table-action">{{ t("accountList.action") }}</th>
        </tr>
      </thead>
      <tbody class="tbody">
        <tr
          class="table-row"
          :class="{
            active: item.isPay,
            'disabled-account': item.enable === '0',
          }"
          v-for="(item, index) in instanceData"
          :key="index"
        >
          <td class="table-text-number">
            <div class="table-text-number" v-if="item.type === 'bulk'">
              <AccountIcon :item="item" />
              <div>Оплата рассылок</div>
              <DeletedBadge v-if="item.enable === '0'" />
            </div>
            <div class="table-text-number" v-else>
              <AccountIcon :item="item" />
              <span>{{ item.name || item.login || "-" }}</span>
              <DeletedBadge v-if="item.enable === '0'" />
              <div
                v-if="showSubscriptionWarning(item)"
                class="subscription-warning-desktop"
                @click="$emit('open-subscription-modal', item)"
              >
                <svg
                  width="20"
                  height="20"
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
          </td>
          <td class="table-text">
            <span v-if="item.enable === '0'">
              <StatusBadge status="deleted" type="account" />
            </span>
            <span v-else-if="item.type === 'bulk'">
              <StatusBadge type="bulk" />
            </span>
            <span
              v-else-if="
                item.step &&
                item.type != 'amocrm' &&
                item.type != 'bitrix24' &&
                item.type != 'uon'
              "
              @mouseover="$emit('show-message', $event, item.step.message)"
              @mouseleave="$emit('hide-message')"
            >
              <StatusBadge :status="item.step.value" type="account" />
            </span>
            <span
              v-else-if="
                item.loading &&
                item.type != 'amocrm' &&
                item.type != 'bitrix24' &&
                item.type != 'uon'
              "
            >
              <LoadingAccount />
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
          </td>
          <td v-if="accountStation === 'crm'">{{ item.type }}</td>
          <td v-if="item.subscription_dt_to === null">
            <div
              v-if="
                item.type != 'amocrm' &&
                item.type != 'bitrix24' &&
                item.type != 'uon' &&
                item.enable !== '0'
              "
              class="subscription-status"
            >
              <button
                class="open-tariff-button"
                @click="$emit('change-tariff', item)"
              >
                Активировать
              </button>
            </div>
            <span
              v-else-if="
                (item.type === 'amocrm' ||
                  item.type === 'bitrix24' ||
                  item.type === 'uon') &&
                item.enable !== '0'
              "
            >
              Не требуется
            </span>
            <span v-else></span>
          </td>
          <td v-if="item.subscription_dt_to !== null">
            До {{ item.subscription_dt_to }}
          </td>
          <td class="table-action-text">
            <button
              class="action-table-button"
              @click="$emit('open-modal', $event, item)"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                class="bi bi-list act-icon"
                viewBox="0 0 16 16"
              >
                <path
                  fill-rule="evenodd"
                  d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5"
                />
              </svg>
              {{ t("accountList.actionButton") }}
            </button>
          </td>
        </tr>
      </tbody>
    </table>
    <span v-if="messageVisible" class="tooltip" :style="tooltipStyle">{{
      tooltipMessage
    }}</span>
  </div>
</template>

<script setup>
import { useI18n } from "vue-i18n";
import LoadingAccount from "../LoadingMoadal/LoadingAccount.vue";
import AccountIcon from "@/components/Accounts/AccountIcon.vue";
import StatusBadge from "../StatusBadge.vue";

const { t } = useI18n();

defineProps({
  instanceData: {
    type: Array,
    required: true,
  },
  messageVisible: {
    type: Boolean,
    required: true,
  },
  tooltipMessage: {
    type: String,
    required: true,
  },
  tooltipStyle: {
    type: Object,
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
});

defineEmits([
  "open-modal",
  "open-subscription-modal",
  "change-tariff",
  "show-message",
  "hide-message",
]);

const DeletedBadge = {
  template: `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="deleted-badge">
      <path d="M6 6L18 18M6 18L18 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>
  `,
};
</script>

<style scoped>
.table-container {
  overflow-x: auto;
  overflow-y: auto;
  max-width: 100%;
  height: 80vh;
}

.table-container::-webkit-scrollbar {
  width: 6px;
}

.table-container::-webkit-scrollbar-track {
  background-color: var(--scrolBg);
}

.table-container::-webkit-scrollbar-thumb {
  background: var(--scrolColor);
  border-radius: 5px;
}

.tooltip {
  position: absolute;
  background: rgba(0, 0, 0, 0.75);
  color: #fff;
  padding: 5px 10px;
  border-radius: 5px;
  font-size: 12px;
  z-index: 10;
}

.table {
  width: 100%;
  border-collapse: collapse;
  min-width: 600px;
}

.table-header {
  position: sticky;
  top: 0;
  z-index: 1;
}

th,
td {
  padding: 1rem;
  font-weight: 500;
  font-size: 11px;
  color: #6b7280;
  text-align: left;
}

td {
  font-weight: 500;
  font-size: 14px;
  color: #000;
}

.table-login {
  width: 200px;
}

.table-step {
  width: 220px;
}

.table-sub {
  width: 200px;
}

.table-action {
  text-align: right;
  padding-right: 15px;
}

.table-text-number {
  display: flex;
  align-items: center;
  gap: 4px;
}

.table-text {
  padding: 1rem;
}

.table-action-text {
  padding: 1rem;
  text-align: right;
}

.table-row {
  position: relative;
  overflow: hidden;
}

.table-row.active::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    90deg,
    rgba(76, 175, 80, 0.1) 0%,
    rgba(76, 175, 80, 0.3) 50%,
    rgba(76, 175, 80, 0.1) 100%
  );
  animation: highlight 3s ease-in-out forwards;
  z-index: -1;
}

.table-row.disabled-account {
  opacity: 0.6;
  background-color: #f9f9f9 !important;
}

.table-row.disabled-account td {
  color: #999 !important;
}

.open-tariff-button {
  display: flex;
  align-items: center;
  gap: 6px;
  text-align: center;
  padding: 8px 12px;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  color: white;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: auto;
}

.open-tariff-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.4);
}

.subscription-status {
  display: flex;
  align-items: center;
  gap: 8px;
}

.subscription-warning-desktop {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  color: #f59e0b;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-left: 8px;
  flex-shrink: 0;
}

.subscription-warning-desktop:hover {
  color: #d97706;
  transform: scale(1.1);
}

.deleted-badge {
  color: #ef4444;
  margin-left: 8px;
  flex-shrink: 0;
}

.action-table-button {
  background: oklch(0.65 0.22 267 / 0.16);
  font-weight: 600;
  font-size: 12px;
  padding: 10px 12px;
  color: oklch(0.4 0.18 267 / 0.86);
  gap: 6px;
  transition: all 0.25s;
  border-radius: 5px;
  border: none;
  cursor: pointer;
}

.action-table-button:hover {
  background: rgba(23, 30, 162, 0.2);
}

.action-table-button:active {
  background: rgba(0, 4, 78, 0.2);
}

.bi-list {
  width: 16px;
  height: 16px;
  fill: currentColor;
  margin-bottom: -4px;
  margin-right: 6px;
}

@keyframes highlight {
  0% {
    opacity: 0;
    transform: translateX(-100%);
  }
  20% {
    opacity: 1;
    transform: translateX(0);
  }
  80% {
    opacity: 1;
    transform: translateX(0);
  }
  100% {
    opacity: 0;
    transform: translateX(100%);
  }
}

@media (max-height: 920px) {
  .table-container {
    height: 74vh;
  }
}

@media (max-height: 660px) {
  .table-container {
    height: 78vh;
  }
}

@media (max-height: 600px) {
  .table-container {
    height: 76vh;
  }
}

@media (max-height: 550px) {
  .table-container {
    height: 74vh;
  }
}

@media (max-height: 500px) {
  .table-container {
    height: 70vh;
  }
}

@media (max-height: 450px) {
  .table-container {
    height: 66vh;
  }
}

@media (max-width: 768px) {
  .desktop-view {
    display: none;
  }
}
</style>
