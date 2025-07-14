<template>
  <div @click="openAddAccountStation" class="black-fon"></div>
  <ErrorBlock v-if="errorBlock" :changeIncorrectPassword="chaneErrorBlock" />
  <section v-if="!loading" class="add-account-section">
    <div>
      <h2 class="title">{{ t("addAccount.title") }}</h2>
      <div @click="dropdownOpen('category')" class="dropdown-select">
        <h2
          v-if="!accountData.category"
          class="selected"
          :class="{ active: isOpen.category }"
        >
          {{ t("addAccount.typeCategory") }}
        </h2>
        <h2
          :class="{ unactive: !isOpen.category }"
          v-else
          class="item-selected"
        >
          {{ accountData.category }}
        </h2>
        <h2
          v-if="accountData.category && !isOpen.category"
          class="selected"
          :class="{ active: isOpen.category }"
        >
          {{ t("addAccount.typeCategory") }}
        </h2>
        <img
          class="arrow"
          :class="{ up: isOpen.category }"
          src="/account/arrow.svg"
          alt=""
        />
      </div>
      <nav v-if="isOpen.category" class="dropdown-options">
        <ul>
          <li @click="selectCategory('Messenger')" class="dropdown-option">
            Messenger
          </li>
        </ul>
        <ul>
          <li @click="selectCategory('CRM')" class="dropdown-option">CRM</li>
        </ul>
      </nav>
    </div>
    <Crm
      @update-login="updateLogin"
      @update-token="updateToken"
      :selectType="selectType"
      :changeAcooundDataButton="changeAcooundDataButton"
      :selectCrmType="selectCrmType"
      v-if="accountData.category === 'CRM'"
    />
    <section v-else>
      <div>
        <div
          v-if="accountData.category === 'Messenger'"
          @click="dropdownOpen('messenger')"
          class="dropdown-select"
        >
          <h2
            v-if="!accountData.messenger"
            class="selected"
            :class="{ active: isOpen.messenger }"
          >
            {{ t("addAccount.typeMessanger") }}
          </h2>
          <h2
            :class="{ unactive: !isOpen.messenger }"
            v-else
            class="item-selected"
          >
            {{ accountData.messenger }}
          </h2>
          <h2
            v-if="accountData.messenger && !isOpen.messenger"
            class="selected"
            :class="{ active: isOpen.messenger }"
          >
            {{ t("addAccount.typeMessanger") }}
          </h2>
          <img
            class="arrow"
            :class="{ up: isOpen.messenger }"
            src="/account/arrow.svg"
            alt=""
          />
        </div>
        <nav v-if="isOpen.messenger" class="dropdown-options">
          <ul>
            <li @click="selectMessenger('WhatsApp')" class="dropdown-option">
              WhatsApp
            </li>
          </ul>
          <ul>
            <li @click="selectMessenger('Telegram')" class="dropdown-option">
              Telegram
            </li>
          </ul>
          <ul>
            <li @click="selectMessenger('SMS')" class="dropdown-option">SMS</li>
          </ul>
        </nav>
      </div>
      <div>
        <input
          v-if="
            accountData.messenger === 'Telegram' &&
            accountData.category === 'Messenger'
          "
          @input="checkInputTelegram"
          v-model="accountData.tgLogin"
          :placeholder="t('addAccount.login')"
          type="text"
          class="input-data"
        />
      </div>
      <Whatsapp
        v-if="
          accountData.messenger === 'WhatsApp' &&
          accountData.category === 'Messenger'
        "
        @update-login="updateLogin"
        @update-token="updateToken"
        :selectType="selectType"
      />
    </section>
    <button
      v-if="accountData.button"
      @click="AddAccount"
      class="create-account-button"
    >
      {{ t("addAccount.addButton") }}
    </button>
  </section>
  <section v-else class="add-account-section">
    <SettingsLoad />
  </section>
</template>

