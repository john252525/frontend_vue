<template>
  <header>
    <section class="header-content">
      <article class="logo-header-cont">
        <!-- <img
          @click="phoneMenuOn"
          :class="{ s: isChatPage, 'phone-menu': !isChatPage }"
          src="/header/menu_phone.svg"
          alt="Меню для телефона"
        /> -->

        <h2
          v-if="!stationDomain.cosmetics.additionallyLogo"
          class="logo-header"
        >
          <img
            :src="stationDomain.cosmetics.urlLogo"
            class="logo-img"
            alt="Logo"
          />
          {{ stationDomain.cosmetics.titleLogo }}
        </h2>
        <div v-else class="img-logo">
          <img
            :src="stationDomain.cosmetics.urlLogo"
            class="logo-img"
            alt="Logo"
          />
          <img
            :src="stationDomain.cosmetics.additionallyLogo"
            class="logo-img"
            alt="Logo"
          />
        </div>
      </article>
      <article class="user-cont">
        <h2
          v-if="
            (balanceStore.balance || balanceStore.balance === 0) &&
            !balanceStore.balanceError
          "
          @click="toggleBalanceStation"
          class="balance-user"
        >
          {{ balanceStore.formattedBalance }}
        </h2>
        <h2
          v-if="balanceStore.balanceLoading"
          @click="toggleBalanceStation"
          class="balance-user"
        >
          <LoadingBalance />
        </h2>
        <h2
          v-if="balanceStore.balanceError"
          @click="toggleBalanceStation"
          class="balance-user"
        >
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

        <img
          @click="toggleAccountMenu"
          src="/header/user_img.svg"
          alt="Пользователь"
          class="user-icon"
        />
        <!-- <svg
          version="1.1"
          id="Capa_1"
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          width=""
          height="55"
          x="0px"
          y="0px"
          viewBox="0 0 58 58"
          style="enable-background: new 0 0 58 58"
          xml:space="preserve"
        >
          <circle style="fill: #25ae88" cx="29" cy="29" r="29" />
          <path
            style="fill: #fbce9d"
            d="M52.932,45.376C52.275,38.985,46.876,34,40.311,34h-5.946C33.611,34,33,33.389,33,32.635V31.99 c0-0.583,0.379-1.082,0.925-1.287c5.804-2.182,9.778-11.704,8.971-18.433C42.134,5.919,36.97,0.801,30.614,0.09 c-0.517-0.058-1.029-0.086-1.535-0.088c-0.016,0-0.032-0.001-0.048-0.001C21.285-0.016,15,6.258,15,14 c0,6.024,3.807,14.755,9.145,16.729C24.668,30.922,25,31.442,25,32v0.635C25,33.389,24.389,34,23.635,34h-5.946 c-6.565,0-11.964,4.985-12.621,11.376C10.293,52.998,19.061,58,29,58S47.707,52.998,52.932,45.376z"
          />
          <path
            style="fill: #6b5b4b"
            d="M33.492,6.61c3.715,1.021,7.213,3.306,9.453,6.322c-0.016-0.221-0.023-0.447-0.049-0.663 C42.134,5.919,36.97,0.801,30.614,0.09c-0.517-0.058-1.029-0.086-1.535-0.088c-0.016,0-0.032-0.001-0.048-0.001 c-6.92-0.015-12.66,4.995-13.808,11.583l0.005,0c0.179,0.252,0.354,0.507,0.545,0.75c0.07-0.087,0.141-0.173,0.213-0.258 c2-2.38,5.341-2.931,8.183-1.671C25.034,10.787,25.992,11,27,11C29.942,11,32.456,9.182,33.492,6.61z"
          />
          <path
            style="fill: #556080"
            d="M52.932,45.376C52.275,38.985,46.876,34,40.311,34H37l-8,8l-8-8h-3.311 c-6.565,0-11.964,4.985-12.621,11.376C10.293,52.998,19.061,58,29,58S47.707,52.998,52.932,45.376z"
          />
          <path
            style="fill: #424a60"
            d="M43,54.392c0.685-0.379,1.35-0.789,2-1.22V47h-2V54.392z"
          />
          <path
            style="fill: #424a60"
            d="M15,54.392V47h-2v6.172C13.65,53.603,14.315,54.013,15,54.392z"
          />
        </svg> -->
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
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import LoadingBalance from "./Loading/LoadingBalance.vue";
import Balance from "./Balance.vue";
import AccountMenu from "./AccountMenu.vue";
import { useDomain } from "@/composables/getDomain";
import { useBalanceStore } from "@/stores/balanceStore";

const { stationDomain } = useDomain();
const balanceStore = useBalanceStore();

const logo = import.meta.env.VITE_TITLE_LOGO;
const logoUrl = import.meta.env.VITE_URL_LOGO;

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

const route = useRoute();
const isChatPage = computed(() => {
  return route.name === "Chats";
});

onMounted(() => {
  balanceStore.regBalanceUser();
});
</script>

<style scoped>
.header-content {
  background-color: var(--bg);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  box-sizing: border-box;
  /* margin: 0px 0px 0px 0px; */
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
  width: 120px;
}

.img-logo {
  display: flex;
  align-items: center;
  gap: 6px;
}

.balance-user {
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 12px;
  color: #4047ca;
  padding: 5px;
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
  color: var(--text);
  display: flex;
  align-items: center;
  gap: 8px;
}

.line {
  margin: 0;
  width: 100%;
  height: 0.5px;
  background-color: var(--line);
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
    /* display: none; */
    cursor: pointer;
  }
}
</style>
