<template>
  <div v-if="isModalOpen" class="black-fon" @click="closeModal">
    <ErrorBlock v-if="errorBlock" :changeIncorrectPassword="chaneErrorBlock" />
    <transition name="fade">
      <div
        class="action-list"
        :class="{ 'mobile-fullscreen': isMobile }"
        :style="
          isMobile
            ? {}
            : {
                top: modalPosition.top + 'px',
                left: modalPosition.left + 'px',
              }
        "
      >
        <div v-if="isMobile" class="mobile-header">
          <div class="account-info-mobile">
            <AccountIcon :item="selectedItem" />
            <span class="account-login-mobile">{{
              selectedItem.login || "-"
            }}</span>
            <DeletedBadge v-if="isAccountDisabled" />
          </div>
          <button class="close-button" @click="closeModal">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <template v-if="isAccountDisabled">
          <span class="action action-support" @click="openSupport">
            Написать в ТП
          </span>
        </template>

        <!-- Для активных аккаунтов показываем полный список действий -->
        <template v-else>
          <span
            class="action"
            v-if="!['amocrm', 'bitrix24', 'uon'].includes(selectedItem.type)"
            @click="openTariff"
            >Подписка</span
          >
          <span
            class="action"
            v-if="
              isAdminUser &&
              !['amocrm', 'bitrix24', 'uon', 'bulk'].includes(selectedItem.type)
            "
            @click="handleSubmit"
            >{{ t("modalAccount.settings") }}</span
          >
          <span
            class="action"
            v-if="
              !['amocrm', 'bitrix24', 'uon', 'bulk'].includes(selectedItem.type)
            "
            @click="changeEditNameModal"
            >Сменить имя</span
          >
          <span
            v-if="
              selectedItem.source != 'telegram' &&
              !['amocrm', 'bitrix24', 'uon', 'bulk'].includes(
                selectedItem.type,
              ) &&
              isAdminUser
            "
            class="action"
            @click="openScreen"
            >{{ t("modalAccount.screen") }}</span
          >
          <span
            v-if="
              !['amocrm', 'bitrix24', 'uon', 'bulk'].includes(selectedItem.type)
            "
            class="action action-on"
            @click="changeEnableStation"
            >{{ t("modalAccount.on") }}</span
          >
          <span
            v-if="
              !['amocrm', 'bitrix24', 'uon', 'bulk'].includes(selectedItem.type)
            "
            class="action"
            @click="forceStopActive"
            >{{ t("modalAccount.off") }}</span
          >

          <span
            v-if="
              !['amocrm', 'bitrix24', 'uon', 'bulk'].includes(selectedItem.type)
            "
            class="action action-throw"
            @click="openResetAccountModal"
            >{{ t("modalAccount.change") }}</span
          >

          <span
            v-if="
              !['amocrm', 'bitrix24', 'uon', 'bulk'].includes(selectedItem.type)
            "
            class="action"
            @click="getNewProxy"
            >{{ t("modalAccount.changeProxy") }}</span
          >

          <span
            class="action action-delete"
            @click="openDeleteAccountModal"
            v-if="
              !['amocrm', 'bitrix24', 'uon', 'bulk'].includes(
                selectedItem.type,
              ) &&
              !(
                selectedItem.storage === 'binder' &&
                selectedItem.type === 'touchapi'
              ) &&
              !(
                selectedItem.storage === 'whatsapi' &&
                selectedItem.type === 'undefined'
              )
            "
            >{{ t("modalAccount.deleteAccount") }}</span
          >
          <span
            v-if="['amocrm', 'bitrix24', 'uon'].includes(selectedItem.type)"
            class="action"
            @click="updateAccountButton"
            >Обновить аккаунт</span
          >

          <span
            v-if="
              ['uon'].includes(selectedItem.type) &&
              stationDomain.navigate.value === 'whatsapi'
            "
            class="action"
            @click="changeStationGetHistory"
            >История</span
          >

          <span
            v-if="
              ['uon'].includes(selectedItem.type) &&
              stationDomain.navigate.value === 'whatsapi'
            "
            class="action"
            @click="changeRoutingSettings"
            >Менеджеры</span
          >

          <span
            v-if="
              ['uon'].includes(selectedItem.type) &&
              stationDomain.navigate.value === 'whatsapi'
            "
            class="action"
            @click="openUonSettingModal"
            >Настройки</span
          >

          <span
            v-if="
              ['uon'].includes(selectedItem.type) &&
              stationDomain.navigate.value === 'whatsapi'
            "
            class="action"
            @click="openMessageHistory"
            >История сообщений</span
          >

          <span
            v-if="
              ['uon'].includes(selectedItem.type) &&
              stationDomain.navigate.value === 'whatsapi'
            "
            class="action"
            @click="openBlacklistModal"
            >Черный список</span
          >

          <span
            v-if="
              ['uon'].includes(selectedItem.type) &&
              stationDomain.navigate.value === 'whatsapi'
            "
            class="action"
            @click="openCustomSourcesModal"
            >Источники</span
          >

          <span
            v-if="['amocrm'].includes(selectedItem.type)"
            class="action"
            @click="changeBindingStation"
            >Привязать</span
          >

          <span
            v-if="
              selectedItem.source != 'telegram' &&
              ['amocrm', 'bitrix24', 'uon'].includes(selectedItem.type)
            "
            class="action"
            @click="deleteAccountButton"
            >Удалить аккаунт</span
          >
        </template>
      </div>
    </transition>
  </div>

  <LoadingMoadal
    :changeStationLoadingModal="changeStationLoadingModal"
    :stationLoading="stationLoading"
  />

  <LoadMoadal
    :stationLoading="stationLoading"
    :textLoadin="stationLoading.text"
    :changeStationLoading="changeStationLoading"
  />

  <ConfirmDelete
    :loadingStart="loadingStart"
    :ChangeconfirmStation="ChangeconfirmStation"
    v-if="confirmStation.delete"
    :selectedItem="selectedItem"
    :changeStationLoadingModal="changeStationLoadingModal"
    :errorStationOn="errorStationOn"
    :errorStationOff="errorStationOff"
    :loadingStop="loadingStop"
  />

  <ChatStation
    v-if="chatsStationModal"
    :close="changeChatsStationModal"
    :error="errorValueChat"
  />
