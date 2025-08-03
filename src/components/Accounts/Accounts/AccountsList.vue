<template>
  <section class="account-list-section">
    <div class="table-container">
      <table class="table">
        <thead class="table-header">
          <tr>
            <th class="table-login">{{ t("accountList.login") }}</th>
            <th v-if="accountStation === 'crm'" class="table-login">СОУРС</th>
            <th v-if="accountStation === 'crm'" class="table-login">СТАТУС</th>
            <th v-if="accountStation === 'crm'" class="table-login">ТИП</th>
            <th v-if="accountStation != 'crm'" class="table-step">
              {{ t("accountList.step") }}
            </th>
            <th class="table-login">ПОДПИСКА</th>
            <th v-if="accountStation != 'crm'" class="table-action">
              {{ t("accountList.action") }}
            </th>
          </tr>
        </thead>
        <tbody class="tbody">
          <tr
            v-if="dataStation"
            v-for="(item, index) in instanceData"
            :key="index"
          >
            <td v-if="item.login" class="table-text-number">
              <AccountIcon :item="item" />
              {{ item.login }}
            </td>
            <td v-else class="table-text">-</td>
            <td
              v-if="accountStation === 'crm' && item.source"
              class="table-text"
            >
              {{ item.source }}
            </td>
            <td
              v-if="accountStation === 'crm' && !item.source"
              class="table-text"
            >
              -
            </td>
            <td
              class="table-text"
              @mouseover="showMessage($event, item.step.message)"
              @mouseleave="hideMessage"
              v-if="item.step && accountStation != 'crm'"
            >
              {{ item.step.value }}
            </td>

            <td
              class="table-text"
              v-else-if="item.loading && accountStation != 'crm'"
            >
              <LoadingAccount />
            </td>
            <td
              class="table-text"
              v-if="!item.loading && accountStation != 'crm'"
            >
              -
            </td>
            <td v-if="item.enable === 1 && accountStation === 'crm'">
              Активно
            </td>
            <td v-if="item.enable === 0 && accountStation === 'crm'">
              Неактивно
            </td>
            <td v-if="accountStation === 'crm'">{{ item.type }}</td>
            <td><button @click="changeTariffStation">Продлить</button></td>
            <td class="table-action-text">
              <button
                v-if="
                  (item.storage === 'local' && item.type === 'undefined') ||
                  (item.storage === 'binder' && item.type === 'touchapi') ||
                  (item.storage === 'undefined' && item.type === 'whatsapi') ||
                  (item.storage === 'whatsapi' && item.type === 'undefined')
                "
                class="action-table-button"
                @click="openModal($event, item)"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  class="bi bi-list"
                  viewBox="0 0 16 16"
                >
                  <path
                    fill-rule="evenodd"
                    d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5"
                  ></path>
                </svg>
                {{ t("accountList.actionButton") }}
              </button>
            </td>
          </tr>
          <tr v-else-if="dataStationNone">
            <td colspan="3">
              <div class="none-account-cont">
                <h2>{{ t("accountList.accountNone") }}</h2>
              </div>
            </td>
          </tr>
          <tr v-if="loadDataStation">
            <td colspan="3">
              <div class="load-cont">
                <LoadAccount />
              </div>
            </td>
          </tr>
          <tr v-if="errorAccountBolean && !loadDataStation">
            <td colspan="3">
              <div class="load-cont">
                <errorAccount />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <span v-if="messageVisible" class="tooltip" :style="tooltipStyle">{{
        tooltipMessage
      }}</span>
    </div>
    <Tariff />
    <Modal
      :isModalOpen="isModalOpen"
      :closeModal="closeModal"
      :modalPosition="modalPosition"
      :selectedItem="selectedItem"
      :qrCodeData="qrCodeData"
      @update:loadingStation="updateLoading"
      @update:selectedItems="updateSelectedItems"
      @update:qrCodeData="updateqrCodeData"
      :changeStationSettingsModal="changeStationSettingsModal"
      :changeStationQrModal="changeStationQrModal"
      :changeStationGetByCode="changeStationGetByCode"
      :changeEnableStation="changeEnableStation"
      :getScreenStation="getScreenStation"
      :changeGetScreenStation="changeGetScreenStation"
      :chatsStation="chatsStation"
      :changeForceStopItemData="changeForceStopItemData"
    />
    <SettignsModal
      :closeModal="closeModal"
      :selectedItems="selectedItems"
      :settingsModalStation="settingsModalStation"
      :changeStationSettingsModal="changeStationSettingsModal"
    />
    <QrModal
      :qrModalStation="qrModalStation"
      :changeStationQrModal="changeStationQrModal"
      :qrCodeData="qrCodeData"
      :changeStationQrModalOn="changeStationQrModalOn"
    />
    <getByCode
      v-if="getByCodeStation"
      :changeStationGetByCode="changeStationGetByCode"
      :selectedItems="selectedItems"
      :getByCodeStation="getByCodeStation"
    />
    <getScreen
      v-if="getScreenStation"
      :changeGetScreenStation="changeGetScreenStation"
      :selectedItem="selectedItem"
    />
    <Enable
      v-if="enableStation"
      :changeForceStopItemData="changeForceStopItemData"
      :enableStation="enableStation"
      :selectedItem="selectedItem"
      :changeEnableStation="changeEnableStation"
    />
    <ErrorBlock v-if="errorBlock" :changeIncorrectPassword="chaneErrorBlock" />
  </section>
