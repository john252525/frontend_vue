<template>
  <section class="referral-section">
    <!-- Кнопки переключения -->
    <div class="tab-switcher">
      <button
        @click="activeTab = 'referrals'"
        :class="['tab-button', { active: activeTab === 'referrals' }]"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
        Рефералы
      </button>
      <button
        @click="activeTab = 'payments'"
        :class="['tab-button', { active: activeTab === 'payments' }]"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
          <path d="M1 10h22" />
        </svg>
        Платежи
      </button>
    </div>

    <!-- Таблица рефералов -->
    <div class="table-container" v-if="activeTab === 'referrals'">
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

    <!-- Таблица платежей -->
    <div class="table-container" v-if="activeTab === 'payments'">
      <table class="table" v-if="payments.length > 0">
        <thead class="table-header">
          <tr>
            <th class="table-email">EMAIL</th>
            <th class="table-amount">СУММА</th>
            <th class="table-status">СТАТУС</th>
            <th class="table-date">ДАТА</th>
          </tr>
        </thead>
        <tbody class="tbody">
          <tr v-for="(item, index) in payments" :key="index">
            <td class="table-text">{{ item.email }}</td>
            <td class="table-text">
              {{ formatCurrency(item.reward_amount) }}
            </td>
            <td class="table-text">
              <span
                :class="['status-badge', getPaymentStatusClass(item.status)]"
              >
                {{ getPaymentStatusText(item.status) }}
              </span>
            </td>
            <td class="table-text">{{ formatDate(item.created_at) }}</td>
          </tr>
        </tbody>
      </table>

      <div class="mobile-cards" v-if="payments.length > 0">
        <div
          v-for="(item, index) in payments"
          :key="'mobile-payment-' + index"
          class="mobile-card"
        >
          <div class="card-row">
            <span class="card-label">Email:</span>
            <span class="card-value">{{ item.email }}</span>
          </div>
          <div class="card-row">
            <span class="card-label">Сумма:</span>
            <span class="card-value">{{
              formatCurrency(item.reward_amount)
            }}</span>
          </div>
          <div class="card-row">
            <span class="card-label">Статус:</span>
            <span class="card-value">
              <span
                :class="['status-badge', getPaymentStatusClass(item.status)]"
              >
                {{ getPaymentStatusText(item.status) }}
              </span>
            </span>
          </div>
          <div class="card-row">
            <span class="card-label">Дата:</span>
            <span class="card-value">{{ formatDate(item.created_at) }}</span>
          </div>
        </div>
      </div>

      <div v-if="loadPayments" class="load-cont">
        <LoadAccount />
      </div>

      <div v-if="errorPaymentsBolean && !loadPayments" class="load-cont">
        <errorAccount />
      </div>

      <div
        v-if="!loadPayments && !errorPaymentsBolean && payments.length === 0"
        class="none-account-cont"
      >
        <h2>У вас пока нет платежей</h2>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import axios from "axios";
import { useAccountStore } from "@/stores/accountStore";
import { useI18n } from "vue-i18n";
import LoadAccount from "../Accounts/Accounts/LoadAccount.vue";
import errorAccount from "@/components/Mailing/MailingList/errorAccount.vue";

const { t } = useI18n();
const accountStore = useAccountStore();
const token = computed(() => accountStore.getAccountToken);

const FRONTEND_URL_USERS = import.meta.env.VITE_FRONTEND_URL_USERS;
const API_URL = "https://api22.developtech.ru/api";

const props = defineProps({
  changeUsersCount: {
    type: Function,
  },
});

// Состояние вкладок
const activeTab = ref("referrals");

// Рефералы
const accounts = ref([]);
const loadDataStation = ref(false);
const errorAccountBolean = ref(false);

// Платежи
const payments = ref([]);
const loadPayments = ref(false);
const errorPaymentsBolean = ref(false);

// Форматирование даты
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

// Форматирование валюты
const formatCurrency = (value) => {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    minimumFractionDigits: 2,
  }).format(value);
};

// Получение текста статуса платежа
const getPaymentStatusText = (status) => {
  const statusMap = {
    applied: "Применен",
    pending: "Ожидание",
    rejected: "Отклонен",
    completed: "Завершен",
  };
  return statusMap[status] || status;
};

// Получение класса статуса платежа
const getPaymentStatusClass = (status) => {
  const classMap = {
    applied: "applied",
    pending: "pending",
    rejected: "rejected",
    completed: "completed",
  };
  return classMap[status] || "pending";
};

// Получение рефералов
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

