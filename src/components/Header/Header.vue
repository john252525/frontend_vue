<template>
  <header>
    <section class="header-content">
      <article class="logo-header-cont">
        <img
          @click="phoneMenuOn"
          :class="{ s: isChatPage, 'phone-menu': !isChatPage }"
          src="/header/menu_phone.svg"
          alt="Меню для телефона"
        />
        <h2 class="logo-header">
          <img
            src="https://static.tildacdn.com/tild3630-6562-4930-b532-356635636363/favicon.ico"
            class="logo-img"
            alt="Logo"
          />
          Touch-API
        </h2>
      </article>
      <article class="user-cont">
        <h2 v-if="balance" @click="toggleBalanceStation" class="balance-user">
          {{ removeDecimalZeros(balance) }} ₽
        </h2>
        <h2 v-else @click="toggleBalanceStation" class="balance-user">
          <LoadingBalance />
        </h2>
        <img
          @click="toggleAccountMenu"
          src="/header/user_img.svg"
          alt="Пользователь"
          class="user-icon"
        />
      </article>
      <Balance :balanceStationOn="toggleBalanceStation" v-if="balanseStation" />
      <AccountMenu
        v-if="AccountMenuStation"
        :AccountMenuStationOn="toggleAccountMenu"
      />
    </section>
    <div class="line"></div>
  </header>
</template>

<script setup>
import axios from "axios";
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import LoadingBalance from "./Loading/LoadingBalance.vue";
import Balance from "./Balance.vue";
import AccountMenu from "./AccountMenu.vue";

const props = defineProps({
  phoneMenuOn: {
    type: Function,
  },
});

const apiUrl = import.meta.env.VITE_PAY_URL;

function removeDecimalZeros(value) {
  return value.toString().replace(/\.00$/, "");
}

const balanseStation = ref(false);
const AccountMenuStation = ref(false);

function toggleBalanceStation() {
  balanseStation.value = !balanseStation.value;
}

function toggleAccountMenu() {
  AccountMenuStation.value = !AccountMenuStation.value;
}

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

const route = useRoute();
const isChatPage = computed(() => {
  return route.name === "Chats"; // Ensure "Chats" matches the route name for the chat page
});

onMounted(getBalance);
</script>

<style scoped>
.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  box-sizing: border-box;
  margin: 0px 0px 0px 4px;
}

.logo-img {
  height: 2rem;
}

.user-icon {
  cursor: pointer;
  height: 2rem;
}

.user-cont {
  display: flex;
  align-items: center;
  gap: 16px;
  width: 121px;
}

.balance-user {
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 12px;
  color: #4047ca;
  padding: 8px;
  border: 1px solid rgba(64, 71, 202, 0.2);
  border-radius: 5px;
  cursor: pointer;
  width: 80px; /* Фиксированная ширина */
  text-align: center; /* Центрирование текста */
}

.logo-header-cont {
  display: flex;
  align-items: center;
  gap: 20px;
  width: 215px;
}

.logo-header {
  font-family: system-ui;
  font-weight: 500;
  font-size: 24px;
  color: #000;
  display: flex;
  align-items: center;
  gap: 8px;
}

.line {
  width: 100%;
  height: 0.5px;
  background-color: #ebebeb;
}

.phone-menu {
  display: none;
}

@media (max-width: 768px) {
  .phone-menu {
    display: block;
  }
}

@media (max-width: 500px) {
  .logo,
  .logo-header {
    display: none;
    cursor: pointer;
  }
}
</style>
