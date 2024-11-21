<template>
  <header>
    <section>
      <article class="logo-header-cont">
        <img
          @click="phoneMenuOn"
          class="phone-menu"
          src="/header/menu_phone.svg"
          alt=""
        />
        <h2 class="logo-header">
          <img class="logo" src="/header/logo.svg" alt="logo" />Name-<span
            >API</span
          >
        </h2>
      </article>
      <article class="user-cont">
        <h2 @click="balanceStationOn" class="balance-user">0.00 ₽</h2>
        <img
          @click="AccountMenuStationOn"
          src="/header/user_img.svg"
          alt="user"
          class="user-icon"
        />
      </article>
      <Balance :balanceStationOn="balanceStationOn" v-if="balanseStation" />
      <AccountMenu
        v-if="AccountMenuStation"
        :AccountMenuStationOn="AccountMenuStationOn"
      />
    </section>
    <div class="line"></div>
  </header>
</template>

<script setup>
const props = defineProps({
  phoneMenuOn: {
    type: Function,
  },
});

import Balance from "./Balance.vue";
import AccountMenu from "./AccountMenu.vue";

import { ref } from "vue";

const balanseStation = ref(false);
const AccountMenuStation = ref(false);

function balanceStationOn() {
  balanseStation.value = !balanseStation.value;
}

function AccountMenuStationOn() {
  AccountMenuStation.value = !AccountMenuStation.value;
}
</script>

<style scoped>
section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  box-sizing: border-box;
}

.user-icon {
  cursor: pointer;
}

.user-cont {
  display: flex;
  align-items: center;
  gap: 16px;
  width: 121px;
}

.balance-user {
  font-weight: 700;
  font-size: 14px;
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
  font-weight: 600;
  font-size: 26px;
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
  background-color: #d9d9d9;
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
  .logo {
    display: none;
  }

  .logo-header {
    display: none;
  }
}
</style>
