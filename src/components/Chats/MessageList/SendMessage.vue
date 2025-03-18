<template>
  <ErrorBlock v-if="errorBlock" :changeIncorrectPassword="chaneErrorBlock" />
  <MessageContent
    :openMessageContent="openMessageContent"
    :changeImgUrl="changeImgUrl"
    :openCameraStation="openCameraStation"
    v-if="station.messageContent"
  />
  <checkImg
    :changeImgUrl="changeImgUrl"
    v-if="urlImg"
    @messages="messages"
    :chatInfo="chatInfo"
    :urlImg="urlImg"
    :typeUrl="typeUrl"
  />
  <Camera
    v-if="station.cameraStation"
    :changeImgUrl="changeImgUrl"
    :openCameraStation="openCameraStation"
  />
  <section class="send-photo">
    <img class="send" :src="urlImg" alt="" />
  </section>
  <section class="send-message">
    <section v-if="replyToDataBolean" class="reply-section">
      <section class="content">
        <h2 class="number-user">
          {{ formatPhoneNumber(replyToData.data.from) }}
        </h2>
        <h2 class="message-user">
          {{ replyToData.data.text }}
        </h2>
      </section>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        class="close-img"
        @click="offReplyToDataBoleanFalse"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="m16 16l-4-4m0 0L8 8m4 4l4-4m-4 4l-4 4"
        />
      </svg>
    </section>
    <div class="img-cont">
      <img
        @click="openMessageContent"
        class="file-img"
        src="/chats/file.svg"
        alt=""
      />
      <article class="smile-img-cont">
        <Emoji
          v-if="station.emoji"
          @closeEmoji="closeEmojiModal"
          @addEmoji="insertEmoji"
        />
        <input
          v-if="urlImg"
          class="send-message-input"
          placeholder="Добавить подпись"
          type="text"
          v-model="contentText"
        />
        <input
          v-else
          class="send-message-input"
          placeholder="Введите сообщение"
          type="text"
          v-model="messageText"
        />
        <img
          @click="changeStatinonEmoji"
          class="smile-img"
          src="/chats/smile.svg"
          alt=""
        />
      </article>
      <img @click="sendMessage" class="send-img" src="/chats/send.svg" alt="" />
    </div>
  </section>
</template>

<script setup>
import { ref, toRefs, computed, watch, defineEmits, reactive } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";
import checkImg from "./MessageContent/checkContent/CheckImg.vue";
import Camera from "./MessageContent/checkContent/Camera.vue";
import Emoji from "./MessageContent/Emoji.vue";
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
  changeMessageState: {
    type: Function,
  },
  replyToData: {
    type: Object,
  },
  replyToDataBolean: {
    type: Boolean,
  },
  offReplyToDataBolean: {
    type: Function,
  },
  offReplyToDataBoleanFalse: {
    type: Function,
  },
  clearDataToReply: {
    type: Function,
  },
});

// const emit = defineEmits(["updateMessages"]);
const { chatInfo, replyToData, replyToDataBolean } = toRefs(props);

const errorBlock = ref(false);
const chaneErrorBlock = () => {
  errorBlock.value = errorBlock.value;
};

const messageText = ref("");
const contentText = ref("");
const urlImg = ref("");
const typeUrl = ref(false);

const station = reactive({
  messageContent: false,
  cameraStation: false,
  emoji: false,
});

const changeStatinonEmoji = () => {
  station.emoji = !station.emoji;
};

const closeEmojiModal = () => {
  station.emoji = false;
};

const openCameraStation = () => {
  station.cameraStation = !station.cameraStation;
};

const openMessageContent = () => {
  station.messageContent = !station.messageContent;
};

function formatPhoneNumber(phoneNumber) {
  // Удаляем все нецифровые символы
  const cleaned = phoneNumber.replace(/\D/g, "");

  // Проверяем, что номер состоит из 11 цифр (для России)
  if (cleaned.length !== 11) {
    throw new Error("Неверный формат номера. Должно быть 11 цифр.");
  }

  // Форматируем номер
  const countryCode = cleaned[0];
  const areaCode = cleaned.slice(1, 4);
  const firstPart = cleaned.slice(4, 7);
  const secondPart = cleaned.slice(7, 9);
  const thirdPart = cleaned.slice(9, 11);

  // Собираем номер в нужном формате
  return `+${countryCode} ${areaCode} ${firstPart}-${secondPart}-${thirdPart}`;
}

const insertEmoji = (emoji) => {
  if (contentText.value) {
    contentText.value += emoji; // Добавляем эмодзи в contentText
  } else {
    messageText.value += emoji; // Добавляем эмодзи в messageText
  }
};

const changeImgUrl = (url, type) => {
  urlImg.value = url;
  typeUrl.value = type;
};

const generateItem = () => {
  // Генерируем случайный 16-значный шестнадцатеричный код
  return (
    "sendM-" +
    [...Array(16)]
      .map(() => Math.floor(Math.random() * 16).toString(16))
      .join("")
      .toUpperCase()
  );
};

const generateItemNew = () => {
  // Генерируем случайный 16-значный шестнадцатеричный код
  return [...Array(16)]
    .map(() => Math.floor(Math.random() * 16).toString(16))
    .join("")
    .toUpperCase();
};
const date = new Date();
function convertToMicroseconds(date) {
  if (!(date instanceof Date)) {
    // Если передан некорректный объект, используем текущее время
    date = new Date();
  }
  return Math.floor(date.getTime() * 1000); // Преобразуем миллисекунды в микросекунды
}

