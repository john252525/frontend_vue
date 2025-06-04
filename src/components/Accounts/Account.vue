<template>
  <!-- <AddTelegramAccount
    :openAddAccountStation="openAddAccount"
    v-if="openAddAccountStation"
  /> -->
  <AddAccount
    :openAddAccountStation="openAddAccount"
    v-if="openAddAccountStation"
  />
  <header>
    <section class="account-section">
      <h2 class="title">{{ t("account.accounts") }}</h2>
      <h2 v-if="stationDomain.navigate.value != 'whatsapi'" class="account">
        {{ platformStationText }}
      </h2>
    </section>
    <section class="account-section">
      <button
        v-if="stationDomain.navigate.value != 'whatsapi'"
        @click="openPlatformChoice"
        class="account-list-button"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="bi bi-view-list"
          viewBox="0 0 16 16"
        >
          <path
            d="M3 4.5h10a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2m0 1a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1zM1 2a.5.5 0 0 1 .5-.5h13a.5.5 0 0 1 0 1h-13A.5.5 0 0 1 1 2m0 12a.5.5 0 0 1 .5-.5h13a.5.5 0 0 1 0 1h-13A.5.5 0 0 1 1 14"
          ></path>
        </svg>
        {{ platformStationText }}
      </button>
      <article v-if="platformStation">
        <div @click="openPlatformChoice" class="black-fon"></div>
        <ul
          v-if="platformStationText === 'Telegram'"
          class="platform-list-telegram"
        >
          <li @click="choiceNetWork('telegram', 'Telegram')" class="platform">
            Telegram
          </li>
          <li @click="choiceNetWork('whatsapp', 'WhatsApp')" class="platform">
            WhatsApp
          </li>
        </ul>
        <ul v-else class="platform-list-whatsapp">
          <li @click="choiceNetWork('telegram', 'Telegram')" class="platform">
            Telegram
          </li>
          <li @click="choiceNetWork('whatsapp', 'WhatsApp')" class="platform">
            WhatsApp
          </li>
        </ul>
      </article>
      <button @click="openAddAccount" class="add-account-button">
        <svg
          class="svg-icon"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill-rule="evenodd"
            d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
            clip-rule="evenodd"
          ></path>
        </svg>

        {{ t("account.addButton") }}
      </button>
    </section>
  </header>
  <AccountList :platformStationTextValue="platformStationTextValue" />
</template>

<script setup>
import AccountList from "./Accounts/AccountsList.vue";
import AddAccount from "./Accounts/AddAccount/AddAccount.vue";
import { useAccountStore } from "@/stores/accountStore";
const accountStore = useAccountStore();

import { ref, onMounted } from "vue";
const platformStationTextValue = ref("telegram");
const openAddAccountStation = ref(false);
const platformStationText = localStorage.getItem("accountStationText");
const platformStation = ref(false);
import { useI18n } from "vue-i18n";
const { t } = useI18n();

import { useDomain } from "@/composables/getDomen";
const { stationDomain } = useDomain();

function openPlatformChoice() {
  platformStation.value = !platformStation.value;
}

function choiceNetWork(value, valueTwo) {
  location.reload();
  accountStore.setAccountStation(value);
  accountStore.setAccountStationText(valueTwo);
  platformStation.value = !platformStation.value;
}

function openAddAccount() {
  openAddAccountStation.value = !openAddAccountStation.value;
}
</script>

<style scoped>
header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 18px 12px 18px 18px;
  box-sizing: border-box;
}

.account-section {
  display: flex;
  align-items: center;
}

.title {
  font-weight: 500;
  font-size: 22px;
  color: var(--text);
  flex: 1;
  margin-right: 8px;
}

.account {
  font-weight: 700;
  font-size: 18px;
  color: var(--headerAccountText);
  background: var(--headerAccount);
  border-radius: 5px;
  padding: 5px 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
}

.account-list-button,
.add-account-button {
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex: 0 0 auto;
}

.bi-view-list {
  width: 1rem;
  height: 1rem;
  fill: currentColor;
}

.account-list-button {
  background: oklch(0.65 0.22 267 / 0.16);
  font-weight: 600;
  font-size: 12px;
  padding: 10px 12px;
  color: var(--headerAccountButtonColor);
  margin-right: 10px;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.25s;
}

.account-list-button:hover {
  background: rgba(0, 13, 255, 0.2);
  transition: all 0.25s;
}

.account-list-button:active {
  background: rgba(17, 21, 93, 0.2);
  transition: all 0.25s;
}

.svg-icon {
  width: 1.25rem; /* 20px */
  height: 1.25rem; /* 20px */
  margin-right: 0.25rem; /* 4px */
  margin-left: -0.25rem; /* -4px */
  fill: currentColor; /* Заполнение текущим цветом */
}

.add-account-button {
  background: oklch(0.541 0.198 267);
  font-weight: 600;
  font-size: 12px;
  color: #fff;
  transition: all 0.25s;
  padding: 8px 12px;
}

.add-account-button:hover {
  background: #565cc8;
  transition: all 0.25s;
}

.add-account-button:active {
  background: #3e43ae;
  transition: all 0.25s;
}

.black-fon {
  position: absolute;
  z-index: 5;
  width: 100%;
  height: 100vh;
  background: rgba(117, 117, 117, 0.3);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.platform-list-telegram {
  position: absolute;
  z-index: 10;
  right: 122px;
  top: 120px;
  border-radius: 10px;
  width: 100px;
  height: 70px;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 2px;
}

.platform-list-whatsapp {
  position: absolute;
  z-index: 10;
  right: 122px;
  top: 120px;
  border-radius: 10px;
  width: 108px;
  height: 70px;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 2px;
}

.platform-list-telegram .fade-enter-active,
.platform-list-telegram .fade-leave-active {
  transition: opacity 0.5s ease;
}
.platform-list-telegram .fade-enter,
.platform-list-telegram .fade-leave-to {
  opacity: 0;
}

.platform-list-telegram {
  animation: fadeIn 0.5s forwards;
}

.platform-list-whatsapp.fade-enter-active,
.platform-list-whatsapp.fade-leave-active {
  transition: opacity 0.5s ease;
}
.platform-list-whatsapp.fade-enter,
.platform-list-whatsapp.fade-leave-to {
  opacity: 0;
}

.platform-list-whatsapp {
  animation: fadeIn 0.5s forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    /* transform: translateY(5px); */
  }
  to {
    opacity: 1;
    /* transform: translateY(0); */
  }
}

.platform {
  padding: 4px;
  transition: all 0.1s;
  cursor: pointer;
  font-size: 14px;
}

.platform:hover {
  text-align: center;
  width: 80px;
  background-color: #eeeeee;
  border-radius: 5px;
  transition: all 0.2s;
}

@media (max-width: 768px) {
  .account {
    display: none;
  }

  header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .platform-list {
    left: 20px;
    top: 180px;
  }

  .platform-list-telegram {
    left: 17px;
    top: 160px;
  }

  .platform-list-whatsapp {
    left: 16px;
    top: 160px;
  }
}
</style>
