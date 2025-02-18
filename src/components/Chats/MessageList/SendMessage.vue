<template>
  <ErrorBlock v-if="errorBlock" :changeIncorrectPassword="chaneErrorBlock" />
  <MessageContent v-if="station.messageContent" />
  <section class="send-message">
    <div class="img-cont">
      <img
        @click="openMessageContent"
        class="file-img"
        src="/chats/file.svg"
        alt=""
      />
      <article class="smile-img-cont">
        <input
          class="send-message-input"
          placeholder="Введите сообщение"
          type="text"
          v-model="messageText"
        />
        <img class="smile-img" src="/chats/smile.svg" alt="" />
      </article>
      <img @click="sendMessage" class="send-img" src="/chats/send.svg" alt="" />
    </div>
  </section>
</template>

<script setup>
import { ref, toRefs, computed, defineEmits, reactive } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";
const router = useRouter();
import MessageContent from "./MessageContent/MessageContent.vue";
import ErrorBlock from "@/components/ErrorBlock/ErrorBlock.vue";
const props = defineProps({
  chatInfo: {
    type: Object,
  },
  messages: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["updateMessages"]);
const { chatInfo } = toRefs(props);
const errorBlock = ref(false);
const chaneErrorBlock = () => {
  errorBlock.value = errorBlock.value;
};

const messageText = ref("");
const contentText = ref("привет");

const station = reactive({
  messageContent: false,
});

const openMessageContent = () => {
  station.messageContent = !station.messageContent;
};

const sendMessage = async () => {
  const parsedChatInfo = computed(() => {
    try {
      return JSON.parse(chatInfo.value.data);
    } catch (error) {
      console.error("Ошибка при парсинге JSON:", error);
      return {}; // Возвращаем пустой объект в случае ошибки
    }
  });
  const apiUrl = import.meta.env.VITE_API_URL;
  console.log(22794591901);
  const message = {
    to: `${chatInfo.value.phone}`,
    text: contentText.value ? contentText.value : messageText.value || null, // Используем contentText, если он есть, иначе messageText
    content: contentText.value
      ? [
          {
            type: "image",
            src: "https://touchapi-whats.s3.amazonaws.com/79228059886-79228556998-1A619D5426FF09D9E0F5233B7C6DF795.jpeg",
          },
        ] // Если contentText есть, то content пустой
      : [],
    time: Date.now() / 1000,
    outgoing: true,
  };
  console.log(message);

  try {
    const response = await axios.post(
      `${apiUrl}/sendMessage`,
      {
        source: "whatsapp",
        login: "helly",
        msg: message,
      },
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: `Bearer ${localStorage.getItem("accountToken")}`,
        },
      }
    );
    if (response.data === 401) {
      errorBlock.value = true;
      setTimeout(() => {
        localStorage.removeItem("accountToken");
        router.push("/login");
      }, 2000);
    }
    console.log("Сообщение отправлено:", response.data);
    emit("updateMessages", message); // Обновляем список сообщений
    messageText.value = "";
  } catch (error) {
    console.error("Ошибка при отправке сообщения:", error);
    if (error.response) {
      console.error("Ошибка сервера:", error.response.data);
    }
  }
};
</script>

<style scoped>
.send-message {
  width: 100%;
  padding: 10px 0px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 11px;
}

.img-cont {
  display: flex;
  align-items: center;
  gap: 14px;
  flex: 1;
}

.smile-img-cont {
  display: flex;
  position: relative;
  flex: 1;
}

.file-img,
.smile-img,
.send-img {
  cursor: pointer;
}

.send-img {
  margin-right: 20px;
}

.file-img {
  margin-left: 20px;
}

.smile-img {
  position: absolute;
  top: 11px;
  right: 12px;
}

.send-message-input {
  border-radius: 233px;
  width: 100%;
  height: 36px;
  border: 1px solid #d4d4d4;
  padding-left: 10px;
  box-sizing: border-box;
}
</style>