</template>

<script setup>
import { ref, reactive, onMounted, provide, inject, computed } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";
import LoadingAccount from "./LoadingMoadal/LoadingAccount.vue";
import ErrorBlock from "@/components/ErrorBlock/ErrorBlock.vue";
import Modal from "./Modal.vue";
import Enable from "./ModalAccount/Enable/Enable.vue";
import SettignsModal from "./ModalAccount/settingsModal.vue";
import getByCode from "./ModalAccount/GetByCode/GetByCode.vue";
import QrModal from "./ModalAccount/qrModal.vue";
import errorAccount from "@/components/Mailing/MailingList/errorAccount.vue";
import getScreen from "./ModalAccount/GetScreen.vue";
import LoadAccount from "./LoadAccount.vue";
import AccountIcon from "../AccountIcon.vue";
import Tariff from "./TariffAccount/Tariff.vue";
import { useAccountStore } from "@/stores/accountStore";
const accountStore = useAccountStore();
const token = computed(() => accountStore.getAccountToken);
const accountStation = computed(() => accountStore.getAccountStation);
const crmPlatform = computed(() => accountStore.getCrmPlatform);
const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL;

import { storeToRefs } from "pinia";
import { useLoginWhatsAppChatsStepStore } from "@/stores/loginWhatsAppChatsStepStore";
const chatStore = useLoginWhatsAppChatsStepStore();
const allAcoount = computed(() => chatStore.getLoginWhatsAppChatsStep);

import { useUserInfoStore } from "@/stores/userInfoStore";
const userInfoStore = useUserInfoStore();
const { userInfo } = storeToRefs(userInfoStore);

import { fetchChats } from "@/utils/getChats";
import { useDomain } from "@/composables/getDomain";
const { stationDomain } = useDomain();

import { useI18n } from "vue-i18n";
const { t } = useI18n();

const router = useRouter();

const forceStopItemData = ref({});
const chatsLoadingChange = inject("chatsLoadingChange");
const dataStationNone = ref(false);
const dataStation = ref(false);
const loadDataStation = ref(false);
const errorAccountBolean = ref(false);
const qrCodeData = ref([]);
const enableStation = ref(false);
const getByCodeStation = ref(false);
const getScreenStation = ref(false);
const qrModalStation = ref(false);
const settingsModalStation = ref(false);
const instanceData = ref([]);
const accounts = ref([]);
const isModalOpen = ref(false);
const modalPosition = ref({ top: 0, left: 0 });
const selectedItem = ref(null);
const selectedItems = ref(null);
const loadingStation = ref(false);
const chatsStation = ref(null);

import useFrontendLogger from "@/composables/useFrontendLogger";
import False from "@/components/Chats/UserList/ResultModal/False.vue";
const { sendLog } = useFrontendLogger();

