<template>
  <div v-if="isModalOpen" class="black-fon" @click="closeModal">
    <ErrorBlock v-if="errorBlock" :changeIncorrectPassword="chaneErrorBlock" />
    <transition name="fade">
      <div
        class="action-list"
        :style="{
          top: modalPosition.top + 'px',
          left: modalPosition.left + 'px',
        }"
      >
        <span class="action" @click="handleSubmit">Настройки</span>
        <span
          class="action"
          v-if="accountStationText === 'whatsapp'"
          @click="changeGetScreenStation"
          >Скриншот</span
        >
        <span class="action action-on" @click="changeEnableStation"
          >Включить</span
        >
        <span class="action" @click="forceStopActive">Выключить</span>
        <span class="action action-throw" @click="ChangeconfirmStationReset"
          >Сбросить</span
        >
        <span
          class="action-loading"
          :class="{ 'flash-red': isFlashing }"
          v-if="!chatsStation"
          @click.stop="handleDisabledChat"
          >Чат</span
        >
        <span
          class="action"
          v-else="chatsStation === true"
          @click="connectToDatabaseAndNavigate"
          >Чат</span
        >
        <span class="action" @click="getNewProxy">Сменить прокси</span>
        <!-- <span class="action" @click="startEnableByQR('whatsapp')"
          >Связать через QR</span
        > -->
        <!-- <span class="action" @click="handleSubmitCode">Связать через код</span> -->
        <span
          class="action action-delete"
          @click="ChangeconfirmStation"
          v-if="
            !(
              selectedItem.storage === 'binder' &&
              selectedItem.type === 'touchapi'
            ) &&
            !(
              selectedItem.storage === 'whatsapi' &&
              selectedItem.type === 'undefined'
            )
          "
          >Удалить аккаунт</span
        >
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

  <ConfirmReset
    :loadingStart="loadingStart"
    :ChangeconfirmStationReset="ChangeconfirmStationReset"
    v-if="confirmStation.reset"
    :selectedItem="selectedItem"
    :changeStationLoadingModal="changeStationLoadingModal"
    :errorStationOn="errorStationOn"
    :errorStationOff="errorStationOff"
    :loadingStop="loadingStop"
  />
</template>

<script setup>
import {
  toRefs,
  ref,
  defineProps,
  reactive,
  onMounted,
  inject,
  watch,
} from "vue";
import ErrorBlock from "@/components/ErrorBlock/ErrorBlock.vue";
import axios from "axios";
import ConfirmDelete from "./ModalAccount/ConfirmModal/ConfirmDelete.vue";
import LoadingMoadal from "./LoadingMoadal/LoadingMoadal.vue";
import LoadMoadal from "./LoadingMoadal/LoadModal.vue";
import ConfirmReset from "./ModalAccount/ConfirmModal/ConfirmReset.vue";
// import LoadingMoadal from "../Accounts/LoadingMoadal/LoadingMoadal.vue";
import GetScreen from "./ModalAccount/GetScreen.vue";