</template>

<script setup>
import { toRefs, ref, defineProps, reactive, computed } from "vue";
import ChatStation from "./ModalAccount/ChatStation.vue";
import ErrorBlock from "@/components/ErrorBlock/ErrorBlock.vue";
import axios from "axios";
import ConfirmDelete from "./ModalAccount/ConfirmModal/ConfirmDelete.vue";
import LoadingMoadal from "./LoadingMoadal/LoadingMoadal.vue";
import LoadMoadal from "./LoadingMoadal/LoadModal.vue";
const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL;
const FRONTEND_URL_VENDORS = import.meta.env.VITE_FRONTEND_URL_VENDORS;
import GetScreen from "./ModalAccount/GetScreen.vue";

const props = defineProps({
  closeModal: {
    type: Function,
  },
  changeTariffStation: {
    type: Function,
  },
  openMessageHistory: {
    type: Function,
  },
  openUonSettingModal: {
    type: Function,
  },
  modalPosition: {
    type: Object,
  },
  openDeleteAccountModal: {
    type: Function,
  },
  isModalOpen: {
    type: Boolean,
  },
  changeEditNameModal: {
    type: Function,
  },
  openResetAccountModal: {
    type: Function,
  },
  changeRoutingSettings: {
    type: Function,
  },
  selectedItem: {
    type: Object,
  },
  changeStationGetHistory: {
    type: Function,
  },
  selectedItems: {
    type: Object,
  },
  changeBindingStation: {
    type: Function,
  },
  qrCodeData: {
    type: Object,
  },
  loadingStation: {
    type: Boolean,
  },
  openBlacklistModal: {
    type: Function,
  },
  changeStationSettingsModal: {
    type: Function,
  },
  openSupport: {
    type: Function,
  },
  changeStationQrModal: {
    type: Function,
  },
  changeStationGetByCode: {
    type: Function,
  },
  changeEnableStation: {
    type: Function,
  },
  changeGetScreenStation: {
    type: Function,
  },
  getScreenStation: {
    type: Boolean,
  },
  chatsStation: {
    type: Boolean,
  },
  changeForceStopItemData: {
    type: Function,
  },
  getAccounts: {
    type: Function,
  },
  openCustomSourcesModal: {
    type: Function,
  },
});