const changeForceStopItemData = async (item) => {
  try {
    forceStopItemData.value = { ...item, loading: true };
    const accountIndex = instanceData.value.findIndex(
      (acc) => acc.login === item.login && acc.source === item.source
    );

    if (accountIndex === -1) {
      console.warn("Account not found in instanceData");
      return;
    }

    instanceData.value[accountIndex].loading = true;

    const infoResponse = await getInfoWhats(
      item.source,
      item.login,
      item.type,
      item.storage
    );

    if (!infoResponse?.data?.data) {
      throw new Error("Invalid response structure");
    }

    instanceData.value[accountIndex] = {
      ...instanceData.value[accountIndex],
      step: infoResponse.data.data.step || "Н/Д",
      loading: false,
    };

    forceStopItemData.value = {
      ...instanceData.value[accountIndex],
      loading: false,
    };

    if (infoResponse.data.data.step?.[0]?.value === 5) {
      updateLocalStorage(item.login, item.source, item.storage, item.type);
    }
  } catch (error) {
    console.error("error", error);
    if (forceStopItemData.value) {
      forceStopItemData.value.loading = false;
    }
    const accountIndex = instanceData.value.findIndex(
      (acc) => acc.login === item.login && acc.source === item.source
    );
    if (accountIndex !== -1) {
      instanceData.value[accountIndex].loading = false;
    }
  }
};

const updateLocalStorage = (login, source, storage, type) => {
  try {
    const newLoginData = {
      login,
      source,
      storage: storage || "undefined",
      type: type || "undefined",
    };
    chatStore.addOrUpdateChat(newLoginData);
    console.log("Account saved to store:", newLoginData);
  } catch (e) {
    console.error("Error updating store:", e);
  }
};

const changeEnableStation = () => {
  enableStation.value = !enableStation.value;
};

const changeGetScreenStation = () => {
  getScreenStation.value = !getScreenStation.value;
};

const errorBlock = ref(false);
const chaneErrorBlock = () => {
  errorBlock.value = !errorBlock.value;
};

const handleSendLog = async (location, method, params, results, answer) => {
  try {
    await sendLog(location, method, params, results, answer);
  } catch (err) {
    console.error("error", err);
  }
};

