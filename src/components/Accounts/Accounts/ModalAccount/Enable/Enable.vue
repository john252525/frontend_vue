<template>
  <div @click="allStop" class="black-fon"></div>
  <ErrorBlock v-if="errorBlock" :changeIncorrectPassword="chaneErrorBlock" />
  <section class="enable-section">
    <QrCode ref="subComponentRef" v-if="station.qrCode" />
    <GetCode ref="subComponent" v-if="station.getCode" />
    <ChallengeRequired v-if="station.ChallengeRequired" />
    <LoadingModal
      :textLoadin="station.text"
      :stationLoading="station.stationLoading"
    />
    <ResultModal v-if="station.result" />
    <ResultModalTrue v-if="station.resultTrue" />
  </section>
</template>

<script setup>
import ErrorBlock from "@/components/ErrorBlock/ErrorBlock.vue";
import QrCode from "./QrCode/QrCode.vue";
import GetCode from "./GetCode/GetCode.vue";
import ResultModal from "./ResultModal.vue";
import ChallengeRequired from "./ChallengeRequired/ChallengeRequired.vue";
import LoadingModal from "./LoadingModal.vue";
import ResultModalTrue from "./ResultModalTrue.vue";
import { useRouter } from "vue-router";
import { useAccountStore } from "@/stores/accountStore";
const accountStore = useAccountStore();
const token = computed(() => accountStore.getAccountToken);
const router = useRouter();
import { ref, toRefs, provide, onMounted, reactive, computed } from "vue";
import axios from "axios";
const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL;

import { storeToRefs } from "pinia";
import { useLoginWhatsAppChatsStepStore } from "@/stores/loginWhatsAppChatsStepStore";

const chatStore = useLoginWhatsAppChatsStepStore();

const props = defineProps({
  selectedItem: {
    type: Object,
  },
  enableStation: {
    type: Boolean,
  },
  changeEnableStation: {
    type: Function,
  },
  changeForceStopItemData: {
    type: Function,
  },
});

const errorBlock = ref(false);
const chaneErrorBlock = () => {
  errorBlock.value = errorBlock.value;
};

let isRunning = false; // Флаг для отслеживания выполнения функции

const station = reactive({
  qrCode: false,
  getCode: false,
  ChallengeRequired: false,
  stationLoading: false,
  result: null,
  resultTrue: false,
  text: "",
});

const subComponent = ref(null);
const subComponentRef = ref(null);
const stopAuthCode = () => {
  if (subComponent.value) {
    // Проверяем, есть ли у подкомпонента функция stopAuthCode
    const child = subComponent.value.getChild(); // Получаем дочерний компонент
    if (child && typeof child.stopAuthCode === "function") {
      child.stopAuthCode(); // Вызываем функцию остановки в дочернем компоненте
    }
  }
};

const handleStopEnableByQR = () => {
  if (subComponentRef.value) {
    const childComponent = subComponentRef.value.getChild(); // Получаем дочерний компонент
    if (childComponent && typeof childComponent.stopEnableByQR === "function") {
      childComponent.stopEnableByQR(); // Вызываем функцию остановки в дочернем компоненте
    }
  }
};

const allStop = () => {
  handleStopEnableByQR();
  stopAuthCode();
  props.changeEnableStation();
  isRunning = false;
};

const offQrCodeStation = () => {
  station.qrCode = false;
};

const offQrQrStation = () => {
  station.getCode = false;
};

const code = ref(null);
import { useDomain } from "@/composables/getDomain";
const { stationDomain } = useDomain();
const { selectedItem, enableStation } = toRefs(props);

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

const forceStop = async () => {
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
    const response = await axios.post(`${FRONTEND_URL}forceStop`, params, {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Authorization: `Bearer ${token.value}`,
      },
    });

    if (response.data) {
      await handleSendLog(
        "enable",
        "forceStop",
        params,
        response.data.ok,
        response.data
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
    console.error(`error`, error);
    if (error.response) {
      console.error("error", error.response.data);
    }
  }
};

const setState = async (request) => {
  const { source, login, storage, type } = selectedItem.value;
  let params = {
    source: source,
    login: login,
  };
  if (stationDomain.navigate.value != "whatsapi") {
    params = {
      source: source,
      login: login,
      setState: true,
    };
  } else {
    params = {
      source: source,
      login: login,
      storage: storage,
      setState: true,
    };
  }
  try {
    const response = await axios.post(`${FRONTEND_URL}setState`, params, {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Authorization: `Bearer ${token.value}`,
      },
    });

    if (response.data) {
      await handleSendLog(
        "enable",
        "setState",
        params,
        response.data.ok,
        response.data
      );
    }
    props.changeForceStopItemData(selectedItem.value);
    // console.log(response.data.data);
    const newLoginData = {
      login,
      source,
      storage: storage,
      type: type,
    };
    if (response.data.data.status === "ok") {
      station.stationLoading = false;
      chatStore.addOrUpdateChat(newLoginData);
      station.resultTrue = true;
    } else if (response.data.data.error) {
      setTimeout(() => {
        station.stationLoading = false;
      }, 1000);
      if (response.data.data.error.message === "QR received") {
        station.qrCode = true;
      } else if (response.data.data.error.message === "Challenge required") {
        station.stationLoading = false;
        station.ChallengeRequired = true;
      } else if (response.data.data.error.message === "QR code received") {
        station.qrCode = true;
      } else if (response.data.data.error.message === "Auth code received") {
        station.getCode = true;
      } else {
        setTimeout(() => {
          station.result = true;
        }, 1000);
      }
    } else if (response.data === 401) {
      errorBlock.value = true;
      setTimeout(() => {
        localStorage.removeItem("accountToken");
        router.push("/login");
      }, 2000);
    }
  } catch (error) {
    console.error(`error`, error);

    station.result = true;
    station.stationLoading = false;
    if (error.response) {
      console.error("error", error.response.data);
    }
  }
};
import { useI18n } from "vue-i18n";
const { t } = useI18n();
const startFunc = async () => {
  isRunning = true; // Устанавливаем флаг, что функция запущена
  station.stationLoading = true;
  station.result = false;
  station.text = t("globalLoading.checkAccoutn");

  await forceStop();
  if (isRunning) {
    // Проверяем флаг перед вызовом setState
    await setState();
  }
};

onMounted(() => {
  startFunc();
});

provide("accountItems", {
  startFunc,
  selectedItem,
  offQrCodeStation,
  offQrQrStation,
});
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

.enable-section {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
  background-color: white;
  padding: 30px 30px;
  /* width: 300px;
  height: 400px; */
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}
</style>
