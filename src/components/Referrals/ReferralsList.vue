<template>
  <section class="account-list-section">
    <div class="table-container">
      <!-- Десктопная таблица -->
      <table class="table" v-if="accounts.length > 0">
        <thead class="table-header">
          <tr>
            <th class="table-login">{{ t("accountList.login") }}</th>
            <th class="table-status">СТАТУС</th>
            <th class="table-date">ДАТА РЕГИСТРАЦИИ</th>
            <th class="table-active">АКТИВЕН</th>
          </tr>
        </thead>
        <tbody class="tbody">
          <tr v-for="(item, index) in accounts" :key="index">
            <td class="table-text-number">{{ item.email }}</td>
            <td class="table-text">
              <span
                :class="[
                  'status-badge',
                  item.is_verified === '1' ? 'verified' : 'not-verified',
                ]"
              >
                {{
                  item.is_verified === "1" ? "Подтвержден" : "Не подтвержден"
                }}
              </span>
            </td>
            <td class="table-text">{{ formatDate(item.dt_ins) }}</td>
            <td class="table-text">
              <span
                :class="[
                  'status-badge',
                  item.enable === '1' ? 'active' : 'inactive',
                ]"
              >
                {{ item.enable === "1" ? "Да" : "Нет" }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Мобильные карточки -->
      <div class="mobile-cards" v-if="accounts.length > 0">
        <div
          v-for="(item, index) in accounts"
          :key="'mobile-' + index"
          class="mobile-card"
        >
          <div class="card-row">
            <span class="card-label">Email:</span>
            <span class="card-value">{{ item.email }}</span>
          </div>
          <div class="card-row">
            <span class="card-label">Статус:</span>
            <span class="card-value">
              <span
                :class="[
                  'status-badge',
                  item.is_verified === '1' ? 'verified' : 'not-verified',
                ]"
              >
                {{
                  item.is_verified === "1" ? "Подтвержден" : "Не подтвержден"
                }}
              </span>
            </span>
          </div>
          <div class="card-row">
            <span class="card-label">Дата регистрации:</span>
            <span class="card-value">{{ formatDate(item.dt_ins) }}</span>
          </div>
          <div class="card-row">
            <span class="card-label">Активен:</span>
            <span class="card-value">
              <span
                :class="[
                  'status-badge',
                  item.enable === '1' ? 'active' : 'inactive',
                ]"
              >
                {{ item.enable === "1" ? "Да" : "Нет" }}
              </span>
            </span>
          </div>
        </div>
      </div>

      <!-- Состояния загрузки и пустого списка -->
      <div v-if="loadDataStation" class="load-cont">
        <LoadAccount />
      </div>

      <div v-if="errorAccountBolean && !loadDataStation" class="load-cont">
        <errorAccount />
      </div>

      <div
        v-if="!loadDataStation && !errorAccountBolean && accounts.length === 0"
        class="none-account-cont"
      >
        <h2>У вас пока нет рефералов</h2>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, reactive, onMounted, provide, inject, computed } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";
const FRONTEND_URL_USERS = import.meta.env.VITE_FRONTEND_URL_USERS;
const FRONTEND_URL_VENDORS = import.meta.env.VITE_FRONTEND_URL_VENDORS;

const props = defineProps({
  changeUsersCount: {
    type: Function,
  },
});

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

const errorBlock = ref(false);
const chaneErrorBlock = () => {
  errorBlock.value = !errorBlock.value;
};

function decodeJWT(token) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) throw new Error("Invalid JWT format");

    const payload = parts[1];
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("JWT decode error:", e);
    return null;
  }
}

// Функция для форматирования даты
const formatDate = (dateString) => {
  if (!dateString) return "-";

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (e) {
    console.error("Date formatting error:", e);
    return dateString;
  }
};

// const getAccounts = async () => {
//   loadDataStation.value = true;
//   errorAccountBolean.value = false;

//   // ЗАГЛУШКА - используем моковые данные
//   console.log("Using mock data for referrals");

//   // Имитируем задержку сети
//   await new Promise((resolve) => setTimeout(resolve, 1000));

