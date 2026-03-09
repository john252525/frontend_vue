<template>
  <section class="account-list-section">
    <DesktopTableView
      :dataStation="dataStation"
      :instanceData="instanceData"
      :dataStationNone="dataStationNone"
      :loadDataStation="loadDataStation"
      :errorAccountBolean="errorAccountBolean"
      :changeForceStopItemData="changeForceStopItemData"
      :changeEnableStartModal="changeEnableStation"
      :changeEditNameModal="changeEditNameModal"
      :openResetAccountModal="openResetAccountModal"
      :openDeleteAccountModal="openDeleteAccountModal"
      :selectAccount="selectAccount"
      :changeRoutingSettings="changeRoutingSettings"
      :openMessageHistory="openMessageHistory"
      :openUonSettingModal="openUonSettingModal"
      :openBlacklistModal="openBlacklistModal"
      :openWarningModal="openWarningModal"
      :changeStationGetHistory="changeStationGetHistory"
      :openCustomSourcesModal="openCustomSourcesModal"
      @show-message="showMessage"
      @hide-message="hideMessage"
      @change-tariff="changeTariffStation"
      @open-modal="openModal"
    />

    <!-- <MobileCardsView
      :dataStation="dataStation"
      :instanceData="instanceData"
      :dataStationNone="dataStationNone"
      :loadDataStation="loadDataStation"
      :errorAccountBolean="errorAccountBolean"    
      :accountStation="accountStation"
      @open-mobile-modal="openMobileModal"
      @change-tariff="changeTariffStation"
    /> -->
    <!-- 
    <div v-if="dataStationNone" class="none-account-cont">
      <NoData type="accounts" />
    </div>

    <div v-if="loadDataStation" class="load-cont">
      <LoadAccount />
    </div>

    <div v-if="errorAccountBolean && !loadDataStation" class="load-cont">
      <errorAccount />
    </div> -->

    <WarningAccount
      v-if="showWarningModal"
      :item="selectedWarningItem"
      @close="closeWarningModal"
    />

    <Tariff
      v-if="tariffStation"
      :selectedItem="selectedItem"
      :changeTariffStation="changeTariffStation"
      :getAccounts="getAccounts"
      :changePayDataForAccounts="changePayDataForAccounts"
    />

    <GetHistory
      v-if="getHistoryModal"
      :changeStationGetHistory="changeStationGetHistory"
      :item="selectedItem"
    />

    <Modal
      :changeStationGetHistory="changeStationGetHistory"
      :changeTariffStation="changeTariffStation"
      :isModalOpen="isModalOpen"
      :closeModal="closeModal"
      :changeRoutingSettings="changeRoutingSettings"
      :modalPosition="modalPosition"
      :selectedItem="selectedItem"
      :qrCodeData="qrCodeData"
      :openResetAccountModal="openResetAccountModal"
      @update:loadingStation="updateLoading"
      @update:selectedItems="updateSelectedItems"
      @update:qrCodeData="updateqrCodeData"
      :changeStationSettingsModal="changeStationSettingsModal"
      :changeStationQrModal="changeStationQrModal"
      :changeStationGetByCode="changeStationGetByCode"
      :changeEnableStation="changeEnableStation"
      :getScreenStation="getScreenStation"
      :changeGetScreenStation="changeGetScreenStation"
      :chatsStation="chatsStation"
      :changeForceStopItemData="changeForceStopItemData"
      :getAccounts="getAccounts"
      :openSupport="changeSendSupport"
      :changeBindingStation="changeBindingStation"
      :openUonSettingModal="openUonSettingModal"
      :openBlacklistModal="openBlacklistModal"
      :changeEditNameModal="changeEditNameModal"
      :openMessageHistory="openMessageHistory"
      :openDeleteAccountModal="openDeleteAccountModal"
      :openCustomSourcesModal="openCustomSourcesModal"
    />

    <SettignsModal
      :closeModal="closeModal"
      :selectedItems="selectedItems"
      :settingsModalStation="settingsModalStation"
      :changeStationSettingsModal="changeStationSettingsModal"
    />

    <QrModal
      :qrModalStation="qrModalStation"
      :changeStationQrModal="changeStationQrModal"
      :qrCodeData="qrCodeData"
      :changeStationQrModalOn="changeStationQrModalOn"
    />

    <getByCode
      v-if="getByCodeStation"
      :changeStationGetByCode="changeStationGetByCode"
      :selectedItems="selectedItems"
      :getByCodeStation="getByCodeStation"
    />

    <getScreen
      v-if="getScreenStation"
      :closeScreen="closeScreen"
      :changeGetScreenStation="changeGetScreenStation"
      :selectedItem="selectedItem"
    />

    <RoutingSettings
      :isOpen="showRoutingSettings"
      :close="changeRoutingSettings"
      :item="selectedItem"
      :vendors="instanceData"
    />

    <Enable
      v-if="enableStation"
      :changeForceStopItemData="changeForceStopItemData"
      :enableStation="enableStation"
      :selectedItem="selectedItem"
      :changeEnableStation="changeEnableStation"
    />

    <SendSupport
      v-if="sendSupportStation"
      :close="changeSendSupport"
      :selectedItem="selectedItem"
    />

    <ErrorBlock v-if="errorBlock" :changeIncorrectPassword="chaneErrorBlock" />

    <Binding
      v-if="bindingStation"
      :close="changeBindingStation"
      :getAllAccounts="getAllAccounts"
      :selectedItem="selectedItem"
    />

    <UonSettings
      v-if="uonSettingsModal"
      :item="selectedItem"
      :close="closeUonSettings"
    />

    <Blacklist
      v-if="blacklistModal"
      :item="selectedItem"
      :close="closeBlacklistModal"
    />

    <MessageHistory
      v-if="messageHistory"
      :close="closeMessageHistory"
      :item="selectedItem"
    />

    <EditNameModal
      v-if="editNameModal"
      :selectedItem="selectedItem"
      :close="changeEditNameModal"
      :getAccounts="getAccounts"
    />

    <ConfirmReset
      v-if="resetAccountModal"
      :selected-item="selectedItem"
      :close="closeResetAccountModal"
      :changeForceStopItemData="changeForceStopItemData"
    />

    <ConfirmDelete
      v-if="deleteAccountModal"
      :selected-item="selectedItem"
      :close="closeDeleteAccountModal"
    />

    <CustomSources
      v-if="customSourcesModal"
      :item="selectedItem"
      :close="closeCustomSourcesModal"
      :accounts="instanceData"
    />
  </section>
