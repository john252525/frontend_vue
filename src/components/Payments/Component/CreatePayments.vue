<template>
  <section>
    <h1 class="title">Пополнение баланса</h1>
    <form @submit.prevent="createPayment">
      <input
        v-model="amount"
        type="number"
        placeholder="Сумма"
        required
        min="0.01"
        step="0.01"
      />
      <button class="create-payments" type="submit">Пополнить баланс</button>
    </form>
    <div v-if="paymentUrl">
      <a :href="paymentUrl" target="_blank">Перейти к оплате</a>
    </div>
    <div v-if="errorMessage" style="color: red">
      {{ errorMessage }}
    </div>
  </section>
</template>

<script setup>
import { ref } from "vue";
import axios from "axios";

const errorMessage = ref(null);

const amount = ref("");
const currency = ref("");
const paymentUrl = ref(null);

const createPayment = async () => {
  errorMessage.value = null; // Сброс сообщения об ошибке
  try {
    const response = await axios.post(
      "http://localhost:3000/api/create_payment",
      {
        amount: amount.value,
        currency: "RUB",
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
</script>

<style scoped>
input {
  border: 0.5px solid #c1c1c1;
  border-radius: 5px;
  padding-left: 10px;
  width: 400px;
  height: 35px;
  background: #fcfcfc;
  font-weight: 400;
  font-size: 14px;
  color: #000;
}

.title {
  font-weight: 500;
  font-size: 20px;
}

.create-payments {
  border-radius: 5px;
  width: 413px;
  height: 35px;
  background: #4950ca;
  font-weight: 500;
  font-size: 14px;
  color: #fff;
}
</style>