// Получение платежей
const getPayments = async () => {
  loadPayments.value = true;
  errorPaymentsBolean.value = false;

  try {
    const response = await axios.post(
      `${API_URL}/referrals/history`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.value}`,
        },
      }
    );

    if (response.data.success) {
      payments.value = response.data.data || [];
      console.log("Payments data:", payments.value);
    } else {
      console.error("API response not OK:", response.data.message);
      errorPaymentsBolean.value = true;
    }
  } catch (error) {
    console.error("Error fetching payments:", error);
    errorPaymentsBolean.value = true;
  } finally {
    loadPayments.value = false;
  }
};

onMounted(async () => {
  await getAccounts();
  await getPayments();
});
</script>

<style scoped>
.referral-section {
  width: 100%;
  display: flex;
  flex-direction: column;
  height: 50vh;
  gap: 16px;
  padding: 20px;
  box-sizing: border-box;
}

/* Переключатель вкладок */
.tab-switcher {
  display: flex;
  gap: 8px;
  width: fit-content;
  background: white;
  box-sizing: border-box;
  padding: 6px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #e5e7eb;
}

.tab-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  border: none;
  background: transparent;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.tab-button:hover {
  background: #f3f4f6;
  color: #1f2937;
}

.tab-button.active {
  background: oklch(0.541 0.198 267);
  color: white;
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
}

.tab-button svg {
  width: 18px;
  height: 18px;
}

/* Таблица */
.table-container {
  flex: 1;
  overflow: auto;
  min-height: 0;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

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

th {
  padding: 14px 16px;
  font-weight: 700;
  font-size: 11px;
  color: #374151;
  background-color: #f9fafb;
  border-bottom: 2px solid #e5e7eb;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  text-align: left;
}

td {
  padding: 14px 16px;
  font-weight: 500;
  font-size: 14px;
  color: #000;
  text-align: left;
  border-bottom: 1px solid #f3f4f6;
}

tbody tr:hover {
  background-color: #fafbff;
}

.table-login,
.table-email {
  width: 35%;
}

.table-status,
.table-amount {
  width: 20%;
}

.table-date {
  width: 25%;
}

.table-active {
  width: 20%;
}

/* Статусы */
.status-badge {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  display: inline-block;
  text-align: center;
  min-width: 100px;
}

.status-badge.verified,
.status-badge.applied,
.status-badge.completed,
.status-badge.active {
  background-color: #dcfce7;
  color: #15803d;
}

.status-badge.not-verified,
.status-badge.rejected,
.status-badge.inactive {
  background-color: #fee2e2;
  color: #991b1b;
}

.status-badge.pending {
  background-color: #fef3c7;
  color: #92400e;
}

/* Мобильные карточки */
.mobile-cards {
  display: none;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  overflow-y: auto;
}

.mobile-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.card-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f3f4f6;
}

.card-row:last-child {
  border-bottom: none;
}

.card-label {
  font-size: 12px;
  font-weight: 700;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.card-value {
  font-size: 14px;
  font-weight: 600;
  color: #000;
  text-align: right;
}

/* Состояния загрузки */
.load-cont,
.none-account-cont {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  background-color: #fafbff;
}

.none-account-cont h2 {
  font-size: 16px;
  font-weight: 600;
  color: #6b7280;
}

/* Скролл */
.table-container::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.table-container::-webkit-scrollbar-track {
  background-color: #f3f4f6;
}

.table-container::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

.table-container::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

/* Медиа-запросы */
@media (max-width: 1024px) {
  .referral-section {
    padding: 16px;
    gap: 14px;
  }

  .tab-switcher {
    width: 100%;
  }

  .tab-button {
    flex: 1;
  }
}

@media (max-width: 768px) {
  .table {
    display: none;
  }

  .mobile-cards {
    display: flex;
  }

  .referral-section {
    padding: 12px;
    gap: 12px;
  }

  .tab-switcher {
    width: 100%;
    gap: 6px;
    padding: 4px;
  }

  .tab-button {
    flex: 1;
    padding: 12px 8px;
    font-size: 13px;
    gap: 6px;
  }

  .tab-button svg {
    display: none;
  }

  th {
    padding: 10px 12px;
    font-size: 10px;
  }

  td {
    padding: 10px 12px;
    font-size: 13px;
  }

  .status-badge {
    padding: 4px 8px;
    font-size: 11px;
    min-width: 80px;
  }

  .mobile-card {
    padding: 12px;
  }

  .card-label {
    font-size: 11px;
  }

  .card-value {
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .referral-section {
    padding: 10px;
    gap: 10px;
  }

  .tab-switcher {
    width: 100%;
  }

  .tab-button {
    padding: 10px 6px;
    font-size: 12px;
  }

  .mobile-card {
    padding: 10px;
    border-radius: 8px;
  }

  .card-row {
    padding: 8px 0;
  }

  .card-label {
    font-size: 10px;
  }

  .card-value {
    font-size: 12px;
  }

  .none-account-cont h2 {
    font-size: 14px;
  }
}
</style>
