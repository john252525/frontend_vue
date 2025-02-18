<template>
  <section class="pc-version" v-if="!isMobile && userInfo">
    <UserList class="user-list" :selectChat="selectChat" />
    <MessageList
      class="message-list"
      :changeMessageListStation="changeMessageListStation"
      :chatInfo="chatInfo"
    />
  </section>
  <section class="phone-version" v-if="isMobile && userInfo">
    <UserList
      class="phone-user-list"
      :style="style.userList"
      :selectChat="selectChat"
    />
    <MessageList
      class="message-list"
      :style="{ display: showMessageList ? 'block' : 'none' }"
      :changeMessageListStation="changeMessageListStation"
      :chatInfo="chatInfo"
    />
  </section>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import UserList from "./UserList/UserList.vue";
import MessageList from "./MessageList/MessageList.vue";

const style = reactive({
  userList: {
    display: "none",
  },

  messageList: {
    display: "none",
  },
});

const isMobile = ref(false); // Определяем состояние: мобильное устройство или нет
const showMessageList = ref(false); // Добавляем состояние для отображения MessageList

const userInfo = JSON.parse(localStorage.getItem("userInfo"));
const chatInfo = ref(null);

const changeMessageListStation = () => {
  showMessageList.value = false; // Скрываем MessageList при вызове changeMessageListStation
};

const selectChat = (chat) => {
  chatInfo.value = chat;
  showMessageList.value = true;
  console.log(chat.phone);
  style.userList.display = "none";
};

const clickChat = () => {
  station.userList.display = "none";
};

onMounted(() => {
  // Определяем, является ли устройство мобильным при монтировании компонента
  isMobile.value = window.innerWidth <= 768;

  // Слушаем изменение размера окна
  window.addEventListener("resize", () => {
    isMobile.value = window.innerWidth <= 768;
  });
});
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
  width: 100%;
  height: 100vh;
}

.phone-user-list {
  /* Стиль для UserList в мобильной версии, если нужен */
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
}
</style>
