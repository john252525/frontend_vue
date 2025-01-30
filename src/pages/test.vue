<template>
  <div>
    <button @click="fetchHello">Отправить запрос</button>
    <p v-if="message">{{ message }}</p>
    <p v-if="error">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref } from "vue";
import axios from "axios";

const message = ref(null);
const error = ref(null);

const fetchHello = async () => {
  try {
    const response = await axios.get("http://213.159.208.139:3000/api/hello");
    message.value = response.data.message;
    error.value = null;
  } catch (e) {
    console.error("Ошибка при запросе /api/hello:", e);
    error.value = "Ошибка при получении сообщения.";
    message.value = null;
  }
};
</script>
