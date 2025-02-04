<template>
  <section class="account-list-section">
    <div class="table-container">
      <table class="table">
        <thead class="table-header">
          <tr>
            <th class="table-login">ПЛАТЕЖНАЯ СИСТЕМА</th>
            <th class="table-step">СУММА</th>
            <th class="table-status">ДАТА</th>
            <th class="table-action">СТАТУС</th>
          </tr>
        </thead>
        <tbody class="tbody">
          <tr
            v-if="paymentsLoadingStation.dataStation"
            v-for="(item, index) in payments"
            :key="index"
          >
            <td class="name-pay">YooKassa</td>
            <td class="table-text">{{ removeDecimalZeros(item.amount) }} ₽</td>
            <td class="table-text">{{ formatDate(item.created_at) }}</td>
            <td
              class="table-status-text canceled"
              v-if="item.status === 'canceled'"
            >
              Отменён
            </td>
            <td
              class="table-status-text succeeded"
              v-else-if="item.status === 'succeeded'"
            >
              Оплачен
            </td>
            <td
              class="table-status-text pending"
              v-else="item.status === 'pending'"
            >
              Ожидается
            </td>
          </tr>
          <tr v-else-if="paymentsLoadingStation.dataStationNone">
            <td colspan="4">
              <div class="none-account-cont">
                <h2>Аккаунты отсутствуют.</h2>
              </div>
            </td>
          </tr>
          <tr v-if="paymentsLoadingStation.loadDataStation">
            <td colspan="4">
              <div class="load-cont">
                <LoadAccount />
                sdsa
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup>
import { ref, reactive, onMounted, provide } from "vue";
import axios from "axios";
import LoadAccount from "/src/components/Accounts/Accounts/LoadAccount.vue";
const payments = ref([]); // Массив для хранения платежей
const fetchError = ref(null);

const paymentsLoadingStation = reactive({
  dataStationNone: false,
  dataStation: false,
  loadDataStation: false,
});

const fetchPayments = async () => {
  paymentsLoadingStation.loadDataStation = true;
  fetchError.value = null; // Сброс сообщения об ошибке
  console.log(localStorage.getItem("accountToken"));
  try {
    const response = await axios.get(
      "https://hellylo.apitter.com/paymentsList",
      {},
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accountToken")}`,
        },
      }
    );
    console.log(response.data);
    // Извлекаем платежи из массива items
    if (response.data) {
      payments.value = response.data;
      if (instanceData.value.length === 0) {
        console.log("данных нет");
        paymentsLoadingStation.loadDataStation = false;
        paymentsLoadingStation.dataStationNone = true;
      } else {
        paymentsLoadingStation.loadDataStation = false;
        paymentsLoadingStation.dataStation = true;
      }
    } else {
      paymentsLoadingStation.loadDataStation = false;
      paymentsLoadingStation.dataStationNone = true;
    }
  } catch (error) {
    paymentsLoadingStation.loadDataStation = false;
    paymentsLoadingStation.dataStationNone = true;
    console.error("Ошибка при получении списка платежей:", error);
    fetchError.value = error.response
      ? error.response.data.message || "Неизвестная ошибка"
      : "Ошибка сети";
  }
};

const createUser = async () => {
  try {
    const token = localStorage.getItem("accountToken");
    const response = await axios.get(
      "https://hellylo.apitter.com/paymentsList",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log(response.data);
    if (response.data) {
      payments.value = response.data;
      if (payments.value.length === 0) {
        console.log("данных нет");
        paymentsLoadingStation.loadDataStation = false;
        paymentsLoadingStation.dataStationNone = true;
      } else {
        paymentsLoadingStation.loadDataStation = false;
        paymentsLoadingStation.dataStation = true;
      }
    } else {
      paymentsLoadingStation.loadDataStation = false;
      paymentsLoadingStation.dataStationNone = true;
    }
  } catch (error) {
    paymentsLoadingStation.loadDataStation = false;
    paymentsLoadingStation.dataStationNone = true;
    console.error("Ошибка при создании платежа:", error);
  }
};

function removeDecimalZeros(value) {
  return value.toString().replace(/\.00$/, "");
}

function formatDate(dateString) {
  // Создаем объект Date из входной строки
  const date = new Date(dateString);

  // Получаем компоненты даты и времени
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Месяцы начинаются с 0
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  // Формируем строку в нужном формате
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

onMounted(createUser);
</script>

<style scoped>
.table-container {
  overflow-x: auto;
  overflow-y: auto;
  height: 83vh;
  /* width: 80%; */
}

.table-header {
  position: sticky;
  top: 0;
  z-index: 1;
  background: rgb(243, 244, 246);
}

.table {
  width: 100%;
  /* min-width: 1200px;
  max-width: 1000px; */
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
  background-color: #ebf5ff;
  border-radius: 5px;
}

.none-account-cont h2 {
  font-size: 14px;
  font-weight: 500;
  color: #17388d;
  margin-left: 10px;
}

.table-login {
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

.canceled {
  color: rgb(253, 86, 86);
}

.succeeded {
  color: rgb(39, 146, 39);
}

.pending {
  color: gray;
}

.table-login {
  width: 30%;
}

.table-step {
  width: 25%;
}

.table-status {
  width: 20%;
}

.table-action {
  width: 25%;
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
  background-color: #ebf5ff;
  border-radius: 5px;
}

.none-account-cont h2 {
  font-size: 14px;
  font-weight: 500;
  color: #17388d;
  margin-left: 10px;
}

.table-status-text {
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
  background: rgb(243 244 246);
}

@media (max-width: 700px) {
  .table-login {
    width: 20%;
  }

  .table-step {
    width: 15%;
  }

  .table-status {
    width: 40%;
  }

  .table-action {
    width: 25%;
  }
}
</style>
