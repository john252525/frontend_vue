<template>
  <AddAccount
    :getAccounts="getAccountListMethod"
    :openModal="openAddAccount"
    v-if="openAddAccountStation"
  />
  <header>
    <section class="account-section">
      <h2 class="title">{{ t("account.accounts") }}</h2>
      <button @click="changeTourMenu" class="help-button">
        <svg
          class="help-icon"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
            clip-rule="evenodd"
          />
        </svg>
        Как пользоваться?
      </button>
      <div
        v-if="setPlatformStation"
        @click="openCrmPlatform"
        class="black-fon"
      ></div>
      <div v-if="setPlatformStation" class="crm-list">
        <ul>
          <li
            @click="changeCrmPlatform('amocrm', 'AmoCRM')"
            :class="{ active: crmText === 'AmoCRM' }"
            class="crm-platform"
          >
            AmoCRM
          </li>
          <li
            @click="changeCrmPlatform('bitrix24', 'Bitrix24')"
            :class="{ active: crmText === 'Bitrix24' }"
            class="crm-platform"
          >
            Bitrix24
          </li>
          <li
            @click="changeCrmPlatform('megaplan', 'MegaPlan')"
            :class="{ active: crmText === 'MegaPlan' }"
            class="crm-platform"
          >
            MegaPlan
          </li>
        </ul>
      </div>
      <Filters
        :getAccounts="getAccountListMethod"
        :close="openPlatformChoice"
        :isOpen="platformStation"
      />
    </section>
    <section class="account-section">
      <button @click="openPlatformChoice" class="account-list-button">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="bi bi-view-list"
          viewBox="0 0 16 16"
        >
          <path
            d="M3 4.5h10a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2m0 1a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1zM1 2a.5.5 0 0 1 .5-.5h13a.5.5 0 0 1 0 1h-13A.5.5 0 0 1 1 2m0 12a.5.5 0 0 1 .5-.5h13a.5.5 0 0 1 0 1h-13A.5.5 0 0 1 1 14"
          ></path>
        </svg>
        Фильтры
      </button>
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
  <AccountList
    ref="accountListRef"
    :platformStationTextValue="platformStationTextValue"
  />
  <AccountsTour ref="accountTour" />
  <AccountTourModal
    v-if="tourMenu"
    :startTour="startAccountTour"
    :close="changeTourMenu"
  />
</template>

<script setup>
import AccountList from "./Accounts/AccountsList.vue";
import AccountTourModal from "../GlobalModal/TourModal/Accounts/AccountTourModal.vue";
import AddAccount from "./Accounts/AddAccount/AddAccountV2.vue";
import Filters from "./Filters.vue";
import AccountsTour from "../tours/AccountsTour.vue";

import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useAccountStore } from "@/stores/accountStore";
import { useI18n } from "vue-i18n";

const accountStore = useAccountStore();
const route = useRoute();
const { t } = useI18n();

const platformStationTextValue = ref("telegram");
const crmText = accountStore.getCrmPlatformText;
const openAddAccountStation = ref(false);
const setPlatformStation = ref(false);
const platformStation = ref(false);
const accountTour = ref(null);
const accountListRef = ref(null);
const tourMenu = ref(false);

const getAccountListMethod = () => {
  if (accountListRef.value) {
    accountListRef.value.getAccounts();
  }
};

const startAccountTour = () => {
  if (accountTour.value) {
    accountTour.value.startTour();
  }
};

function changeTourMenu() {
  tourMenu.value = !tourMenu.value;
}

function openCrmPlatform() {
  setPlatformStation.value = !setPlatformStation.value;
}

function openPlatformChoice() {
  platformStation.value = !platformStation.value;
}

function openAddAccount() {
  openAddAccountStation.value = !openAddAccountStation.value;
}

function changeCrmPlatform(value, valueTwo) {
  accountStore.setCrmPlatform(value);
  accountStore.setCrmPlatformText(valueTwo);
  setPlatformStation.value = !setPlatformStation.value;
  location.reload();
}

onMounted(() => {
  if (route.query.tour === "true") {
    if (accountTour.value) {
      accountTour.value.startTour();
    }
  }
});
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
  gap: 10px;
}

.title {
  font-weight: 500;
  font-size: 22px;
  color: var(--text);
  flex: 1;
  margin-right: 8px;
}

.help-button {
  background: oklch(0.65 0.22 267 / 0.16);
  border: none;
  border-radius: 5px;
  padding: 10px 12px;
  font-weight: 600;
  font-size: 12px;
  color: var(--headerAccountButtonColor);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.25s;
  flex-shrink: 0;
}

.help-button:hover {
  background: rgba(0, 13, 255, 0.2);
  transition: all 0.25s;
}

.help-button:active {
  background: rgba(17, 21, 93, 0.2);
  transition: all 0.25s;
}

.help-icon {
  width: 0.875rem;
  height: 0.875rem;
  fill: currentColor;
  opacity: 0.8;
  filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.05));
  transition: all 0.25s ease;
}

.help-button:hover .help-icon {
  opacity: 1;
  transform: scale(1.05);
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
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
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.25s;
  border: none;
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
  width: 1.25rem;
  height: 1.25rem;
  margin-right: 0.25rem;
  margin-left: -0.25rem;
  fill: currentColor;
}

.add-account-button {
  background: oklch(0.541 0.198 267);
  font-weight: 600;
  font-size: 12px;
  color: #fff;
  transition: all 0.25s;
  padding: 8px 12px;
  border: none;
}

.crm-platform-cont {
  font-weight: 700;
  font-size: 12px;
  color: var(--headerAccountText);
  background: var(--headerAccount);
  border-radius: 5px;
  padding: 5px 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
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
  height: 100px;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 2px;
}

.crm-list {
  position: absolute;
  z-index: 10;
  left: 350px;
  top: 120px;
  border-radius: 10px;
  width: 108px;
  height: 100px;
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
  height: 100px;
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
  }
  to {
    opacity: 1;
  }
}

.platform {
  padding: 4px;
  transition: all 0.1s;
  cursor: pointer;
  font-size: 14px;
}

.crm-platform {
  padding: 4px;
  transition: all 0.1s;
  cursor: pointer;
  font-size: 14px;
  width: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.crm-platform:hover {
  text-align: center;
  width: 80px;
  background-color: #eeeeee;
  border-radius: 5px;
  transition: all 0.2s;
}

.crm-platform.active {
  text-align: center;
  width: 80px;
  background-color: #eeeeee;
  border-radius: 5px;
  transition: all 0.2s;
}

.platform:hover {
  text-align: center;
  width: 80px;
  background-color: #eeeeee;
  border-radius: 5px;
  transition: all 0.2s;
}

.platform.active {
  text-align: center;
  width: 80px;
  background-color: #eeeeee;
  border-radius: 5px;
  transition: all 0.2s;
}

@media (max-width: 768px) {
  .crm-list {
    left: 120px;
    top: 120px;
  }
  .account {
    display: none;
  }

  header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .account-section {
    width: 100%;
    justify-content: space-between;
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

  .help-button {
    margin-right: 0;
  }
}
</style>