</template>

<script setup>
import { ref, reactive, onMounted, provide, inject, computed } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";
import LoadingAccount from "./LoadingMoadal/LoadingAccount.vue";
import ErrorBlock from "@/components/ErrorBlock/ErrorBlock.vue";
import Modal from "./Modal.vue";
import Enable from "./ModalAccount/Enable/Enable.vue";
import SettignsModal from "./ModalAccount/settingsModal.vue";
import getByCode from "./ModalAccount/GetByCode/GetByCode.vue";
import QrModal from "./ModalAccount/qrModal.vue";
import MessageHistory from "./ModalAccount/CRM/MessageHistory/MessageHistory.vue";
import ConfirmReset from "./ModalAccount/ConfirmModal/ConfirmReset.vue";
import errorAccount from "@/components/Mailing/MailingList/errorAccount.vue";
import EditNameModal from "./ModalAccount/EditNameModal/EditNameModal.vue";
import getScreen from "./ModalAccount/GetScreen.vue";
import LoadAccount from "./LoadAccount.vue";
import GetHistory from "./ModalAccount/CRM/GetHistory/GetHistory.vue";
import UonSettings from "./ModalAccount/CRM/UonSettings/Settings.vue";
import Blacklist from "./ModalAccount/CRM/UonSettings/Blacklist.vue";
import AccountIcon from "../AccountIcon.vue";
import Tariff from "./TariffAccount/Tariff.vue";
import NoData from "@/components/GlobalModal/StationList/NoData.vue";
import StatusBadge from "./StatusBadge.vue";
import SendSupport from "./ModalAccount/SendSupport.vue";
import ConfirmDelete from "./ModalAccount/ConfirmModal/ConfirmDelete.vue";
import Binding from "./ModalAccount/AmoCrm/Binding.vue";
import RoutingSettings from "./ModalAccount/RoutingSettings/RoutingSettings.vue";
import WarningAccount from "./WarningAccount.vue";
import CustomSources from "./ModalAccount/CRM/UonSettings/customSources/CustomSources.vue";

