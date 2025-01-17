<template>
  <section v-if="userInfo">
    <UserList :selectChat="selectChat" />
    <MessageList :chatInfo="chatInfo" />
  </section>
  <section v-else>sdsds</section>
</template>

<script setup>
import { ref } from "vue";
import axios from "axios";
import UserList from "./UserList/UserList.vue";
import MessageList from "./MessageList/MessageList.vue";
const userInfo = JSON.parse(localStorage.getItem("userInfo"));
const chatInfo = ref(null);
const selectChat = (chat) => {
  chatInfo.value = chat;
  console.log(chat.phone);
};
</script>

<style scoped>
section {
  display: flex;
  align-items: flex-start;
}
</style>
