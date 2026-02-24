<template>
  <div class="list-container">
    <div v-if="dataStation && instanceData.length > 0" class="accounts-list">
      <div
        class="account-row"
        v-for="(item, index) in instanceData"
        :key="index"
        @click="openAccountModal(item)"
        style="cursor: pointer"
      >
        <div class="row-section section-identity">
          <AccountIcon :item="item" class="account-icon-large" />

          <div class="identity-info">
            <span v-if="item.name" class="account-name">{{ item.name }}</span>
            <span v-else class="account-login">{{ item.login }}</span>

            <span v-if="item.type != 'undefined'" class="account-type">
              {{ getType(item.type) }}
            </span>
            <span v-else class="account-type">
              {{ getType(item.source) }}
            </span>
          </div>

          <div
            class="subscription-warning-desktop"
            v-if="showSubscriptionWarning(item)"
            @click.stop="openWarningModal(item)"
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

        <div @click.stop>
          <StatusSwitch
            :item="item"
            :enableCheckbox="enableCheckbox"
            :changeEnableStartModal="changeEnableStartModal"
            :changeForceStopItemData="changeForceStopItemData"
          />
        </div>

        <div class="vertical-divider"></div>

        <div class="row-section section-data">
          <span class="data-label">Статус</span>
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
        </div>

        <div
          @click.stop="$emit('change-tariff', item)"
          class="row-section section-data"
        >
          <span class="data-label">Подписка</span>
          <div class="data-value">
            <span
              v-if="
                item.subscription_dt_to === null &&
                item.type !== 'amocrm' &&
                item.type !== 'bitrix24' &&
                item.type !== 'uon'
              "
              class="subscription-expired"
            >
              <button
                v-if="item.type != 'amocrm' && item.type != 'bitrix24'"
                class="open-tariff-button"
              >
                Продлить
              </button>
              <span v-else>-</span>
            </span>
            <span
              class="subscription-active"
              v-else-if="
                item.type === 'amocrm' ||
                item.type === 'bitrix24' ||
                item.type === 'uon'
              "
              >Не требуется</span
            >
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
        </div>

        <div class="row-section section-actions">
          <div class="icon-actions"></div>

          <button
            class="action-menu-button"
            @click.stop="$emit('open-modal', $event, item)"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              viewBox="0 0 16 16"
            >
              <path
                fill-rule="evenodd"
                d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5"
              ></path>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <div v-else-if="dataStationNone" class="state-container">
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

    <div v-if="loadDataStation" class="state-container">
      <div class="loading-state">
        <div class="loading-spinner"></div>
        <p>Загрузка аккаунтов...</p>
      </div>
    </div>

    <div v-if="errorAccountBolean && !loadDataStation" class="state-container">
      <errorAccount />
    </div>

    <AccountModal
      v-if="selectedAccount && isModalVisible"
      :accountData="selectedAccount"
      :isVisible="isModalVisible"
      :changeEditNameModal="changeEditName"
      :changeForceStopItemData="changeForceStopItemData"
      :openResetAccountModal="resetAccount"
      :deleteAccount="deleteAccount"
      :changeRoutingSettings="routingSettings"
      :openMessageHistory="messageHistory"
      :uonSettings="uonSettings"
      :blacklistModal="blacklistModal"
      :changeStationGetHistory="stationGetHistory"
      :customSources="customSources"
      @close="closeAccountModal"
      @action="handleAccountAction"
    />
  </div>
</template>

<script setup>
import AccountIcon from "../../AccountIcon.vue";
import LoadingAccount from "../LoadingMoadal/LoadingAccount.vue";
import AccountModal from "./AccountModal.vue";
import errorAccount from "@/components/Mailing/MailingList/errorAccount.vue";
import StatusBadge from "../StatusBadge.vue";
import { useI18n } from "vue-i18n";
import { ref, computed, toRefs } from "vue";

import StatusSwitch from "./cardComponents/StatusSwitch.vue";

const { t } = useI18n();

const props = defineProps({
  dataStation: Boolean,
  instanceData: Array,
  dataStationNone: Boolean,
  loadDataStation: Boolean,
  errorAccountBolean: Boolean,
  changeEnableStartModal: Function,
  changeForceStopItemData: Function,
  openResetAccountModal: Function,
  changeEditNameModal: Function,
  selectAccount: Function,
  openDeleteAccountModal: Function,
  changeRoutingSettings: Function,
  openMessageHistory: Function,
  openUonSettingModal: Function,
  openBlacklistModal: Function,
  changeStationGetHistory: Function,
  openCustomSourcesModal: Function,
  openWarningModal: Function,
});