import { storeToRefs } from "pinia";
import { useLoginWhatsAppChatsStepStore } from "@/stores/loginWhatsAppChatsStepStore";

const isAdminUser = localStorage.getItem("is_admin") === "true" || false;
const chatStore = useLoginWhatsAppChatsStepStore();
const emit = defineEmits();
const { selectedItem, loadingStation, chatsStation } = toRefs(props);
import { useRouter } from "vue-router";
import WhatsApp from "./ModalAccount/GetByCode/WhatsApp.vue";
import { useAccountStore } from "@/stores/accountStore";
const accountStore = useAccountStore();
const token = computed(() => accountStore.getAccountToken);
import { useStationLoading } from "@/composables/useStationLoading";
const { setLoadingStatus } = useStationLoading();
const updateLoadingStation = ref(false);

const qrData = ref([]);
const router = useRouter();

// Добавляем computed для проверки статуса аккаунта
const isAccountDisabled = computed(() => {
  const item = selectedItem.value;
  return item && (item.enable === "0" || item.enable === 0);
});

const handleSubmit = () => {
  emit("update:selectedItems", selectedItem.value);
  props.changeStationSettingsModal();
  props.closeModal();
};
const isFlashing = ref(false);

const chatsStationModal = ref(false);

const changeChatsStationModal = () => {
  chatsStationModal.value = !chatsStationModal.value;
};

const errorValueChat = ref("");

const isMobile = computed(() => window.innerWidth <= 768);

const navigateTo = (page, queryParams = {}) => {
  router.push({
    path: page,
    query: queryParams,
  });
};

// Функция для обращения в техподдержку
const contactSupport = () => {
  // Здесь можно добавить логику для открытия чата с ТП
  // или перенаправления на страницу поддержки
  console.log("Обращение в техподдержку для аккаунта:", selectedItem.value);
  // Например, открыть ссылку на Telegram или email
  window.open("https://t.me/your_support_bot", "_blank");
  props.closeModal();
};

const openChat = () => {
  console.log(chatsStation.value);
  if (selectedItem.value.subscription_dt_to === null) {
    chatsStationModal.value = true;
    errorValueChat.value = "tariff";
  } else if (chatsStation.value === false) {
    errorValueChat.value = "noStarted";
    chatsStationModal.value = true;
  } else {
    navigateTo("/UserChats", {
      login: selectedItem.value.login,
      uuid: selectedItem.value.uuid,
      type: selectedItem.value.type,
      storage: selectedItem.value.storage,
      source: selectedItem.value.source,
      mode: "mailing",
    });
  }
};

const openScreen = () => {
  if (!selectedItem.value.step) {
    errorValueChat.value = "noStarted";
    changeChatsStationModal();
    return;
  }

  props.changeGetScreenStation();
};

const openTariff = () => {
  props.changeTariffStation(selectedItem.value);
};

const changeLadingStation = () => {
  emit("update:loadingStation", updateLoadingStation.value);
};
const handleDisabledChat = (event) => {
  event.stopPropagation();

  // Активируем мигание
  isFlashing.value = true;

  // Отключаем мигание через 500мс
  setTimeout(() => {
    isFlashing.value = false;
  }, 500);
};
const confirmStation = reactive({
  delete: false,
  reset: false,
});

const stationLoading = reactive({
  loading: false,
  value: "",
  text: "",
  modalStation: false,
  deleteAccount: {
    station: false,
    result: undefined,
  },
  account: {
    station: false,
    result: undefined,
    error: false,
  },
});

