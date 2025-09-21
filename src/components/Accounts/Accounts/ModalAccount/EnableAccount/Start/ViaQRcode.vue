<template></template>

<script setup>
import axios from "axios";
import { ref, toRefs, computed, onMounted } from "vue";
const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL;

import { useAccountStore } from "@/stores/accountStore";
const accountStore = useAccountStore();
const token = computed(() => accountStore.getAccountToken);

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

const { selectedItem } = toRefs(props);

const { source, login, storage, type } = selectedItem.value;

const params = {
  source: source,
  login: login,
  storage: storage,
};

const forceStop = async () => {
  try {
    const response = await axios.post(
      `${FRONTEND_URL}forceStop?referer=https://app.chatserv.ru/`,
      params,
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: `Bearer ${token.value}`,
        },
      }
    );

    if (response.data.ok === true) {
    } else {
    }
  } catch (error) {
    console.error(`error`, error);
    if (error.response) {
      console.error("error", error.response.data);
    }
  }
};

const setState = async () => {
  const paramsState = {
    source: source,
    login: login,
    storage: storage,
    setState: true,
  };

  try {
    const response = await axios.post(
      `${FRONTEND_URL}setState?referer=https://app.chatserv.ru/`,
      paramsState,
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: `Bearer ${token.value}`,
        },
      }
    );

    // props.changeForceStopItemData(selectedItem.value);
    // console.log(response.data.data);

    if (response.data.status === "ok") {
      station.stationLoading = false;
      station.resultTrue = true;
    } else if (response.data.error) {
      setTimeout(() => {
        station.stationLoading = false;
      }, 1000);
      if (response.data.error.message === "QR received") {
        station.qrCode = true;
      } else if (response.data.error.message === "Challenge required") {
        station.stationLoading = false;
        station.ChallengeRequired = true;
      } else if (response.data.error.message === "QR code received") {
        station.qrCode = true;
      } else if (response.data.error.message === "Auth code received") {
        station.getCode = true;
      } else {
        setTimeout(() => {
          station.result = true;
        }, 1000);
      }
    } else {
      station.result = true;
      station.stationLoading = false;
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

const startFunction = async () => {
  await forceStop();
  await setState();
};

onMounted(startFunction);
</script>

<style scoped></style>
