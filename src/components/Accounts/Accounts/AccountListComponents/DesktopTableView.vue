<template>
  <div class="table-container desktop-view">
    <table class="table">
      <thead class="table-header">
        <tr>
          <th class="table-account">
            <span class="column-header">
              <!-- <svg
                class="header-icon"
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
              </svg> -->
              АККАУНТ
            </span>
          </th>
          <th class="table-on">
            <span class="column-header">
              <!-- <svg
                class="header-icon"
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
              </svg> -->
              ВКЛЮЧЕНИЕ
            </span>
          </th>
          <th class="table-status">
            <span class="column-header">
              <!-- <svg
                class="header-icon"
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg> -->
              СТАТУС
            </span>
          </th>
          <th class="table-subscription">
            <span class="column-header">
              <!-- <svg
                class="header-icon"
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  d="M5 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-1"
                ></path>
                <polygon points="12 15 17 21 7 21 12 15"></polygon>
              </svg> -->
              ПОДПИСКА
            </span>
          </th>
          <th class="table-chat">
            <span class="column-center"> ЧАТ </span>
          </th>
          <th class="table-screenshot">
            <span class="column-center"> СКРИНШОТ </span>
          </th>
          <th class="table-action">
            <span class="column-header"> ДЕЙСТВИЕ </span>
          </th>
        </tr>
      </thead>
      <tbody class="tbody">
        <tr
          class="table-row"
          :class="{
            'row-active': item.isPay,
            'row-disabled': !item.enabled,
          }"
          v-if="dataStation"
          v-for="(item, index) in instanceData"
          :key="index"
        >
          <!-- АККАУНТ -->
          <td @click="openAccountModal(item)" class="table-account-data">
            <div class="account-content">
              <AccountIcon :item="item" />
              <div class="account-info">
                <span v-if="item.name" class="account-name">{{
                  item.name
                }}</span>
                <span v-else class="account-login">{{ item.login }}</span>
                <span v-if="item.type != 'undefined'" class="account-type">{{
                  getType(item.type)
                }}</span>
                 <span v-else class="account-type">{{
                  getType(item.source)
                }}</span>
              </div>
            </div>
          </td>

          <!-- ВКЛЮЧЕНИЕ -->
          <td class="table-switch">
            <label class="switch" :class="{ 'switch-loading': item.loading }">
               <input
  type="checkbox"
  :checked="enableCheckbox(item)"
  :disabled="item.type === 'bulk'"
  @change="changeEnableStartModal(item)"
/>
              <span class="slider round">
                <span class="switch-handle"></span>
              </span>
              <span v-if="item.loading" class="switch-loader"></span>
            </label>
          </td>

          <!-- СТАТУС -->
          <td class="table-status-data">
            <div
              class="status-content"
              @mouseover="
                item.step?.message &&
                  $emit('show-message', $event, item.step.message)
              "
              @mouseleave="$emit('hide-message')"
            >
              <span
                v-if="
                  item.step && item.type != 'amocrm' && item.type != 'bitrix24'
                "
                class="status-badge"
                :class="getStatusClass(item.step)"
              >
                {{ getStatusText(item.step) }}
              </span>
              <LoadingAccount
                v-else-if="
                  item.loading &&
                  item.type != 'amocrm' &&
                  item.type != 'bitrix24'
                "
              />
              <span
                v-else-if="item.type === 'amocrm' || item.type === 'bitrix24'"
                class="status-text"
              >
                {{ item.enable }}
              </span>
              <span v-else class="status-empty">-</span>
            </div>
          </td>

          <!-- ПОДПИСКА -->
          <td class="table-subscription-data">
            <div class="subscription-content">
              <span
                v-if="item.subscription_dt_to === null"
                class="subscription-expired"
              >
                <button
                  v-if="item.type != 'amocrm' && item.type != 'bitrix24'"
                  class="open-tariff-button"
                  @click="$emit('change-tariff', item)"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path
                      d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"
                    />
                  </svg>
                  Продлить
                </button>
                <span v-else>-</span>
              </span>
              <span v-else class="subscription-active">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                До {{ formatDate(item.subscription_dt_to) }}
              </span>
            </div>
          </td>

          <!-- ЧАТ -->
          <td class="table-chat-data">
            <div class="icon-wrapper" @click="$emit('open-chat', item)">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path
                  d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                />
              </svg>
            </div>
          </td>

          <!-- СКРИНШОТ -->
          <td class="table-screenshot-data">
            <div class="icon-wrapper" @click="$emit('take-screenshot', item)">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
            </div>
          </td>

          <!-- ДЕЙСТВИЯ -->
          <td class="table-action-data">
            <div class="action-buttons">
              <button
                class="action-table-button"
                @click="$emit('open-modal', $event, item)"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  class="action-icon"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  <path
                    fill-rule="evenodd"
                    d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5"
                  ></path>
                </svg>
                <span class="action-text">Действия</span>
              </button>
            </div>
          </td>
        </tr>

        <!-- Состояния загрузки и ошибок -->
        <tr v-else-if="dataStationNone">
          <td colspan="7">
            <div class="none-account-cont">
              <div class="empty-state">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <h3>{{ t("accountList.accountNone") }}</h3>
                <p>Нет доступных аккаунтов для отображения</p>
              </div>
            </div>
          </td>
        </tr>
        <tr v-if="loadDataStation">
          <td colspan="7">
            <div class="load-cont">
              <div class="loading-state">
                <div class="loading-spinner"></div>
                <p>Загрузка аккаунтов...</p>
              </div>
            </div>
          </td>
        </tr>
        <tr v-if="errorAccountBolean && !loadDataStation">
          <td colspan="7">
            <div class="load-cont">
              <errorAccount />
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <span v-if="messageVisible" class="tooltip" :style="tooltipStyle">
      {{ tooltipMessage }}
    </span>
    <AccountModal
      v-if="selectedAccount && isModalVisible"
      :accountData="selectedAccount"
      :isVisible="isModalVisible"
      @close="closeAccountModal"
      @action="handleAccountAction"
    />
  </div>
