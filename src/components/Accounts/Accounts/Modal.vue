<template>
  <div v-if="isModalOpen" class="black-fon" @click="closeModal">
    <div
      class="action-list"
      :style="{
        top: modalPosition.top + 'px',
        left: modalPosition.left + 'px',
      }"
    >
      <span class="action" @click="handleSubmit">Настройки</span>
      <span class="action" @click="screenshot">Скриншот</span>
      <span class="action action-on" @click="getNewProxy">Включить</span>
      <span class="action" @click="createRequest('forceStop')">Выключить</span>
      <span class="action action-throw" @click="resetAccount">Сбросить</span>
      <span class="action" @click="getNewProxy">Сменить прокси</span>
      <span class="action" @click="">Связать через QR</span>
      <span class="action" @click="handleSubmitCode">Связать через код</span>
      <span class="action" @click="performAction('Проверить код')"
        >Проверить код</span
      >
      <span class="action action-delete" @click="deleteAccount"
        >Удалить аккаунт</span
      >
    </div>
  </div>
  <LoadingMoadal :stationLoading="stationLoading" />
</template>

<script setup>
import { toRefs, ref, defineProps, reactive } from "vue";
import axios from "axios";
import LoadingMoadal from "./LoadingMoadal/LoadingMoadal.vue";
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
const { selectedItem } = toRefs(props);
const responseQr = ref(null);
const qrData = ref([]);
const accountStationText = localStorage.getItem("accountStation");
const handleSubmit = () => {
  emit("update:selectedItems", selectedItem.value);
  props.changeStationSettingsModal();
  props.closeModal();
};

const stationLoading = reactive({
  value: "",
  modalStation: false,
  deleteAccount: {
    station: false,
    result: undefined,
  },
  account: {
    station: false,
    result: undefined,
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

const qrCodeDataSubmit = () => {
  emit("update:qrCodeData", qrData.value);
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
        token: "342b63fd-6017-446f-adf8-d1b8e0b7bfc6",
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
        console.log(responseQr.value);
        qrData.value = Array.from(responseQr.value.split(","));
      } else if (request === "deleteAccount") {
        stationLoading.account.result = true;
        setTimeout(() => {
          changeStationLoadingModal();
          location.reload();
        }, 2000);
      } else if (request === "getNewProxy") {
        stationLoading.account.result = true;
        setTimeout(() => {
          changeStationLoadingModal();
        }, 2000);
      } else {
        console.log(`${request} - Успешно`);
      }
    } else {
      console.log(response.data.ok);
    }
  } catch (error) {
    console.error(`${request} - Ошибка`, error);
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
        source: "whatsapp",
        login: "helly",
        token: "342b63fd-6017-446f-adf8-d1b8e0b7bfc6",
        phone: "89228556998",
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
        source: "whatsapp",
        login: "helly",
        token: "342b63fd-6017-446f-adf8-d1b8e0b7bfc6",
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
        token: "342b63fd-6017-446f-adf8-d1b8e0b7bfc6",
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
    await createRequest("forceStop");
    await disablePhoneAuth();
    await setStateTelegram();
    await createRequest("getqr");
    await qrCodeDataSubmit();
    props.changeStationQrModal();
    console.log("telega");
  } else {
    await createRequest("forceStop");
    await disablePhoneAuth();
    await setState();
    await createRequest("getqr");
    await qrCodeDataSubmit();
    props.changeStationQrModal();
    console.log("wat");
  }
};

const getNewProxy = async () => {
  changeStationLoadingModal();
  stationLoading.value = "getNewProxy";
  await createRequest("getNewProxy");
};

const resetAccount = async () => {
  stationLoading.value = "resetAccount";
  changeStationLoadingModal();
  await createRequest("forceStop");
  await createRequest("clearSession");
  await createRequest("getNewProxy");
};

const deleteAccount = async () => {
  stationLoading.value = "deleteAccount";
  changeStationLoadingModal();
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
  position: absolute;
  z-index: 20;
  display: flex;
  justify-content: center;
  flex-direction: column;
  margin-left: -63px;
  margin-top: 10px;
  padding: 10px 0px 10px 10px;
}

img {
  max-width: 100px; /* Установите ширину для удобства отображения */
  height: auto;
  margin: 10px 0;
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