const changeStationLoading = () => {
  stationLoading.loading = !stationLoading.loading;
};

const stateLoading = (value) => {
  if (value === true) {
    stationLoading.loading = true;
  } else {
    stationLoading.loading = false;
  }
};

const errorBlock = ref(false);
const chaneErrorBlock = () => {
  errorBlock.value = errorBlock.value;
};

const errorStationOn = () => {
  stationLoading.account.error = true;
};

const errorStationOff = () => {
  stationLoading.account.error = true;
};

import useFrontendLogger from "@/composables/useFrontendLogger";
const { sendLog } = useFrontendLogger();

const handleSendLog = async (location, method, params, results, answer) => {
  try {
    await sendLog(location, method, params, results, answer);
  } catch (err) {
    console.error("error", err);
    // Optionally, update the error message ref
  }
};

const connectToDatabaseAndNavigate = async () => {
  const apiUrl = import.meta.env.VITE_API_URL;

  try {
    const response = await axios.post(`${apiUrl}/connect`, {
      source: "whatsapp",
      login: selectedItem.value.login,
      token: `token`,
    });

    router.push({ name: "Chats", query: { mode: "widget" } });
    if (response.data) {
      await handleSendLog(
        "modalAccount",
        "connect",
        { source: "whatsapp", login: selectedItem.value.login, token: `token` },
        response.data,
        response.data,
      );
    }
  } catch (err) {
    console.log(err);
  }
};

const navigateToChat = () => {
  router.push({ name: "Chats", query: { mode: "widget" } });
};

const ChangeconfirmStation = () => {
  confirmStation.delete = !confirmStation.delete;
};

const ChangeconfirmStationReset = () => {
  confirmStation.reset = !confirmStation.reset;
};

const loadingStart = (value) => {
  stationLoading.loading = true;
  stationLoading.text = value;
};

const loadingStop = () => {
  stationLoading.loading = false;
};

const changeStationLoadingModal = (value) => {
  stationLoading.modalStation = value;
};

const handleSubmitCode = () => {
  emit("update:selectedItems", selectedItem.value);
  props.changeStationGetByCode();
  props.closeModal();
};

const qrCodeDataSubmit = async () => {
  await emit("update:qrCodeData", qrData.value);
  props.closeModal();
};

import { useDomain } from "@/composables/getDomain";
const { stationDomain } = useDomain();

const createRequest = async (request) => {
  const { source, login, storage } = selectedItem.value;
  let params = {
    source: source,
    login: login,
  };
  if (stationDomain.navigate.value != "whatsapi") {
    params = {
      source: source,
      login: login,
    };
  } else {
    params = {
      source: source,
      login: login,
      storage: storage,
    };
  }
  try {
    const response = await axios.post(`${FRONTEND_URL}${request}`, params, {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Authorization: `Bearer ${token.value}`,
      },
    });

    if (response.data) {
      await handleSendLog(
        "modalAccount",
        request,
        params,
        response.data,
        response.data,
      );
    }

    if (response.data.status === "ok") {
      if (request === "getQr") {
        responseQr.value = response.data.data.value;
        qrData.value = Array.from(responseQr.value.split(","));
        stationLoading.account.result = true;
        stationLoading.loading = false;

        // qrCodeDataSubmit();
      } else if (request === "deleteAccount") {
        stationLoading.loading = false;
        // location.reload();
        setTimeout(() => {
          changeStationLoadingModal();
        }, 1000);
      } else if (request === "getNewProxy") {
        updateLoadingStation.value = false;
        changeLadingStation();
        stationLoading.loading = false;
        setLoadingStatus(true, "success");
      } else {
        setLoadingStatus(true, "error");
      }
    } else if (response.data === 401) {
      errorBlock.value = true;
      setTimeout(() => {
        localStorage.removeItem("accountToken");
        router.push("/login");
      }, 2000);
    } else {
    }
  } catch (error) {
    console.error(`error`, error);
    stationLoading.account.error = true;
    stationLoading.modalStation = true;
    setTimeout(() => {
      stationLoading.modalStation = false;
      stationLoading.account.error = false;
    }, 5000);
    if (error.response) {
      console.error("error", error.response.data);
    }
  }
};

