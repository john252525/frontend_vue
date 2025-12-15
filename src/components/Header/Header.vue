<template>
  <header>
    <section class="header-content">
      <article class="logo-header-cont">
        <h2
          v-if="!stationDomain.cosmetics.additionallyLogo"
          class="logo-header"
        >
          <img
            :src="stationDomain.cosmetics.urlLogo"
            class="logo-img"
            alt="Logo"
          />
          <span class="logo-text">{{ stationDomain.cosmetics.titleLogo }}</span>
        </h2>
        <div v-else class="img-logo">
          <img
            :src="stationDomain.cosmetics.urlLogo"
            class="logo-img"
            alt="Logo"
          />
          <img
            :src="stationDomain.cosmetics.additionallyLogo"
            class="logo-img-title"
            alt="Logo"
          />
        </div>
      </article>

      <article class="user-cont">
        <!-- Иконка почты -->

        <!-- Email пользователя -->
        <div v-if="email" class="email-display">
          <span class="email-text">{{ email }}</span>
        </div>

        <!-- Баланс -->
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

        <!-- Иконка пользователя -->
        <img
          @click="toggleAccountMenu"
          src="/header/user_img.svg"
          alt="Пользователь"
          class="user-icon"
        />
      </article>

      <!-- Модальные окна -->
      <Balance
        :balanceStationOn="toggleBalanceStation"
        :balance="balanceStore.formattedBalance"
        :balanceLoading="balanceStore.balanceLoading"
        :balanceError="balanceStore.balanceError"
        v-if="balanseStation"
      />
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
import { useAccountStore } from "@/stores/accountStore";

const { stationDomain } = useDomain();
const balanceStore = useBalanceStore();
const accountStore = useAccountStore();

// Получаем email пользователя из store
const storedData = computed(() => accountStore.getAccountData);
const email = computed(() => storedData.value);

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
  balanceStore.initBalance();
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
  gap: 20px;
}

.logo-img {
  height: 2rem;
}

.logo-img-title {
  height: 1rem;
}

.user-icon {
  cursor: pointer;
  height: 2rem;
  transition: transform 0.2s;
  flex-shrink: 0;
}

.user-icon:hover {
  transform: scale(1.05);
}

.user-cont {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.img-logo {
  display: flex;
  align-items: center;
  gap: 6px;
}

/* Email icon */
.email-icon {
  color: var(--text);
  cursor: pointer;
  transition: transform 0.2s, color 0.2s;
  flex-shrink: 0;
}

.email-icon:hover {
  transform: scale(1.1);
  color: #4047ca;
}

/* Email display */
.email-display {
  display: flex;
  align-items: center;
  padding: 6px 12px;
  background-color: rgba(64, 71, 202, 0.05);
  border-radius: 5px;
  border: 1px solid rgba(64, 71, 202, 0.1);
  max-width: 300px;
}

.email-text {
  font-size: 13px;
  color: var(--text);
  font-weight: 500;
  word-break: break-word;
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
  width: 80px;
  text-align: center;
  transition: background-color 0.2s;
  flex-shrink: 0;
}

.balance-user:hover {
  background-color: rgba(64, 71, 202, 0.05);
}

.logo-header-cont {
  display: flex;
  align-items: center;
  gap: 20px;
  min-width: 215px;
  flex-shrink: 0;
}

.logo-header {
  font-family: system-ui;
  font-weight: 500;
  font-size: 24px;
  color: var(--text);
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
}

.logo-text {
  white-space: nowrap;
}

.line {
  margin: 0;
  width: 100%;
  height: 0.5px;
  background-color: var(--line);
}

/* ============ АДАПТИВ ============ */

/* Планшет 768px - скрываем email текст, оставляем иконку */
@media (max-width: 768px) {
  .email-display {
    display: none;
  }

  .user-cont {
    gap: 10px;
  }

  .logo-header {
    font-size: 20px;
  }

  .logo-img {
    height: 1.5rem;
  }
}

/* Мобильные устройства 500px */
@media (max-width: 500px) {
  .header-content {
    padding: 10px;
    gap: 10px;
  }

  .logo-header-cont {
    min-width: auto;
    gap: 10px;
  }

  .logo-header {
    font-size: 18px;
    gap: 6px;
  }

  .logo-text {
    display: none;
  }

  .logo-img {
    height: 1.3rem;
  }

  .user-cont {
    gap: 8px;
  }
}

/* Очень маленькие экраны 350px */
@media (max-width: 350px) {
  .header-content {
    padding: 8px;
    gap: 6px;
  }

  .logo-img {
    height: 1rem;
  }
}

.phone-menu {
  display: none;
}

@media (max-width: 768px) {
  .phone-menu {
    display: block;
  }
}
</style>
