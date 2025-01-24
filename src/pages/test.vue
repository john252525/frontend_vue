<template>
  <div>
    <h1>Создать платеж</h1>
    <form @submit.prevent="createPayment">
      <input
        v-model="amount"
        type="number"
        placeholder="Сумма"
        required
        min="0.01"
        step="0.01"
      />
      <input
        v-model="currency"
        type="text"
        placeholder="Валюта"
        required
        maxlength="3"
      />
      <button type="submit">Оплатить</button>
    </form>
    <div v-if="paymentUrl">
      <a :href="paymentUrl" target="_blank">Перейти к оплате</a>
    </div>
    <div v-if="errorMessage" style="color: red">
      {{ errorMessage }}
    </div>

    <h2>Список платежей</h2>
    <button @click="fetchPayments">Получить список платежей</button>
    <ul v-if="payments.length">
      <li v-for="payment in payments" :key="payment.id">
        <strong>ID:</strong> {{ payment.id }}<br />
        <strong>Описание:</strong> {{ payment.description }}<br />
        <strong>Сумма:</strong> {{ payment.amount.value }}
        {{ payment.amount.currency }}<br />
        <strong>Статус:</strong> {{ payment.status }}<br />
        <strong>Дата создания:</strong>
        {{ new Date(payment.created_at).toLocaleString() }}<br />
        <strong>Дата захвата:</strong>
        {{
          payment.captured_at
            ? new Date(payment.captured_at).toLocaleString()
            : "Не захвачено"
        }}<br />
        <hr />
      </li>
    </ul>
    <div v-else-if="fetchError" style="color: red">
      {{ fetchError }}
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import axios from "axios";

// Определение реактивных переменных
const amount = ref("");
const currency = ref("");
const paymentUrl = ref(null);
const errorMessage = ref(null);
const payments = ref([]); // Массив для хранения платежей
const fetchError = ref(null); // Сообщение об ошибке при получении платежей

// Функция для создания платежа
const createPayment = async () => {
  errorMessage.value = null; // Сброс сообщения об ошибке
  try {
    const response = await axios.post(
      "http://localhost:3000/api/create_payment",
      {
        amount: amount.value,
        currency: currency.value.toUpperCase(), // Приведение валюты к верхнему регистру
      }
    );
    paymentUrl.value = response.data.confirmation.confirmation_url;
  } catch (error) {
    console.error("Ошибка при создании платежа:", error);
    errorMessage.value = error.response
      ? error.response.data.message || "Неизвестная ошибка"
      : "Ошибка сети";
  }
};

// Функция для получения списка платежей
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
</script>

<style>
/* Добавьте стили по вашему усмотрению */
</style>