// Импортируем новые компоненты
import DesktopTableView from "./AccountListComponents/DesktopTableView.vue";
import AccountListDesktop from "./AccountComponents/AccountListDesktop.vue";
import AccountListMobile from "./AccountComponents/AccountListMobile.vue";

import { useAccountStore } from "@/stores/accountStore";
const accountStore = useAccountStore();
const token = computed(() => accountStore.getAccountToken);
const accountStation = computed(() => accountStore.getAccountStation);
const sourceGroup = computed(() => accountStore.getSource);
const addDeleted = computed(() => accountStore.getAddDeleted);
const typeGroup = computed(() => accountStore.getType);
const allGroup = computed(() => accountStore.getGroup);
const crmPlatform = computed(() => accountStore.getCrmPlatform);
const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL;

import { storeToRefs } from "pinia";
import { useLoginWhatsAppChatsStepStore } from "@/stores/loginWhatsAppChatsStepStore";
const chatStore = useLoginWhatsAppChatsStepStore();
const allAcoount = computed(() => chatStore.getLoginWhatsAppChatsStep);

import { useUserInfoStore } from "@/stores/userInfoStore";
const userInfoStore = useUserInfoStore();
const { userInfo } = storeToRefs(userInfoStore);

import { fetchChats } from "@/utils/getChats";
import { useDomain } from "@/composables/getDomain";
const { stationDomain } = useDomain();

import { useI18n } from "vue-i18n";
const { t } = useI18n();

import useFrontendLogger from "@/composables/useFrontendLogger";
const { sendLog } = useFrontendLogger();

const router = useRouter();

const props = defineProps({
  changeAllAccounts: {
    type: Function,
  },
});

// ============= СОСТОЯНИЯ =============
const tariffStation = ref(false);
const forceStopItemData = ref({});
const chatsLoadingChange = inject("chatsLoadingChange");
const dataStationNone = ref(false);
const dataStation = ref(false);
const loadDataStation = ref(false);
const errorAccountBolean = ref(false);
const qrCodeData = ref([]);
const enableStation = ref(false);
const getByCodeStation = ref(false);
const getScreenStation = ref(false);
const qrModalStation = ref(false);
const settingsModalStation = ref(false);
const instanceData = ref([]);
const accounts = ref([]);
const isModalOpen = ref(false);
const modalPosition = ref({ top: 0, left: 0 });
const selectedItem = ref(null);
const selectedItems = ref(null);
const loadingStation = ref(false);
const chatsStation = ref(null);
const sendSupportStation = ref(false);
const bindingStation = ref(false);
const getHistoryModal = ref(false);
const messageVisible = ref(false);
const tooltipMessage = ref("");
const tooltipStyle = ref({});
const errorBlock = ref(false);
const showWarningModal = ref(false);
const selectedWarningItem = ref(null);
const showRoutingSettings = ref(false);
const uonSettingsModal = ref(false);
const blacklistModal = ref(false);
const messageHistory = ref(false);
const editNameModal = ref(false);
const resetAccountModal = ref(false);
const deleteAccountModal = ref(false);
const customSourcesModal = ref(false);

// ============= УТИЛИТЫ =============

const closeCustomSourcesModal = () => {
  customSourcesModal.value = false;
};

const openCustomSourcesModal = () => {
  customSourcesModal.value = true;
};

const openMessageHistory = () => {
  messageHistory.value = true;
};

const openDeleteAccountModal = () => {
  deleteAccountModal.value = true;
};

const closeDeleteAccountModal = () => {
  deleteAccountModal.value = false;
};

const openResetAccountModal = () => {
  resetAccountModal.value = true;
};

const closeResetAccountModal = () => {
  resetAccountModal.value = false;
};

