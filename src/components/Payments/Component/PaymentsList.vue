<template>
  <section class="account-list-section">
    <div class="table-container">
      <table class="table">
        <thead class="table-header">
          <tr>
            <th class="table-login">ID</th>
            <th class="table-type">{{ t("paymentList.type") }}</th>
            <th class="table-step">{{ t("paymentList.sum") }}</th>
            <th class="table-status">{{ t("paymentList.date") }}</th>
            <th class="table-action">{{ t("paymentList.status.table") }}</th>
          </tr>
        </thead>
        <tbody class="tbody">
          <tr
            v-if="paymentsLoadingStation.dataStation"
            v-for="(item, index) in payments"
            :key="index"
          >
            <td class="name-pay">{{ getPaymentSystem(item.public_id) }}</td>
            <td class="table-type-text" :class="getTypeClass(item.type)">
              {{ getTypeText(item.type) }}
            </td>
            <td class="table-text">{{ removeDecimalZeros(item.amount) }} ₽</td>
            <td class="table-text">{{ formatDate(item.dt_ins) }}</td>
            <td
              class="table-status-text"
              :class="getStatusClass(item.public_status, item.type)"
            >
              <template v-if="item.type === 'c' && item.public_status">
                <button
                  class="check-button"
                  @click="openCheck(item.public_status)"
                  :title="item.public_status"
                >
                  Открыть чек
                </button>
              </template>
              <template v-else>
                {{ getStatusText(item.public_status, item.type) }}
              </template>
            </td>
          </tr>
          <tr v-else-if="paymentsLoadingStation.dataStationNone">
            <td colspan="5">
              <div class="none-account-cont">
                <h2>Tранзакций нет</h2>
              </div>
            </td>
          </tr>
          <tr v-if="paymentsLoadingStation.loadDataStation">
            <td colspan="5">
              <div class="load-cont">
                <LoadAccount />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from "vue";
import axios from "axios";
import { useI18n } from "vue-i18n";
const { t } = useI18n();
import LoadAccount from "/src/components/Accounts/Accounts/LoadAccount.vue";

const payments = ref([]);
const fetchError = ref(null);
const apiUrl = import.meta.env.VITE_PAY_URL;

const paymentsLoadingStation = reactive({
  dataStationNone: false,
  dataStation: false,
  loadDataStation: false,
});

import { useAccountStore } from "@/stores/accountStore";
const accountStore = useAccountStore();
const token = computed(() => accountStore.getAccountToken);

const fetchPayments = async () => {
  paymentsLoadingStation.loadDataStation = true;
  fetchError.value = null;

  try {
    const response = await axios.get(`${apiUrl}/getPaymentsList`, {
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
    });

    if (response.data && response.data.data.length > 0) {
      payments.value = response.data.data;
      paymentsLoadingStation.loadDataStation = false;
      paymentsLoadingStation.dataStation = true;
    } else {
      paymentsLoadingStation.loadDataStation = false;
      paymentsLoadingStation.dataStationNone = true;
    }
  } catch (error) {
    paymentsLoadingStation.loadDataStation = false;
    paymentsLoadingStation.dataStationNone = true;
    console.error("error", error);
    fetchError.value = error.response
      ? error.response.data.message || "Неизвестная ошибка"
      : "Ошибка сети";
  }
};

// Функция для открытия чека
function openCheck(url) {
  if (url && (url.startsWith("http://") || url.startsWith("https://"))) {
    window.open(url, "_blank");
  } else if (url) {
    // Если URL без протокола, добавляем https://
    window.open(`https://${url}`, "_blank");
  }
}

