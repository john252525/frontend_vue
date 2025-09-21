<template>
  <section class="account-list-section">
    <DesktopTableView
      :dataStation="dataStation"
      :instanceData="instanceData"
      :dataStationNone="dataStationNone"
      :loadDataStation="loadDataStation"
      :errorAccountBolean="errorAccountBolean"
      :changeEnableStartModal="changeEnableStartModal"
      @show-message="showMessage"
      @hide-message="hideMessage"
      @change-tariff="changeTariffStation"
      @open-modal="openModal"
    />

    <MobileCardsView
      :dataStation="dataStation"
      :instanceData="instanceData"
      :dataStationNone="dataStationNone"
      :loadDataStation="loadDataStation"
      :errorAccountBolean="errorAccountBolean"
      :accountStation="accountStation"
      @open-mobile-modal="openMobileModal"
      @change-tariff="changeTariffStation"
    />

    <Tariff
      v-if="tariffStation"
      :selectedItem="selectedItem"
      :changeTariffStation="changeTariffStation"
      :getAccounts="getAccounts"
      :changePayDataForAccounts="changePayDataForAccounts"
    />

    <Modal
      :changeTariffStation="changeTariffStation"
      :isModalOpen="isModalOpen"
      :closeModal="closeModal"
      :modalPosition="modalPosition"
      :selectedItem="selectedItem"
      :qrCodeData="qrCodeData"
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

    <Enable
      v-if="enableStation"
      :changeForceStopItemData="changeForceStopItemData"
      :enableStation="enableStation"
      :selectedItem="selectedItem"
      :changeEnableStation="changeEnableStation"
    />
    <StartModal
      v-if="enableStartModal"
      :item="selectedItem"
      :closeModal="changeEnableStartModal"
    />
    <ErrorBlock v-if="errorBlock" :changeIncorrectPassword="chaneErrorBlock" />
  </section>
</template>

<script setup>
import { ref, reactive, onMounted, provide, inject, computed } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";
import DesktopTableView from "./AccountListComponents/DesktopTableView.vue";
import MobileCardsView from "./AccountListComponents/MobileCardsView.vue";
import ErrorBlock from "@/components/ErrorBlock/ErrorBlock.vue";
import Modal from "./Modal.vue";
import Enable from "./ModalAccount/Enable/Enable.vue";
import SettignsModal from "./ModalAccount/SettingsModal/SettingsModal.vue";
import getByCode from "./ModalAccount/GetByCode/GetByCode.vue";
import StartModal from "./ModalAccount/EnableAccount/StartModal.vue";
import QrModal from "./ModalAccount/qrModal.vue";
import getScreen from "./ModalAccount/GetScreen.vue";
import Tariff from "./TariffAccount/Tariff.vue";
import { useAccountStore } from "@/stores/accountStore";

const accountStore = useAccountStore();
const token = computed(() => accountStore.getAccountToken);
const accountStation = computed(() => accountStore.getAccountStation);
const sourceGroup = computed(() => accountStore.getSource);
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

const router = useRouter();

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
const enableStartModal = ref(false);

import useFrontendLogger from "@/composables/useFrontendLogger";
import False from "@/components/Chats/UserList/ResultModal/False.vue";
import { compileScript } from "vue/compiler-sfc";
const { sendLog } = useFrontendLogger();

const changeForceStopItemData = async (item) => {
  try {
    forceStopItemData.value = { ...item, loading: true };
    const accountIndex = instanceData.value.findIndex(
      (acc) => acc.login === item.login && acc.source === item.source
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
      item.storage
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
      (acc) => acc.login === item.login && acc.source === item.source
    );
    if (accountIndex !== -1) {
      instanceData.value[accountIndex].loading = false;
    }
  }
};

const formatSubscriptionDate = (dateString) => {
  if (!dateString) return "-";

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch (e) {
    return dateString;
  }
};

