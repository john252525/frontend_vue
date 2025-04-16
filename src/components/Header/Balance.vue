<template>
  <div @click="balanceStationOn" class="black-fon"></div>
  <section class="balance-user-section">
    <article class="balance-info">
      <h2 class="balance-text">
        {{ t("personalAccount.balance") }}:
        <span v-if="balance || balance === 0">{{
          removeDecimalZeros(balance)
        }}</span>
        <LoadingBalance v-else /> ₽
      </h2>
      <div class="line"></div>
    </article>
    <article class="top-balance-cont" @click="navigateTo('/payments')">
      <img src="/header/balance.svg" alt="Иконка пополнения баланса" />
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
import { ref, onMounted } from "vue";
const router = useRouter();
const props = defineProps({
  balanceStationOn: {
    type: Function,
  },
});

function removeDecimalZeros(value) {
  return value.toString().replace(/\.00$/, "");
}
const apiUrl = import.meta.env.VITE_PAY_URL;
const balance = ref("");

const getBalance = async () => {
  try {
    const token = localStorage.getItem("accountToken"); // Получаем токен из localStorage

    const response = await axios.post(
      `${apiUrl}/get-payment-sum`, // URL вашего бэкенда
      {}, // Тело запроса, если не нужно отправлять дополнительные данные
      {
        headers: {
          "Content-Type": "application/json", // Убедитесь, что заголовок указан
          Authorization: `Bearer ${token}`, // Заголовок авторизации с токеном
        },
      }
    );
    balance.value = response.data.totalAmount;
    console.log("Платеж создан:", response.data);
  } catch (err) {
    console.error(
      "Ошибка при создании платежа:",
      err.response ? err.response.data : err.message
    );
  }
};

const navigateTo = (page) => {
  props.balanceStationOn();
  router.push(page);
};

onMounted(getBalance);
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

.balance-user-section {
  position: absolute;
  z-index: 10;
  right: 71px;
  top: 65px;
  background: #fff;
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
  gap: 6px;
  font-weight: 700;
  font-size: 16px;
  color: #535353;
  text-align: center;
}

.line {
  width: 100%;
  height: 1px;
  background-color: #d9d9d9;
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
  background-color: rgb(236, 236, 236);
  border-radius: 5px;
}

.top-balance-title {
  font-weight: 600;
  font-size: 14px;
  color: #535353;
  text-align: center;
}

@media (max-width: 1000px) {
  .balance-user-section {
    width: 150px;
    height: 130px;
  }
}
</style>
