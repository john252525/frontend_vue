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
  startFunction: {
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

const enablePhoneAuth = async () => {
  try {
    const response = await axios.post(
      `${FRONTEND_URL}enablePhoneAuth?referer=https://app.chatserv.ru/`,
      {
        source: source,
        login: login,
        storage: storage,
        phone: "79228556998",
      },
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

const func = async () => {
  await enablePhoneAuth();
  await props.startFunction();
};

onMounted(func);
</script>

<style scoped></style>
