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
          <img class="user-img" src="/chats/user-chat-icon.svg" alt="" />
          <div>
            <h2 class="name-user">{{ chatInfo.name }}</h2>
            <span class="status-user">Онлайн</span>
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
                'last-sent-message': index === lastSentMessageIndex,
              },
            ]"
          >
            <div class="message-content">
              <p v-if="message.text" class="message-text">
                {{ message.text }}
              </p>
              <div
                v-if="!message.send && message.outgoing"
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
              </div>
              <footer>
                <div class="message-time">
                  {{ formatTimestamp(message.time) }}
                </div>
                <img
                  class="state-img"
                  v-if="(message.send && !message.state) || !message.outgoing"
                  src="/chats/read_it.svg"
                  alt=""
                />
                <img
                  class="state-img"
                  v-if="message.send && message.state"
                  src="/chats/not_read_it.svg"
                  alt=""
                />
              </footer>
            </div>
          </div>
        </div>

        <Loading v-if="loading" />
        <SendMessage :chatInfo="chatInfo" @updateMessages="updateMessages" />
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
  // Если у нас есть последнее сообщение, устанавливаем его send в true
  if (lastSentMessageIndex.value !== -1) {
    messages.value[lastSentMessageIndex.value].send = true; // Сообщение завершено
  }

  // Добавляем новое сообщение в массив
  messages.value.push(newMessage);
  lastSentMessageIndex.value = messages.value.length - 1; // Обновляем индекс последнего отправленного сообщения

  // Устанавливаем новое сообщение в состояние отправки
  messages.value[lastSentMessageIndex.value].send = false;

  setTimeout(() => {
    scrollToBottom();
  }, 500);
};

// Функция для обновления состояния сообщения

const { chatInfo } = toRefs(props);

const getMessage = async () => {
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

const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp / 1000);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const changeLoading = () => {
  loading.value = !loading.value;
};

const changeMenuPhotoStation = () => {
  station.photoMenu = !station.photoMenu;
};
let previousChatInfo = null;
// watch(
//   () => chatInfo.value,
//   (newChatInfo) => {
//     if (JSON.stringify(newChatInfo) !== JSON.stringify(previousChatInfo)) {
//       loading.value = true;
//       getMessage();
//       previousChatInfo = newChatInfo; // Сохраняем текущее состояние
//     }
//   }
// );

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

// if (chatInfo.value) {
//   if (chatInfo.value.phone) {
//     getMessage();
//   }
// }

// onMounted(() => {
//   if (chatInfo.value) {
//     getMessage();
//   }
// });
const updateMessageState = (item) => {
  const messageToUpdate = messages.value.find(
    (message) => message.item === item
  );

  if (messageToUpdate) {
    messageToUpdate.state = true; // Обновляем поле state
  } else {
    console.log("Сообщение с таким thread не найдено");
  }
};
onMounted(() => {
  const eventSource = new EventSource(
    "https://hellychat.apitter.com/api/events"
  );

  eventSource.onmessage = (event) => {
    const eventData = JSON.parse(event.data);

    console.log(eventData);

    if (eventData.hook_type === "message") {
      const newMessage = {
        ...eventData,
        state: false,
        reaction: "",
        send: false,
      };
      updateMessages(newMessage);
    }

    if (eventData.content && eventData.hook_type === "message_status") {
      if (eventData.content[0].type === "delivered") {
        console.log("доставдено");
        const messageToUpdate = messages.value.find(
          (message) => message.item === eventData.item
        );

        if (messageToUpdate) {
          messageToUpdate.send = true;
        } else {
          console.log("Сообщение с таким thread не найдено");
        }
      } else if (eventData.content[0].type === "has_seen") {
        const messageToUpdate = messages.value.find(
          (message) => message.item === eventData.item
        );

        if (messageToUpdate) {
          messageToUpdate.state = true;
        } else {
          console.log("Сообщение с таким thread не найдено");
        }
      }
    } else {
      console.log("Content не найден");
    }
  };

  eventSource.onerror = (error) => {
    console.error("Ошибка SSE:", error);
    eventSource.close(); // Закрываем соединение при ошибке
  };
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