// Пример использования
const microseconds = convertToMicroseconds(); // Вызываем без аргументов

const specificMicroseconds = convertToMicroseconds(date);

const emit = defineEmits(["updateMessages"]);
const sendMessage = async () => {
  // changeStatinonEmoji();
  closeEmojiModal();
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const replyToUniq = replyToData.value.uniq;

  const apiUrl = import.meta.env.VITE_API_URL;

  const message = {
    tempId: generateItemNew(),
    to: `${chatInfo.value.phone}`,
    text: contentText.value ? contentText.value : messageText.value || null, // Используем contentText, если он есть, иначе messageText
    content: contentText.value
      ? [
          {
            type: "video",
            src: urlImg.value,
          },
        ]
      : [],
    from: "79027631667",
    // from: chatInfo.value.lastMessage?.from,
    time: Date.now(),
    replyTo: replyToDataBolean ? replyToUniq : null,
    outgoing: true,
    state: "send",
  };
  const newMessage = {
    tempId: generateItemNew(),
    uniq: "3EB0NEWUNIQUEID",
    timestamp: Date.now(),
    data: {
      content: contentText.value
        ? [
            {
              type: "video",
              src: urlImg.value,
            },
          ]
        : [],
      item: "3EB0NEWUNIQUEID",
      from: "79027631667",
      outgoing: true,
      text: contentText.value ? contentText.value : messageText.value || null,
      time: Date.now(),
      state: "send",
      replyTo: replyToDataBolean ? replyToUniq : null,
    },
    reaction: null,
    state: 0,
  };

  const front_message = {
    to: `${chatInfo.value.phone}`,
    text: contentText.value ? contentText.value : messageText.value || null, // Используем contentText, если он есть, иначе messageText
    item: generateItem(),
    timestamp: specificMicroseconds,
    content: contentText.value
      ? [
          {
            type: "video",
            src: urlImg.value,
          },
        ]
      : [],
    state: "error",
    tempId: generateItemNew(),
    time: Date.now(),
    from: "79027631667",
    outgoing: true,
    replyTo: replyToDataBolean ? replyToUniq : null,
  };

  emit("updateMessages", newMessage);
  const userLogin = JSON.parse(localStorage.getItem("userInfo"));
  let messageDataRes = {
    source: "whatsapp",
    login: chatInfo.value.loginUser,
    msg: message,
    errorMessage: front_message,
    mUniq: chatInfo.value.lastMessage.id.remote,
    replyTo: replyToDataBolean ? replyToUniq : null,
  };
  if (apiUrl === "https://hellychat.apitter.com/api") {
    messageDataRes.login = chatInfo.value.loginUser;
  } else {
    messageDataRes.login = userLogin.login;
  }
  try {
    const response = await axios.post(`${apiUrl}/sendMessage`, messageDataRes, {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Authorization: `Bearer ${localStorage.getItem("accountToken")}`,
      },
    });
    if (response.data === 401) {
      errorBlock.value = true;
      setTimeout(() => {
        localStorage.removeItem("accountToken");
        router.push("/login");
      }, 2000);
    }
    if (response.data.ok) {
      urlImg.value = "";

      props.changeMessageState(response.data.messsage, newMessage.tempId);
      if (replyToDataBolean.value) {
        props.offReplyToDataBolean();
      }

      messageText.value = "";
    } else {
      props.changeMessageState(response.data.messsage, newMessage.tempId);
      if (replyToDataBolean.value) {
        props.offReplyToDataBolean();
      }
      messageText.value = "";
    }
  } catch (error) {
    console.error("Ошибка при отправке сообщения:", error);

    props.changeMessageState(response.data.messsage, newMessage.tempId);
    if (replyToDataBolean.value) {
      props.offReplyToDataBolean();
    }
    messageText.value = "";
    if (error.response) {
      console.error("Ошибка сервера:", error.response.data);
    }
  }
};

watch(
  chatInfo,
  (newValue, oldValue) => {
    if (newValue !== oldValue) {
      props.offReplyToDataBoleanFalse(); // Вызываем функцию при изменении chatInfo
    }
  },
  { deep: true }
);
</script>

<style scoped>
.send-message {
  width: 100%;
  padding: 10px 0px;
  /* display: flex; */
  /* align-items: center; */
  /* justify-content: center; */
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

.send {
  width: 10%;
  position: absolute;
  bottom: 60px;
  left: 23px;
  border-radius: 5px;
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

.reply-section {
  display: flex;
  align-items: center;
  justify-content: center;
}

.content {
  height: 60px;
  background-color: rgb(236, 236, 236);
  width: 85%;
  margin-bottom: 10px;
  border-radius: 5px;
  border-left: 6px solid #06cf9c;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  flex-direction: column;
  gap: 6px;
}

.number-user {
  font-size: 14px;
  font-weight: 500;
  color: #06cf9c;
  margin-left: 10px;
}

.message-user {
  font-size: 14px;
  font-weight: 500;
  color: #636363;
  margin-left: 10px;
}

.close-img {
  width: 35px;
  height: 35px;
  stroke: gray;
}
</style>