const changeEditNameModal = () => {
  editNameModal.value = !editNameModal.value;
};

const closeMessageHistory = () => {
  messageHistory.value = false;
};

const openSubscriptionModal = (item) => {
  selectedWarningItem.value = item;
  showWarningModal.value = true;
};

const openBlacklistModal = () => {
  blacklistModal.value = true;
};

const closeBlacklistModal = () => {
  blacklistModal.value = false;
};

const openUonSettingModal = () => {
  uonSettingsModal.value = true;
};

const closeUonSettings = () => {
  uonSettingsModal.value = false;
};

const openWarningModal = (item) => {
  selectedWarningItem.value = item;
  showWarningModal.value = true;
};

const closeWarningModal = () => {
  showWarningModal.value = false;
  selectedWarningItem.value = null;
};

// ============= УПРАВЛЕНИЕ МОДАЛКАМИ =============
const changeTariffStation = (item) => {
  if (item) {
    selectedItem.value = item;

    if (
      item.type === "uon" ||
      item.type === "amocrm" ||
      item.type === "bitrix24"
    ) {
      return;
    }
  }

  tariffStation.value = !tariffStation.value;
};

const changePayDataForAccounts = (item) => {
  const index = instanceData.value.findIndex(
    (account) => account.uuid === item.uuid,
  );

  if (index !== -1) {
    instanceData.value[index] = {
      ...instanceData.value[index],
      isPay: true,
    };

    setTimeout(() => {
      instanceData.value[index] = {
        ...instanceData.value[index],
        isPay: false,
      };
    }, 3000);
  }
};

const changeGetScreenStation = () => {
  getScreenStation.value = !getScreenStation.value;
};

const selectAccount = (item) => {
  selectedItem.value = item;
};

const changeRoutingSettings = () => {
  showRoutingSettings.value = !showRoutingSettings.value;
};

const closeScreen = () => {
  getScreenStation.value = false;
};

const changeStationGetHistory = () => {
  getHistoryModal.value = !getHistoryModal.value;
};

const changeBindingStation = () => {
  bindingStation.value = !bindingStation.value;
};

const chaneErrorBlock = () => {
  errorBlock.value = !errorBlock.value;
};

const changeStationSettingsModal = () => {
  settingsModalStation.value = !settingsModalStation.value;
};

const changeStationQrModal = () => {
  qrModalStation.value = !qrModalStation.value;
};

const changeStationQrModalOn = () => {
  qrModalStation.value = true;
};

const changeStationGetByCode = () => {
  getByCodeStation.value = !getByCodeStation.value;
};

const closeModal = () => {
  isModalOpen.value = false;
  chatsStation.value = false;
};

const updateSelectedItems = (newValue) => {
  selectedItems.value = newValue;
};

const updateqrCodeData = (newValue) => {
  qrCodeData.value = newValue;
};

const changeSendSupport = () => {
  sendSupportStation.value = !sendSupportStation.value;
};

const updateLoading = (newValue) => {
  loadingStation.value = newValue;
};

// ============= ТУЛТИПЫ И СООБЩЕНИЯ =============
const showMessage = (event, step) => {
  tooltipMessage.value = `Текущий шаг: ${step}`;
  messageVisible.value = true;
  const tooltipWidth = 100;
  const tooltipHeight = 30;
  const rect = event.currentTarget.getBoundingClientRect();
  tooltipStyle.value = {
    top: `${rect.bottom + window.scrollY}px`,
    left: `${rect.left + window.scrollX + rect.width / 2 - tooltipWidth / 2}px`,
    width: `${tooltipWidth}px`,
    height: `${tooltipHeight}px`,
  };
};

const hideMessage = () => {
  messageVisible.value = false;
};

// ============= API ВЫЗОВЫ =============
const getInfoWhats = async (source, login, type, storage) => {
  try {
    const response = await axios.post(
      `${FRONTEND_URL}getInfo`,
      {
        source: source,
        login: login,
        type: type,
        storage: storage,
      },
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: `Bearer ${token.value}`,
        },
      },
    );
    return response;
  } catch (error) {
    console.error("Error in getInfoWhats:", error);
    return null;
  }
};