const changePayDataForAccounts = (item) => {
  const index = instanceData.value.findIndex(
    (account) => account.uuid === item.uuid
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

const updateLocalStorage = (login, source, storage, type) => {
  try {
    const newLoginData = {
      login,
      source,
      storage: storage || "undefined",
      type: type || "undefined",
    };
    chatStore.addOrUpdateChat(newLoginData);
  } catch (e) {
    console.error("Error updating store:", e);
  }
};

const changeEnableStation = () => {
  enableStation.value = !enableStation.value;
};

const changeGetScreenStation = () => {
  getScreenStation.value = !getScreenStation.value;
};

const changeEnableStartModal = (item) => {
  selectedItem.value = item;
  console.log(selectedItem.value);
  enableStartModal.value = !enableStartModal.value;
};

const closeScreen = () => {
  getScreenStation.value = false;
};

const errorBlock = ref(false);
const chaneErrorBlock = () => {
  errorBlock.value = !errorBlock.value;
};

const handleSendLog = async (location, method, params, results, answer) => {
  try {
    await sendLog(location, method, params, results, answer);
  } catch (err) {
    console.error("error", err);
  }
};

const changeTariffStation = (item) => {
  selectedItem.value = item;
  tariffStation.value = !tariffStation.value;
};

const getAccounts = async () => {
  dataStationNone.value = false;
  errorAccountBolean.value = false;
  loadDataStation.value = true;

  const mockResponse = {
    ok: true,
    message: "Instances received",
    data: {
      instances: [
        {
          storage: "local",
          type: "undefined",
          login: "mizxoyjnmvsdcnq",
          source: "whatsapp",
          id: "3",
          step: { value: 5 },
          uuid: "20964f74-641c-4869-9ecf-eef76902ebe3",
          domain: "",
          subscription_dt_to: "2026-03-14 23:55:24",
          name: "политех",
        },
        {
          storage: "local",
          type: "undefined",
          login: "mizxoyjnmm2wiyi",
          source: "whatsapp",
          id: "2",
          uuid: "e44f9d80-343b-40cb-8a6e-584195a44243",
          domain: "",
          step: null,
          subscription_dt_to: "2026-01-15 01:00:27",
          name: "алабуга",
        },
        {
          id: "4",
          uuid: "6936f66b-b336-430f-b4cd-c99850a9532a",
          dt_ins: "2025-09-18 18:50:21",
          type: "amocrm",
          login: "еу",
          source: "",
          enable: 1,
          subscription_dt_to: "2025-09-22 23:32:35",
        },
        {
          id: "5",
          uuid: "f49bf745-5221-4bc1-bbe1-46c41cb35e46",
          dt_ins: "2025-09-18 19:21:20",
          type: "bitrix24",
          login: "4324324",
          source: "4324324",
          enable: 1,
          subscription_dt_to: "2025-09-22 23:32:35",
        },
        {
          id: "1",
          uuid: "337734e4-05fe-4262-97e5-43d401b7c4de",
          dt_ins: "2025-09-11 15:47:20",
          type: "bulk",
          token: "22e75215907b1984e7c117db09cb23bd",
          login: "maksim.birykov.2007@mail.ru",
          source: "whatsapi",
          enable: 1,
          subscription_dt_to: "2025-09-22 23:32:35",
        },
      ],
    },
  };

  if (mockResponse.ok === true) {
    accounts.value = mockResponse;
    instanceData.value = accounts.value.data.instances.map((instance) => ({
      ...instance,
      step: instance.step || null,
      loading: false,
      storage: instance.storage || "undefined",
      type: instance.type || "undefined",
    }));

    if (instanceData.value.length === 0) {
      loadDataStation.value = false;
      dataStationNone.value = true;
    } else {
      loadDataStation.value = false;
      dataStation.value = true;
    }
  }
};

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
      }
    );
    return response;
  } catch (error) {
    console.error("Error in getInfoWhats:", error);
    return null;
  }
};

const updateUserInfo = (event) => {
  userInfoStore.setUserInfo(event);
};

const openModal = (event, item) => {
  selectedItem.value = item;
  isModalOpen.value = true;
  updateUserInfo(JSON.stringify(selectedItem.value));
  getInfo();

  const rect = event.currentTarget.getBoundingClientRect();
  const modalWidth = 160;
  const edgeMargin = 10;

  let left = rect.left + window.scrollX;
  let top = rect.bottom + window.scrollY + 2;

  if (left + modalWidth > window.innerWidth + window.scrollX - edgeMargin) {
    left = window.innerWidth + window.scrollX - modalWidth - edgeMargin;
  }

  if (left < window.scrollX + edgeMargin) {
    left = window.scrollX + edgeMargin;
  }

  const modalHeight = 300;
  const bottomEdge = window.innerHeight + window.scrollY;

  if (top + modalHeight > bottomEdge - edgeMargin) {
    top = rect.top + window.scrollY - modalHeight - 2;

    if (top < window.scrollY + edgeMargin) {
      top = window.scrollY + edgeMargin;
    }
  }

  modalPosition.value = {
    top: Math.round(top),
    left: Math.round(left),
  };
};

function formatPhoneNumber(phoneNumber) {
  const regex = /^8(\d{3})(\d{3})(\d{2})(\d{2})$/;
  const match = phoneNumber.match(regex);

  if (!match) {
    return phoneNumber;
  }

  return `+7 (${match[1]}) ${match[2]}-${match[3]}-${match[4]}`;
}

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

const updateLoading = (newValue) => {
  loadingStation.value = newValue;
};

const messageVisible = ref(false);
const tooltipMessage = ref("");
const tooltipStyle = ref({});

const isActionAvailable = (item) => {
  return (
    (item.storage === "local" && item.type === "undefined") ||
    (item.storage === "binder" && item.type === "touchapi") ||
    (item.storage === "undefined" && item.type === "whatsapi") ||
    (item.storage === "whatsapi" && item.type === "undefined") ||
    item.type === "bulk" ||
    item.type === "amocrm" ||
    item.type === "bitrix24"
  );
};

const openMobileModal = (event, item) => {
  openModal(event, item);
};

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
      }
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
        response.data
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
  }
};

onMounted(async () => {
  await chatStore.init();
  await getAccounts();
});

defineExpose({
  getAccounts,
});

provide("selectedItems", { selectedItems });
provide("changeEnableStation", { changeEnableStation });
</script>

<style scoped>
.account-list-section {
  position: relative;
}
</style>
