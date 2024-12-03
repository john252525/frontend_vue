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
      <span class="action" @click="performActions('Скриншот')">Скриншот</span>
      <span class="action action-on" @click="getNewProxy">Включить</span>
      <span class="action" @click="createRequest('forceStop')">Выключить</span>
      <span class="action action-throw" @click="resetAccount">Сбросить</span>
      <span class="action" @click="createRequest('getNewProxy')"
        >Сменить прокси</span
      >
      <span class="action" @click="EnablebyQR">Связать через QR</span>
      <span class="action" @click="enableByCode">Связать через код</span>
      <span class="action" @click="performAction('Проверить код')"
        >Проверить код</span
      >
      <span class="action action-delete" @click="deleteAccount"
        >Удалить аккаунт</span
      >
    </div>
  </div>
</template>

<script setup>
import { toRefs, ref, defineProps } from "vue";
import QrcodeVue from "qrcode.vue";
import axios from "axios";
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
});
const emit = defineEmits();
const { selectedItem } = toRefs(props);

const handleSubmit = () => {
  emit("update:selectedItems", selectedItem.value);
  props.changeStationSettingsModal();
  props.closeModal();
};

const qrCodeDataSubmit = () => {
  emit("update:qrCodeData", qrData.value);
  props.closeModal();
};

const responseQr = ref(null);
const qrData = ref([]);

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
      console.log(`${request} - Успешно`);
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

const getQr = async () => {
  const { source, login } = selectedItem.value;
  try {
    const response = await axios.post(
      "https://b2288.apitter.com/instances/getQr",
      {
        source: "whatsapp",
        login: "helly",
        token: "342b63fd-6017-446f-adf8-d1b8e0b7bfc6",
      },
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: "Bearer 342b63fd-6017-446f-adf8-d1b8e0b7bfc6",
        },
      }
    );
    console.log(response);
    if (response.data.ok === true) {
      responseQr.value = response.data.data.value;
      console.log(responseQr.value);

      qrData.value = Array.from(responseQr.value.split(","));
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

const enablePhoneAuth = async () => {
  const { source, login } = selectedItem.value;
  try {
    const response = await axios.post(
      "https://b2288.apitter.com/instances/enablePhoneAuth",
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
        phone: "89228556998",
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

const getAuthCode = async () => {
  const { source, login } = selectedItem.value;
  try {
    const response = await axios.post(
      "https://b2288.apitter.com/instances/getAuthCode",
      {
        source: "whatsapp",
        login: "helly",
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
      console.log("Состояние установлено");
      console.log(response.data);
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

const EnablebyQR = async () => {
  await createRequest("forceStop");
  await disablePhoneAuth();
  await setState();
  await getQr();
  await qrCodeDataSubmit();
  props.changeStationQrModal();
};

const resetAccount = async () => {
  await createRequest("forceStop");
  await createRequest("clearSession");
  await createRequest("getNewProxy");
};

const enableByCode = async () => {
  await createRequest("forceStop");
  await enablePhoneAuth();
  await setState();
  await getAuthCode();
};

const deleteAccount = async () => {
  await createRequest("forceStop");
  await createRequest("deleteAccount");
  location.reload();
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