//   const mockData = {
//     ok: true,
//     message: "Referrals received",
//     data: {
//       referrals: [
//         {
//           email: "entitled3265@tiffincrane.com",
//           is_verified: "1",
//           dt_ins: "2025-09-24 19:48:30",
//           enable: "1",
//         },
//         {
//           email: "entitled3265@tiffincrane.com",
//           is_verified: "1",
//           dt_ins: "2025-09-24 19:48:30",
//           enable: "1",
//         },
//         {
//           email: "entitled3265@tiffincrane.com",
//           is_verified: "1",
//           dt_ins: "2025-09-24 19:48:30",
//           enable: "1",
//         },
//         {
//           email: "entitled3265@tiffincrane.com",
//           is_verified: "1",
//           dt_ins: "2025-09-24 19:48:30",
//           enable: "1",
//         },
//         {
//           email: "entitled3265@tiffincrane.com",
//           is_verified: "1",
//           dt_ins: "2025-09-24 19:48:30",
//           enable: "1",
//         },
//         {
//           email: "testuser1@example.com",
//           is_verified: "0",
//           dt_ins: "2025-09-23 14:20:15",
//           enable: "1",
//         },
//         {
//           email: "john.doe@mail.com",
//           is_verified: "1",
//           dt_ins: "2025-09-22 10:05:45",
//           enable: "0",
//         },
//       ],
//       referrals_count: 3,
//     },
//   };

//   if (mockData.ok) {
//     accounts.value = mockData.data.referrals || [];
//     console.log("Mock referrals data loaded:", accounts.value.length, "items");
//   } else {
//     console.error("Mock data error:", mockData.message);
//     errorAccountBolean.value = true;
//   }

//   loadDataStation.value = false;
// };

const getAccounts = async () => {
  loadDataStation.value = true;
  errorAccountBolean.value = false;

  try {
    const response = await axios.get(`${FRONTEND_URL_USERS}getAllReferrals`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.value}`,
      },
    });

    if (response.data.ok) {
      // Теперь данные приходят в response.data.data.referrals

      props.changeUsersCount(response.data.data.referrals_count);
      accounts.value = response.data.data.referrals || [];
      console.log("Referrals data:", accounts.value);
    } else {
      console.error("API response not OK:", response.data.message);
      errorAccountBolean.value = true;
    }
  } catch (error) {
    console.error("Error fetching accounts:", error);
    errorAccountBolean.value = true;
  } finally {
    loadDataStation.value = false;
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
.account-list-section {
  width: 100%;
  display: flex;
  flex-direction: column;
  height: 50vh; /* Фиксированная высота */
}

.table-container {
  flex: 1;
  overflow: auto;
  min-height: 0; /* Важно для flex-контейнеров */
}

/* Стили таблицы */
.table {
  width: 100%;
  border-collapse: collapse;
}

.table-header {
  position: sticky;
  top: 0;
  background: white;
  z-index: 2;
}

.table-login {
  width: 35%;
  padding: 1rem;
  text-align: left;
}
.table-status {
  width: 20%;
  padding: 1rem;
  text-align: left;
}
.table-date {
  width: 25%;
  padding: 1rem;
  text-align: left;
}
.table-active {
  width: 20%;
  padding: 1rem;
  text-align: left;
}

th {
  padding: 1rem;
  font-weight: 600;
  font-size: 12px;
  color: #374151;
  background-color: #f9fafb;
  border-bottom: 2px solid #e5e7eb;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

td {
  padding: 1rem;
  font-weight: 500;
  font-size: 14px;
  color: #000;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

tr:hover {
  background-color: #f9fafb;
}

/* Стили статусов */
.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  display: inline-block;
  text-align: center;
  min-width: 100px;
}

.status-badge.verified {
  background-color: #d1fae5;
  color: #065f46;
}

.status-badge.not-verified {
  background-color: #fee2e2;
  color: #991b1b;
}

.status-badge.active {
  background-color: #d1fae5;
  color: #065f46;
}

.status-badge.inactive {
  background-color: #f3f4f6;
  color: #6b7280;
}

/* Мобильные карточки */
.mobile-cards {
  display: none;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
}

.mobile-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.card-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f3f4f6;
}

.card-row:last-child {
  border-bottom: none;
}

.card-label {
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  min-width: 100px;
}

.card-value {
  font-size: 14px;
  font-weight: 500;
  color: #000;
  text-align: right;
  flex: 1;
}

.card-value .status-badge {
  min-width: 80px;
  font-size: 11px;
}

/* Состояния загрузки */
.load-cont,
.none-account-cont {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
}

.none-account-cont {
  background-color: var(--noAccountTableBg);
  border-radius: 5px;
}

.none-account-cont h2 {
  font-size: 14px;
  font-weight: 500;
  color: var(--noAccountTableText);
}

/* Скролл */
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

/* Медиа-запросы */
@media (max-width: 768px) {
  .table {
    display: none;
  }

  .mobile-cards {
    display: flex;
  }

  .account-list-section {
    height: 60vh; /* Чуть больше на мобилках */
  }
}
</style>