const changeForceStopItemData = async (item) => {
  try {
    forceStopItemData.value = { ...item, loading: true };
    const accountIndex = instanceData.value.findIndex(
      (acc) => acc.login === item.login && acc.source === item.source,
    );

    if (accountIndex === -1) {
      console.warn("Account not found in instanceData");
      return;
    }

    instanceData.value[accountIndex].loading = true;

    const infoResponse = await getInfoWhats(
      item.source,
      item.login,
      item.type,
      item.storage,
    );

    if (!infoResponse?.data) {
      throw new Error("Invalid response structure");
    }

    const currentStep = infoResponse.data.step || { value: "-", message: "" };

    instanceData.value[accountIndex] = {
      ...instanceData.value[accountIndex],
      step: currentStep,
      loading: false,
    };

    forceStopItemData.value = {
      ...instanceData.value[accountIndex],
      loading: false,
    };

    if (currentStep.value === 5) {
      updateLocalStorage(item.login, item.source, item.storage, item.type);
    }
  } catch (error) {
    console.error("Error in changeForceStopItemData:", error);
    if (forceStopItemData.value) {
      forceStopItemData.value.loading = false;
    }
    const accountIndex = instanceData.value.findIndex(
      (acc) => acc.login === item.login && acc.source === item.source,
    );
    if (accountIndex !== -1) {
      instanceData.value[accountIndex].loading = false;
    }
  }
};

const updateLocalStorage = (login, source, storage, type) => {
  try {
    const newLoginData = {
      login,
      source,
      storage: storage || "undefined",
      type: type || "undefined",
    };
    chatStore.addOrUpdateChat(newLoginData);
    console.log("Account saved to store:", newLoginData);
  } catch (e) {
    console.error("Error updating store:", e);
  }
};

const updateUserInfo = (event) => {
  userInfoStore.setUserInfo(event);
};

const getAllAccounts = () => {
  console.log("📦 getAllAccounts вызван, возвращаем:", instanceData.value);
  return instanceData.value;
};

const getActionCount = (item) => {
  if (!item) return 1;

  if (item.enable === "0") {
    return 1;
  }

  let count = 0;

  if (!["amocrm", "bitrix24", "uon", "bulk"].includes(item.type)) {
    if (!["amocrm", "bitrix24", "uon"].includes(item.type)) count++;

    count += 2;

    if (item.source !== "telegram") count++;

    count += 3;

    count++;

    if (
      !(
        (item.storage === "binder" && item.type === "touchapi") ||
        (item.storage === "whatsapi" && item.type === "undefined")
      )
    ) {
      count++;
    }
  } else if (["amocrm", "bitrix24", "uon"].includes(item.type)) {
    count++;

    if (item.type === "amocrm") {
      count++;
    }

    if (item.source !== "telegram") {
      count++;
    }
  } else if (item.type === "bulk") {
    count += 2;
  }

  return Math.max(1, count);
};

const changeEnableStation = (item, locale) => {
  console.log("click changeEnableStation");
  if (locale === "accountList") {
    console.log("item", item);
    selectedItem.value = item;
  }
  console.log(selectedItem.value);

  enableStation.value = !enableStation.value;
};