<script setup>
import ErrorBlock from "@/components/ErrorBlock/ErrorBlock.vue";
import Whatsapp from "./Messenger/Whatsapp.vue";
import Crm from "./Crm/Crm.vue";
import axios from "axios";
const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL;
import { ref, reactive, watch, provide, computed } from "vue";
import { useRouter } from "vue-router";
import { useAccountStore } from "@/stores/accountStore";
import { useStationLoading } from "@/composables/useStationLoading";
const { setLoadingStatus } = useStationLoading();
const accountStore = useAccountStore();
const token = computed(() => accountStore.getAccountToken);
const router = useRouter();
const errorBlock = ref(false);
import { useI18n } from "vue-i18n";
const { t } = useI18n();
const chaneErrorBlock = () => {
  errorBlock.value = errorBlock.value;
};

const props = defineProps({
  openAddAccountStation: {
    type: Function,
  },
});

const accountData = reactive({
  category: "",
  messenger: "",
  type: "",
  login: "",
  tgLogin: "",
  token: "",
  button: false,
  crmType: "",
});

const data = reactive({
  category: "",
  messenger: "",
  type: "",
});

const station = reactive({
  login: false,
  token: false,
});

const isOpen = reactive({
  category: false,
  messenger: false,
});

const isDropdownOpen = ref(false);
const loading = ref(false);

const selectType = (value) => {
  accountData.type = value;
  if (value === "Touchapi") {
    // accountData.button = true;
  } else if ("Edna") {
    if (accountData.token) {
      return;
    } else {
      accountData.button = false;
    }
  } else {
    accountData.button = false;
  }
};

const selectCrmType = (type) => {
  accountData.crmType = type;
};

const selectCategory = (value) => {
  accountData.category = value;
  if (value === "Messenger") {
    data.category = "messenger";
    accountData.button = false;
  } else if (value === "CRM") {
    accountData.type = "";

    accountData.messenger = "";
    accountData.button = false;
    data.category = "crm";
  }
  dropdownOpen("category");
};

const selectMessenger = (value) => {
  accountData.messenger = value;
  if (value === "Telegram") {
    data.messenger = "telegram";
    if (accountData.tgLogin) {
      accountData.button = true;
      return;
    } else {
      accountData.button = false;
    }
  } else if (accountData.messenger === "WhatsApp") {
    data.messenger = "whatsapp";
    accountData.button = false;
    accountData.type = "";
  } else if (accountData.messenger === "SMS") {
    data.messenger = "sms";
    accountData.button = true;
  } else {
    accountData.button = false;
  }
  dropdownOpen("messenger");
};
import useFrontendLogger from "@/composables/useFrontendLogger";
import SettingsLoad from "../LoadingMoadal/SettingsLoad.vue";
const { sendLog } = useFrontendLogger();

const handleSendLog = async (location, method, params, results, answer) => {
  try {
    await sendLog(location, method, params, results, answer);
  } catch (err) {
    console.error("error", err);
    // Optionally, update the error message ref
  }
};

const addAccount = async () => {
  loading.value = true;
  const login = ref("");
  if (data.messenger === "whatsapp") {
    login.value = accountData.login;
  } else if (data.messenger === "telegram") {
    login.value = accountData.tgLogin;
  }
  try {
    const response = await axios.post(
      `${FRONTEND_URL}addAccount`,
      {
        token: accountData.token,
        login: login.value,
        type: data.type,
        group: data.category,
        proxyString: "",
        webhookUrls: "",
        source: data.messenger,
        crmType: accountData.crmType,
      },
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: `Bearer ${token.value}`,
        },
      }
    );

    if (response.data) {
      await handleSendLog(
        "addAccount",
        "addAccount",
        {
          token: accountData.token,
          login: login.value,
          type: data.type,
          group: data.category,
          proxyString: "",
          webhookUrls: "",
          source: data.messenger,
          crmType: accountData.crmType,
        },
        response.data.ok,
        response.data
      );
    }

    if (response.data.data.status != "error") {
      loading.value = false;
      setLoadingStatus(true, "success");
      props.openAddAccountStation();
      location.reload();
    } else if (response.data === 401) {
      errorBlock.value = true;
      setTimeout(() => {
        localStorage.removeItem("accountToken");
        router.push("/login");
      }, 2000);
    }
    if ((response.data.data.status = "error")) {
      loading.value = false;
      setLoadingStatus(true, "error");
    }
  } catch (error) {
    error.value = error.message || "Произошла ошибка.";
    console.error("error:", error);
    if (error.response) {
      setLoadingStatus(true, "error");
      loading.value = false;
      console.error("error", error.response.data);
    }
  }
};

