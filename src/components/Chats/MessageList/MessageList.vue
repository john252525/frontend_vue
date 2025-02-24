<template>
  <section v-if="!chatInfo" class="no-message-section">
    <h2 class="change-message">Выберите чат для начала общения</h2>
  </section>
  <section v-else class="app-section">
    <ErrorBlock v-if="errorBlock" :changeIncorrectPassword="chaneErrorBlock" />
    <section class="chat-section">
      <section class="message-section">
        <header class="user-info-section">
          <div @click="changeMessageListStation" class="phone-out">
            <img src="/chats/out.svg" alt="" />
            <span class="out-text">Назад</span>
          </div>
          <img
            v-if="chatInfo.avatar"
            class="user-img"
            :src="chatInfo.avatar"
            alt=""
          />
          <img v-else class="user-img" src="/chats/user-chat-icon.svg" alt="" />
          <div>
            <h2 class="name-user">{{ chatInfo.name }}</h2>
          </div>
        </header>
        <div ref="scrollContainer" v-if="!loading" class="messages">
          <div
            v-for="(message, index) in messages"
            :key="message.time"
            :class="[
              'message',
              message.outgoing ? 'outgoing' : 'incoming',
              {
                'has-content': message.content && message.content.length > 0,
              },
            ]"
          >
            <div class="message-content">
              <p v-if="message.text" class="message-text">
                {{ message.text }}
              </p>
              <div
                v-if="
                  message.state === 'send' &&
                  message.outgoing &&
                  apiUrl != 'https://b2288.apitter.com/instances'
                "
                class="icon-container"
              >
                <LoadingMessage />
              </div>
              <div class="message-content">
                <img
                  v-if="
                    message.content &&
                    message.content.length > 0 &&
                    message.content[0].src &&
                    message.content[0].type === 'sticker'
                  "
                  :src="message.content[0].src"
                  alt="Sticker"
                  class="sticker"
                />
                <img
                  v-if="
                    message.content &&
                    message.content.length > 0 &&
                    message.content[0].src &&
                    message.content[0].type === 'image'
                  "
                  :src="message.content[0].src"
                  alt="Image"
                  class="img-message"
                  @click="openPhotoMenu(message.content[0].src)"
                />
                <PhotoMenu
                  :changeMenuPhotoStation="changeMenuPhotoStation"
                  :img="selectedImage"
                  v-if="station.photoMenu"
                />
                <video
                  v-if="
                    message.content &&
                    message.content.length > 0 &&
                    message.content[0].src &&
                    message.content[0].type === 'video'
                  "
                  controls
                  :src="message.content[0].src"
                  class="video-message"
                  @click="openVideoMenu(message.content[0].src)"
                >
                  Ваш браузер не поддерживает видео.
                </video>
                <audio
                  v-if="
                    message.content &&
                    message.content.length > 0 &&
                    message.content[0].src &&
                    message.content[0].type === 'audio'
                  "
                  controls
                  :src="message.content[0].src"
                  class="audio-message"
                >
                  Ваш браузер не поддерживает аудио.
                </audio>
                <h2
                  v-if="
                    message.content &&
                    message.content.length > 0 &&
                    message.content[0].type === 'geo'
                  "
                  class="geo-message"
                >
                  Сообщение не поддерживается
                </h2>
                <div
                  class="content-file"
                  v-if="
                    message.content &&
                    message.content.length > 0 &&
                    message.content[0].src &&
                    message.content[0].type === 'file'
                  "
                  @click="downloadFile(message.content[0].src)"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="100"
                    height="100"
                    viewBox="0 0 1024 1024"
                    class="svg-icon"
                  >
                    <path
                      d="M854.6 288.7c6 6 9.4 14.1 9.4 22.6V928c0 17.7-14.3 32-32 32H192c-17.7 0-32-14.3-32-32V96c0-17.7 14.3-32 32-32h424.7c8.5 0 16.7 3.4 22.7 9.4zM790.2 326L602 137.8V326zM633.22 637.26c-15.18-.5-31.32.67-49.65 2.96c-24.3-14.99-40.66-35.58-52.28-65.83l1.07-4.38l1.24-5.18c4.3-18.13 6.61-31.36 7.3-44.7c.52-10.07-.04-19.36-1.83-27.97c-3.3-18.59-16.45-29.46-33.02-30.13c-15.45-.63-29.65 8-33.28 21.37c-5.91 21.62-2.45 50.07 10.08 98.59c-15.96 38.05-37.05 82.66-51.2 107.54c-18.89 9.74-33.6 18.6-45.96 28.42c-16.3 12.97-26.48 26.3-29.28 40.3c-1.36 6.49.69 14.97 5.36 21.92c5.3 7.88 13.28 13 22.85 13.74c24.15 1.87 53.83-23.03 86.6-79.26c3.29-1.1 6.77-2.26 11.02-3.7l11.9-4.02c7.53-2.54 12.99-4.36 18.39-6.11c23.4-7.62 41.1-12.43 57.2-15.17c27.98 14.98 60.32 24.8 82.1 24.8c17.98 0 30.13-9.32 34.52-23.99c3.85-12.88.8-27.82-7.48-36.08c-8.56-8.41-24.3-12.43-45.65-13.12M385.23 765.68v-.36l.13-.34a54.86 54.86 0 0 1 5.6-10.76c4.28-6.58 10.17-13.5 17.47-20.87c3.92-3.95 8-7.8 12.79-12.12c1.07-.96 7.91-7.05 9.19-8.25l11.17-10.4l-8.12 12.93c-12.32 19.64-23.46 33.78-33 43c-3.51 3.4-6.6 5.9-9.1 7.51a16.43 16.43 0 0 1-2.61 1.42c-.41.17-.77.27-1.13.3a2.2 2.2 0 0 1-1.12-.15a2.07 2.07 0 0 1-1.27-1.91M511.17 547.4l-2.26 4l-1.4-4.38c-3.1-9.83-5.38-24.64-6.01-38c-.72-15.2.49-24.32 5.29-24.32c6.74 0 9.83 10.8 10.07 27.05c.22 14.28-2.03 29.14-5.7 35.65zm-5.81 58.46l1.53-4.05l2.09 3.8c11.69 21.24 26.86 38.96 43.54 51.31l3.6 2.66l-4.39.9c-16.33 3.38-31.54 8.46-52.34 16.85c2.17-.88-21.62 8.86-27.64 11.17l-5.25 2.01l2.8-4.88c12.35-21.5 23.76-47.32 36.05-79.77zm157.62 76.26c-7.86 3.1-24.78.33-54.57-12.39l-7.56-3.22l8.2-.6c23.3-1.73 39.8-.45 49.42 3.07c4.1 1.5 6.83 3.39 8.04 5.55a4.64 4.64 0 0 1-1.36 6.31a6.7 6.7 0 0 1-2.17 1.28"
                    />
                  </svg>
                </div>
              </div>
              <footer>
                <div class="message-time">
                  {{ formatTimestamp(message.time) }}
                </div>
                <img
                  class="state-img"
                  v-if="message.state === 'delivered' && message.outgoing"
                  src="/chats/read_it.svg"
                  alt=""
                />
                <img
                  class="state-img"
                  v-if="message.state === 'has_seen' && message.outgoing"
                  src="/chats/not_read_it.svg"
                  alt=""
                />
                <img
                  class="state-img"
                  v-if="message.state === 'sendMessage' && message.outgoing"
                  src="/chats/sned_message_state.svg"
                  alt=""
                />
                <img
                  class="state-img"
                  v-if="message.state === 'error' && message.outgoing"
                  src="/chats/send_message_error.svg"
                  alt=""
                />
              </footer>
            </div>
          </div>
        </div>

        <Loading v-if="loading" />
        <SendMessage
          :changeMessageState="changeMessageState"
          :chatInfo="chatInfo"
          @updateMessages="updateMessages"
        />
      </section>
    </section>
  </section>
