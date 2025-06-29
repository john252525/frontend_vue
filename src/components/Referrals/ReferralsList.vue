<template>
  <section class="account-list-section">
    <div class="table-container">
      <table class="table">
        <thead class="table-header">
          <tr>
            <th class="table-login">{{ t("accountList.login") }}</th>
          </tr>
        </thead>
        <tbody class="tbody">
          <tr v-if="dataStation" v-for="(item, index) in accounts" :key="index">
            <td class="table-text-number">{{ item.login }}</td>
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

    <ErrorBlock v-if="errorBlock" :changeIncorrectPassword="chaneErrorBlock" />
  </section>
</template>

<script setup>
import { ref, reactive, onMounted, provide, inject, computed } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";
import LoadingAccount from "../Accounts/Accounts/LoadingMoadal/LoadingAccount.vue";
import ErrorBlock from "@/components/ErrorBlock/ErrorBlock.vue";
import errorAccount from "@/components/Mailing/MailingList/errorAccount.vue";
import LoadAccount from "../Accounts/Accounts/LoadAccount.vue";
import { useAccountStore } from "@/stores/accountStore";
const accountStore = useAccountStore();
const token = computed(() => accountStore.getAccountToken);
const accountStation = computed(() => accountStore.getAccountStation);

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
const accounts = ref([
  {
    id: "245",
    uuid: "e183462c-0e5a-4ea1-8cfe-ee260bc526ae",
    dt_ins: "2025-06-26 21:53:16",
    type: "frontend_vue",
    token: "32d4f3ca2e781add555730b56de15ed3",
    login: "maksim.birukov.2007@mail.ru",
    source: "",
    enable: "1",
  },
]);
const isModalOpen = ref(false);
const modalPosition = ref({ top: 0, left: 0 });
const selectedItem = ref(null);
const selectedItems = ref(null);
const loadingStation = ref(false);
const chatsStation = ref(null);

import useFrontendLogger from "@/composables/useFrontendLogger";
import False from "@/components/Chats/UserList/ResultModal/False.vue";
const { sendLog } = useFrontendLogger();

const errorBlock = ref(false);
const chaneErrorBlock = () => {
  errorBlock.value = !errorBlock.value;
};

const getAccounts = async () => {
  //   let params = {
  //     source: accountStation.value,
  //     skipDetails: true,
  //   };

  //   if (stationDomain.navigate.value !== "whatsapi") {
  //     params = {
  //       source: accountStation.value,
  //       skipDetails: true,
  //     };
  //   } else {
  //     params = {
  //       skipDetails: true,
  //     };
  //   }

  loadDataStation.value = true;
  try {
    const response = await axios.post(
      "https://b2288.developtech.ru/api/v1/vendors/getByIds",
      {
        vendor_ids: [245],
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.value}`,
        },
      }
    );

    if (response.data.ok === true) {
      loadDataStation.value = false;
      accounts.value = JSON.stringify(response.data.data.vendors);
      console.log(response.data.data);
      console.log(response.data.data.vendors);
    }
  } catch (error) {
    loadDataStation.value = false;
    errorAccountBolean.value = true;
    console.error("Error:", error);
  }
};

const updateUserInfo = (event) => {
  userInfoStore.setUserInfo(event);
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

onMounted(async () => {
  await chatStore.init();
  await getAccounts();
});
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