const changeAcooundDataButton = () => {
  accountData.button = true;
};

const checkInputTelegram = () => {
  accountData.button = accountData.tgLogin.trim() !== "";
};

const updateLogin = (newLogin) => {
  accountData.login = newLogin;
  if (newLogin && accountData.type === "Touchapi") {
    accountData.button = true;
  }
};

const updateToken = (newToken) => {
  accountData.token = newToken;
  if (newToken) {
    station.token = true;
  } else {
    station.token = false;
  }
};

const dropdownOpen = (value) => {
  if (value === "category") {
    isOpen.category = !isOpen.category;
  } else if (value === "messenger") {
    isOpen.messenger = !isOpen.messenger;
  }
};

const AddAccount = () => {
  if (!accountData.category) {
    return;
  } else {
    if (accountData.category === "Messenger") {
    } else if (accountData.category === "CRM") {
      if (accountData.type === "Bitrix24") {
        addAccount();
        return;
      } else if (accountData.type === "AmoCRM") {
        addAccount();
        return;
      }
    }
  }
  if (!accountData.messenger) {
  } else {
    if (accountData.messenger === "WhatsApp") {
      if (!accountData.type) {
        return;
      } else {
        if (accountData.type === "Touchapi") {
          if (!accountData.login) {
            return;
          } else {
            addAccount();
          }
        } else if (accountData.type === "Edna") {
          if (!accountData.token || !accountData.login) {
          } else {
            addAccount();
          }
        }
      }
    } else if (accountData.messenger === "Telegram") {
      if (!accountData.tgLogin) {
      } else {
        addAccount();
      }
    } else if (accountData.messenger === "SMS") {
    }
  }
};
watch(
  () => [accountData.login, accountData.token],
  ([newLogin, newToken]) => {
    if (newLogin.trim() !== "" && newToken.trim() !== "") {
      accountData.button = true;
    }
    // accountData.button = newLogin.trim() !== "" && newToken.trim() !== "";
  }
);
provide("accountData", { accountData });
</script>

<style scoped>
.add-account-section {
  position: fixed;
  z-index: 10;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 10px;
  width: 593px;
  height: 625px;
  background: #fff;
  display: flex;
  /* justify-content: center; */
  align-items: center;
  flex-direction: column;
}

.title {
  font-weight: 600;
  font-size: 18px;
  color: #000;
  margin-top: 24px;
}

.create-account-button {
  border-radius: 5px;
  width: 490px;
  height: 44px;
  background: #4950ca;
  font-weight: 600;
  font-size: 14px;
  color: #fff;
  margin-top: 20px;
}

.create-account-button.fade-enter-active,
.create-account-button.fade-leave-active {
  transition: opacity 0.5s ease;
}
.create-account-button.fade-enter,
.create-account-button.fade-leave-to {
  opacity: 0;
}

