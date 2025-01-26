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
          <tr v-for="(item, index) in payments" :key="index">
            <td class="table-text">YooKassa</td>
            <td class="table-text">
              {{ removeDecimalZeros(item.amount.value) }}
            </td>
            <td class="table-text">{{ formatDate(item.created_at) }}</td>
            <td class="table-text" v-if="item.status === 'canceled'">
              Отменён
            </td>
            <td class="table-text" v-else-if="item.status === 'succeeded'">
              Оплачен
            </td>
            <td class="table-text" v-else="item.status === 'pending'">
              Ожидается
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

const payments = ref([]); // Массив для хранения платежей
const fetchError = ref(null);

const fetchPayments = async () => {
  fetchError.value = null; // Сброс сообщения об ошибке
  try {
    const response = await axios.get("http://localhost:3000/api/payments");
    console.log("Ответ от API:", response.data); // Выводим ответ в консоль для отладки

    // Извлекаем платежи из массива items
    if (response.data.items) {
      payments.value = response.data.items; // Получаем платежи
    } else {
      fetchError.value = "Нет доступных платежей.";
    }
  } catch (error) {
    console.error("Ошибка при получении списка платежей:", error);
    fetchError.value = error.response
      ? error.response.data.message || "Неизвестная ошибка"
      : "Ошибка сети";
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

onMounted(fetchPayments);
</script>

<style scoped>
.table-container {
  /* overflow-x: auto; */
  overflow-y: auto;
  height: 83vh;
}

.table-header {
  position: sticky;
  top: 0;
  z-index: 1;
  background: rgb(243, 244, 246);
}

.table {
  /* width: 100%; */
  /* width: 700px; */
  /* min-width: 600px; */
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
}

.table-login {
  width: 25%;
}

.table-step {
  width: 25%;
}

.table-status {
  width: 25%;
}

.table-action {
  width: 25%;
}

.table-text-number {
  padding: 1rem;
}

.table-text {
  padding: 1rem;
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
  font-weight: 500;
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
    width: 45%;
  }

  .table-status {
    width: 10%;
  }

  .table-action {
    width: 25%;
  }
}
</style>
