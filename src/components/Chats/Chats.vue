<template>
  <LoadingMultiChat
    :changeLoadChatMulti="changeLoadChatMulti"
    v-if="loadChatMulti"
  />
  <section class="pc-version" v-if="!isMobile && !loadChatMulti">
    <CheckUserImage
      :changeImageStation="changeImageStation"
      :userImageUrl="userImageUrl"
      v-if="imgageStation"
    />
    <UserList
      :clearNewMessages="clearNewMessages"
      class="user-list"
      :selectChat="selectChat"
      :isChatClickable="isChatClickable"
      :blockChat="blockChat"
      :webhookEventData="webhookEventData"
      :changeImageStation="changeImageStation"
    />
    <MessageList
      :thread="route.query.thread"
      class="message-list"
      :changeMessageListStation="changeMessageListStation"
      @update:chatInfo="chatInfo = $event"
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
      :clearNewMessages="clearNewMessages"
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
      :thread="route.query.thread"
      class="message-list"
      :changeMessageListStation="changeMessageListStation"
      @update:chatInfo="chatInfo = $event"
      :chatInfo="chatInfo"
      :blockChat="blockChat"
      :blockChatOff="blockChatOff"
      :changeImageStation="changeImageStation"
      :changeWebhookEventData="changeWebhookEventData"
    />
  </section>
</template>

<script setup>
import {
  ref,
  reactive,
  onMounted,
  watch,
  computed,
  onBeforeUnmount,
} from "vue";
import UserList from "./UserList/UserList.vue";
import MessageList from "./MessageList/MessageList.vue";
import axios from "axios";
import CheckUserImage from "./CheckUserImage.vue";
import LoadingMultiChat from "./LoadingMultiChat.vue";
import { useRouter, useRoute } from "vue-router";
const route = useRoute();

const props = defineProps({
  mode: String,
  userLink: String,
  thread: String,
});

const storageKey = "chatAppActiveTab";
const tabId = Math.random().toString(36).substring(2, 15);

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

const loadAccountLinkChat = ref(false);
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

const checkActiveTab = () => {
  const activeTabData = localStorage.getItem(storageKey);

  if (activeTabData) {
    try {
      const { tabId: activeTabId, timestamp } = JSON.parse(activeTabData);

      // Если метка свежая (менее 10 секунд назад) и это не наш ID
      if (Date.now() - timestamp < 10000 && activeTabId !== tabId) {
        alert("Пожалуйста, закройте другие вкладки с чатами...");
        window.location.href = "/close";
        return false;
      }
    } catch (e) {
      console.error("Error parsing active tab data", e);
    }
  }

  // Устанавливаем текущую вкладку как активную
  localStorage.setItem(
    storageKey,
    JSON.stringify({
      tabId,
      timestamp: Date.now(),
    })
  );
  return true;
};

const setupTabControl = () => {
  if (!checkActiveTab()) return;

  // Обновляем метку активности каждые 3 секунды
  const activityInterval = setInterval(() => {
    localStorage.setItem(
      storageKey,
      JSON.stringify({
        tabId,
        timestamp: Date.now(),
      })
    );
  }, 3000);

  // Обработчики событий
  const handleBeforeUnload = () => {
    clearInterval(activityInterval);
    if (localStorage.getItem(storageKey)?.includes(tabId)) {
      localStorage.removeItem(storageKey);
    }
  };

  const handleVisibilityChange = () => {
    if (document.visibilityState === "visible") {
      checkActiveTab();
    }
  };

  const handleStorageChange = (e) => {
    if (e.key === storageKey) {
      checkActiveTab();
    }
  };

  window.addEventListener("beforeunload", handleBeforeUnload);
  window.addEventListener("visibilitychange", handleVisibilityChange);
  window.addEventListener("storage", handleStorageChange);

  return () => {
    clearInterval(activityInterval);
    window.removeEventListener("beforeunload", handleBeforeUnload);
    window.removeEventListener("visibilitychange", handleVisibilityChange);
    window.removeEventListener("storage", handleStorageChange);
  };
};

// const setupTabControl = () => {
//   // Проверяем при загрузке
//   if (!checkActiveTab()) return;

//   // Обновляем метку активности каждые 5 секунд
//   const activityInterval = setInterval(() => {
//     localStorage.setItem(storageKey, tabId);
//   }, 5000);

//   // Слушаем событие beforeunload для очистки
//   window.addEventListener("beforeunload", () => {
//     clearInterval(activityInterval);
//     if (localStorage.getItem(storageKey) === tabId) {
//       localStorage.removeItem(storageKey);
//     }
//   });

//   // Слушаем изменения в localStorage
//   const handleStorageChange = (e) => {
//     if (e.key === storageKey && e.newValue !== tabId) {
//       // Другая вкладка объявила себя активной
//       alert(
//         "Обнаружена другая активная вкладка с чатами. Пожалуйста, используйте только одну вкладку."
//       );
//       window.location.href = "/close";
//     }
//   };

//   window.addEventListener("storage", handleStorageChange);

//   return () => {
//     clearInterval(activityInterval);
//     window.removeEventListener("storage", handleStorageChange);
//   };
// };

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

onMounted(() => {
  const cleanup = setupTabControl();

  onBeforeUnmount(() => {
    cleanup();
    if (localStorage.getItem(storageKey) === tabId) {
      localStorage.removeItem(storageKey);
    }
  });
});

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

// onMounted(() => {
//   handleRouteParams();
// });

// const handleRouteParams = async () => {
//   if (route.query.thread) {
//     if (route.query.userLink === "true") {
//       console.log(true);
//       loadAccountLinkChat.value = true;
//     } else {
//       console.log(false);
//       loadAccountLinkChat.value = false;
//     }
//   }
// };

onMounted(() => {
  if (isMulti.value) {
    console.log("мульти тру");
    loadChatMulti.value = true;
  } else {
    console.log("мульти фщл");
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

watch(
  () => props.thread,
  (newThread) => {
    if (newThread) {
      // Здесь можно добавить логику обработки thread
      console.log("Thread changed:", newThread);
    }
  },
  { immediate: true }
);

// Аналогично для mode и userLink
watch(
  () => props.mode,
  (newMode) => {
    if (newMode === "widget") {
      // Применяем стили widget mode
      document.body.classList.add("widget-mode");
    } else {
      document.body.classList.remove("widget-mode");
    }
  },
  { immediate: true }
);
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