const props = defineProps({
  closeModal: {
    type: Function,
  },
  modalPosition: {
    type: Object,
  },
  isModalOpen: {
    type: Boolean,
  },
  selectedItem: {
    type: Object,
  },
  selectedItems: {
    type: Object,
  },
  qrCodeData: {
    type: Object,
  },
  loadingStation: {
    type: Boolean,
  },
  changeStationSettingsModal: {
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
});

const emit = defineEmits();
const { selectedItem, loadingStation, chatsStation } = toRefs(props);
import { useRouter } from "vue-router";
import WhatsApp from "./ModalAccount/GetByCode/WhatsApp.vue";
const updateLoadingStation = ref(false);
const qrData = ref([]);
const accountStationText = localStorage.getItem("accountStation");
const router = useRouter();
const handleSubmit = () => {
  emit("update:selectedItems", selectedItem.value);
  props.changeStationSettingsModal();
  props.closeModal();
};
const isFlashing = ref(false);

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

const connectToDatabaseAndNavigate = async () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  console.log(localStorage.getItem("accountData"));
  try {
    const response = await axios.post(`${apiUrl}/connect`, {
      source: "whatsapp",
      login: selectedItem.value.login,
      token: `token`,
    });

    router.push({ name: "Chats", query: { mode: "widget" } });
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
  console.log(selectedItem.value);
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

import { useDomain } from "@/composables/getDomen";
const { stationDomen } = useDomain();

const createRequest = async (request) => {
  const { source, login, storage } = selectedItem.value;
  let params = {
    source: source,
    login: login,
  };
  if (stationDomen.navigate.value != "whatsapi") {
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
    const response = await axios.post(
      `https://b2288.apitter.com/instances/${request}`,
      params,
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: `Bearer ${localStorage.getItem("accountToken")}`,
        },
      }
    );
    if (response.data.ok === true) {
      if (request === "getQr") {
        responseQr.value = response.data.data.value;
        qrData.value = Array.from(responseQr.value.split(","));
        stationLoading.account.result = true;
        stationLoading.loading = false;
        console.log("qr");
        // qrCodeDataSubmit();
      } else if (request === "deleteAccount") {
        stationLoading.loading = false;
        // location.reload();
        setTimeout(() => {
          changeStationLoadingModal();
        }, 1000);
      } else if (request === "getNewProxy") {
        stationLoading.modalStation = true;
        updateLoadingStation.value = false;
        changeLadingStation();
        stationLoading.loading = false;
        setTimeout(() => {
          stationLoading.modalStation = false;
        }, 5000);
      } else {
        console.log(`${request} - Успешно`);
      }
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
    console.error(`${request} - Ошибка`, error);
    stationLoading.account.error = true;
    stationLoading.modalStation = true;
    setTimeout(() => {
      stationLoading.modalStation = false;
      stationLoading.account.error = false;
    }, 5000);
    if (error.response) {
      console.error("Ошибка сервера:", error.response.data);
    }
  }
};

const forceStop = async (request) => {
  const { source, login } = selectedItem.value;
  try {
    const response = await axios.post(
      `https://b2288.apitter.com/instances/${request}`,
      {
        source: source,
        login: login,
      },
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: `Bearer ${localStorage.getItem("accountToken")}`,
        },
      }
    );
    if (response.data.ok === true) {
      stationLoading.loading = false;
      stationLoading.account.error = false;
      stationLoading.modalStation = true;
      setTimeout(() => {
        stationLoading.modalStation = false;
        stationLoading.account.error = false;
      }, 5000);
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
    console.error(`${request} - Ошибка`, error);
    stationLoading.account.error = true;
    cstationLoading.modalStation = true;
    setTimeout(() => {
      stationLoading.modalStation = false;
      stationLoading.account.error = false;
    }, 5000);
    if (error.response) {
      console.error("Ошибка сервера:", error.response.data);
    }
  }
};

const disablePhoneAuth = async () => {
  const { source, login } = selectedItem.value;
  try {
    const response = await axios.post(
      "https://b2288.apitter.com/instances/disablePhoneAuth",
      {
        source: source,
        login: login,
      },
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: `Bearer ${localStorage.getItem("accountToken")}`,
        },
      }
    );

    if (response.data.ok === true) {
      console.log("Аунтефикация 0ff");
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

const setState = async () => {
  const { source, login } = selectedItem.value;
  try {
    const response = await axios.post(
      "https://b2288.apitter.com/instances/setState",
      {
        source: source,
        login: login,
        setState: true,
      },
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: `Bearer ${localStorage.getItem("accountToken")}`,
        },
      }
    );

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

const setStateTelegram = async () => {
  const { source, login } = selectedItem.value;
  try {
    const response = await axios.post(
      "https://b2288.apitter.com/instances/setState",
      {
        source: "whatsapp",
        login: "helly",
        setState: true,
        qrLogin: true,
      },
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: `Bearer ${localStorage.getItem("accountToken")}`,
        },
      }
    );

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
</script>

<style scoped>
.black-fon {
  position: fixed;
  z-index: 5;
  width: 100%;
  height: 100vh;
  background: rgba(117, 117, 117, 0.3);
  top: 0;
  left: 0;
}

.action-list {
  border-radius: 10px;
  width: 150px;
  height: auto;
  background: #ffffff;
  position: sticky;
  z-index: 20;
  display: flex;
  justify-content: center;
  flex-direction: column;
  margin: 12px;
  padding: 10px 0px 10px 10px;
}
.action-list.fade-enter-active,
.action-list.fade-leave-active {
  transition: opacity 0.5s ease;
}
.action-list.fade-enter,
.action-list.fade-leave-to {
  opacity: 0;
}

.action-list {
  animation: fadeIn 0.5s forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.action {
  font-weight: 400;
  font-size: 14px;
  color: #000;
  cursor: pointer;
  padding: 4px;
}

.action-loading {
  font-weight: 400;
  font-size: 14px;
  color: #5f5f5f;
  cursor: pointer;
  animation: shimmer 1s infinite;
  padding: 4px;
}

.action-loading {
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

.action-loading:hover {
  background-color: #eeeeee;
  border-radius: 5px 0px 0px 5px;
}

.action:hover {
  background-color: #eeeeee;
  border-radius: 5px 0px 0px 5px;
}

.action-on:hover {
  color: green;
}

.action-throw:hover,
.action-delete:hover {
  color: rgb(255, 0, 0);
}
</style>
