<template>
  <div>
    <h1>Подключение к базе данных</h1>
    <form @submit.prevent="connectToDatabase">
      <div>
        <label for="source">Source:</label>
        <input v-model="source" id="source" required />
      </div>
      <div>
        <label for="login">Login:</label>
        <input v-model="login" id="login" required />
      </div>
      <div>
        <label for="token">Token:</label>
        <input v-model="token" id="token" type="password" required />
      </div>
      <button type="submit">Подключиться</button>
    </form>
    <div v-if="message">{{ message }}</div>
    <div v-if="error" style="color: red">{{ error }}</div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import axios from "axios";

const source = ref("");
const login = ref("");
const token = ref("");
const message = ref("");
const error = ref("");

const connectToDatabase = async () => {
  try {
    const response = await axios.post("http://localhost:4000/connect", {
      source: source.value,
      login: login.value,
      token: token.value,
    });
    message.value = response.data.message;
    error.value = "";
  } catch (err) {
    message.value = "";
    error.value = err.response.data.error || "Произошла ошибка при подключении";
  }
};
</script>

<style scoped>
/* Здесь вы можете добавить стили для вашего компонента */
</style>