</template>
<!-- slice().reverse() -->
<script setup>
import { ref, onMounted, computed, watch, toRefs, reactive } from "vue";
import axios from "axios";
import SendMessage from "./SendMessage.vue";
import ErrorBlock from "@/components/ErrorBlock/ErrorBlock.vue";
import Loading from "./Loading.vue";
import LoadingMessage from "./Loading/LoadingMessage.vue";
import PhotoMenu from "./MenuContent/PhotoMenu.vue";

import { useRouter } from "vue-router";
const router = useRouter();
const loading = ref(false);
const props = defineProps({
  chatInfo: {
    type: Object,
  },
  changeMessageListStation: {
    type: Function,
  },
});

const loadingMessageIndex = ref(-1);
const apiUrl = import.meta.env.VITE_API_URL;
const lastSentMessageIndex = ref(-1);
const messages = ref([]); // Инициализация массива сообщений

const station = reactive({
  photoMenu: false,
  videoMenu: false,
});

const testMsg = {
  to: "79198670001",
  from: "79228556998",
  item: "3A24BA98AB791BCAAE9F",
  text: "А кто ты такой?",
  time: 1739979536000000,
  state: true,
  source: "whatsapp",
  thread: "79198670001@c.us",
  content: [],
  replyTo: null,
  outgoing: true,
  reaction: "",
  send: true,
};

