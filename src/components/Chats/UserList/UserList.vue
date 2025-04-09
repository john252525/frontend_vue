<template>
  <ErrorBlock v-if="errorBlock" :changeIncorrectPassword="chaneErrorBlock" />
  <NewMessageSend
    :changeAddAccountStation="changeAddAccountStation"
    v-if="addAccountStation"
  />
  <div class="chat-container">
    <!-- <CheckUserImage /> -->
    <button v-if="!chatsNull" @click="changeAddAccountStation" class="add-new-chat">+</button>
    <button v-if="chatsNull" @click="changeAddAccountStation" class="add-new-chat-animation">+</button>
    <aside class="chat-list" :style="{ width: computedChatListWidth }">
      <section
        v-if="
  apiUrl === apiCheckUrl
        &&
          isMulti
        "
        class="setting-chats"
      >
        <button class="setting-chats-button" @click="toggleAccountList">
          {{ showAccountList ? "Скрыть аккаунты" : "Настроить чаты" }}
        </button>
        <div v-if="showAccountList" class="account-list">
          <div
            v-for="(account, index) in accounts"
            :key="index"
            class="account-item"
          >
            <img class="icon-chat-list" v-if="account.source==='telegram'" src="/chats/telegram.svg" alt="">
            <img class="icon-chat-list"  v-if="account.source==='whatsapp'" src="/chats/whatsapp.svg" alt="">
            <span class="text-account-item">{{ account.name }} </span>
            <div class="checkbox-input">
              <input
                type="checkbox"
                :id="'account-' + index"
                :checked="account.active"
                @change="toggleAccount(account)"
              />
              <label :for="'account-' + index"></label>
            </div>
          </div>
        </div>
      </section>

      <section
        v-if="chats"
        v-for="chat in sortedChats"
        :key="chat.unid"
        class="chat-item"
        :class="{ 'disabled-chat': !isChatClickable }"
        @click="isChatClickable ? selectChatClick(chat) : null"
      >
      
        <div class="chat-user-cont">
          <img
            v-if="
              apiUrl === apiCheckUrl && chat.data.avatar
            "
            class="user-chat-avatar"
            :src="chat.data.avatar"
            @click="changeImageStation(chat)"
            alt=""
          />

          <img
            v-else
            @click="changeImageStation(chat)"
            class="user-chat-icon"
            src="/chats/user-chat-icon.svg"
            alt=""
          />
          <div v-if="isMulti" class="chat-logo">
            <img
              v-if="chat.data.sourceUser === 'whatsapp'"
              class="whatsapp-img"
              src="/chats/whatsapp.svg"
              alt=""
            />
            <img
              v-if="chat.data.sourceUser === 'telegram'"
              class="telegram-img"
              src="/chats/telegram.svg"
              alt=""
            />
          </div>
          <div class="chat-info">
            <div class="chat-name">{{ chat.data.name }}</div>
            <div class="chat-last-message">
              {{ formatLastMessage(chat.data.lastMessage?.body) }}
            </div>
          </div>
        </div>
        <div class="chat-meta">
          <div class="chat-timestamp">
            {{ formatTimestamp(chat.data.timestamp) }}
          </div>
          <div class="chat-unread" v-if="chat.newMessage > 0">
            {{ chat.newMessage }}
          </div>
        </div>
        
      </section>
      <section class="loading-chat-list" v-if="chatsNull">
        <h2 class="chat-null-text">Чаты не найдены</h2>
      </section>
      <section class="loading-chat-list" v-if="!chats && !errorStation">
        <Loading />
      </section>
      <section class="error-section" v-if="!chats && errorStation">
        <Error />
      </section>
    </aside>
    <div class="resizer" @mousedown="startResize"></div>
  </div>
</template>

<script setup>
import axios from "axios";
import { onMounted, ref, watch, computed, defineProps, toRefs } from "vue";
import Loading from "./Loading.vue";
import ErrorBlock from "@/components/ErrorBlock/ErrorBlock.vue";
import CheckUserImage from "../CheckUserImage.vue";
import { useRouter, useRoute } from "vue-router";
import NewMessageSend from "./newMessageForUser.vue";
import Error from "./Error.vue";
const apiUrl = import.meta.env.VITE_API_URL;
const apiCheckUrl = import.meta.env.VITE_API_CHECK_BE_CHAT;

