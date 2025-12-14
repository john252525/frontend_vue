<template>
  <EnteringNumber
    v-if="stepStation.enteringNumber"
    :updateLoadingStatus="updateLoadingStatus"
    :startFunc="startFunc"
    :close="close"
    :user="user"
  />
  <EnteringCode
    v-if="stepStation.enteringCode"
    :close="close"
    :openError="openError"
    :changeStatus="changeStatus"
    :openEnableMenuTrue="openEnableMenuTrue"
    :updateLoadingStatus="updateLoadingStatus"
    :user="user"
  />

  <EnteringPassword
    v-if="stepStation.enteringPassword"
    :close="close"
    :openError="openError"
    :openEnableMenuTrue="openEnableMenuTrue"
    :updateLoadingStatus="updateLoadingStatus"
    :user="user"
  />
</template>

<script setup>
import { toRefs, computed, ref, reactive, onMounted } from "vue";
import EnteringNumber from "./enteringNumber.vue";
import EnteringCode from "./enteringСode.vue";
import EnteringPassword from "./enteringPassword.vue";
import axios from "axios";
import { useAccountStore } from "@/stores/accountStore";

const props = defineProps({
  user: {
    type: Object,
  },
  updateLoadingStatus: {
    type: Function,
  },
  close: {
    type: Function,
  },
  openError: {
    type: Function,
  },
  openEnableMenuTrue: {
    type: Function,
  },
  startFunc: {
    type: Function,
  },
});

const { user } = toRefs(props);
const { login, source } = user.value;

const accountStore = useAccountStore();
const token = computed(() => accountStore.getAccountToken);

const stepStation = reactive({
  enteringNumber: false,
  enteringCode: false,
  enteringPassword: false,
});

const data = ref([]);
const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL;

const getAccountInfo = async () => {
  await props.updateLoadingStatus(true, "Синхронизация..");
  const params = { source, login };

  try {
    const response = await axios.post(`${FRONTEND_URL}getInfo`, params, {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Authorization: `Bearer ${token.value}`,
      },
    });

    data.value = response.data;
    console.log("response:", response.data);

    if (Number(response.data.step?.value) === 2.21) {
      stepStation.enteringNumber = true;
    } else if (Number(response.data.step?.value) === 2.21) {
      stepStation.enteringNumber = true;
    } else if (Number(response.data.step?.value) === 2.25) {
      stepStation.enteringCode = true;
    } else if (Number(response.data.step?.value) === 2.1) {
      stepStation.enteringPassword = true;
    }

    await props.updateLoadingStatus(false);
  } catch (error) {
    await props.updateLoadingStatus(false);
    console.error("Error fetching account info:", error);
    if (error.response) {
      await props.updateLoadingStatus(false);
      console.error("Error response:", error.response.data);
    }
  }
};

const changeStatus = () => {
  stepStation.enteringCode = false;
  stepStation.enteringPassword = true;
};

onMounted(() => {
  getAccountInfo();
});
</script>