const getAccounts = async () => {
  let params = {
    source: accountStation.value,
    skipDetails: true,
    group: "messenger",
  };

  if (stationDomain.navigate.value === "touchapi") {
    console.log("touch");
    params = {
      source: accountStation.value,
      skipDetails: true,
      group: "messenger",
    };

    if (accountStation.value === "crm") {
      console.log("crn");
      params = {
        group: "crm",
        type: crmPlatform.value,
      };
    }
  }

  if (stationDomain.navigate.value === "whatsapi") {
    params = {
      skipDetails: true,
    };
  }

  loadDataStation.value = true;
  try {
    const response = await axios.post(`${FRONTEND_URL}getInfoByToken`, params, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.value}`,
      },
    });

    if (response.data.ok === true) {
      await handleSendLog(
        "accountList",
        "getInfoByToken",
        params,
        response.data.ok,
        response.data
      );

      accounts.value = response.data;
      instanceData.value = accounts.value.data.instances.map((instance) => ({
        ...instance,
        step: instance.step === null ? "Н/Д" : instance.step,
        loading: true,
        storage: instance.storage || "undefined",
        type: instance.type || "undefined",
      }));

      if (instanceData.value.length === 0) {
        loadDataStation.value = false;
        dataStationNone.value = true;
      } else {
        loadDataStation.value = false;
        dataStation.value = true;

        if (
          accountStation.value === "whatsapp" ||
          accountStation.value === "telegram"
        ) {
          const accountsToFetch = instanceData.value.filter(
            (instance) =>
              instance.step?.value === 5 &&
              ((instance.storage === "binder" &&
                instance.type !== "touchapi") ||
                (instance.storage === "whatsapi" &&
                  instance.type === "whatsapi"))
          );

          if (accountsToFetch.length > 0) {
            try {
              await new Promise((resolve) =>
                setTimeout(resolve, 200 * accountsToFetch.length)
              );
              const result = await fetchChats({
                token: token.value,
                accounts: accountsToFetch,
              });
              if (result.error) {
                console.error("Ошибка пакетного запроса чатов:", result.error);
              }
            } catch (e) {
              console.error("Ошибка при сохранении аккаунтов:", e);
            } finally {
              accountsToFetch.forEach((instance) => {
                instance.loading = false;
              });
            }
          }

          const promises = instanceData.value.map(async (instance) => {
            const login = instance.login;
            if (
              (instance.storage === "binder" && instance.type !== "touchapi") ||
              (instance.storage === "whatsapi" && instance.type === "whatsapi")
            ) {
              instance.loading = false;
              return;
            }

            try {
              const infoResponse = await getInfoWhats(
                instance.source,
                login,
                instance.type,
                instance.storage
              );

              if (infoResponse?.data?.data?.step) {
                instance.step = infoResponse.data.data.step;
              }
            } catch (error) {
              console.error(`Error for ${login}:`, error);
            } finally {
              instance.loading = false;
            }
          });

          await Promise.all(promises);
          chatsLoadingChange();
        }
      }
    } else if (response.data === 401) {
      errorBlock.value = true;
      loadDataStation.value = false;
      errorAccountBolean.value = true;
    }
  } catch (error) {
    loadDataStation.value = false;
    errorAccountBolean.value = true;
    console.error("Error:", error);
  }
};

const getInfoWhats = async (source, login, type, storage) => {
  try {
    const response = await axios.post(
      `${FRONTEND_URL}getInfo`,
      {
        source: source,
        login: login,
        type: type,
        storage: storage,
      },
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: `Bearer ${token.value}`,
        },
      }
    );
    return response;
  } catch (error) {
    console.error("Error in getInfoWhats:", error);
    return null;
  }
};

const updateUserInfo = (event) => {
  userInfoStore.setUserInfo(event);
};

const openModal = (event, item) => {
  selectedItem.value = item;
  isModalOpen.value = true;
  updateUserInfo(JSON.stringify(selectedItem.value));
  console.log(userInfo);
  getInfo();
  const rect = event.currentTarget.getBoundingClientRect();
  modalPosition.value = {
    top: rect.bottom + window.scrollY,
    left: rect.left + window.scrollX,
  };
};

function formatPhoneNumber(phoneNumber) {
  const regex = /^8(\d{3})(\d{3})(\d{2})(\d{2})$/;
  const match = phoneNumber.match(regex);

  if (!match) {
    return phoneNumber;
  }

  return `+7 (${match[1]}) ${match[2]}-${match[3]}-${match[4]}`;
}

const changeStationSettingsModal = () => {
  settingsModalStation.value = !settingsModalStation.value;
};

const changeStationQrModal = () => {
  qrModalStation.value = !qrModalStation.value;
};

const changeStationQrModalOn = () => {
  qrModalStation.value = true;
};

const changeStationGetByCode = () => {
  getByCodeStation.value = !getByCodeStation.value;
};

const closeModal = () => {
  isModalOpen.value = false;
  chatsStation.value = false;
};

const updateSelectedItems = (newValue) => {
  selectedItems.value = newValue;
};

const updateqrCodeData = (newValue) => {
  qrCodeData.value = newValue;
};

const updateLoading = (newValue) => {
  loadingStation.value = newValue;
};

const messageVisible = ref(false);
const tooltipMessage = ref("");
const tooltipStyle = ref({});

const showMessage = (event, step) => {
  tooltipMessage.value = `Текущий шаг: ${step}`;
  messageVisible.value = true;
  const tooltipWidth = 100;
  const tooltipHeight = 30;
  const rect = event.currentTarget.getBoundingClientRect();
  tooltipStyle.value = {
    top: `${rect.bottom + window.scrollY}px`,
    left: `${rect.left + window.scrollX + rect.width / 2 - tooltipWidth / 2}px`,
    width: `${tooltipWidth}px`,
    height: `${tooltipHeight}px`,
  };
};

const hideMessage = () => {
  messageVisible.value = false;
};

const getInfo = async () => {
  chatsStation.value = "loading";
  try {
    const response = await axios.post(
      `${FRONTEND_URL}getInfo`,
      {
        source: selectedItem.value.source,
        login: selectedItem.value.login,
        type: selectedItem.value.type,
        storage: selectedItem.value.storage,
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
        "accountList",
        "getInfo",
        {
          source: selectedItem.value.source,
          login: selectedItem.value.login,
        },
        response.data.ok,
        response.data
      );
    }
    console.log(response.data);
    if (response.data.data) {
      if (response.data.data.step != null) {
        if (response.data.data.step.value === 5) {
          chatsStation.value = true;
        }
      } else {
        chatsStation.value = false;
      }
    } else if (response.data === 401) {
      errorBlock.value = true;
      setTimeout(() => {
        localStorage.removeItem("accountToken");
        router.push("/login");
      }, 2000);
    }
  } catch (error) {
    console.error("error:", error);
    if (error.response) {
      console.error("error", error.response.data);
    }
  }
};

onMounted(async () => {
  await chatStore.init();
  await getAccounts();
});

provide("selectedItems", { selectedItems });
provide("changeEnableStation", { changeEnableStation });
</script>

<style scoped>
.table-container {
  overflow-x: auto;
  overflow-y: auto;
  max-width: 100%;
  height: 80vh;
}

.table-container::-webkit-scrollbar {
  width: 6px;
}

.table-container::-webkit-scrollbar-track {
  background-color: var(--scrolBg);
}

.table-container::-webkit-scrollbar-thumb {
  background: var(--scrolColor);
  border-radius: 5px;
}

.tooltip {
  position: absolute;
  background: rgba(0, 0, 0, 0.75);
  color: #fff;
  padding: 5px 10px;
  border-radius: 5px;
  font-size: 12px;
  z-index: 10;
}

.table-header {
  top: 0;
  z-index: 1;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.bi-list {
  width: 16px;
  height: 16px;
  fill: currentColor;
  margin-bottom: -4px;
  margin-right: 6px;
}

.load-cont {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: -10px;
}

.none-account-cont {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  flex-direction: column;
  margin-top: 0px;
  height: 50px;
  width: 100%;
  background-color: var(--noAccountTableBg);
  border-radius: 5px;
}

.none-account-cont h2 {
  font-size: 14px;
  font-weight: 500;
  color: var(--noAccountTableText);
  margin-left: 10px;
}

.table-login {
  text-align: left;
  padding: 1rem;
  width: 200px;
}

.table-step {
  text-align: left;
  padding: 1rem;
  width: 220px;
}

.table-action {
  text-align: right;
  padding: 1rem;
  padding-right: 15px;
}

.table-text-number {
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
  box-sizing: border-box;
}

.table-text {
  padding: 1rem;
}

.table-action-text {
  padding: 1rem;
  text-align: right;
}

.action-table-button {
  background: oklch(0.65 0.22 267 / 0.16);
  font-weight: 600;
  font-size: 12px;
  padding: 10px 12px;
  color: oklch(0.4 0.18 267 / 0.86);
  margin-right: 10px;
  gap: 6px;
  transition: all 0.25s;
  border-radius: 5px;
  margin-right: -3px;
}

.action-table-button:hover {
  background: rgba(23, 30, 162, 0.2);
  transition: all 0.15s;
}

.action-table-button:active {
  background: rgba(0, 4, 78, 0.2);
  transition: all 0.15s;
}

th,
td {
  padding: 1rem;
  font-weight: 500;
  font-size: 11px;
  color: #6b7280;
}

td {
  font-weight: 500;
  font-size: 14px;
  color: #000;
  text-align: left;
}

tr:not(:last-child):after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 1px;
  background-color: #ebebeb;
}

@media (max-height: 900px) {
  .table-container {
    height: 74vh;
  }
}

@media (max-height: 660px) {
  .table-container {
    height: 78vh;
  }
}

@media (max-height: 600px) {
  .table-container {
    height: 76vh;
  }
}

@media (max-height: 550px) {
  .table-container {
    height: 74vh;
  }
}

@media (max-height: 500px) {
  .table-container {
    height: 70vh;
  }
}

@media (max-height: 450px) {
  .table-container {
    height: 66vh;
  }
}
</style>
