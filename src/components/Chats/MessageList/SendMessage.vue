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
  replyToData: {
    type: Object,
  },
  replyToDataBolean: {
    type: Boolean,
  },
  offReplyToDataBolean: {
    type: Function,
  },
});

// const emit = defineEmits(["updateMessages"]);
const { chatInfo, replyToData, replyToDataBolean } = toRefs(props);
console.log(replyToData.value);
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

function formatPhoneNumber(phoneNumber) {
  // Удаляем все нецифровые символы
  const cleaned = phoneNumber.replace(/\D/g, "");

  // Проверяем, что номер состоит из 11 цифр (для России)
  if (cleaned.length !== 11) {
    throw new Error("Неверный формат номера. Должно быть 11 цифр.");
  }

  // Форматируем номер
  const countryCode = cleaned[0]; // Код страны (7 для России)
  const areaCode = cleaned.slice(1, 4); // Код региона (902)
  const firstPart = cleaned.slice(4, 7); // Первая часть номера (894)
  const secondPart = cleaned.slice(7, 9); // Вторая часть номера (13)
  const thirdPart = cleaned.slice(9, 11); // Третья часть номера (42)

  // Собираем номер в нужном формате
  return `+${countryCode} ${areaCode} ${firstPart}-${secondPart}-${thirdPart}`;
}

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

const specificMicroseconds = convertToMicroseconds(date);

const emit = defineEmits(["updateMessages"]);
const sendMessage = async () => {
  console.log("eplyToData.uniq");
  const replyToUniq = replyToData.value.uniq;
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
        ]
      : [],
    time: Date.now() / 1000,
    replyTo: replyToUniq,
    outgoing: true,
    state: "send",
  };
  const newMessage = {
    tempId: generateItemNew(),
    uniq: "3EB0NEWUNIQUEID",
    timestamp: Date.now() / 1000,
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
      outgoing: true,
      text: contentText.value ? contentText.value : messageText.value || null,
      time: Date.now() / 1000,
      state: "send",
      replyTo: replyToUniq,
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
    time: Date.now() / 1000,
    outgoing: true,
    replyTo: replyToUniq,
  };
  console.log(message);
  emit("updateMessages", newMessage);
  try {
    const response = await axios.post(
      `${apiUrl}/sendMessage`,
      {
        source: "whatsapp",
        login: "helly",
        msg: message,
        errorMessage: front_message,
        mUniq: chatInfo.value.lastMessage.id.remote,
        replyTo: replyToUniq,
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
      props.changeMessageState(response.data.messsage, newMessage.tempId);
      if (replyToDataBolean.value) {
        props.offReplyToDataBolean();
      }

      messageText.value = "";
    } else {
      console.log("Сообщение ne отправлено:", response.data);
      props.changeMessageState(response.data.messsage, newMessage.tempId);
      if (replyToDataBolean.value) {
        props.offReplyToDataBolean();
      }
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