const openModal = (event, item) => {
  selectedItem.value = item;
  isModalOpen.value = true;
  updateUserInfo(JSON.stringify(selectedItem.value));
  getInfo();

  // 1. Получаем координаты кнопки относительно видимой области (viewport)
  const rect = event.currentTarget.getBoundingClientRect();
  const viewportHeight = window.innerHeight;
  const viewportWidth = window.innerWidth;

  // Константы для расчетов
  const modalWidth = 180; // Чуть шире, с запасом
  const edgeMargin = 15; // Отступ от краев экрана
  const gap = 4; // Отступ модалки от кнопки

  // 2. Считаем высоту модалки с ЗАПАСОМ
  // Увеличили высоту пункта до 40px (было 32), чтобы наверняка перекрыть паддинги
  const actionCount = getActionCount(item);
  const itemHeight = 40;
  const containerPadding = 20;
  const estimatedModalHeight = actionCount * itemHeight + containerPadding;

  // === РАСЧЕТ ВЕРТИКАЛИ (Y) ===

  // Сколько места реально видно снизу под кнопкой?
  const spaceBelow = viewportHeight - rect.bottom;

  let top;

  // ЖЕСТКАЯ ЛОГИКА:
  // 1. Если визуально места снизу меньше, чем высота модалки...
  // 2. ИЛИ если кнопка находится ниже 70% высоты экрана (жесткий триггер)...
  // ... ТО открываем ВВЕРХ.
  const isTooLowOnScreen = rect.top > viewportHeight * 0.7;

  if (spaceBelow < estimatedModalHeight || isTooLowOnScreen) {
    // -- Открываем ВВЕРХ --
    // Координата: Верх кнопки + Скролл страницы - Высота модалки - Зазор
    top = rect.top + window.scrollY - estimatedModalHeight - gap;

    // Защита: если при открытии вверх мы улетели за верхний край страницы (top < 0)
    // Прижимаем к верхнему краю, но не даем уйти в минус
    if (top < window.scrollY + edgeMargin) {
      top = window.scrollY + edgeMargin;
    }
  } else {
    // -- Открываем ВНИЗ --
    // Координата: Низ кнопки + Скролл страницы + Зазор
    top = rect.bottom + window.scrollY + gap;
  }

  // === РАСЧЕТ ГОРИЗОНТАЛИ (X) ===

  let left = rect.left + window.scrollX;

  // Мобильная версия (оставляем без изменений логику позиционирования, только стили)
  if (window.innerWidth <= 768) {
    modalPosition.value = {
      top: "auto",
      bottom: "10px",
      left: "50%",
      transform: "translateX(-50%)",
      width: "90%",
      maxWidth: "400px",
    };
    return;
  }

  // Если модалка вылезает за правый край экрана
  // (Координата левого края + ширина модалки > ширины окна + скролл)
  if (rect.left + modalWidth > viewportWidth - edgeMargin) {
    // Сдвигаем влево: Правый край кнопки - Ширина модалки
    left = rect.right + window.scrollX - modalWidth;
  }

  // Финальная защита левого края
  if (left < edgeMargin) {
    left = edgeMargin;
  }

  modalPosition.value = {
    top: Math.round(top),
    left: Math.round(left),
  };
};

const getInfo = async () => {
  chatsStation.value = "loading";
  try {
    const response = await axios.post(
      `${FRONTEND_URL}getInfo`,
      {
        source: selectedItem.value.source,
        login: selectedItem.value.login,
        type: selectedItem.value.type,
        storage: selectedItem.value.storage,
      },
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: `Bearer ${token.value}`,
        },
      },
    );

    if (response.data) {
      await handleSendLog(
        "accountList",
        "getInfo",
        {
          source: selectedItem.value.source,
          login: selectedItem.value.login,
        },
        response.data.ok,
        response.data,
      );
    }

    if (response.data) {
      if (response.data.step != null) {
        if (response.data.step.value === 5) {
          chatsStation.value = true;
        }
      } else {
        chatsStation.value = false;
      }
    } else if (response.data === 401) {
      errorBlock.value = true;
      setTimeout(() => {
        localStorage.removeItem("accountToken");
        router.push("/login");
      }, 2000);
    }
  } catch (error) {
    console.error("error:", error);
    if (error.response) {
      console.error("error", error.response.data);
    }
  }
};

const handleSendLog = async (location, method, params, results, answer) => {
  try {
    await sendLog(location, method, params, results, answer);
  } catch (err) {
    console.error("error", err);
  }
};

