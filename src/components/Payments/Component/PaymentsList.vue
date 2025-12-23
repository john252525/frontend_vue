<template>
  <section class="account-list-section">
    <!-- Desktop Table View -->
    <div class="table-container desktop-view">
      <table class="table">
        <thead class="table-header">
          <tr>
            <th class="table-login">{{ t("paymentList.id") }}</th>
            <th class="table-type">{{ t("paymentList.sum") }}</th>
            <th class="table-step">{{ t("paymentList.operationType") }}</th>
            <th class="table-status">{{ t("paymentList.statusType") }}</th>
            <th class="table-action">{{ t("paymentList.action") }}</th>
          </tr>
        </thead>
        <tbody class="tbody">
          <tr
            v-if="paymentsLoadingStation.dataStation"
            v-for="(item, index) in payments"
            :key="index"
          >
            <td class="name-pay">{{ item.public_id }}</td>
            <td class="table-text">{{ removeDecimalZeros(item.amount) }} ₽</td>
            <td
              class="table-text"
              :class="getOperationTypeClass(item.payment_type, item.type)"
            >
              {{ getOperationType(item.payment_type, item.type) }}
            </td>
            <td
              class="table-status-text"
              :class="getStatusClass(item.payment_type, item.public_status)"
            >
              {{ getDisplayStatus(item.payment_type, item.public_status) }}
            </td>
            <td class="table-action-text">
              <button class="details-button" @click="openPaymentModal(item)">
                {{ t("paymentList.details") }}
              </button>
            </td>
          </tr>
          <tr v-else-if="paymentsLoadingStation.dataStationNone">
            <td colspan="5">
              <div class="none-account-cont">
                <h2>{{ t("paymentList.noTransactions") }}</h2>
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

    <!-- Mobile Card View -->
    <div class="mobile-view">
      <div v-if="paymentsLoadingStation.dataStation" class="cards-container">
        <div
          v-for="(item, index) in payments"
          :key="index"
          class="payment-card"
        >
          <div class="card-header">
            <div class="card-id">
              <span class="id-label">{{ t("paymentList.idLabel") }}:</span>
              <span class="id-value">{{ item.public_id }}</span>
            </div>
            <div class="card-title">
              <span
                class="card-amount"
                :class="getAmountClass(item.payment_type, item.type)"
              >
                {{ removeDecimalZeros(item.amount) }} ₽
              </span>
            </div>
          </div>

          <div class="card-content">
            <div class="card-row">
              <span class="card-label"
                >{{ t("paymentList.operationType") }}:</span
              >
              <span
                class="card-value"
                :class="getOperationTypeClass(item.payment_type, item.type)"
              >
                {{ getOperationType(item.payment_type, item.type) }}
              </span>
            </div>

            <div class="card-row">
              <span class="card-label">{{ t("paymentList.date") }}:</span>
              <span class="card-value">{{ formatDate(item.dt_ins) }}</span>
            </div>

            <div class="card-row">
              <span class="card-label">{{ t("paymentList.status") }}:</span>
              <span
                class="card-value"
                :class="getStatusClass(item.payment_type, item.public_status)"
              >
                {{ getDisplayStatus(item.payment_type, item.public_status) }}
              </span>
            </div>
          </div>

          <div class="card-footer">
            <button
              class="details-button-mobile"
              @click="openPaymentModal(item)"
            >
              {{ t("paymentList.viewDetails") }}
            </button>
          </div>
        </div>
      </div>

      <div v-else-if="paymentsLoadingStation.dataStationNone" class="no-data">
        <h2>{{ t("paymentList.noTransactions") }}</h2>
      </div>

      <div v-if="paymentsLoadingStation.loadDataStation" class="load-cont">
        <LoadAccount />
      </div>
    </div>

    <!-- Payment Details Modal -->
    <div v-if="showModal" class="modal-overlay" @click="closePaymentModal">
      <div class="modal-content" @click.stop>
        <button class="modal-close" @click="closePaymentModal">✕</button>

        <div class="modal-header">
          <h2>{{ t("paymentList.paymentDetails") }}</h2>
          <p class="modal-id">
            {{ t("paymentList.idLabel") }}: {{ selectedPayment.public_id }}
          </p>
        </div>

        <div class="modal-body">
          <!-- Admin Payment Type -->
          <template v-if="selectedPayment.payment_type === 'admin'">
            <div class="detail-row">
              <label>{{ t("paymentList.operationType") }}:</label>
              <span>{{
                selectedPayment.type === "+"
                  ? t("paymentList.replenishment")
                  : t("paymentList.debit")
              }}</span>
            </div>

            <div class="detail-row">
              <label>{{ t("paymentList.sum") }}:</label>
              <span>{{ removeDecimalZeros(selectedPayment.amount) }} ₽</span>
            </div>

            <div class="detail-row">
              <label>{{ t("paymentList.previousBalance") }}:</label>
              <span>{{ parsedAdminDetails.previous_balance }} ₽</span>
            </div>

            <div class="detail-row">
              <label>{{ t("paymentList.newBalance") }}:</label>
              <span>{{ parsedAdminDetails.new_balance }} ₽</span>
            </div>

            <div class="detail-row">
              <label>{{ t("paymentList.date") }}:</label>
              <span>{{ formatDate(selectedPayment.dt_ins) }}</span>
            </div>

            <div class="detail-row">
              <label>{{ t("paymentList.changedBy") }}:</label>
              <span>{{ t("paymentList.byAdmin") }}</span>
            </div>

            <div class="detail-row">
              <label>{{ t("paymentList.clarification") }}:</label>
              <span>{{ selectedPayment.message }}</span>
            </div>

            <div class="modal-actions">
              <button
                class="action-button secondary"
                @click="closePaymentModal"
              >
                {{ t("paymentList.close") }}
              </button>
            </div>
          </template>

          <!-- Check Payment Type -->
          <template v-else-if="selectedPayment.payment_type === 'check'">
            <div class="detail-row">
              <label>{{ t("paymentList.sum") }}:</label>
              <span>{{ removeDecimalZeros(selectedPayment.amount) }} ₽</span>
            </div>

            <div class="detail-row">
              <label>{{ t("paymentList.date") }}:</label>
              <span>{{ formatDate(selectedPayment.dt_ins) }}</span>
            </div>

            <div class="detail-row">
              <label>{{ t("paymentList.status") }}:</label>
              <span
                :class="
                  getStatusClass(
                    selectedPayment.payment_type,
                    selectedPayment.public_status
                  )
                "
              >
                {{ selectedPayment.public_status }}
              </span>
            </div>

            <div v-if="selectedPayment.link" class="modal-actions">
              <button class="action-button primary" @click="openCheckLink">
                {{ t("paymentList.openInvoice") }}
              </button>
              <button
                class="action-button secondary"
                @click="closePaymentModal"
              >
                {{ t("paymentList.close") }}
              </button>
            </div>
            <div v-else class="modal-actions">
              <button
                class="action-button secondary"
                @click="closePaymentModal"
              >
                {{ t("paymentList.close") }}
              </button>
            </div>
          </template>

          <!-- Up Payment Type -->
          <template v-else-if="selectedPayment.payment_type === 'up'">
            <div class="detail-row">
              <label>{{ t("paymentList.sum") }}:</label>
              <span>{{ removeDecimalZeros(selectedPayment.amount) }} ₽</span>
            </div>

            <div class="detail-row">
              <label>{{ t("paymentList.date") }}:</label>
              <span>{{ formatDate(selectedPayment.dt_ins) }}</span>
            </div>

            <div class="detail-row">
              <label>{{ t("paymentList.status") }}:</label>
              <span
                :class="
                  getStatusClass(
                    selectedPayment.payment_type,
                    selectedPayment.public_status
                  )
                "
              >
                {{ selectedPayment.public_status }}
              </span>
            </div>

            <div
              v-if="selectedPayment.link && isPaymentActive"
              class="modal-actions"
            >
              <button class="action-button primary" @click="goToPayment">
                {{ t("paymentList.goToPayment") }}
              </button>
              <button
                class="action-button secondary"
                @click="closePaymentModal"
              >
                {{ t("paymentList.close") }}
              </button>
            </div>
            <div v-else class="modal-actions">
              <button
                class="action-button secondary"
                @click="closePaymentModal"
              >
                {{ t("paymentList.close") }}
              </button>
            </div>
          </template>

          <!-- Tariff Payment Type -->
          <template v-else-if="selectedPayment.payment_type === 'tariff'">
            <div class="detail-row">
              <label>{{ t("paymentList.tariff") }}:</label>
              <span>{{
                parsedTariffDetails.title || t("paymentList.notSpecified")
              }}</span>
            </div>

            <div class="detail-row">
              <label>{{ t("paymentList.sum") }}:</label>
              <span>{{ removeDecimalZeros(selectedPayment.amount) }} ₽</span>
            </div>

            <div class="detail-row">
              <label>{{ t("paymentList.period") }}:</label>
              <span>{{ getPeriodText(parsedTariffDetails.period) }}</span>
            </div>

            <div class="detail-row">
              <label>{{ t("paymentList.currency") }}:</label>
              <span>{{ parsedTariffDetails.currency }}</span>
            </div>

            <div class="detail-row">
              <label>{{ t("paymentList.date") }}:</label>
              <span>{{ formatDate(selectedPayment.dt_ins) }}</span>
            </div>

            <div class="detail-row">
              <label>{{ t("paymentList.status") }}:</label>
              <span
                :class="
                  getStatusClass(
                    selectedPayment.payment_type,
                    selectedPayment.public_status
                  )
                "
              >
                {{ selectedPayment.public_status }}
              </span>
            </div>

            <div class="modal-actions">
              <button
                class="action-button secondary"
                @click="closePaymentModal"
              >
                {{ t("paymentList.close") }}
              </button>
            </div>
          </template>

          <!-- Other Payment Types -->
          <template v-else>
            <div class="detail-row">
              <label>{{ t("paymentList.sum") }}:</label>
              <span>{{ removeDecimalZeros(selectedPayment.amount) }} ₽</span>
            </div>

            <div class="detail-row">
              <label>{{ t("paymentList.date") }}:</label>
              <span>{{ formatDate(selectedPayment.dt_ins) }}</span>
            </div>

            <div class="detail-row">
              <label>{{ t("paymentList.status") }}:</label>
              <span
                :class="
                  getStatusClass(
                    selectedPayment.payment_type,
                    selectedPayment.public_status
                  )
                "
              >
                {{ selectedPayment.public_status }}
              </span>
            </div>

            <div class="modal-actions">
              <button
                class="action-button secondary"
                @click="closePaymentModal"
              >
                {{ t("paymentList.close") }}
              </button>
            </div>
          </template>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from "vue";
