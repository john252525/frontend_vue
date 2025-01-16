<template>
  <Chats />
</template>

<script setup>
import { ref } from "vue";
import axios from "axios";
import Chats from "@/components/Chats/Chats.vue";
const test = async () => {
  console.log(localStorage.getItem("accountToken"));
  try {
    const response = await axios.post(
      "https://b2288.apitter.com/instances/getChatMessages",
      {
        source: "whatsapp",
        login: "helly",
        to: "79608151077",
      },
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: `Bearer ${localStorage.getItem("accountToken")}`,
        },
      }
    );
    console.log(response.data);
    if (response.data.ok === true) {
      console.log(response.data);
    } else {
      console.log(response.data.ok);
    }
  } catch (error) {
    console.error("Ошибка при создании аккаунта:", error);
    if (error.response) {
      console.error("Ошибка сервера:", error.response.data);
    }
  }
};
</script>

<style scoped></style>