const updateAccountButton = async () => {
  const { source, login, type, storage } = selectedItem.value;
  try {
    const response = await axios.post(
      `${FRONTEND_URL_VENDORS}updateAccount`,
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
    if (response.data.ok === true) {
      stationLoading.loading = false;
      setLoadingStatus(true, "success");
      console.log("true responce");
    } else if (response.data === 401) {
      errorBlock.value = true;
      setTimeout(() => {
        localStorage.removeItem("accountStore");
        router.push("/login");
      }, 2000);
    } else {
      setLoadingStatus(true, "error");
    }
  } catch (error) {
    console.log("Огиька level1");
    console.error(`error`, error);
    stationLoading.loading = false;
    setLoadingStatus(true, "error");

    if (error.response) {
      console.log("Огиька level 2");
      console.error("error", error.response.data);
      stationLoading.loading = false;
      setLoadingStatus(true, "error");
    }
  }
};

const deleteAccountButton = async () => {
  const { source, login, type, storage } = selectedItem.value;
  try {
    const response = await axios.post(
      `${FRONTEND_URL_VENDORS}deleteAccount`,
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
    if ((response.data.ok = true)) {
      chatStore.removeChat(login, source);
      stationLoading.loading = false;
      props.getAccounts();
      setLoadingStatus(true, "success");
    } else if (response.data === 401) {
      errorBlock.value = true;
      setTimeout(() => {
        localStorage.removeItem("accountToken");
        router.push("/login");
      }, 2000);
    } else {
      setLoadingStatus(true, "error");
    }
  } catch (error) {
    console.log("Огиька level1");
    console.error(`error`, error);
    stationLoading.loading = false;
    setLoadingStatus(true, "error");

    if (error.response) {
      console.log("Огиька level 2");
      console.error("error", error.response.data);
      stationLoading.loading = false;
    }
  }
};

const forceStop = async (request) => {
  const { source, login, type, storage } = selectedItem.value;
  try {
    const response = await axios.post(
      `${FRONTEND_URL}${request}`,
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
    console.log(response.data);
    if (response.data.status === "ok") {
      chatStore.removeChat(login, source);
      stationLoading.loading = false;
      setLoadingStatus(true, "success");
    } else if (response.data === 401) {
      errorBlock.value = true;
      setTimeout(() => {
        localStorage.removeItem("accountToken");
        router.push("/login");
      }, 2000);
    } else {
      setLoadingStatus(true, "error");
    }
  } catch (error) {
    console.log("Огиька level1");
    console.error(`error`, error);
    stationLoading.loading = false;
    stationLoading.account.error = true;
    stationLoading.modalStation = true;
    setTimeout(() => {
      stationLoading.modalStation = false;
      stationLoading.account.error = false;
    }, 5000);
    if (error.response) {
      console.log("Огиька level 2");
      console.error("error", error.response.data);
      stationLoading.loading = false;
    }
  }
};

const disablePhoneAuth = async () => {
  const { source, login } = selectedItem.value;
  try {
    const response = await axios.post(
      `${FRONTEND_URL}disablePhoneAuth`,
      {
        source: source,
        login: login,
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
        "modalAccount",
        "disablePhoneAuth",
        { source: source, login: login },
        response.data,
        response.data,
      );
    }

    if (response.data.ok === true) {
    } else if (response.data === 401) {
      errorBlock.value = true;
      setTimeout(() => {
        localStorage.removeItem("accountToken");
        router.push("/login");
      }, 2000);
    } else {
    }
  } catch (error) {
    console.error("error", error);
    if (error.response) {
      console.error("error", error.response.data);
    }
  }
};

const changeName = async () => {
  const { uuid } = selectedItem.value;
  try {
    const response = await axios.post(
      `${FRONTEND_URL}updateInstanceName`,
      {
        name: "test_name",
        uuid: uuid,
      },
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: `Bearer ${token.value}`,
        },
      },
    );
    if ((response.data.ok = true)) {
      stationLoading.loading = false;
      props.getAccounts();
      setLoadingStatus(true, "success");
    } else if (response.data === 401) {
      errorBlock.value = true;
      setTimeout(() => {
        localStorage.removeItem("accountToken");
        router.push("/login");
      }, 2000);
    } else {
      setLoadingStatus(true, "error");
    }
  } catch (error) {
    console.log("Огиька level1");
    console.error(`error`, error);
    stationLoading.loading = false;
    setLoadingStatus(true, "error");

    if (error.response) {
      console.log("Огиька level 2");
      console.error("error", error.response.data);
      stationLoading.loading = false;
    }
  }
};

const setState = async () => {
  const { source, login } = selectedItem.value;
  try {
    const response = await axios.post(
      `${FRONTEND_URL}setState`,
      {
        source: source,
        login: login,
        setState: true,
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
        "modalAccount",
        "setState",
        { source: source, login: login, setState: true },
        response.data,
        response.data,
      );
    }

    if (response.data.ok === true) {
    } else if (response.data === 401) {
      errorBlock.value = true;
      setTimeout(() => {
        localStorage.removeItem("accountToken");
        router.push("/login");
      }, 2000);
    } else {
    }
  } catch (error) {
    console.error("error", error);
    if (error.response) {
      console.error("error:", error.response.data);
    }
  }
};

const setStateTelegram = async () => {
  const { source, login } = selectedItem.value;
  try {
    const response = await axios.post(
      `${FRONTEND_URL}setState`,
      {
        source: "whatsapp",
        login: "helly",
        setState: true,
        qrLogin: true,
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
        "modalAccount",
        "setState",
        { source: "whatsapp", login: "helly", setState: true, qrLogin: true },
        response.data,
        response.data,
      );
    }

    if (response.data.ok === true) {
      console.log("Состояние установлено");
    } else if (response.data === 401) {
      errorBlock.value = true;
      setTimeout(() => {
        localStorage.removeItem("accountToken");
        router.push("/login");
      }, 2000);
    } else {
      console.log(response.data.ok);
    }
  } catch (error) {
    console.error("Ошибка при создании аккаунта:", error);
    if (error.response) {
      console.error("Ошибка сервера:", error.response.data);
    }
  }
};

let intervalId = null;

const EnablebyQR = async (value) => {
  stationLoading.loading = true;
  await createRequest("forceStop");
  await disablePhoneAuth();

  if (value === "telegram") {
    await setStateTelegram();
  } else {
    await setState();
  }

  await qrCodeDataSubmit();
};

import { useI18n } from "vue-i18n";
const { t } = useI18n();

const startEnableByQR = async (value) => {
  await EnablebyQR(value);

  intervalId = setInterval(async () => {
    await createRequest("getQr");
    await qrCodeDataSubmit();
  }, 5000);

  setTimeout(() => {
    clearInterval(intervalId);
    stationLoading.loading = false;
  }, 60000);
};

const forceStopActive = async () => {
  stationLoading.loading = true;
  stationLoading.text = t("globalLoading.offAccount");
  forceStop("forceStop");
  props.changeForceStopItemData(selectedItem.value);
};

const getNewProxy = async () => {
  createRequest("getNewProxy");
  stationLoading.loading = true;
  stationLoading.text = t("globalLoading.proxy");
};

const resetAccount = async () => {
  stationLoading.loading = true;
  await createRequest("forceStop");
  await createRequest("clearSession");
  await createRequest("getNewProxy");
};

const DeletedBadge = {
  template: `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="deleted-badge">
      <path d="M6 6L18 18M6 18L18 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>
  `,
};
</script>

<style scoped>
.black-fon {
  position: fixed;
  z-index: 1000;
  width: 100%;
  height: 100vh;
  background: rgba(117, 117, 117, 0.3);
  top: 0;
  left: 0;
}

/* Базовые стили для десктопной версии */
.action-list {
  border-radius: 10px;
  width: 150px;
  background: #ffffff;
  position: absolute;
  z-index: 1010;
  display: flex;
  flex-direction: column;
  padding: 10px 0px 10px 10px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.action-list.fade-enter-active,
.action-list.fade-leave-active {
  transition: opacity 0.3s ease;
}

.action-list.fade-enter,
.action-list.fade-leave-to {
  opacity: 0;
}

/* Мобильная версия через media queries */
@media (max-width: 768px) {
  .action-list {
    position: fixed;
    top: 50% !important;
    left: 50% !important;
    transform: translate(-50%, -50%);
    width: 90%;
    max-width: 400px;
    margin: 0;
    padding: 0;
    border-radius: 16px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    animation: mobileFadeIn 0.3s forwards;
  }

  @keyframes mobileFadeIn {
    from {
      opacity: 0;
      transform: translate(-50%, -40%);
    }
    to {
      opacity: 1;
      transform: translate(-50%, -50%);
    }
  }

  /* Показываем мобильный заголовок только на мобилках */
  .mobile-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    border-bottom: 1px solid #e5e7eb;
    background: #f9fafb;
    border-radius: 16px 16px 0 0;
  }

  /* Стили для действий на мобилках */
  .action-list .action,
  .action-list .action-support {
    padding: 16px;
    font-size: 16px;
    border-bottom: 1px solid #f3f4f6;
    margin: 0;
  }

  .action-list .action:last-child,
  .action-list .action-support:last-child {
    border-bottom: none;
    border-radius: 0 0 16px 16px;
  }

  .action-list .action:hover,
  .action-list .action-support:hover {
    background-color: #f3f4f6;
    border-radius: 0;
  }
}

/* Десктопная версия */
@media (min-width: 769px) {
  .mobile-header {
    display: none;
  }

  .action-list .action,
  .action-list .action-support {
    padding: 8px 12px;
    font-size: 14px;
    margin: 0;
    border-radius: 5px;
  }

  .action-list .action:hover,
  .action-list .action-support:hover {
    background-color: #eeeeee;
    border-radius: 5px;
  }
}

/* Общие стили для мобильного заголовка */
.mobile-header {
  display: none; /* По умолчанию скрыт, показывается через media query */
}

.account-info-mobile {
  display: flex;
  align-items: center;
  gap: 8px;
}

.account-login-mobile {
  font-weight: 600;
  font-size: 16px;
  color: #1f2937;
}

.close-button {
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-button:hover {
  background: #e5e7eb;
}

.close-button svg {
  width: 20px;
  height: 20px;
  color: #6b7280;
}

/* Бейдж удаленного аккаунта */
.deleted-badge {
  color: #ef4444;
  margin-left: 8px;
  flex-shrink: 0;
}

/* Стиль для кнопки поддержки */
.action-support {
  font-weight: 400;
  font-size: 14px;
  color: #6732ff;
  cursor: pointer;
}

.action-support:hover {
  color: #5a2ae0;
}

/* Общие стили для действий */
.action-chat-false {
  font-weight: 400;
  font-size: 14px;
  color: #616161;
  cursor: pointer;
  display: flex;
  align-items: center;
  cursor: not-allowed;
  gap: 6px;
}

.action {
  font-weight: 400;
  font-size: 14px;
  color: #000;
  cursor: pointer;
}

.action-loading {
  font-weight: 400;
  font-size: 14px;
  color: #5f5f5f;
  cursor: pointer;
  animation: shimmer 1s infinite;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: not-allowed;
  opacity: 0.6;
  transition: background-color 0.3s;
}

.flash-red {
  background-color: rgba(255, 0, 0, 0.3);
  animation: flash 0.5s;
}

@keyframes flash {
  0% {
    background-color: rgba(255, 0, 0, 0);
  }
  50% {
    background-color: rgba(255, 0, 0, 0.5);
  }
  100% {
    background-color: rgba(255, 0, 0, 0);
  }
}

@keyframes shimmer {
  0% {
    opacity: 0.7;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.7;
  }
}

.action-on:hover {
  color: green;
}

.action-throw:hover,
.action-delete:hover {
  color: rgb(255, 0, 0);
}
</style>
