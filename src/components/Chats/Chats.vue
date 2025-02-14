<template>
  <section class="pc-version" v-if="userInfo">
    <UserList class="user-list" :selectChat="selectChat" />
    <MessageList
      class="message-list"
      :changeMessageListStation="changeMessageListStation"
      :chatInfo="chatInfo"
    />
  </section>
  <!-- <section class="phone-version" v-if="userInfo">
    <UserList :style="style.UserList" :selectChat="selectChat" />
    <MessageList
      class="message-list"
      :style="style.MessageList"
      :changeMessageListStation="changeMessageListStation"
      :chatInfo="chatInfo"
    />
  </section> -->
</template>

<script setup>
import { ref, reactive } from "vue";
import axios from "axios";
import UserList from "./UserList/UserList.vue";
import MessageList from "./MessageList/MessageList.vue";
const messageListStation = ref(false);

const style = reactive({
  MessageList: {
    display: "none",
  },

  UserList: {
    display: "block",
  },
});

const changeMessageListStation = () => {
  style.UserList.display = "block";
  style.MessageList.display = "none";
};

const userInfo = JSON.parse(localStorage.getItem("userInfo"));
const chatInfo = ref(null);
const selectChat = (chat) => {
  style.UserList.display = "none";
  style.MessageList.display = "block";
  chatInfo.value = chat;
  console.log(chat.phone);
};
</script>

<style scoped>
.pc-version {
  display: flex;
  align-items: flex-start;
  width: 100%;
}

.message-list {
  flex: 1;
}

.phone-version {
  display: none;
}

@media (max-width: 768px) {
  .pc-version {
    display: none;
  }

  .phone-version {
    display: block;
    width: 100%;
    height: 100vh; /* Ограничивает высоту до размера экрана */
  }

  .message-list {
    flex: 1;
    overflow-y: auto; /* Включает вертикальный скролл */
  }
}
</style>
