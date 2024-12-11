<template>
  <div v-if="isModalOpen" class="black-fon" @click="closeModal">
    <transition name="fade">
      <div
        class="action-list"
        :style="{
          top: modalPosition.top + 'px',
          left: modalPosition.left + 'px',
        }"
      >
        <span class="action" @click="handleSubmit">Настройки</span>
        <span class="action" @click="screenshot">Скриншот</span>
        <span class="action action-on">Включить</span>
        <span class="action" @click="forceStopActive">Выключить</span>
        <span class="action action-throw" @click="resetAccount">Сбросить</span>
        <span class="action" @click="getNewProxy">Сменить прокси</span>
        <span class="action" @click="EnablebyQR">Связать через QR</span>
        <span class="action" @click="handleSubmitCode">Связать через код</span>
        <span class="action" @click="performAction('Проверить код')"
          >Проверить код</span
        >
        <span class="action action-delete" @click="deleteAccount"
          >Удалить аккаунт</span
        >
      </div>
    </transition>
  </div>
  <LoadingMoadal
    :changeStationLoadingModal="changeStationLoadingModal"
    :stationLoading="stationLoading"
  />
  <LoadMoadal :stationLoading="stationLoading" />
</template>

<script setup>
import { toRefs, ref, defineProps, reactive, watch } from "vue";
import axios from "axios";
import LoadingMoadal from "./LoadingMoadal/LoadingMoadal.vue";
import LoadMoadal from "./LoadingMoadal/LoadModal.vue";

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
});
const emit = defineEmits();
const { selectedItem, loadingStation } = toRefs(props);
const responseQr = ref(null);
const updateLoadingStation = ref(false);
const qrData = ref([]);
const accountStationText = localStorage.getItem("accountStation");
const handleSubmit = () => {
  emit("update:selectedItems", selectedItem.value);
  props.changeStationSettingsModal();
  props.closeModal();
};

const changeLadingStation = () => {
  emit("update:loadingStation", updateLoadingStation.value);
};

const stationLoading = reactive({
  loading: false,
  value: "",
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

const changeStationLoadingModal = () => {
  stationLoading.modalStation = !stationLoading.modalStation;
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

const createRequest = async (request) => {
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
          Authorization: "Bearer 342b63fd-6017-446f-adf8-d1b8e0b7bfc6",
        },
      }
    );
    if (response.data.ok === true) {
      if (request === "getQr") {
        responseQr.value = response.data.data.value;
        qrData.value = Array.from(responseQr.value.split(","));
        stationLoading.account.result = true;
        stationLoading.loading = false;
      } else if (request === "deleteAccount") {
        stationLoading.loading = false;
        location.reload();
        setTimeout(() => {
          changeStationLoadingModal();
        }, 1000);
      } else if (request === "getNewProxy") {
        changeStationLoadingModal();
        updateLoadingStation.value = false;
        changeLadingStation();
        stationLoading.loading = false;
        setTimeout(() => {
          changeStationLoadingModal();
        }, 5000);
      } else {
        console.log(`${request} - Успешно`);
      }
    } else {
      console.log(response.data.ok);
    }
  } catch (error) {
    console.error(`${request} - Ошибка`, error);
    stationLoading.account.error = true;
    changeStationLoadingModal();
    setTimeout(() => {
      changeStationLoadingModal();
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
          Authorization: "Bearer 342b63fd-6017-446f-adf8-d1b8e0b7bfc6",
        },
      }
    );
    if (response.data.ok === true) {
      stationLoading.loading = false;
      stationLoading.account.error = false;
      changeStationLoadingModal();
      setTimeout(() => {
        changeStationLoadingModal();
        stationLoading.account.error = false;
      }, 5000);
    } else {
      console.log(response.data.ok);
    }
  } catch (error) {
    console.error(`${request} - Ошибка`, error);
    stationLoading.account.error = true;
    changeStationLoadingModal();
    setTimeout(() => {
      changeStationLoadingModal();
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
          Authorization: "Bearer 342b63fd-6017-446f-adf8-d1b8e0b7bfc6",
        },
      }
    );

    if (response.data.ok === true) {
      console.log("Аунтефикация 0ff");
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
          Authorization: "Bearer 342b63fd-6017-446f-adf8-d1b8e0b7bfc6",
        },
      }
    );

    if (response.data.ok === true) {
      console.log("Состояние установлено");
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
          Authorization: "Bearer 342b63fd-6017-446f-adf8-d1b8e0b7bfc6",
        },
      }
    );

    if (response.data.ok === true) {
      console.log("Состояние установлено");
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

const EnablebyQR = async (value) => {
  if (value === "telegram") {
    stationLoading.loading = true;
    await createRequest("forceStop");
    await disablePhoneAuth();
    await setStateTelegram();
    await createRequest("getQr");
    await qrCodeDataSubmit();
  } else {
    stationLoading.loading = true;
    await createRequest("forceStop");
    await disablePhoneAuth();
    await setState();
    await createRequest("getQr");
    await qrCodeDataSubmit();
  }
};

const forceStopActive = async () => {
  stationLoading.loading = true;
  forceStop();
};

const getNewProxy = async () => {
  createRequest("getNewProxy");
  stationLoading.loading = true;
};

const resetAccount = async () => {
  stationLoading.loading = true;
  await createRequest("forceStop");
  await createRequest("clearSession");
  await createRequest("getNewProxy");
};

const deleteAccount = async () => {
  stationLoading.loading = true;
  await createRequest("forceStop");
  await createRequest("deleteAccount");
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
  width: 170px;
  height: auto;
  background: #ffffff;
  position: sticky;
  z-index: 20;
  display: flex;
  justify-content: center;
  flex-direction: column;
  margin: 23px;
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
  font-weight: 500;
  font-size: 15px;
  color: #000;
  cursor: pointer;
  padding: 6px;
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