const router = useRouter();
const route = useRoute();

const props = defineProps({
  isChatClickable: {
    type: Boolean,
  },
  blockChat: {
    type: Function,
  },
  selectChat: {
    type: Function,
  },
  webhookEventData: {
    type: Object,
  },
  changeImageStation: {
    type: Function,
  },
});

const { isChatClickable, webhookEventData } = toRefs(props);
const addAccountStation = ref(false);
const errorBlock = ref(false);
const chats = ref(null);
const userInfo = JSON.parse(localStorage.getItem("userInfo"));
const chatInfo = ref(null);
const errorStation = ref(false);
const chatsNull = ref(false)

const selectChatClick = (chat) => {
  props.selectChat(chat);
  chatInfo.value = chat;
};

const changeAddAccountStation = () => {
  addAccountStation.value = !addAccountStation.value;
};

const updateChatTimestamp = (thread, newTimestamp) => {
  // Преобразуем новый timestamp из миллисекунд (предположительно) в секунды
  const newTimestampInSeconds = Math.floor(newTimestamp / 1000000); // Делим на 1000

  // Ищем чат, где uniq соответствует thread
  const chat = chats.value.find((chat) => chat.uniq === thread);

  if (chat) {
    // Обновляем timestamp внутри lastMessage
    chat.data.timestamp = newTimestampInSeconds;
  } else {
  }
};

const updateLastMessage = (thread, newLastMessage) => {
  // console.log(
  //   "СОООООООООООООООООООООБЩЕНИЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕ",
  //   newLastMessage
  // );
  const chat = chats.value.find((chat) => chat.uniq === thread);

  if (chat) {
    if (chat.data.lastMessage) {
      chat.data.lastMessage.body = newLastMessage;
    } else {
    }
  } else {
  }
};

const updateCountNewMessage = (thread) => {
  const chat = chats.value.find((chat) => chat.uniq === thread);

  if (chat) {
    if (chat) {
      chat.newMessage = chat.newMessage + 1;
    } else {
    }
  } else {
  }
};

const clearCountNewMessage = (thread) => {
  const chat = chats.value.find((chat) => chat.uniq === thread);

  if (chat) {
    if (chat.newMessage) {
      chat.newMessage++;
    } else {
    }
  } else {
  }
};
const chatListWidth = ref(450); // Начальная ширина списка чатов
const isResizing = ref(false);

const MIN_WIDTH = 300; // Минимальная ширина
const MAX_WIDTH = 600; // Максимальная ширина

const computedChatListWidth = computed(() => {
  return window.innerWidth <= 768 ? "100%" : chatListWidth.value + "px";
});

// Функция для начала изменения размера
const startResize = (event) => {
  isResizing.value = true;
  document.addEventListener("mousemove", resizeChatList);
  document.addEventListener("mouseup", stopResize);
};

// Функция для изменения ширины
const resizeChatList = (event) => {
  if (isResizing.value) {
    let newWidth = event.clientX; // Получаем положение мыши по оси X
    // Устанавливаем ограничения на ширину
    if (newWidth < MIN_WIDTH) {
      newWidth = MIN_WIDTH; // Минимальная ширина
    } else if (newWidth > window.innerWidth - 50) {
      newWidth = window.innerWidth - 50; // Максимальная ширина
    }
    chatListWidth.value = Math.min(Math.max(newWidth, MIN_WIDTH), MAX_WIDTH); // Ограничиваем ширину
  }
};

// Функция для остановки изменения размера
const stopResize = () => {
  isResizing.value = false;
  document.removeEventListener("mousemove", resizeChatList);
  document.removeEventListener("mouseup", stopResize);
};

