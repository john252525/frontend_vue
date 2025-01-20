<template>
  <section v-if="!chatInfo" class="no-message-section">
    <h2 class="change-message">Выберите чат для начала общения</h2>
  </section>
  <section v-else class="app-section">
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
        <div v-if="!loading" class="messages">
          <div
            v-for="message in messages"
            :key="message.item"
            :class="['message', message.outgoing ? 'outgoing' : 'incoming']"
          >
            <div class="message-content">
              <p v-if="message.text" class="message-text">{{ message.text }}</p>
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
                alt="Sticker"
                class="img-message"
              />
              <div class="message-time">
                {{ formatTimestamp(message.time) }}
              </div>
            </div>
          </div>
        </div>
        <Loading v-if="loading" />
        <SendMessage />
      </section>
    </section>
  </section>
</template>

<script setup>
import { ref, onMounted, watch, toRefs } from "vue";
import axios from "axios";
import SendMessage from "./SendMessage.vue";
import Loading from "./Loading.vue";
const loading = ref(false);
const props = defineProps({
  chatInfo: {
    type: Object,
  },
  changeMessageListStation: {
    type: Function,
  },
});
const { chatInfo } = toRefs(props);
const messages = ref(null);
const getMessage = async () => {
  console.log(localStorage.getItem("accountToken"));
  try {
    const response = await axios.post(
      "https://b2288.apitter.com/instances/getChatMessages",
      {
        source: "whatsapp",
        login: "helly",
        to: chatInfo.value.phone,
      },
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: `Bearer ${localStorage.getItem("accountToken")}`,
        },
      }
    );
    console.log(response.data);
    if (response.data.ok === true) {
      changeLoading();
      messages.value = response.data.data.messages;
      console.log(messages.value);
      console.log(response.data);
    } else {
      console.log(response.data.ok);
    }
  } catch (error) {
    console.error("Ошибка при создании аккаунта:", error);
    if (error.response) {
      console.error("Ошибка сервера:", error.response.data);
    }
  }
};
const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp / 1000); // Преобразуем миллисекунды в секунды
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const formatMessageText = (text) => {
  const maxLength = 50;
  return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
};

const changeLoading = () => {
  loading.value = !loading.value;
  console.log(loading.value);
};

watch(
  () => chatInfo.value,
  (newPhone) => {
    console.log("новые");
    changeLoading();
    getMessage();
  }
);

if (chatInfo.value) {
  if (chatInfo.value.phone) {
    getMessage();
  }
}
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
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  background-color: #f9f9f9;
  position: relative;
}

.user-info-section {
  z-index: 100;
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
  font-weight: 600;
  font-size: 16px;
  color: #000;
  margin-bottom: -5px;
}

.sticker {
  width: 100px;
  border-radius: 10px;
}

.img-message {
  border-radius: 10px;
  width: 250px;
}

.status-user {
  font-weight: 500;
  font-size: 12px;
  color: #969696;
}

.user-img {
  width: 35px;
  height: 35px;
}

.message {
  margin: 5px 15px;
  max-width: 70%;
  border-radius: 10px;
  padding: 10px;
  position: relative;
}

.outgoing {
  align-self: flex-end;
  background-color: #e1ffc7;
}

.incoming {
  align-self: flex-start;
  background-color: #f1f1f1;
}

.message-content {
  display: flex;
  flex-direction: column;
}

.message-time {
  font-size: 12px;
  color: #888;
  margin-top: 5px;
}

.phone-out {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-right: 10px;
}

.out-text {
  margin-top: -2px;
  color: #bcbcbc;
  font-weight: 400;
}

@media (max-width: 768px) {
  .chat-container {
    width: 100%;
  }
  .chat-container {
    height: calc(100vh - 40px);
  }
}
</style>