function removeDecimalZeros(value) {
  return value.toString().replace(/\.00$/, "");
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function getPaymentSystem(system) {
  const systems = {
    yookassa: "YooKassa",
    check: "Чек",
    // Добавьте другие платежные системы по мере необходимости
  };
  return systems[system] || system;
}

// Функция для получения текста типа транзакции через switch case
function getTypeText(type) {
  switch (type) {
    case "+":
      return "Пополнение";
    case "-":
      return "Списание";
    case "c":
      return "Чек";
    // Добавьте другие типы по мере необходимости
    // case "transfer":
    //   return "Перевод";
    // case "refund":
    //   return "Возврат";
    default:
      return "Неизвестно";
  }
}

// Функция для получения класса типа транзакции через switch case
function getTypeClass(type) {
  switch (type) {
    case "+":
      return "type-income";
    case "-":
      return "type-outcome";
    case "c":
      return "type-check";
    // Добавьте другие типы по мере необходимости
    // case "transfer":
    //   return "type-transfer";
    // case "refund":
    //   return "type-refund";
    default:
      return "type-unknown";
  }
}

// Обновленная функция для получения класса статуса
function getStatusClass(state, type) {
  if (type === "c") {
    return "check-status";
  }

  switch (state) {
    case "Пополнение завершено": // Успешный платеж
      return "succeeded";
    case "Ошибка обработки платежа": // Ошибка
      return "canceled";
    case "Ожидание оплаты": // В обработке
      return "pending";
    case "Успешная покупка":
      return "succeeded";
    case "Недостаточно средств":
      return "canceled";
    default:
      return "pending";
  }
}

// Обновленная функция для получения текста статуса
function getStatusText(state, type) {
  if (type === "c") {
    return "Чек создан";
  }

  switch (state) {
    case "Пополнение завершено":
      return t("paymentList.status.succeeded");
    case "Платеж отменен":
      return t("paymentList.status.canceled");
    case "Ошибка обработки платежа":
      return t("paymentList.status.error");
    case "Успешная покупка":
      return "Успешная покупка";
    case "Недостаточно средств":
      return "Недостаточно средств";
    default:
      return t("paymentList.status.pending");
  }
}

onMounted(fetchPayments);
</script>
<style scoped>
.account-list-section {
  overflow: hidden; /* Это предотвратит появление скролла для всей секции */
  height: 100%;
}

.table-container {
  overflow-x: auto;
  overflow-y: auto;
  height: 83vh;
}

.table-header {
  position: sticky;
  top: 0;
  z-index: 1;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.bi-list {
  width: 16px; /* Ширина и высота иконки */
  height: 16px;
  fill: currentColor; /* Использует текущий цвет текста */
  margin-bottom: -4px;
  margin-right: 6px;
}

.loading-data-text {
  font-weight: 600;
  font-size: 14px;
  color: #000000;
  margin-top: 20px;
  text-align: center;
  padding: 10px;
  background-color: #efefef;
  border-radius: 6px;
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
  color: #ffffff;
  margin-left: 10px;
}

.table-login {
  text-align: left;
  padding: 1rem;
}

.table-type {
  text-align: left;
  padding: 1rem;
}

.load-cont {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: -10px;
}

.accout-load-cont {
  width: 100%;
}

.table-step {
  text-align: left;
  padding: 1rem;
}

.table-status {
  text-align: left;
  padding: 1rem;
}

.table-action {
  text-align: left;
  padding: 1rem;
  padding-right: 15px;
}

/* Стили для типов транзакций */
.type-income {
  color: rgb(39, 146, 39);
  font-weight: 500;
}

.type-outcome {
  color: rgb(253, 86, 86);
  font-weight: 500;
}

.type-check {
  color: rgb(65, 105, 225);
  font-weight: 500;
}

.type-transfer {
  color: rgb(65, 105, 225);
  font-weight: 500;
}

.type-refund {
  color: rgb(255, 165, 0);
  font-weight: 500;
}

.type-unknown {
  color: gray;
  font-weight: 500;
}

/* Стили для статусов */
.canceled {
  color: rgb(253, 86, 86);
}

.succeeded {
  color: rgb(39, 146, 39);
}

.pending {
  color: gray;
}

.check-status {
  color: rgb(65, 105, 225);
}

/* Стиль для кнопки открытия чека */
.check-button {
  background: rgb(65, 105, 225);
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.check-button:hover {
  background: rgb(54, 88, 189);
}

.check-button:active {
  background: rgb(45, 74, 158);
}

.table-login {
  width: 25%;
}

.table-type {
  width: 15%;
}

.table-step {
  width: 20%;
}

.table-status {
  width: 20%;
}

.table-action {
  width: 20%;
}

.table-text-number {
  padding: 1rem;
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

.table-status-text {
  text-align: left;
}

.table-type-text {
  padding: 1rem;
  text-align: left;
}

.table-text {
  padding: 1rem;
}

.name-pay {
  padding: 1rem;
  font-weight: 500;
}

.table-state {
  padding: 1rem;
  text-align: left;
  color: rgb(211, 59, 59);
}

.table-state-active {
  padding: 1rem;
  text-align: left;
  color: rgb(32, 179, 40);
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

.action-table-button-phone {
  display: none;
}

.action-table-button:hover {
  background: rgba(23, 30, 162, 0.2);
  transition: all 0.15s;
}

.action-table-button:active {
  background: rgba(0, 4, 78, 0.2);
  transition: all 0.15s;
}

.action-table-button img {
  margin-right: 10px;
}

th,
td {
  padding: 1rem;
  font-weight: 500;
  font-size: 11px;
  color: #6b7280;
}

td {
  font-weight: 400;
  font-size: 14px;
  color: #000;
  text-align: left;
}

tr {
  position: relative; /* Позволяет псевдоэлементу позиционироваться относительно строки */
}

tr:not(:last-child):after {
  content: ""; /* Создает пустой контент для псевдоэлемента */
  position: absolute; /* Абсолютное позиционирование относительно строки */
  left: 0;
  right: 0;
  bottom: 0; /* Позиционируем линию внизу строки */
  height: 1px; /* Высота линии */
  background-color: #ebebeb;
}

tr:hover {
  background-color: var(--tableHover);
}

@media (max-width: 700px) {
  .table-login {
    width: 20%;
  }

  .table-type {
    width: 15%;
  }

  .table-step {
    width: 15%;
  }

  .table-status {
    width: 30%;
  }

  .table-action {
    width: 20%;
  }

  .check-button {
    padding: 4px 8px;
    font-size: 11px;
  }
}
</style>
