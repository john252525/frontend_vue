<template>
  <header>
    <section class="header-content">
      <article class="logo-header-cont">
        <img
          @click="phoneMenuOn"
          class="phone-menu"
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
        <h2 @click="toggleBalanceStation" class="balance-user">0.00 ₽</h2>
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
import { ref } from "vue";
import Balance from "./Balance.vue";
import AccountMenu from "./AccountMenu.vue";

const props = defineProps({
  phoneMenuOn: {
    type: Function,
  },
});

const balanseStation = ref(false);
const AccountMenuStation = ref(false);

function toggleBalanceStation() {
  balanseStation.value = !balanseStation.value;
}

function toggleAccountMenu() {
  AccountMenuStation.value = !AccountMenuStation.value;
}
</script>

<style scoped>
.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  box-sizing: border-box;
  margin: 0px -18px 0px 4px;
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
  font-weight: 700;
  font-size: 12px;
  color: #4047ca;
  padding: 8px;
  border: 1px solid rgba(64, 71, 202, 0.2);
  border-radius: 5px;
  cursor: pointer;
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

.logo-header span {
  color: #4950ca;
}

.line {
  width: 100%;
  height: 0.5px;
  background-color: #ebebeb;
}

.phone-menu {
  display: none;
}

@media (max-width: 1024px) {
  .phone-menu {
    display: block;
  }
}

@media (max-width: 500px) {
  .logo,
  .logo-header {
    display: none;
  }
}
</style>
