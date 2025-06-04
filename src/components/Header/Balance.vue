<template>
  <div @click="balanceStationOn" class="black-fon"></div>
  <section class="balance-user-section">
    <article class="balance-info">
      <h2 class="balance-text">
        {{ t("personalAccount.balance") }}:
        <span v-if="balance || balance === 0">{{
          removeDecimalZeros(balance)
        }}</span>
        <LoadingBalance v-if="balanceLoading" /> ₽
      </h2>
      <h2 v-if="balanceError" class="balance-text">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
        >
          <path
            fill="#015a83"
            d="M11.953 2C6.465 2 2 6.486 2 12s4.486 10 10 10s10-4.486 10-10S17.493 2 11.953 2M13 17h-2v-2h2zm0-4h-2V7h2z"
          />
        </svg>
      </h2>
      <div class="line"></div>
    </article>
    <article class="top-balance-cont" @click="navigateTo('/payments')">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="32"
        height="32"
        viewBox="0 0 32 32"
      >
        <path fill="currentColor" d="M22 17h2v2h-2z" />
        <path
          fill="gray"
          d="M28 8H4V5h22V3H4a2 2 0 0 0-2 2v21a2 2 0 0 0 2 2h24a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2M4 26V10h24v3h-8a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h8v3Zm24-11v6h-8v-6Z"
        />
      </svg>
      <h2 class="top-balance-title">
        {{ t("personalAccount.depositBalance") }}
      </h2>
    </article>
  </section>
</template>

<script setup>
import { useRouter } from "vue-router";
import axios from "axios";
import { useI18n } from "vue-i18n";
const { t } = useI18n();
import LoadingBalance from "./Loading/LoadingBalance.vue";
import { ref, onMounted, computed } from "vue";
const router = useRouter();
const props = defineProps({
  balanceStationOn: {
    type: Function,
  },
});
import { useAccountStore } from "@/stores/accountStore";
const accountStore = useAccountStore();
const token = computed(() => accountStore.getAccountToken);

import useFrontendLogger from "@/composables/useFrontendLogger";
const { sendLog } = useFrontendLogger();

const balanceError = ref(false);
const balanceLoading = ref(false);

const handleSendLog = async (location, method, params, results, answer) => {
  try {
    await sendLog(location, method, params, results, answer);
  } catch (err) {
    console.error("error", err);
    // Optionally, update the error message ref
  }
};

function removeDecimalZeros(value) {
  return value.toString().replace(/\.00$/, "");
}
const apiUrl = import.meta.env.VITE_PAY_URL;
const balance = ref("");

const getBalance = async () => {
  try {
    balanceLoading.value = true;
    const response = await axios.post(
      `${apiUrl}/get-payment-sum`, // URL вашего бэкенда
      {}, // Тело запроса, если не нужно отправлять дополнительные данные
      {
        headers: {
          "Content-Type": "application/json", // Убедитесь, что заголовок указан
          Authorization: `Bearer ${token.value}`, // Заголовок авторизации с токеном
        },
      }
    );

    if (response.data) {
      await handleSendLog(
        "balance",
        "get-payment-sum",
        null,
        response.data,
        response.data
      );
    }
    balanceLoading.value = false;
    balance.value = response.data.totalAmount;
  } catch (err) {
    balanceLoading.value = false;
    balanceError.value = true;
    console.error("error", err.response ? err.response.data : err.message);
  }
};

const navigateTo = (page) => {
  props.balanceStationOn();
  router.push(page);
};

onMounted(getBalance);
</script>

<style scoped>
.balance-user-section {
  position: absolute;
  z-index: 10;
  right: 71px;
  top: 65px;
  background: var(--bg);
  border-radius: 3px;
  width: 195px;
  height: 130px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
}

.balance-user-section,
.fade-leave-active {
  transition: opacity 0.5s ease;
}
.balance-user-section,
.fade-leave-to {
  opacity: 0;
}

.balance-user-section {
  animation: fadeIn 0.5s forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.balance-text {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-weight: 700;
  font-size: 16px;
  color: var(--text);
  text-align: center;
}

.line {
  width: 100%;
  height: 1px;
  background-color: var(--line);
  margin: 8px 0 10px;
}

.top-balance-cont {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  cursor: pointer;
  transition: background-color 0.15s;
}

.top-balance-cont:hover {
  background-color: var(--changeLantTextHoverBg);
  border-radius: 5px;
}

.top-balance-title {
  font-weight: 600;
  font-size: 14px;
  color: var(--text);
  text-align: center;
}
</style>
