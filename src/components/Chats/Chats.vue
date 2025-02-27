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
      v-if="!showMessageList"
      class="phone-user-list"
      :selectChat="selectChat"
    />
    <MessageList
      :style="style.messageList"
      class="message-list"
      :changeMessageListStation="changeMessageListStation"
      :chatInfo="chatInfo"
    />
  </section>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount } from "vue";
import UserList from "./UserList/UserList.vue";
import MessageList from "./MessageList/MessageList.vue";
import axios from "axios";

const style = reactive({
  userList: {
    display: "none",
  },
  messageList: {
    display: "none",
  },
});

const isMobile = ref(false); // Определяем состояние: мобильное устройство или нет
const showMessageList = ref(false);
const apiUrl = import.meta.env.VITE_API_URL;
const userInfo = JSON.parse(localStorage.getItem("userInfo"));
const chatInfo = ref(null);

// Функция для проверки мобильного устройства
const checkIfMobile = () => {
  isMobile.value = window.innerWidth <= 768;
};

const changeMessageListStation = () => {
  showMessageList.value = false;
  style.userList.display = "block";
  style.messageList.display = "none";
};

const selectChat = (chat) => {
  console.log(chat);
  chatInfo.value = chat.data;
  style.messageList.display = "block";
  style.userList.display = "none";
  showMessageList.value = true;
  console.log(chat.phone);
  clearCountNewMessage(chat.uniq, chat);
  clearNewMessages(chat.uniq);
};

const clearCountNewMessage = (thread, chat) => {
  if (chat) {
    if (chat.newMessage) {
      chat.newMessage = 0;
      console.log(`Последнее сообщение для ${thread} обновлено`);
    } else {
      console.log(`lastMessage для чата с thread ${thread} не найден`);
    }
  } else {
    console.log(`Чат с thread ${thread} не найден`);
  }
};

const clearNewMessages = async (uniq) => {
  try {
    const response = await axios.post(`${apiUrl}/clear-new-messages`, {
      uniq: uniq,
    });
  } catch (error) {
    console.error("Ошибка при очистке новых сообщений:", error);
  }
};

onMounted(() => {
  // Проверяем мобильное устройство при монтировании
  checkIfMobile();

  // Добавляем обработчик события изменения размера окна
  window.addEventListener("resize", checkIfMobile);
});

onBeforeUnmount(() => {
  // Удаляем обработчик события при размонтировании
  window.removeEventListener("resize", checkIfMobile);
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

Найти еще
