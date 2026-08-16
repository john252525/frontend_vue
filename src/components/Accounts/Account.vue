<template>
  <AddAccount
    :getAccounts="getAccountListMethod"
    :openModal="openAddAccount"
    v-if="openAddAccountStation"
  />
  <AccountsOnboardingTour ref="onboardingTourRef" />

  <header class="accounts-onboarding-header">
    <section class="account-section">
      <h2 class="title">Аккаунты</h2>
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
        :filterInstances="filterInstancesMethod"
        :invalidateCache="invalidateCache"
        :close="openPlatformChoice"
        :isOpen="platformStation"
      />
    </section>
    <section class="account-section">
      <TabToggle
        :modelValue="activeTab"
        :getAccounts="getAccountListMethod"
        :availableAccounts="availableAccounts"
        @update:modelValue="changeActiveTab($event)"
      />

      <button
        v-if="activeTab === 'accounts'"
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
        Фильтры
      </button>
      <button
        v-if="activeTab === 'accounts'"
        @click="openAddAccount"
        class="add-account-button"
      >
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
        Добавить аккаунт
      </button>

      <!-- <button
        v-if="activeTab === 'accounts'"
        @click="startOnboardingTour"
        class="help-tour-button"
        title="Как пользоваться"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 2-3 4" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        Как пользоваться
      </button> -->
    </section>
  </header>

  <div class="content-wrapper">
    <AccountList
      v-if="activeTab === 'accounts'"
      ref="accountListRef"
      :platformStationTextValue="platformStationTextValue"
      :changeAllAccounts="changeAllAccounts"
    />

    <GroupsList
      v-if="activeTab === 'groups'"
      :getAccounts="getAccountListMethod"
    />
  </div>
</template>

<script setup>
import AccountList from "./Accounts/AccountsListV2.vue";
import GroupsList from "./Groups/GroupsList.vue";
import TabToggle from "./Groups/TabToggle.vue";
import AddAccount from "./Accounts/AddAccount/AddAccountV2.vue";
import AccountsOnboardingTour from "@/components/tours/AccountsOnboardingTour.vue";
import { useAccountStore } from "@/stores/accountStore";
import { useInstancesStore } from "@/stores/instancesStore";
import Filters from "./Filters.vue";
import { ref, computed } from "vue";

const accountStore = useAccountStore();
const instancesStore = useInstancesStore();

const platformStationTextValue = ref("telegram");
const openAddAccountStation = ref(false);
const platformStationText = accountStore.getAccountStationText;
const crmText = accountStore.getCrmPlatformText;
const platformStation = ref(false);
const setPlatformStation = ref(false);
const accountListRef = ref(null);
const onboardingTourRef = ref(null);

const activeTab = ref("accounts");
const hasLoadedAccounts = ref(false);

// changeAllAccounts оставляем для совместимости с пропом, но данные уже в сторе
const changeAllAccounts = (items) => {
  hasLoadedAccounts.value = true;
};

// Инвалидация кеша — сбрасываем стор, чтобы следующий getAccounts сделал новый запрос
const invalidateCache = () => {
  instancesStore.clearInstances();
};

// Клиентская фильтрация — применяет текущие фильтры без API-запроса
const filterInstancesMethod = () => {
  if (accountListRef.value && accountListRef.value.filterInstances) {
    accountListRef.value.filterInstances();
  }
};

const changeActiveTab = (value) => {
  activeTab.value = value;
};

const availableAccounts = computed(() => {
  return instancesStore.allInstances.filter((account) =>
    ["whatsapp", "telegram", "max", "vk-bot"].includes(
      account.source || account.type,
    ),
  );
});

const getAccountListMethod = async () => {
  // Возвращаем полный список (allInstances) — без учёта текущих фильтров,
  // чтобы группы и другие функции всегда имели доступ ко всем аккаунтам
  if (instancesStore.hasAllInstances && instancesStore.isCacheFresh) {
    return instancesStore.allInstances;
  }

  // Если кеш пустой/устаревший — перезагружаем через компонент
  if (accountListRef.value && accountListRef.value.getAccounts) {
    const result = await accountListRef.value.getAccounts();
    hasLoadedAccounts.value = true;
    return result;
  }

  return [];
};

function openCrmPlatform() {
  setPlatformStation.value = !setPlatformStation.value;
}

function openPlatformChoice() {
  platformStation.value = !platformStation.value;
}

function changeCrmPlatform(value, valueTwo) {
  accountStore.setCrmPlatform(value);
  accountStore.setCrmPlatformText(valueTwo);
  setPlatformStation.value = !setPlatformStation.value;
  location.reload();
}

function openAddAccount() {
  openAddAccountStation.value = !openAddAccountStation.value;
}

function startOnboardingTour() {
  onboardingTourRef.value?.start();
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
  gap: 12px;
}

.title {
  font-weight: 500;
  font-size: 22px;
  color: var(--text);
  flex: 1;
  margin-right: 8px;
  margin: 0;
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
  background: rgba(var(--primary-rgb), 0.16);
  font-weight: 600;
  font-size: 12px;
  padding: 10px 12px;
  color: var(--headerAccountButtonColor);
  margin-right: 10px;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.25s;
  border: none;
}

.account-list-button:hover {
  background: rgba(0, 13, 255, 0.2);
}

.svg-icon {
  width: 1.25rem;
  height: 1.25rem;
  margin-right: 0.25rem;
  margin-left: -0.25rem;
  fill: currentColor;
}

.add-account-button {
  background: var(--primary);
  font-weight: 600;
  font-size: 12px;
  color: #fff;
  transition: all 0.25s;
  padding: 8px 12px;
  border: none;
}

.add-account-button:hover {
  background: var(--primaryHover);
}

.add-account-button:active {
  background: var(--primaryActive);
}

.help-tour-button {
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  flex: 0 0 auto;
  background: transparent;
  border: 1px solid var(--border, #e2e8f0);
  font-weight: 600;
  font-size: 12px;
  color: var(--headerAccountButtonColor, #64748b);
  padding: 10px 12px;
  margin-left: 10px;
  transition: all 0.25s;
}

.help-tour-button:hover {
  background: rgba(var(--primary-rgb), 0.1);
  border-color: var(--primary);
}

.black-fon {
  position: absolute;
  z-index: 5;
  width: 100%;
  height: 100vh;
  background: var(--backgroundComponentModal);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.crm-list {
  position: absolute;
  z-index: 10;
  left: 350px;
  top: 120px;
  border-radius: 10px;
  width: 108px;
  height: 100px;
  background: var(--bg);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 2px;
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
  background-color: var(--tableAccountBg);
  border-radius: 5px;
}

.crm-platform.active {
  background-color: var(--tableAccountBg);
  border-radius: 5px;
}

.content-wrapper {
  /* margin: 18px 12px 18px 18px; */
}

@media (max-width: 1100px) {
  header {
    flex-wrap: wrap;
    gap: 12px;
  }

  .account-section:last-child {
    flex-wrap: wrap;
  }
}

@media (max-width: 768px) {
  .crm-list {
    left: 120px;
    top: 120px;
  }

  header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .account-section {
    width: 100%;
    flex-wrap: wrap;
  }

  .account-section:first-child {
    flex-direction: column;
    align-items: flex-start;
  }

  .title {
    width: 100%;
  }

  .account-section:last-child {
    width: 100%;
  }
}
</style>
