<template>
  <div @click="props.changeEnableStation" class="black-fon"></div>
  <section class="enable-section">
    <QrCode v-if="station.qrCode" />
    <GetCode v-if="station.getCode" />
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
import QrCode from "./QrCode/QrCode.vue";
import GetCode from "./GetCode/GetCode.vue";
import ResultModal from "./ResultModal.vue";
import ChallengeRequired from "./ChallengeRequired/ChallengeRequired.vue";
import LoadingModal from "./LoadingModal.vue";
import ResultModalTrue from "./ResultModalTrue.vue";
import { ref, toRefs, provide, onMounted, reactive } from "vue";
import axios from "axios";
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
});

const station = reactive({
  qrCode: false,
  getCode: false,
  ChallengeRequired: false,
  stationLoading: false,
  result: null,
  resultTrue: false,
  text: "",
});

const offQrCodeStation = () => {
  station.qrCode = false;
};

const offQrQrStation = () => {
  station.getCode = false;
};

const code = ref(null);

const { selectedItem, enableStation } = toRefs(props);

const forceStop = async () => {
  const { source, login } = selectedItem.value;
  try {
    const response = await axios.post(
      `https://b2288.apitter.com/instances/forceStop`,
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
      console.log(response.data);
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

const setState = async (request) => {
  const { source, login } = selectedItem.value;
  try {
    const response = await axios.post(
      `https://b2288.apitter.com/instances/setState`,
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
    if (response.data.data.status === "ok") {
      station.stationLoading = false;
      station.resultTrue = true;
    } else if (response.data.data.error) {
      station.stationLoading = false;
      if (response.data.data.error.message === "QR received") {
        console.log("QR modal open");
        station.qrCode = true;
      } else if (response.data.data.error.message === "Challenge required") {
        station.ChallengeRequired = true;
        console.log(response.data);
        console.log("Challenge required modal open");
      } else if (response.data.data.error.message === "QR code received") {
        station.qrCode = true;
        console.log("QR modal open");
      } else if (response.data.data.error.message === "Auth code received") {
        station.getCode = true;
      } else {
        console.log(response.data);
        station.result = true;
      }
    }
  } catch (error) {
    console.error(`${request} - Ошибка`, error);
    console.log("ошибка");
    station.result = true;
    station.stationLoading = false;
    if (error.response) {
      console.error("Ошибка сервера:", error.response.data);
    }
  }
};

const startFunc = async () => {
  station.stationLoading = true;
  station.result = false;
  station.text = "Проверяем аккаунт...";
  await forceStop();
  await setState();
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
