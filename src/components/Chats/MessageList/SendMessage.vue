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
    <div class="img-cont">
      <img
        @click="openMessageContent"
        class="file-img"
        src="/chats/file.svg"
        alt=""
      />
      <article class="smile-img-cont">
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
import checkImg from "./MessageContent/checkContent/CheckImg.vue";
import Camera from "./MessageContent/checkContent/Camera.vue";
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
});

// const emit = defineEmits(["updateMessages"]);
const { chatInfo } = toRefs(props);
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
});

const openCameraStation = () => {
  station.cameraStation = !station.cameraStation;
};

const openMessageContent = () => {
  station.messageContent = !station.messageContent;
};

const changeImgUrl = (url, type) => {
  urlImg.value = url;
  typeUrl.value = type;
  console.log(typeUrl.value);
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
console.log(microseconds); // Выводит текущее время в формате, подобном 1740179062715000

// Или можно передать конкретную дату

const specificMicroseconds = convertToMicroseconds(date);

const emit = defineEmits(["updateMessages"]);
const sendMessage = async () => {
  console.log(generateItem());
  console.log(chatInfo.value.lastMessage.id.remote);
  const apiUrl = import.meta.env.VITE_API_URL;
  console.log(22794591901);
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
        ] // Если contentText есть, то content пустой
      : [],
    time: Date.now() / 1000,
    outgoing: true,
    state: "send",
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
    time: Date.now() / 1000,
    outgoing: true,
  };
  console.log(message);
  emit("updateMessages", message);
  try {
    const response = await axios.post(
      `${apiUrl}/sendMessage`,
      {
        source: "whatsapp",
        login: "helly",
        msg: message,
        errorMessage: front_message,
        mUniq: chatInfo.value.lastMessage.id.remote,
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
    if (response.data.ok) {
      urlImg.value = "";
      console.log("Сообщение отправлено:", response.data);
      console.log(message.tempId);
      props.changeMessageState(response.data.messsage, message.tempId);
      messageText.value = "";
    } else {
      console.log("Сообщение ne отправлено:", response.data);
      props.changeMessageState(response.data.messsage, message.tempId);
      messageText.value = "";
    }
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
</style>