import { useI18n } from "vue-i18n";
import axios from "axios";
import LoadAccount from "/src/components/Accounts/Accounts/LoadAccount.vue";

const { t } = useI18n();

const payments = ref([]);
const fetchError = ref(null);
const showModal = ref(false);
const selectedPayment = ref(null);
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
      ? error.response.data.message || t("paymentList.unknownError")
      : t("paymentList.networkError");
  }
};

function openPaymentModal(payment) {
  selectedPayment.value = payment;
  showModal.value = true;
  document.body.style.overflow = "hidden";
}

function closePaymentModal() {
  showModal.value = false;
  selectedPayment.value = null;
  document.body.style.overflow = "auto";
}

function openCheckLink() {
  if (selectedPayment.value && selectedPayment.value.link) {
    const url = selectedPayment.value.link;
    if (url.startsWith("http://") || url.startsWith("https://")) {
      window.open(url, "_blank");
    } else {
      window.open(`https://${url}`, "_blank");
    }
  }
}

function goToPayment() {
  if (selectedPayment.value && selectedPayment.value.link) {
    const url = selectedPayment.value.link;
    if (url.startsWith("http://") || url.startsWith("https://")) {
      window.location.href = url;
    } else {
      window.location.href = `https://${url}`;
    }
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

function getOperationType(paymentType, operationType) {
  if (paymentType === "admin") {
    return operationType === "+"
      ? t("paymentList.replenishment")
      : t("paymentList.debit");
  }

  switch (paymentType) {
    case "up":
      return t("paymentList.balanceReplenishment");
    case "check":
      return t("paymentList.invoiceCreation");
    case "tariff":
      return t("paymentList.tariffPurchase");
    default:
      return t("paymentList.unknown");
  }
}

function getOperationTypeClass(paymentType, operationType) {
  if (paymentType === "admin") {
    return operationType === "+"
      ? "operation-admin-up"
      : "operation-admin-down";
  }

  switch (paymentType) {
    case "up":
      return "operation-up";
    case "check":
      return "operation-check";
    case "tariff":
      return "operation-tariff";
    default:
      return "operation-unknown";
  }
}

function getAmountClass(paymentType, operationType) {
  if (paymentType === "admin") {
    return operationType === "+" ? "amount-income" : "amount-outcome";
  }

  switch (paymentType) {
    case "check":
      return "amount-neutral";
    case "up":
      return "amount-income";
    case "tariff":
      return "amount-outcome";
    default:
      return "amount-neutral";
  }
}

function getStatusClass(paymentType, state) {
  if (paymentType === "admin") {
    return "admin-adjustment";
  }

  if (state.includes("Успешн")) {
    return "succeeded";
  }
  if (state.includes("Ошибка") || state.includes("отмен")) {
    return "canceled";
  }
  return "pending";
}

function getDisplayStatus(paymentType, state) {
  if (paymentType === "admin") {
    return t("paymentList.changedByAdmin");
  }
  return state;
}

function getPeriodText(period) {
  if (!period) return t("paymentList.unknown");

  const periodMap = {
    "1m": t("paymentList.period1m"),
    "3m": t("paymentList.period3m"),
    "6m": t("paymentList.period6m"),
    "1y": t("paymentList.period1y"),
  };

  return periodMap[period] || period;
}

const parsedTariffDetails = computed(() => {
  if (selectedPayment.value && selectedPayment.value.details) {
    try {
      if (typeof selectedPayment.value.details === "string") {
        return JSON.parse(selectedPayment.value.details);
      }
      return selectedPayment.value.details;
    } catch (e) {
      console.error("Error parsing tariff details:", e);
      return {};
    }
  }
  return {};
});

const parsedAdminDetails = computed(() => {
  if (selectedPayment.value && selectedPayment.value.details) {
    try {
      if (typeof selectedPayment.value.details === "string") {
        return JSON.parse(selectedPayment.value.details);
      }
      return selectedPayment.value.details;
    } catch (e) {
      console.error("Error parsing admin details:", e);
      return {};
    }
  }
  return {};
});

const isPaymentActive = computed(() => {
  if (!selectedPayment.value) return false;
  const status = selectedPayment.value.public_status;
  return status.includes("Инициирован") || status.includes("Ожидание");
});

onMounted(fetchPayments);
</script>

<style scoped>
.account-list-section {
  overflow: hidden;
  height: 100%;
}

/* Desktop View */
.desktop-view {
  display: block;
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
  background-color: var(--tableHeaderBg, #f9f9f9);
}

.table {
  width: 100%;
  border-collapse: collapse;
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

.load-cont {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: -10px;
}

.table-login {
  text-align: left;
  padding: 1rem;
  width: 20%;
}

.table-type {
  text-align: left;
  padding: 1rem;
  width: 15%;
}

.table-step {
  text-align: left;
  padding: 1rem;
  width: 25%;
}

.table-status {
  text-align: left;
  padding: 1rem;
  width: 20%;
}

.table-action {
  text-align: right;
  padding: 1rem;
  width: 20%;
}

th,
td {
  padding: 1rem;
  font-weight: 500;
  font-size: 11px;
  color: #6b7280;
  text-align: left;
}

td {
  font-weight: 400;
  font-size: 14px;
  color: #000;
}

tr {
  position: relative;
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

tr:hover {
  background-color: var(--tableHover, #f5f5f5);
}

.name-pay {
  font-weight: 500;
}

.table-text {
  padding: 1rem;
}

.table-action-text {
  padding: 1rem;
  text-align: right;
}

.table-status-text {
  padding: 1rem;
  text-align: left;
}

/* Operation Type Styles */
.operation-up {
  color: black;
  font-weight: 500;
}

.operation-check {
  color: black;
  font-weight: 500;
}

.operation-tariff {
  color: black;
  font-weight: 500;
}

.operation-admin-up {
  color: black;
  font-weight: 500;
}

.operation-admin-down {
  color: black;
  font-weight: 500;
}

.operation-unknown {
  color: gray;
  font-weight: 500;
}

/* Status Styles */
.canceled {
  color: rgb(253, 86, 86);
}

.succeeded {
  color: rgb(39, 146, 39);
}

.pending {
  color: gray;
}

.admin-adjustment {
  color: #000;
}

/* Desktop Buttons */
.details-button {
  background: oklch(0.65 0.22 267 / 0.16);
  font-weight: 600;
  font-size: 12px;
  padding: 10px 12px;
  color: oklch(0.4 0.18 267 / 0.86);
  transition: all 0.25s;
  border-radius: 5px;
}

.details-button:hover {
  background: rgba(23, 30, 162, 0.2);
  transition: all 0.15s;
}

.details-button:active {
  background: rgba(0, 4, 78, 0.2);
  transition: all 0.15s;
}

/* Mobile View */
.mobile-view {
  display: none;
}

.cards-container {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.payment-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
}

.payment-card:active {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.card-header {
  margin-bottom: 16px;
}

.card-id {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.id-label {
  font-weight: 600;
  font-size: 13px;
  color: #6b7280;
}

.id-value {
  font-weight: 600;
  font-size: 13px;
  color: #1f2937;
}

.card-title {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 12px;
}

.card-amount {
  font-size: 18px;
  font-weight: 700;
}

.amount-income {
  color: rgb(39, 146, 39);
}

.amount-outcome {
  color: rgb(253, 86, 86);
}

.amount-neutral {
  color: #1f2937;
}

.card-content {
  margin-bottom: 16px;
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
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;
}

.card-value {
  font-size: 14px;
  color: #1f2937;
  font-weight: 500;
  text-align: right;
}

.card-footer {
  padding-top: 12px;
  border-top: 1px solid #f3f4f6;
}

.details-button-mobile {
  width: 100%;
  padding: 12px;
  font-size: 14px;
  background: rgb(65, 105, 225);
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.details-button-mobile:hover {
  background: rgb(54, 88, 189);
}

.details-button-mobile:active {
  background: rgb(45, 74, 158);
}

.no-data {
  padding: 24px;
  text-align: center;
  color: #6b7280;
}

.no-data h2 {
  font-size: 16px;
  font-weight: 500;
  margin: 0;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease-in-out;
  padding: 16px;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  animation: scaleIn 0.3s ease-out;
  position: relative;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  font-size: 24px;
  color: #6b7280;
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
  padding: 0;
}

.modal-close:hover {
  background-color: #f3f4f6;
  color: #1f2937;
}

.modal-header {
  padding: 24px 24px 16px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
}

.modal-id {
  margin: 0;
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;
}

.modal-body {
  padding: 24px;
}

.detail-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px 0;
  border-bottom: 1px solid #f3f4f6;
}

.detail-row:first-child {
  padding-top: 0;
}

.detail-row:last-of-type {
  border-bottom: none;
  padding-bottom: 0;
}

.detail-row label {
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-row span {
  font-size: 15px;
  color: #1f2937;
  font-weight: 500;
  word-break: break-word;
}

.features-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.feature-item {
  font-size: 14px;
  color: #374151;
  padding-left: 8px;
}

.modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
}

.action-button {
  flex: 1;
  padding: 12px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-button.primary {
  background: rgb(65, 105, 225);
  color: white;
}

.action-button.primary:hover {
  background: rgb(54, 88, 189);
}

.action-button.primary:active {
  background: rgb(45, 74, 158);
}

.action-button.secondary {
  background: #f3f4f6;
  color: #1f2937;
  border: 1px solid #e5e7eb;
}

.action-button.secondary:hover {
  background: #e5e7eb;
}

.action-button.secondary:active {
  background: #d1d5db;
}

/* Responsive Design */
@media (max-width: 768px) {
  .desktop-view {
    display: none;
  }

  .mobile-view {
    display: block;
    height: 100%;
    overflow-y: auto;
  }

  .modal-content {
    max-width: calc(100% - 32px);
    max-height: 85vh;
  }

  .modal-actions {
    flex-direction: column;
  }

  .action-button {
    width: 100%;
  }
}

@media (max-width: 600px) {
  .table-login {
    width: 18%;
  }

  .table-type {
    width: 12%;
  }

  .table-step {
    width: 28%;
  }

  .table-status {
    width: 22%;
  }

  .table-action {
    width: 20%;
  }

  .details-button {
    padding: 6px 12px;
    font-size: 12px;
  }

  .modal-header {
    padding: 20px 16px 12px 16px;
  }

  .modal-body {
    padding: 16px;
  }

  .modal-close {
    top: 12px;
    right: 12px;
  }
}
</style>
