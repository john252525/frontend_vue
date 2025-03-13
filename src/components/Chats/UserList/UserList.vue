<template>
  <ErrorBlock v-if="errorBlock" :changeIncorrectPassword="chaneErrorBlock" />
  <aside class="chat-list">
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
          v-if="chat.data.avatar"
          class="user-chat-avatar"
          :src="chat.data.avatar"
          alt=""
        />
        <img
          v-else
          class="user-chat-icon"
          src="/chats/user-chat-icon.svg"
          alt=""
        />
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
    <section class="loading-chat-list" v-if="!chats && !errorStation">
      <Loading />
    </section>
    <section class="error-section" v-if="!chats && errorStation">
      <Error />
    </section>
  </aside>
</template>

<script setup>
import axios from "axios";
import { onMounted, ref, watch, computed, defineProps, toRefs } from "vue";
import Loading from "./Loading.vue";
import ErrorBlock from "@/components/ErrorBlock/ErrorBlock.vue";
import { useRouter, useRoute } from "vue-router";
import Error from "./Error.vue";

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
});

const { isChatClickable, webhookEventData } = toRefs(props);
console.log(isChatClickable.value);
const errorBlock = ref(false);
const chats = ref(null);
const userInfo = JSON.parse(localStorage.getItem("userInfo"));
const chatInfo = ref(null);
const errorStation = ref(false);

const selectChatClick = (chat) => {
  props.selectChat(chat);
  chatInfo.value = chat;
};

const updateChatTimestamp = (thread, newTimestamp) => {
  // Преобразуем новый timestamp из миллисекунд (предположительно) в секунды
  const newTimestampInSeconds = Math.floor(newTimestamp / 1000000); // Делим на 1000

  // Ищем чат, где uniq соответствует thread
  const chat = chats.value.find((chat) => chat.uniq === thread);

  if (chat) {
    console.log("Новое (в секундах):", newTimestampInSeconds);
    console.log("Старое:", chat.data.timestamp);

    // Обновляем timestamp внутри lastMessage
    chat.data.timestamp = newTimestampInSeconds;
    console.log(`Timestamp для ${thread} обновлён на ${newTimestampInSeconds}`);
  } else {
    console.log(`Чат с thread ${thread} не найден`);
  }
};

const updateLastMessage = (thread, newLastMessage) => {
  // console.log(
  //   "СОООООООООООООООООООООБЩЕНИЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕ",
  //   newLastMessage
  // );
  const chat = chats.value.find((chat) => chat.uniq === thread);
  console.log(thread, "чат thread message");
  if (chat) {
    console.log(chat);
    if (chat.data.lastMessage) {
      chat.data.lastMessage.body = newLastMessage;
      console.log(`Последнее сообщение для ${thread} обновлено`);
    } else {
      console.log(`lastMessage для чата с thread ${thread} не найден`);
    }
  } else {
    console.log(`Чат с thread ${thread} не найден`);
  }
};

const updateCountNewMessage = (thread) => {
  const chat = chats.value.find((chat) => chat.uniq === thread);
  console.log(chat.newMessage);
  if (chat) {
    if (chat) {
      chat.newMessage = chat.newMessage + 1;
      console.log(`Последнее сообщение для ${thread} обновлено`);
    } else {
      console.log(`lastMessage для чата с thread ${thread} не найден`);
    }
  } else {
    console.log(`Чат с thread ${thread} не найден`);
  }
};

const clearCountNewMessage = (thread) => {
  const chat = chats.value.find((chat) => chat.uniq === thread);

  if (chat) {
    if (chat.newMessage) {
      chat.newMessage++;
      console.log(`Последнее сообщение для ${thread} обновлено`);
    } else {
      console.log(`lastMessage для чата с thread ${thread} не найден`);
    }
  } else {
    console.log(`Чат с thread ${thread} не найден`);
  }
};

const test = async () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  console.log("userInfo:", userInfo);

  const isMulti = computed(() => {
    return route.query.multi === "true"; // Проверяем значение multi
  });

  console.log("Значение multi:", route.query.multi);
  console.log("isMulti:", isMulti.value);

  try {
    const token = localStorage.getItem("accountToken");
    console.log("Token:", token);

    // Получаем логин в зависимости от значения multi
    const logins = isMulti.value
      ? JSON.parse(localStorage.getItem("loginWhatsAppChatsStep")) || []
      : userInfo?.login;

    console.log("Используемый логин:", logins);

    const response = await axios.post(
      `${apiUrl}/getChats`,
      {
        source: userInfo?.source,
        login: logins, // Используем определенный логин
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

    console.log("Response data:", response);
    chats.value = response.data.data.chats;
    console.log("Chats:", chats.value);
  } catch (error) {
    errorStation.value = true;

    setTimeout(() => {
      localStorage.removeItem("loginWhatsAppChatsStep");
      router.push("/accounts");
    }, 2000);
    console.error("Ошибка при получении сообщений:", error);
    if (error.response) {
      errorStation.value = true;
      console.error("Ошибка сервера:", error.response.data);
    }
  }
};

const formatTimestamp = (timestamp) => {
  // Проверяем, что timestamp является строкой или числом
  if (typeof timestamp === "string") {
    timestamp = parseFloat(timestamp);
  }

  if (typeof timestamp !== "number" || isNaN(timestamp)) {
    console.warn("Предупреждение: timestamp должен быть числом.", {
      originalInput: timestamp,
    });
    return "Некорректный ввод";
  }

  // Создаем объект Date, передавая timestamp как секунды
  const date = new Date(timestamp * 1000); // <---  Умножаем на 1000 (были секунды)
  console.log(date, "ДАААААААТАААААААААААААААААААААААААААА");
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
console.log(formattedTime); // Выведет дату и время в формате "DD.MM.YYYY HH:mm:ss"

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
.chat-list {
  width: 450px;
  border-right: 1px solid #eaeaea;
  overflow-y: auto;
  overflow-x: hidden;
  height: 100vh;
  position: relative;
}

.loading-chat-list {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 94vh;
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

.krig {
  width: 45px;
  height: 45px;
  background-color: red;
  border-radius: 100px;
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
}
</style>