</template>

<script setup>
import AccountIcon from "../../AccountIcon.vue";
import LoadingAccount from "../LoadingMoadal/LoadingAccount.vue";
import LoadAccount from "../LoadAccount.vue";
import AccountModal from "./AccountModal.vue";
import errorAccount from "@/components/Mailing/MailingList/errorAccount.vue";
import { useI18n } from "vue-i18n";
import { ref, computed, toRefs } from "vue";

const { t } = useI18n();

const props = defineProps({
  dataStation: Boolean,
  instanceData: Array,
  dataStationNone: Boolean,
  loadDataStation: Boolean,
  errorAccountBolean: Boolean,
  changeEnableStartModal: Function
});

const {instanceData } = toRefs(props)
 
defineEmits([
  "show-message",
  "hide-message",
  "change-tariff",
  "open-modal",
  "toggle-account",
  "open-chat",
  "take-screenshot",
]);

const messageVisible = ref(false);
const tooltipMessage = ref("");
const tooltipStyle = ref({});

const selectedAccount = ref(null);
const isModalVisible = ref(false);

// Вспомогательные функции
const getStatusClass = (status) => {
  if (!status) return "status-default";

  const statusValue = status.value || status.code || status;
  const statusString =
    typeof statusValue === "number" ? statusValue.toString() : statusValue;

  if (typeof statusString !== "string") return "status-default";

  const statusMap = {
    active: "status-active",
    online: "status-online",
    offline: "status-offline",
    error: "status-error",
    loading: "status-loading",
    connected: "status-online",
    disconnected: "status-offline",
    success: "status-active",
    failed: "status-error",
    pending: "status-loading",
    running: "status-active",
    stopped: "status-offline",
  };

  return statusMap[statusString.toLowerCase()] || "status-default";
};

const getStatusText = (status) => {
  if (!status) return "-";
  const statusValue = status.value || status.code || status;
  return typeof statusValue === "number" ? statusValue.toString() : statusValue;
};

const openAccountModal = (account) => {
  selectedAccount.value = account;
  isModalVisible.value = true;
};

const closeAccountModal = () => {
  isModalVisible.value = false;
  selectedAccount.value = null;
};

const enableCheckbox = (item) => {
  console.log('Processing item:', item);
  
  if (item.source === 'whatsapp' || item.source === 'telegram') {
    return item.step?.value === 5 || false;
  } 
  
  if (item.type === 'amocrm' || item.type === 'bitrix24') {
    return item.enable === 1;
  }
  
  if (item.type === 'bulk') {
    return true;
  }
  
  // Возвращаем false по умолчанию для других случаев
  console.log('Default case');
  return false;
};

function getType(type) {
  switch (type) {
    case "bulk": // Успешный платеж
      return "Аккаунт рассылки";
    case "amocrm": // Ошибка
      return "AmoCRM";
    case "bitrix24": // В обработке
      return "Битрикс 24";
    case "telegram":
      return "Telegram";
    case "whatsapp":
      return "WhatsApp";
    default:
      return "Неизвестно";
  }
}

const handleAccountAction = (actionType, account) => {
  console.log("Action:", actionType, "Account:", account);
  // Здесь обрабатывайте разные действия
  switch (actionType) {
    case "extend":
      $emit("change-tariff", account);
      break;
    case "screenshot":
      $emit("take-screenshot", account);
      break;
    case "chat":
      $emit("open-chat", account);
      break;
    case "toggle":
      $emit("toggle-account", account, !account.enabled);
      break;
    // Добавьте обработчики для других действий
    default:
      $emit("account-action", actionType, account);
  }
};

const formatDate = (dateString) => {
  if (!dateString) return "-";
  try {
    return new Date(dateString).toLocaleDateString("ru-RU");
  } catch (e) {
    return dateString;
  }
};
</script>

<style scoped>
/* ОСНОВНЫЕ СТИЛИ */
.table-container {
  overflow-x: auto;
  overflow-y: auto;
  max-width: 100%;
  height: 80vh;
  background: #ffffff;
  /* border-radius: 8px; */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
}

.desktop-view {
  display: block;
}