const changeMessageState = (newMessage, tempId) => {
  console.log("вгеме77ше 1в", tempId);
  const trackAndRemoveAndAddMessage = (tempId) => {
    // Ищем индекс сообщения по тексту
    const messageIndex = messages.value.findIndex(
      (message) => message.tempId === tempId
    );

    if (messageIndex !== -1) {
      // Удаляем сообщение из массива
      const removedMessage = messages.value.splice(messageIndex, 1)[0];
      console.log("Сообщение удалено:", removedMessage);

      // Добавляем новое сообщение
      messages.value.push(newMessage);
      console.log("Добавлено новое сообщение:", newMessage);
    } else {
      console.log("Сообщение с таким текстом не найдено:", newMessage);
      // Если сообщение не найдено, просто добавляем новое
      messages.value.push(newMessage);
      console.log("Добавлено новое сообщение:", newMessage);
    }
  };

  setTimeout(() => {
    scrollToBottom();
  }, 500);

  // Вызов функции для отслеживания, удаления и добавления
  trackAndRemoveAndAddMessage(tempId);
  console.log(messages);
};

const errorBlock = ref(false);
const chaneErrorBlock = () => {
  errorBlock.value = errorBlock.value;
};

const scrollContainer = ref(null);

const scrollToBottom = () => {
  if (scrollContainer.value) {
    scrollContainer.value.scrollTop = scrollContainer.value.scrollHeight;
  }
};

const updateMessages = (newMessage) => {
  messages.value.push(newMessage);

  setTimeout(() => {
    scrollToBottom();
  }, 500);
};

// Функция для обновления состояния сообщения

const { chatInfo } = toRefs(props);

const pageTitle = computed(() => {
  return chatInfo.value && chatInfo.value.name ? chatInfo.value.name : "Чат";
});

// Устанавливаем заголовок страницы
watch(pageTitle, (newTitle) => {
  document.title = newTitle;
});

