<template>
  <div class="code-footer">
    <button class="code-switch" @click="getQr">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path
          d="M2 9V7C2 5.89543 2.89543 5 4 5H7M16 5H20C21.1046 5 22 5.89543 22 7V9M22 16V20C22 21.1046 21.1046 22 20 22H16M7 22H4C2.89543 22 2 21.1046 2 20V16"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
        />
      </svg>
      Перейти к QR-коду
    </button>
  </div>
</template>

<script setup>
import { toRefs, computed, inject } from "vue";
import axios from "axios";

import { useAccountStore } from "@/stores/accountStore";
const accountStore = useAccountStore();
const token = computed(() => accountStore.getAccountToken);

const { selectedItem, startFunc, offQrQrStation } = inject("accountItems");
const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL;

const props = defineProps({
  stopAllRequests: {
    type: Function,
  },
  updateLoadingStatus: {
    type: Function,
  },
});

const { source, login, storage } = selectedItem.value;

const disablePhoneAuth = async () => {
  let params = {
    source: source,
    login: login,
    storage: storage,
  };

  try {
    const response = await axios.post(
      `${FRONTEND_URL}disablePhoneAuth`,
      params,
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: `Bearer ${token.value}`,
        },
      },
    );

    if (response.data.status === "ok") {
    }
  } catch (error) {
    console.error("error", error);
    if (error.response) {
      console.error("error", error.response.data);
    }
  }
};

const getQr = async () => {
  props.updateLoadingStatus(true, "Изменение статуса...");
  await disablePhoneAuth();
  await offQrQrStation();
  await startFunc();
};
</script>

<style scoped>
.code-footer {
  margin-top: 8px;
  display: flex;
  justify-content: center;
}

.code-switch {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: none;
  border: 1px solid #e9ecef;
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  color: #6c757d;
  font-size: 14px;
  transition: all 0.2s ease;
  width: 100%;
}

.code-switch:hover {
  background: #f8f9fa;
  color: #495057;
  border-color: #ced4da;
}
</style>
