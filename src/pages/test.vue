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
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      amount: "",
      currency: "",
      paymentUrl: null,
      errorMessage: null,
    };
  },
  methods: {
    async createPayment() {
      this.errorMessage = null; // Сброс сообщения об ошибке
      try {
        const response = await axios.post(
          "http://localhost:3000/api/create_payment",
          {
            amount: this.amount,
            currency: this.currency.toUpperCase(), // Приведение валюты к верхнему регистру
          }
        );
        this.paymentUrl = response.data.confirmation.confirmation_url;
      } catch (error) {
        console.error("Ошибка при создании платежа:", error);
        this.errorMessage = error.response
          ? error.response.data.message || "Неизвестная ошибка"
          : "Ошибка сети";
      }
    },
  },
};
</script>

<style></style>