/* СКРОЛЛБАРЫ */
.table-container::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.table-container::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.table-container::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.table-container::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* ТАБЛИЦА */
.table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background: transparent;
  font-size: 14px;
}

/* ЗАГОЛОВКИ */
.table-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background: #f8fafc;
  border-bottom: 2px solid #e2e8f0;
}

.table-header th {
  padding: 16px 12px;
  font-weight: 600;
  font-size: 13px;
  color: #334155;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
}

.table-action {
  text-align: right;
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
}

.table-status, .table-status-data {
  display: flex;
  align-items: center;
  justify-content: center;
}

.table-chat-data, .table-screenshot-data, .table-screenshot{
  text-align: center;
}

.column-center {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #475569;
}

.column-header {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  font-weight: 600;
  color: #475569;
}

.header-icon {
  width: 14px;
  height: 14px;
  color: #64748b;
}

/* СТРОКИ ДАННЫХ */
.table-row {
  position: relative;
  transition: background-color 0.2s ease;
  border-bottom: 1px solid #f1f5f9;
  background: transparent;
}

.table-row:hover {
  background: #f8fafc;
}

.table-row:last-child {
  border-bottom: none;
}

.row-disabled:hover {
  background: #f1f5f9;
}

.row-active {
  background: #f0fdf4;
}

/* ЯЧЕЙКИ ДАННЫХ */
.table-row td {
  padding: 16px 12px;
  font-size: 14px;
  color: #334155;
  border-bottom: 1px solid #f1f5f9;
  transition: background-color 0.2s ease;
}

/* АККАУНТ */
.account-content {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.account-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.account-name {
  font-weight: 600;
  color: #1e293b;
}

.account-login {
  font-weight: 500;
  color: #475569;
}

.account-type {
  font-size: 12px;
  color: #64748b;
  background: #f1f5f9;
  padding: 4px 8px;
  border-radius: 6px;
  display: inline-block;
}

/* ПЕРЕКЛЮЧАТЕЛЬ */
.switch {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 20px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #cbd5e1;
  transition: all 0.3s ease;
  border-radius: 20px;
}

.switch-handle {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 2px;
  bottom: 2px;
  background: white;
  transition: all 0.3s ease;
  border-radius: 50%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

input:checked + .slider {
  background: #3b82f6;
}

input:checked + .slider .switch-handle {
  transform: translateX(20px);
}

input:focus + .slider {
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.switch-loading .slider {
  background: rgba(59, 130, 246, 0.5);
}

.switch-loader {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 12px;
  height: 12px;
  margin: -6px 0 0 -6px;
  border: 2px solid transparent;
  border-top: 2px solid #fff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* СТАТУС */
.status-content {
  display: flex;
  align-items: center;
}

.status-badge {
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.status-active {
  background: #dcfce7;
  color: #166534;
  border: 1px solid #bbf7d0;
}

.status-online {
  background: #dcfce7;
  color: #166534;
  border: 1px solid #bbf7d0;
}

.status-offline {
  background: #f1f5f9;
  color: #64748b;
  border: 1px solid #e2e8f0;
}

.status-error {
  background: #fee2e2;
  color: #b91c1c;
  border: 1px solid #fecaca;
}

.status-loading {
  background: #dbeafe;
  color: #1d4ed8;
  border: 1px solid #bfdbfe;
}

.status-default {
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #e2e8f0;
}

.status-text {
  font-weight: 500;
  color: #475569;
}

.status-empty {
  color: #94a3b8;
  font-style: italic;
}

/* ПОДПИСКА */
.subscription-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.open-tariff-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.open-tariff-button:hover {
  background: #2563eb;
  transform: translateY(-1px);
}

.subscription-active {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #166534;
  font-weight: 500;
  font-size: 13px;
}

.subscription-expired {
  color: #dc2626;
  font-weight: 500;
  font-size: 13px;
}

/* ИКОНКИ */
.icon-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: #f1f5f9;
  cursor: pointer;
  transition: all 0.2s ease;
}

.icon-wrapper:hover {
  background: #e2e8f0;
  transform: scale(1.05);
}

.icon-wrapper svg {
  color: #64748b;
}

/* ДЕЙСТВИЯ */
.action-buttons {
  display: flex;
  justify-content: flex-end;
}

.action-table-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-table-button:hover {
  background: #e2e8f0;
  color: #334155;
}

/* СОСТОЯНИЯ */
.empty-state,
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 32px;
  text-align: center;
}

.empty-state svg {
  color: #cbd5e0;
  margin-bottom: 16px;
}

.empty-state h3 {
  color: #475569;
  margin-bottom: 8px;
  font-weight: 600;
  font-size: 18px;
}

.empty-state p {
  color: #64748b;
  font-size: 14px;
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid #f1f5f9;
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

/* ТУЛТИП */
.tooltip {
  position: fixed;
  background: rgba(15, 23, 42, 0.95);
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  z-index: 1000;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-width: 250px;
  word-wrap: break-word;
  line-height: 1.4;
}


/* АДАПТИВНОСТЬ */
@media (max-width: 950px)  {
  .action-text {
    display: none;
  }
}

@media (max-height: 900px) {
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
    display: none !important;
  }
}
</style