const getMessage = async () => {
  console.log(chatInfo.value);
  console.log("chatInfo.value.unid:", chatInfo.value.unid);
  console.log("getMessage вызван в", new Date().toISOString());
  try {
    const token = localStorage.getItem("accountToken");
    console.log("Token:", token);

    // Функция для парсинга chatInfo.value.data

    // "http://localhost:4000/api/getChatMessages",
    // "https://hellychat.apitter.com/api/getChatMessages",
    console.log(chatInfo.value.lastMessage.id.remote);
    const response = await axios.post(
      `${apiUrl}/getChatMessages`,
      {
        source: "whatsapp",
        login: "helly",
        to: chatInfo.value.phone,
        uniq: chatInfo.value.lastMessage.id.remote,
      },
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("Response status:", response.status);
    console.log("Response data:", response.data);

    if (response.data.ok === true) {
      loading.value = false;

      // Распарсить каждое сообщение
      messages.value = response.data.data.messages;
      console.log(messages);
      setTimeout(() => {
        scrollToBottom();
      }, 200);
      console.log("Messages:", messages.value);
    } else if (response.status === 401 || response.data.errorMessage === 401) {
      console.log("Ошибка авторизации");
      errorBlock.value = true;
      setTimeout(() => {
        localStorage.removeItem("accountToken");
        router.push("/login");
      }, 2000);
    } else {
      console.log("Response ok:", response.data.ok);
    }
  } catch (error) {
    console.error("Ошибка при получении сообщений:", error);
    if (error.response) {
      console.error("Ошибка сервера:", error.response.data);
    }
  }
};

const downloadFile = (url) => {
  const link = document.createElement("a"); // Создаем временный элемент <a>
  link.href = url; // Устанавливаем URL
  link.download = ""; // Устанавливаем атрибут download для инициирования скачивания
  document.body.appendChild(link); // Добавляем элемент в DOM
  link.click(); // Имитируем клик по элементу
  document.body.removeChild(link); // Удаляем элемент из DOM
};

const formatTimestamp = (timestamp) => {
  let seconds;

  // Проверяем, в каком формате передан timestamp
  if (timestamp > 1_000_000_000) {
    // Если больше 1 миллиарда, значит это микросекунды
    seconds = timestamp / 1_000_000; // Переводим в секунды
  } else {
    seconds = timestamp; // Значит это уже в секундах
  }

  const date = new Date(seconds * 1000); // Умножаем на 1000 для перевода в миллисекунды
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const changeLoading = () => {
  loading.value = !loading.value;
};

const changeMenuPhotoStation = () => {
  station.photoMenu = !station.photoMenu;
};
let previousChatInfo = null;

watch(
  () => chatInfo.value,
  (newChatInfo) => {
    if (!loading.value) {
      console.log("вывы");
      // Проверка состояния загрузки
      loading.value = true;
      getMessage();
    }
  }
);

const selectedImage = ref(null);

const openPhotoMenu = (src) => {
  selectedImage.value = src;
  station.photoMenu = true;
};

const updateMessageState = (item) => {
  const messageToUpdate = messages.value.find(
    (message) => message.item === item
  );
  console.log(messages.value);
  if (messageToUpdate) {
    messageToUpdate.state = true;
  } else {
    console.log("Сообщение с таким thread не найдено");
  }
};

onMounted(() => {
  const connectEventSource = () => {
    const eventSource = new EventSource(
      "https://hellychat.apitter.com/api/events"
    );

    // Получаем массив идентификаторов из localStorage или создаем новый
    const receivedMessageIds =
      JSON.parse(localStorage.getItem("receivedMessageIds")) || [];

    eventSource.onmessage = (event) => {
      const eventData = JSON.parse(event.data);

      console.log(eventData);

      // Проверяем тип события
      if (eventData.hook_type === "message") {
        // Проверка на уникальность сообщения
        if (!eventData.outgoing) {
          if (!receivedMessageIds.includes(eventData.item)) {
            const newMessage = {
              ...eventData,
              state: false,
              reaction: "",
            };

            // Сохраняем идентификатор в localStorage
            receivedMessageIds.push(eventData.item);
            localStorage.setItem(
              "receivedMessageIds",
              JSON.stringify(receivedMessageIds)
            );

            // Обновляем сообщения
            updateMessages(newMessage);
          }
        }
      }

      if (eventData.content && eventData.hook_type === "message_status") {
        if (eventData.content[0].type === "delivered") {
          console.log("доставлено");
          const messageToUpdate = messages.value.find(
            (message) => message.item === eventData.item
          );

          if (messageToUpdate) {
            messageToUpdate.state = "delivered";
            console.log(messages);
          } else {
            console.log("Сообщение с таким thread не найдено");
          }
        } else if (eventData.content[0].type === "has_seen") {
          const messageToUpdate = messages.value.find(
            (message) => message.item === eventData.item
          );

          if (messageToUpdate) {
            messageToUpdate.state = "has_seen";
            console.log(messages);
          } else {
            console.log("Сообщение с таким thread не найдено");
          }
        }
      } else {
        console.log("Content не найден");
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
</script>

<style scoped>
.messages {
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  flex: 1;
  margin-top: 60px;
}

.messages::-webkit-scrollbar {
  width: 10px;
}

.messages::-webkit-scrollbar-track {
  background: transparent;
}

.messages::-webkit-scrollbar-thumb {
  background: rgb(209, 209, 209);
  border-radius: 5px;
}

.last-sent-message {
  background-color: #e1ffc7; /* Цвет фона для последнего отправленного сообщения */
}

/* Стили для иконки */
.icon-container {
  display: flex;
  align-items: center;
}

.state-img {
  width: 14px;
}

.svg-icon {
  fill: rgb(110, 110, 110);
}

.message-icon {
  width: 20px; /* Ширина иконки */
  height: 20px; /* Высота иконки */
  margin-left: 5px; /* Отступ слева от текста сообщения */
}

.no-message-section {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
}

.content-file {
  cursor: pointer;
}

.change-message {
  font-size: 16px;
  font-weight: 500;
  background-color: #f1f1f1;
  padding: 4px 10px;
  border-radius: 20px;
}

.geo-message {
  font-weight: 400;
  font-size: 16px;
  color: #000;
  font-style: italic;
}

.app-section {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.chat-section {
  width: 100%;
  display: flex;
  flex-direction: column;
  flex: 1;
  border-radius: 10px;
  overflow: hidden;
}

.message-section {
  flex: 1; /* Позволяет занимать оставшееся пространство */
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  background-color: #f9f9f9;
  position: relative;
  max-height: 100vh;
  min-height: 100vh;
}

.user-info-section {
  z-index: 5;
  position: absolute;
  margin-top: 10px;
  padding-left: 18px;
  width: auto;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
  box-sizing: border-box;
}

.name-user {
  font-weight: 400;
  font-size: 16px;
  color: #000;
  margin-bottom: -5px;
}

.video-message {
  width: 250px;
  border-radius: 10px;
  margin-bottom: 8px;
}

.audio-message {
  width: 300px;
  border-radius: 10px;
  margin-bottom: 8px;
}

.sticker {
  width: 100px;
  border-radius: 10px;
}

.img-message {
  border-radius: 10px;
  width: 350px;
  cursor: pointer;
}

.status-user {
  font-weight: 400;
  font-size: 12px;
  color: #969696;
}

.user-img {
  width: 35px;
  height: 35px;
  border-radius: 100px;
}

.message {
  position: relative;
  padding: 10px;
}

/* Уменьшенный паддинг для сообщений с контентом */
.has-content {
  padding: 5px; /* Уменьшенный паддинг для сообщений с контентом */
}

/* Уменьшенный паддинг для исходящих сообщений с контентом */
.outgoing.has-content {
  padding: 6px; /* Уменьшенный паддинг для исходящих сообщений с контентом */
}

/* Уменьшенный паддинг для входящих сообщений с контентом */
.incoming.has-content {
  padding: 6px; /* Уменьшенный паддинг для входящих сообщений с контентом */
}

.outgoing {
  margin: 5px 30px;
  max-width: 70%;
  border-radius: 10px;
  padding: 10px;
  align-self: flex-end;
  background-color: #e1ffc7;
  box-shadow: -2px 2px 4px 0 rgba(0, 0, 0, 0.08), 0 0 6px 0 rgba(0, 0, 0, 0.02);
}

.incoming {
  margin: 5px 30px;
  max-width: 70%;
  border-radius: 10px;
  padding: 10px;
  align-self: flex-start;
  box-shadow: 2px 2px 4px 0 rgba(0, 0, 0, 0.08), 0 0 6px 0 rgba(0, 0, 0, 0.02);
  background: #f1f1f1;
}

.outgoing::before {
  content: "";
  position: absolute;
  top: 0;
  right: -14px;
  width: 20px;
  height: 20px;
  background-color: red;
  background: linear-gradient(
    135deg,
    #e1ffc7 0%,
    #e1ffc7 50%,
    transparent 50%,
    transparent
  );
}

.incoming::before {
  content: "";
  position: absolute;
  top: 0;
  left: -14px;
  width: 20px;
  height: 20px;
  background-color: red;
  background: linear-gradient(
    225deg,
    #f1f1f1 0%,
    #f1f1f1 50%,
    transparent 50%,
    transparent
  );
}

.message-content {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.message-time {
  font-size: 12px;
  color: #888;
}

.phone-out {
  display: none;
}

.out-text {
  margin-top: -2px;
  color: #bcbcbc;
  font-weight: 400;
}

footer {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 5px;
}

@media (max-width: 520px) {
  .img-message {
    border-radius: 10px;
    width: 250px;
    cursor: pointer;
  }
}

@media (max-width: 768px) {
  .chat-container {
    width: 100%;
  }
  .chat-container {
    height: calc(100vh - 40px);
  }

  .phone-out {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-right: 10px;
  }
}
</style>