const getAccounts = async () => {
  console.log("🔄 AccountList: начало загрузки");

  if (!accountStore || typeof accountStore.setLoading !== "function") {
    console.error("❌ AccountList: store или setLoading не доступны");
    return [];
  }

  try {
    console.log("🔄 AccountList: устанавливаем loading = true");
    accountStore.setLoading(true);

    dataStationNone.value = false;
    errorAccountBolean.value = false;
    instanceData.value = [];

    let params = {
      source: accountStation.value,
      skipDetails: true,
      group: "messenger",
    };

    console.debug(stationDomain.navigate.value, "stationDomain navigate value");
    console.debug(typeGroup.value, "typeGroup");

    if (stationDomain.navigate.value === "touchapi") {
      params = {
        source: sourceGroup.value,
        type: typeGroup.value,
        group: allGroup.value,
        add_deleted: addDeleted.value,
      };
    }

    if (stationDomain.navigate.value === "whatsapi") {
      params = {
        source: sourceGroup.value,
        type: typeGroup.value,
        group: allGroup.value,
        add_deleted: addDeleted.value,
      };
    }

    console.debug(params, "Params before requesting accounts");

    loadDataStation.value = true;
    console.log("Параметры отправки", params);

    try {
      const response = await axios.post(
        `${FRONTEND_URL}getInfoByToken`,
        params,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token.value}`,
          },
        },
      );

      if (response.data.ok === true) {
        accounts.value = response.data;
        instanceData.value = accounts.value.data.instances.map((instance) => ({
          ...instance,
          step: instance.step === null ? "Н/Д" : instance.step,
          loading: true,
          storage: instance.storage || "undefined",
          type: instance.type || "undefined",
        }));

        await props.changeAllAccounts(instanceData.value);

        if (instanceData.value.length === 0) {
          loadDataStation.value = false;
          dataStationNone.value = true;
        } else {
          loadDataStation.value = false;
          dataStation.value = true;

          if (
            accountStation.value === "whatsapp" ||
            accountStation.value === "telegram"
          ) {
            const accountsToFetch = instanceData.value.filter(
              (instance) =>
                instance.step?.value === 5 &&
                !["bulk", "amocrm", "bitrix24", "uon"].includes(
                  instance.type,
                ) &&
                ((instance.storage === "binder" &&
                  instance.type !== "touchapi") ||
                  (instance.storage === "whatsapi" &&
                    instance.type === "whatsapi")),
            );

            if (accountsToFetch.length > 0) {
              try {
                await new Promise((resolve) =>
                  setTimeout(resolve, 200 * accountsToFetch.length),
                );
                const result = await fetchChats({
                  token: token.value,
                  accounts: accountsToFetch,
                });
              } catch (e) {
                console.error("Ошибка при сохранении аккаунтов:", e);
              }
            }

            const promises = instanceData.value.map(async (instance) => {
              const login = instance.login;

              if (
                instance.type === "bulk" ||
                instance.type === "amocrm" ||
                instance.type === "bitrix24" ||
                instance.type === "uon"
              ) {
                instance.loading = false;
                return;
              }

              if (
                (instance.storage === "binder" &&
                  instance.type !== "touchapi") ||
                (instance.storage === "whatsapi" &&
                  instance.type === "whatsapi")
              ) {
                instance.loading = false;
                return;
              }

              try {
                const infoResponse = await getInfoWhats(
                  instance.source,
                  login,
                  instance.type,
                  instance.storage,
                );

                if (infoResponse?.data?.step) {
                  instance.step = infoResponse.data.step;
                }
              } catch (error) {
                console.error(`Error for ${login}:`, error);
              } finally {
                instance.loading = false;
              }
            });

            await Promise.all(promises);
            chatsLoadingChange();
          } else {
            instanceData.value.forEach((instance) => {
              instance.loading = false;
            });
          }
        }
      }
    } catch (error) {
      loadDataStation.value = false;
      errorAccountBolean.value = true;
      console.error("Error:", error);
    }
  } catch (error) {
    console.error("❌ AccountList: ошибка в основном блоке:", error);
  } finally {
    console.log("✅ AccountList: устанавливаем loading = false");
    console.log("✅ AccountList: возвращаем аккаунты:", instanceData.value);
    accountStore.setLoading(false);
    return instanceData.value;
  }
};

onMounted(async () => {
  await chatStore.init();
  await getAccounts();
});

defineExpose({
  getAccounts,
  getAllAccounts,
});

provide("selectedItems", { selectedItems });
provide("changeEnableStation", { changeEnableStation });
</script>

<style scoped>
.account-list-section {
  position: relative;
}
</style>