const { instanceData } = toRefs(props);

defineEmits([
  "show-message",
  "hide-message",
  "change-tariff",
  "open-modal",
  "toggle-account",
  "open-chat",
  "take-screenshot",
]);

const selectedAccount = ref(null);
const isModalVisible = ref(false);

const openAccountModal = (account) => {
  if (account.type === "bulk") {
    return;
  }
  props.selectAccount(account);
  selectedAccount.value = account;
  isModalVisible.value = true;
};

const closeAccountModal = () => {
  isModalVisible.value = false;
  selectedAccount.value = null;
};

const enableCheckbox = (item) => {
  console.log("check start", item);
  if (
    item.source === "whatsapp" ||
    item.source === "telegram" ||
    item.source === "max" ||
    item.source === "vk"
  ) {
    return item.step?.value === 5 || false;
  }

  if (
    item.type === "amocrm" ||
    item.type === "bitrix24" ||
    item.type === "uon" ||
    item.type === "bulk"
  ) {
    return true;
  }

  return false;
};

function getType(type) {
  switch (type) {
    case "bulk":
      return "Аккаунт рассылки";
    case "amocrm":
      return "AmoCRM";
    case "bitrix24":
      return "Битрикс 24";
    case "telegram":
      return "Telegram";
    case "whatsapp":
      return "WhatsApp";
    case "max":
      return "Max";
    case "uon":
      return "U-ON";
    default:
      return "Неизвестно";
  }
}

const showSubscriptionWarning = (item) => {
  const isExcludedType = ["amocrm", "bitrix24", "uon", "bulk"].includes(
    item.type,
  );

  if (isExcludedType) return false;

  const noSubscription = item.subscription_dt_to === null;

  const stepNotFinished = item.step?.value !== 5;

  return noSubscription && stepNotFinished;
};