.create-account-button {
  animation: fadeIn 0.5s forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dropdown-select {
  position: relative;
  border: 0.5px solid #c1c1c1;
  border-radius: 5px;
  width: 490px;
  height: 45px;
  background: #fcfcfc;
  display: flex;
  align-items: center;
  font-weight: 500;
  font-size: 16px;
  color: #343434;
  margin-top: 30px;
}

.selected {
  position: absolute;
  font-size: 14px;
  font-weight: 500;
  margin-left: 12px;
  background-color: white;
  padding: 0px 8px;
  top: -11px;
  transition: all 0.15s;
}

.selected.active {
  position: relative;
  font-size: 16px;
  padding: 0px 0px;
  transition: all 0.15s;
  top: 0;
}

.item-selected {
  font-size: 16px;
  font-weight: 500;
  margin-left: 12px;
}

.item-selected.unactive {
  font-size: 16px;
  font-weight: 500;
  margin-left: 12px;
  color: #696969;
  transition: all 0.05s;
}

.arrow {
  position: absolute;
  right: 10px;
  transition: transform 0.3s;
}

.arrow.up {
  transform: rotate(180deg);
}

.dropdown-options {
  position: absolute;
  border: 0.5px solid #c1c1c1;
  border-top: 0px;
  border-radius: 5px;
  padding: 10px;
  width: 470px;
  height: auto;
  background: #fcfcfc;
  display: flex;
  flex-direction: column;
  gap: 1px;
  z-index: 100;
}

.dropdown-option {
  font-size: 16px;
  padding: 4px;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.15s;
}
.dropdown-option:hover {
  background-color: #eeeeee;
  transition: all 0.15s;
}

.dropdown-options.fade-enter-active,
.dropdown-options.fade-leave-active {
  transition: opacity 0.5s ease;
}
.dropdown-options.fade-enter,
.action-list.fade-leave-to {
  opacity: 0;
}

.dropdown-options {
  animation: fadeIn 0.5s forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dropdown-select.fade-enter-active,
.dropdown-select.fade-leave-active {
  transition: opacity 0.5s ease;
}
.dropdown-select.fade-enter,
.dropdown-select.fade-leave-to {
  opacity: 0;
}

.dropdown-select {
  animation: fadeIn 0.5s forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.input-data {
  border: 0.5px solid #c1c1c1;
  border-radius: 5px;
  width: 478px;
  height: 45px;
  background: #fcfcfc;
  font-weight: 500;
  font-size: 14px;
  color: #343434;
  margin-top: 30px;
  padding-left: 10px;
}

.input-data.fade-enter-active,
.input-data.fade-leave-active {
  transition: opacity 0.5s ease;
}
.input-data.fade-enter,
.input-data.fade-leave-to {
  opacity: 0;
}

.input-data {
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

@media (max-width: 600px) {
  .add-account-section {
    width: 500px;
    height: 625px;
  }

  .dropdown-select {
    width: 400px;
    height: 45px;
    font-size: 16px;
    margin-top: 30px;
  }

  .dropdown-options {
    border-top: 0px;
    padding: 10px;
    width: 380px;
    height: auto;
    gap: 1px;
  }

  .create-account-button {
    width: 400px;
    height: 44px;
    font-size: 14px;
    margin-top: 20px;
  }

  .input-data {
    width: 387px;
    height: 45px;
  }
}

@media (max-width: 500px) {
  .add-account-section {
    width: 400px;
    height: 625px;
  }

  .dropdown-select {
    width: 350px;
    height: 45px;
    font-size: 16px;
    margin-top: 30px;
  }

  .dropdown-options {
    border-top: 0px;
    padding: 10px;
    width: 330px;
    height: auto;
    gap: 1px;
  }

  .create-account-button {
    width: 350px;
    height: 44px;
    font-size: 14px;
    margin-top: 20px;
  }

  .input-data {
    width: 338px;
    height: 45px;
  }
}

@media (max-width: 400px) {
  .add-account-section {
    width: 350px;
    height: 625px;
  }

  .dropdown-select {
    width: 300px;
    height: 45px;
    font-size: 16px;
    margin-top: 30px;
  }

  .dropdown-options {
    border-top: 0px;
    padding: 10px;
    width: 280px;
    height: auto;
    gap: 1px;
  }

  .create-account-button {
    width: 300px;
    height: 44px;
    font-size: 14px;
    margin-top: 20px;
  }

  .input-data {
    width: 287px;
    height: 45px;
  }
}
</style>