// Обработчик изменения размера окна
window.addEventListener("resize", () => {
  if (window.innerWidth <= 768) {
    chatListWidth.value = 100; // Устанавливаем ширину на 100% для мобильных устройств
  } else {
    chatListWidth.value = Math.min(
      Math.max(chatListWidth.value, MIN_WIDTH),
      MAX_WIDTH
    ); // Устанавливаем ширину в пределах допустимых значений
  }
});

// Добавляем обработчик события mousedown
onMounted(() => {
  const chatListElement = document.querySelector(".chat-list");
  chatListElement.addEventListener("mousedown", startResize);
});

const isMulti = computed(() => {
  return route.query.multi === "true"; // Проверяем значение multi
});

const test = async () => {
  const isMulti = computed(() => {
    return route.query.multi === "true"; // Проверяем значение multi
  });

  try {
    const token = localStorage.getItem("accountToken");
    console.log(JSON.parse(localStorage.getItem("loginWhatsAppChatsStep")));
    // Получаем логин в зависимости от значения multi
    const logsingFromAccount =
      JSON.parse(localStorage.getItem("loginWhatsAppChatsStep")) || []; // Получаем массив объектов из localStorag
    console.log(logsingFromAccount);
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    let logins;

    if (isMulti.value) {
      logins = logsingFromAccount.map((item) => item.login) || []; // Извлекаем массив логинов из массива объектов
    } else {
      logins = userInfo?.login; // Если isMulti не true, просто используем login из userInfo
    }

    let sourse;

    if (isMulti.value) {
      sourse = logsingFromAccount.map((item) => item.source) || []; // Извлекаем массив логинов из массива объектов
    } else {
      sourse = localStorage.getItem("accountStation"); // Если isMulti не true, просто используем login из userInfo
    }
    console.log(logins);

    const response = await axios.post(
      `${apiUrl}/getChats`,
      {
        source: sourse,
        login: logins,
      },
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.status === 401) {
      errorBlock.value = true;
      setTimeout(() => {
        localStorage.removeItem("accountToken");
        router.push("/login");
      }, 2000);
      return;
    }

    if (
      apiUrl === apiCheckUrl 
    ) {
      chats.value = response.data.data.chats;
      console.log(chats.value);
    } else {
      chats.value = response.data.data.chats.map((chat) => ({
        newMessage: chat.unreadCount,
        timestamp: chat.timestamp,
        uniq: chat.lastMessage.to,
        data: chat,
      }));
    }
    if(chats.value.length === 0) {
      chatsNull.value = true
      console.log('dssd')
    }
  } catch (error) {
    errorStation.value = true;
    
    setTimeout(() => {
      localStorage.removeItem("loginWhatsAppChatsStep");
      // router.push("/accounts");
    }, 2000);
    console.error("Ошибка при получении сообщений:", error);
    if (error.response) {
      errorStation.value = true;
      console.error("Ошибка сервера:", error.response.data);
    }
  }
};

const formatTimestamp = (timestamp) => {
  if (typeof timestamp === "string") {
    timestamp = parseFloat(timestamp);
  }

  if (typeof timestamp !== "number" || isNaN(timestamp)) {
    console.warn("Предупреждение: timestamp должен быть числом.", {
      originalInput: timestamp,
    });
    return "Некорректный ввод";
  }

  const date = new Date(timestamp * 1000); // <---  Умножаем на 1000 (были секунды)

  // Проверка, если дата некорректна
  if (isNaN(date.getTime())) {
    console.warn("Некорректная дата:", date);
    return "Некорректная дата"; // Возвращаем сообщение об ошибке
  }

  const now = new Date();

  // Создаем копию даты "сегодня", чтобы установить время на полночь для сравнения
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  // Создаем дату "вчера"
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  // Получаем дату начала текущей недели (считая с понедельника)
  const startOfWeek = new Date(today);
  const dayOfWeek = today.getDay(); // 0 (воскресенье) - 6 (суббота)
  const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Если воскресенье, вычитаем 6 дней, иначе вычитаем dayOfWeek - 1
  startOfWeek.setDate(today.getDate() - daysToSubtract);

  // Форматируем дату
  if (date >= today) {
    // Если дата сегодня
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  } else if (date >= yesterday && date < today) {
    // Если дата вчера
    return "Вчера";
  } else if (date >= startOfWeek && date < yesterday) {
    // Если дата на этой неделе
    const daysOfWeek = [
      "Воскресенье",
      "Понедельник",
      "Вторник",
      "Среда",
      "Четверг",
      "Пятница",
      "Суббота",
    ];
    return daysOfWeek[date.getDay()]; // Возвращаем день недели
  } else {
    // Если другая дата
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Месяцы начинаются с 0
    const year = date.getFullYear();
    return `${day}.${month}.${year}`; // Возвращаем формат дд.мм.гггг
  }
};

