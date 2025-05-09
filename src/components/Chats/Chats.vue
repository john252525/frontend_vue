<template>
  <LoadingMultiChat
    :changeLoadChatMulti="changeLoadChatMulti"
    v-if="loadChatMulti"
  />
  <section class="pc-version" v-if="!isMobile && userInfo && !loadChatMulti">
    <CheckUserImage
      :changeImageStation="changeImageStation"
      :userImageUrl="userImageUrl"
      v-if="imgageStation"
    />
    <UserList
      class="user-list"
      :selectChat="selectChat"
      :isChatClickable="isChatClickable"
      :blockChat="blockChat"
      :webhookEventData="webhookEventData"
      :changeImageStation="changeImageStation"
    />
    <MessageList
      class="message-list"
      :changeMessageListStation="changeMessageListStation"
      :chatInfo="chatInfo"
      :blockChatOff="blockChatOff"
      :blockChat="blockChat"
      :changeWebhookEventData="changeWebhookEventData"
      :changeImageStation="changeImageStation"
    />
  </section>
  <section class="phone-version" v-if="isMobile && userInfo && !loadChatMulti">
    <LoadingMultiChat
      :changeLoadChatMulti="changeLoadChatMulti"
      v-if="loadChatMulti"
    />
    <CheckUserImage
      :changeImageStation="changeImageStation"
      :userImageUrl="userImageUrl"
      v-if="imgageStation"
    />
    <UserList
      v-if="!showMessageList"
      class="phone-user-list"
      :changeImageStation="changeImageStation"
      :selectChat="selectChat"
      :isChatClickable="isChatClickable"
      :blockChat="blockChat"
      :chatInfo="chatInfo"
      :webhookEventData="webhookEventData"
      :chats="chats"
      :getChats="getChats"
    />
    <MessageList
      class="message-list"
      :changeMessageListStation="changeMessageListStation"
      :chatInfo="chatInfo"
      :blockChat="blockChat"
      :blockChatOff="blockChatOff"
      :changeImageStation="changeImageStation"
      :changeWebhookEventData="changeWebhookEventData"
    />
  </section>
</template>

<script setup>
import { ref, reactive, onMounted, computed, onBeforeUnmount } from "vue";
import UserList from "./UserList/UserList.vue";
import MessageList from "./MessageList/MessageList.vue";
import axios from "axios";
import CheckUserImage from "./CheckUserImage.vue";
import LoadingMultiChat from "./LoadingMultiChat.vue";
import { useRouter, useRoute } from "vue-router";
const route = useRoute();

import useFrontendLogger from "@/composables/useFrontendLogger";
const { sendLog } = useFrontendLogger();

const handleSendLog = async (location, method, params, results, answer) => {
  try {
    await sendLog(location, method, params, results, answer);
  } catch (err) {
    console.error("Ошибка при парсинге JSON:", err);
    // Optionally, update the error message ref
  }
};

const style = reactive({
  userList: {
    display: "none",
  },
  messageList: {
    display: "none",
  },
});

const webhookEventData = ref({
  hook_type: null,
  // ... другие свойства с начальными значениями
});

const isMulti = computed(() => {
  return route.query.multi === "true"; // Проверяем значение multi
});

const chats = ref(null);
const isChatClickable = ref(true);
const isMobile = ref(false);
const showMessageList = ref(false);
const apiUrl = import.meta.env.VITE_API_URL;
const userInfo = JSON.parse(localStorage.getItem("userInfo"));
const chatInfo = ref(null);
const imgageStation = ref(false);
const userImageUrl = ref(null);
const loadChatMulti = ref(true);

const changeLoadChatMulti = () => {
  loadChatMulti.value = false;
};

const changeImageStation = (chat, value) => {
  imgageStation.value = !imgageStation.value;
  console.log(chat);
  if (value) {
    userImageUrl.value = chat.avatar;
  } else {
    if (chat.data) {
      if (chat.data.avatar) {
        userImageUrl.value = chat.data.avatar;
      }
    } else {
      userImageUrl.value = null;
    }
  }
};

const checkIfMobile = () => {
  isMobile.value = window.innerWidth <= 768;
};

const changeWebhookEventData = (data) => {
  const transformedData = {
    hook_type: data.hook_type,
  };
  webhookEventData.value = data;
};

const blockChat = () => {
  isChatClickable.value = !isChatClickable.value;
};
const blockChatOff = () => {
  isChatClickable.value = true;
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
    if (response.data) {
      await handleSendLog(
        "chats",
        "clear-new-messages",
        { uniq: uniq },
        response.data,
        response.data
      );
    }
  } catch (error) {
    console.error("Ошибка при очистке новых сообщений:", error);
  }
};

onMounted(() => {
  const connectEventSource = () => {
    const eventSource = new EventSource(`${apiUrl}/events`);

    const receivedMessageIds =
      JSON.parse(localStorage.getItem("receivedMessageIds")) || [];

    eventSource.onmessage = (event) => {
      const eventData = JSON.parse(event.data);

      console.log(eventData);

      // Проверяем тип события
      if (eventData.hook_type === "message") {
        changeWebhookEventData(eventData);
        console.log(
          "новое сообщения для чата от ивана кикунаныыыыыыыыыыыыыыыыыыыыыыыыыан"
        );
      }
    };

    eventSource.onerror = (error) => {
      console.error("Ошибка соединения:", error);
      eventSource.close(); // Закрываем текущее соединение
      // Пытаемся переподключиться через 3 секунды
      setTimeout(() => {
        console.log("Попытка переподключения...");
        connectEventSource();
      }, 3000);
    };

    eventSource.onopen = () => {
      console.log("Соединение установлено");
    };
  };

  connectEventSource();
});

onMounted(() => {
  if (isMulti.value) {
    loadChatMulti.value = true;
  } else {
    loadChatMulti.value = false;
  }
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