const handleAccountAction = (actionType, account) => {
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

const changeEditName = () => {
  isModalVisible.value = false;
  props.changeEditNameModal();
};

const resetAccount = () => {
  isModalVisible.value = false;
  props.openResetAccountModal();
};

const deleteAccount = () => {
  isModalVisible.value = false;
  props.openDeleteAccountModal();
};

const routingSettings = () => {
  isModalVisible.value = false;
  props.changeRoutingSettings();
};

const messageHistory = () => {
  isModalVisible.value = false;
  props.openMessageHistory();
};

const stationGetHistory = () => {
  isModalVisible.value = false;
  props.changeStationGetHistory();
};

const uonSettings = () => {
  isModalVisible.value = false;
  props.openUonSettingModal();
};

const blacklistModal = () => {
  isModalVisible.value = false;
  props.openBlacklistModal();
};

const customSources = () => {
  isModalVisible.value = false;
  props.openCustomSourcesModal();
};
</script>

<style scoped>
/* ОСНОВНОЙ КОНТЕЙНЕР */
.list-container {
  width: 100%;
  height: 80vh;
  overflow-y: auto;
  padding: 16px;
  box-sizing: border-box;
}

.accounts-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* СТРОКА-КАРТОЧКА */
.account-row {
  display: flex;
  align-items: center;
  background: #ffffff;
  /* border: 1px solid #e2e8f0; */
  border-radius: 10px;
  padding: 12px 20px;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  gap: 20px;
}

.account-row:hover {
  border-color: #cbd5e1;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transform: translateY(-1px);
}

.row-active {
  background: #ffffff;
}

.row-disabled {
  background: #f5f7fa;
  opacity: 0.9;
}

/* СЕКЦИИ СТРОКИ */
.row-section {
  display: flex;
  align-items: center;
}

/* 1. ИДЕНТИФИКАЦИЯ (Иконка, Имя) */
.section-identity {
  flex: 1.5; /* Широкая секция */
  min-width: 220px;
  gap: 12px;
  cursor: pointer;
}

.identity-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.account-name {
  font-weight: 600;
  color: #1e293b;
  font-size: 15px;
}

.account-login {
  font-weight: 500;
  color: #475569;
  font-size: 15px;
}

.account-type {
  font-size: 11px;
  color: #64748b;
  background: #f1f5f9;
  padding: 2px 8px;
  border-radius: 4px;
  margin-top: 4px;
  display: inline-block;
  align-self: flex-start;
}

.subscription-warning-desktop {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  padding: 4px;
  border-radius: 100%;

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

/* 2. ТУМБЛЕР (ПЕРЕКЛЮЧАТЕЛЬ) */
.section-toggle {
  flex: 0 0 auto;
}

/* Вертикальная линия разделитель (опционально) */
.vertical-divider {
  width: 1px;
  height: 32px;
  background: #e2e8f0;
}

/* 3. ДАННЫЕ (СТАТУС И ПОДПИСКА) - Вертикальный стек */
.section-data {
  flex: 1;
  flex-direction: column; /* Сверху вниз */
  align-items: flex-start;
  justify-content: center;
  gap: 4px;
}

.data-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  color: #94a3b8;
  letter-spacing: 0.05em;
}

.data-value {
  display: flex;
  align-items: center;
  min-height: 24px;
}

/* 4. ДЕЙСТВИЯ (Справа) */
.section-actions {
  flex: 0 0 auto;
  justify-content: flex-end;
  gap: 12px;
  margin-left: auto; /* Прижимаем вправо */
}

/* КОМПОНЕНТЫ УПРАВЛЕНИЯ */

/* Переключатель */
.switch {
  position: relative;
  display: inline-block;
  width: 36px;
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
  transform: translateX(16px);
}

.switch-loading .slider {
  background: rgba(59, 130, 246, 0.5);
}

.switch-loader {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 10px;
  height: 10px;
  margin: -5px 0 0 -5px;
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

/* Статус Бейджи */
.status-badge {
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  white-space: nowrap;
}

.status-active,
.status-online,
.status-connected,
.status-success,
.status-running {
  background: #dcfce7;
  color: #166534;
  border: 1px solid #bbf7d0;
}

.status-offline,
.status-disconnected,
.status-stopped {
  background: #f1f5f9;
  color: #64748b;
  border: 1px solid #e2e8f0;
}

.status-error,
.status-failed {
  background: #fee2e2;
  color: #b91c1c;
  border: 1px solid #fecaca;
}

.status-loading,
.status-pending {
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

.open-tariff-button {
  position: relative;
  z-index: 1;
  padding: 4px 8px;
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  overflow: hidden; /* Чтобы градиент не вылезал за скругление */
}

/* Создаем слой для нового градиента при наведении */
.open-tariff-button::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    #7c3aed 0%,
    #4f46e5 100%
  ); /* Цвета наоборот или другие */
  opacity: 0;
  z-index: -1;
  transition: opacity 0.25s ease-in-out;
}

.open-tariff-button:hover::before {
  opacity: 1;
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

/* Иконки действий */
.icon-actions {
  display: flex;
  gap: 8px;
}

.icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: #f1f5f9;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #64748b;
}

.icon-wrapper:hover {
  background: #e2e8f0;
  color: #334155;
}

.action-menu-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: transparent;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  cursor: pointer;
  color: #64748b;
  transition: all 0.2s ease;
}

.action-menu-button:hover {
  background: #f1f5f9;
  color: #334155;
}

/* СОСТОЯНИЯ (Empty, Loading, Error) */
.state-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
}

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

/* СКРОЛЛБАР */
.list-container::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.list-container::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.list-container::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.list-container::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

@media (max-width: 900px) {
  .account-row {
    flex-wrap: wrap;
    gap: 12px;
    padding: 12px; /* Чуть уменьшаем отступы для мобилок */
  }

  .section-identity {
    flex: 1 1 100%; /* Занимает всю верхнюю строку */
    min-width: 100%;
    border-bottom: 1px solid #f1f5f9;
    padding-bottom: 8px;
    margin-bottom: 4px;
  }

  .vertical-divider {
    display: none; /* Скрываем разделитель */
  }

  /* Статус и Подписка теперь делят место */
  .section-data {
    flex: 1;
    min-width: auto; /* Убираем жесткое ограничение */
  }

  /* Тумблер и кнопка меню */
  .section-toggle {
    order: 1; /* Порядок сразу после иконки, если нужно */
  }

  .section-actions {
    order: unset; /* Возвращаем в общий поток */
    margin-left: auto; /* Прижимаем вправо */
    width: auto; /* Убираем 100% */
    border-top: none; /* Убираем линию сверху */
    padding-top: 0;
  }
}
</style>