const timestampMilliseconds = "1740994136000";
const formattedTime = formatTimestamp(timestampMilliseconds);

const sortedChats = computed(() => {
  if (!chats.value) return [];
  return [...chats.value].sort((a, b) => {
    // Создаем копию массива
    const timestampA = a.data?.timestamp || 0; // Безопасный доступ к вложенному свойству и обработка undefined
    const timestampB = b.data?.timestamp || 0; // Безопасный доступ к вложенному свойству и обработка undefined
    return timestampB - timestampA; // Сортируем по убыванию
  });
});

onMounted(test);

const formatLastMessage = (message) => {
  const maxLength = 20;
  if (message && message.length > maxLength) {
    return message.slice(0, maxLength) + "...";
  }
  return message || "Нет сообщений";
};

const audio = ref(null);

const accounts = ref([]);
const showAccountList = ref(false);

// Функция для получения аккаунтов из localStorage
const getAccounts = () => {
  const storedAccounts =
    JSON.parse(localStorage.getItem("loginWhatsAppChatsStep")) || [];
  // Преобразуем массив объектов из localStorage в массив объектов Vue с флагом active
  accounts.value = storedAccounts.map((account) => ({
    name: account.login,
    source: account.source,
    active: true, // По умолчанию аккаунт активен
  }));
};

// Функция для переключения активности аккаунта
const toggleAccount = (account) => {
  account.active = !account.active;
  updateLocalStorage();
};

// Функция для обновления localStorage на основе текущего состояния аккаунтов
const updateLocalStorage = () => {
  // Сохраняем массив объектов, но только активные
  const activeAccounts = accounts.value
    .filter((account) => account.active)
    .map((account) => ({ login: account.name, source: account.source })); // Сохраняем только логин и source

  localStorage.setItem(
    "loginWhatsAppChatsStep",
    JSON.stringify(activeAccounts)
  );
  test(); // Вызываем test() после каждого изменения
};

// Функция для переключения видимости списка аккаунтов
const toggleAccountList = () => {
  showAccountList.value = !showAccountList.value;
};

// Получаем аккаунты при монтировании компонента
onMounted(() => {
  getAccounts();
});

// onMounted(() => {
//   audio.value = new Audio("/chats/newMessage.mp3");

//   const connectEventSource = () => {
//     const eventSource = new EventSource(
//       "https://hellychat.apitter.com/api/events"
//     );

//     // Получаем массив идентификаторов из localStorage или создаем новый
//     const receivedMessageIds =
//       JSON.parse(localStorage.getItem("receivedMessageIds")) || [];

//     eventSource.onmessage = (event) => {
//       const eventData = JSON.parse(event.data);

//       console.log(eventData);

//       if (eventData.hook_type === "message") {
//         if (!receivedMessageIds.includes(eventData.item)) {
//           // Сохраняем идентификатор в localStorage
//           receivedMessageIds.push(eventData.item);
//           localStorage.setItem(
//             "receivedMessageIds",
//             JSON.stringify(receivedMessageIds)
//           );
//           console.log(chatInfo.value);
//           console.log(
//             "СОООООООООООООООООООООБЩЕНИЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕ",
//             eventData
//           );
//           updateLastMessage(eventData.thread, eventData.text);
//           updateChatTimestamp(eventData.thread, eventData.time);

//           if (!eventData.outgoing) {
//             updateCountNewMessage(eventData.thread);
//           }

//           playSound();
//         }
//       }
//     };

//     eventSource.onerror = (error) => {
//       console.error("Ошибка соединения:", error);
//       eventSource.close(); // Закрываем текущее соединение
//       // Пытаемся переподключиться через 3 секунды
//       setTimeout(() => {
//         console.log("Попытка переподключения...");
//         connectEventSource();
//       }, 3000);
//     };

//     eventSource.onopen = () => {
//       console.log("Соединение установлено");
//     };
//   };

//   // Инициализация соединения
//   connectEventSource();
// });

watch(
  webhookEventData,
  (newValue, oldValue) => {
    if (newValue) {
      updateLastMessage(newValue.thread, newValue.text);
      updateChatTimestamp(newValue.thread, newValue.time);

      if (!newValue.outgoing) {
        updateCountNewMessage(newValue.thread);
      }
    }
  },
  { deep: true }
);

// Функция для проигрывания звука
const playSound = () => {
  if (audio.value) {
    audio.value.play().catch((error) => {
      console.error("Ошибка при проигрывании звука:", error);
    });
  }
};
</script>

<style scoped>
.chat-container {
  display: flex;
  height: 100vh;
  position: relative; /* Для правильного позиционирования элемента изменения размера */
}
.loading-chat-list {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 94vh;
}

.chat-list {
  border-right: 1px solid #eaeaea;
  overflow-y: auto;
  overflow-x: hidden;
  height: 100%;
  position: relative;
}

.resizer {
  width: 10px; /* Ширина элемента изменения размера */
  cursor: ew-resize; /* Курсор при наведении на элемент изменения размера */
  background-color: transparent; /* Сделать его прозрачным */
  position: absolute; /* Позволяет позиционировать его рядом со списком */
  right: 0; /* Позиционирование справа от списка */
  top: 0; /* Позиционирование сверху */
  height: 100%; /* Высота на 100% от контейнера */
  z-index: 1; /* Убедиться, что элемент изменения размера выше других элементов */
  user-select: none; /* Отключаем выделение текста */
}

.chat-list {
  user-select: none; /* Отключаем выделение текста для списка чатов */
}

.error-section {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  height: 94vh;
  gap: 10px;
}
.error-section h2 {
  color: rgb(219, 57, 57);
  font-size: 18px;
  font-weight: 600;
}

.chat-logo {
  position: absolute;
  width: 20px;
  height: 20px;
  background: #f9f9f9;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 100%;
  left: 42px;
  margin-top: 26px;
}

.chat-container {
  display: flex;
  height: 100vh;
}

.error-section p {
  color: black;
  font-size: 14px;
  font-weight: 500;
}

.chat-item {
  display: flex;
  justify-content: space-between;
  padding: 12px;
  cursor: pointer;
  background-color: #f9f9f9;
  transition: background-color 0.3s ease;
}

.add-contact {
  padding: 12px;
  background-color: #f9f9f9;
  display: flex;
  align-items: center;
  cursor: pointer;
  justify-content: center;
  border-bottom: 1px solid #f1f1f1;
}

.add-contact h2 {
  font-size: 14px;
  font-weight: 500;
}

.disabled-chat {
  background-color: #f1f1f1; /* Светло-серый цвет для отключенных чатов */
  cursor: not-allowed; /* Изменяем курсор на "не разрешен" */
  opacity: 0.6; /* Уменьшаем непрозрачность, чтобы показать, что элемент отключен */
  transition: background-color 0.3s ease, opacity 0.3s ease; /* Плавный переход */
}

.chat-item {
  transition: background-color 0.3s ease, opacity 0.3s ease; /* Плавный переход для обычного состояния */
}

/* Добавим эффект при наведении на отключенный чат */
.disabled-chat:hover {
  background-color: #e0e0e0; /* Немного темнее при наведении */
  opacity: 0.7; /* Увеличиваем непрозрачность при наведении */
}

.disabled-chat {
  background-color: #f1f1f1;
  cursor: not-allowed;
  opacity: 0.6;
}

.account-list {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  flex-direction: column;
  background-color: #f9f9f9;
}

.account-item {
  display: flex;
  font-size: 16px;
  margin-top: 4px;
  margin-left: 14px;
  margin-bottom: 4px;
}

.text-account-item {
  display: flex;
}

.checkbox-input {
  position: absolute;
  right: 0;
}

.svg-icon {
  fill: rgb(248, 82, 82);
  cursor: pointer;
}

.setting-chats-button {
  height: 40px;
  width: 100%;
  background-color: #f9f9f9;
  font-size: 14px;
}

.chat-item:hover {
  background-color: #f0f0f0;
  transition: background-color 0.3s ease, opacity 0.3s ease;
}

.chat-info {
  flex-grow: 1;
  font-size: 14px;
  display: flex;
  flex-direction: column;
}

.chat-user-cont {
  display: flex;
  align-items: center;
  gap: 12px;
}

.chat-name {
  font-size: 16px;
  font-weight: 400;
  margin-bottom: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-last-message {
  color: #888;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-meta {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.chat-timestamp {
  position: absolute;
  font-size: 12px;
  color: #888;
}

.chat-unread {
  position: absolute;
  background-color: #007bff;
  color: white;
  border-radius: 12px;
  padding: 2px 6px;
  font-size: 12px;
  bottom: 0;
}

.chat-list::-webkit-scrollbar {
  width: 6px;
}

.chat-list::-webkit-scrollbar-track {
  background-color: #f9f9f9;
}

.user-chat-avatar {
  width: 44px;
  border-radius: 100px;
}

.chat-list::-webkit-scrollbar-thumb {
  background: rgb(209, 209, 209);
  border-radius: 5px;
}

.chat-null-text {
  font-size: 16px;
  font-weight: 500;
}

.krig {
  width: 45px;
  height: 45px;
  background-color: red;
  border-radius: 100px;
}

.icon-chat-list {
  margin-right: 4px;
}

.add-new-chat {
  position: absolute;
  width: 45px;
  height: 45px;
  color: white;
  font-size: 20px;
  background: #4950ca;
  z-index: 2;
  bottom: 20px;
  right: 20px;
  border-radius: 100%;

}

.add-new-chat-animation {
  position: absolute;
  width: 45px;
  height: 45px;
  color: white;
  font-size: 20px;
  background: #4950ca;
  z-index: 2;
  bottom: 20px;
  right: 20px;
  border-radius: 100%;
  animation: pulse-circle 2s infinite; /* Добавляем анимацию */
}

@keyframes pulse-circle {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(73, 80, 202, 0.7); /* Цвет тени соответствует background */
  }
  70% {
    transform: scale(1.2); /* Увеличиваем немного больше, чем в предыдущем примере */
    box-shadow: 0 0 0 10px rgba(73, 80, 202, 0);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(73, 80, 202, 0);
  }
}

input[type="checkbox"] {
  /* Скрываем стандартный чекбокс */
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

label {
  position: relative;
  cursor: pointer;
  padding-left: 30px;
}

/* Создаем стилизованный чекбокс */
label:before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 20px;
  height: 20px;
  background-color: #fff;
  border: 1px solid #ccc;
  border-radius: 3px;
}

/* Стиль, когда чекбокс отмечен */
input[type="checkbox"]:checked + label:before {
  background-color: #2196f3;
  border: 1px solid #2196f3;
}

/* Иконка "галочка" */
label:after {
  content: "";
  position: absolute;
  display: none;
  top: 5px;
  left: 7px;
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 3px 3px 0;
  transform: rotate(45deg);
}

input[type="checkbox"]:checked + label:after {
  display: block;
}

@media (max-width: 1200px) {
  .chat-list {
    width: 350px;
  }
}

@media (max-width: 900px) {
  .chat-list {
    width: 300px;
  }
}

@media (max-width: 768px) {
  .chat-list {
    width: 100%;
  }
  .chat-list {
    width: 100%; /* Устанавливаем ширину списка чатов на 100% */
  }

  .chat-container {
    width: 100%;
  }
}
</style>
