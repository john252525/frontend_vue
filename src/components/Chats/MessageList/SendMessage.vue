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
      <!-- <img
        @click="openMessageContent"
        class="file-img"
        src="/chats/file.svg"
        alt=""
      /> -->
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 1024 1024"
        class="pointer file-icon"
        @click="openMessageContent"
      >
        <path
          fill="#54656F"
          d="M128 192v640h768V320H485.76L357.504 192zm-32-64h287.872l128.384 128H928a32 32 0 0 1 32 32v576a32 32 0 0 1-32 32H96a32 32 0 0 1-32-32V160a32 32 0 0 1 32-32m384 416V416h64v128h128v64H544v128h-64V608H352v-64z"
        />
      </svg>
      <article class="smile-img-cont">
        <Emoji
          v-if="station.emoji"
          @closeEmoji="closeEmojiModal"
          @addEmoji="insertEmoji"
        />
        <textarea
          v-if="urlImg"
          class="send-message-input"
          placeholder="Добавить подпись"
          v-model="contentText"
          @keydown="handleKeyDown"
          @input="adjustHeight"
          rows="1"
          :style="{ height: inputHeight }"
        ></textarea>
        <textarea
          v-else
          class="send-message-input"
          placeholder="Введите сообщение"
          v-model="messageText"
          @keydown="handleKeyDown"
          @input="adjustHeight"
          rows="1"
          :style="{ height: inputHeight }"
        ></textarea>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 48 48"
          class="emoji-icon pointer"
          @click="changeStatinonEmoji"
        >
          <path
            fill="#54656F"
            d="M32.39 11.609a5.36 5.36 0 0 1 1.295 2.105l.846 2.6a1.027 1.027 0 0 0 1.938 0l.846-2.6a5.36 5.36 0 0 1 3.397-3.394l2.602-.845a1.028 1.028 0 0 0 0-1.937l-.052-.013l-2.602-.845a5.36 5.36 0 0 1-3.397-3.394l-.846-2.6a1.027 1.027 0 0 0-1.939 0l-.845 2.6l-.022.064a5.36 5.36 0 0 1-3.322 3.33l-2.603.845a1.028 1.028 0 0 0 0 1.937l2.602.845a5.36 5.36 0 0 1 2.103 1.301m13.841 6.927l1.378.448l.028.007a.544.544 0 0 1 0 1.025l-1.378.448a2.84 2.84 0 0 0-1.798 1.796l-.448 1.377l-.016.04v.009a.544.544 0 0 1-1.01-.039l-.448-1.377a2.84 2.84 0 0 0-1.357-1.61l-.003-.015a3 3 0 0 0-.438-.188l-1.378-.448a.544.544 0 0 1 0-1.025l1.378-.448a2.84 2.84 0 0 0 1.77-1.796l.448-1.377a.544.544 0 0 1 1.027 0l.448 1.377a2.83 2.83 0 0 0 1.797 1.796M25.682 6.58A18 18 0 0 0 24 6.5C14.335 6.5 6.5 14.335 6.5 24S14.335 41.5 24 41.5c9.332 0 16.957-7.304 17.472-16.507q.236.313.56.544a2.54 2.54 0 0 0 1.872.434C42.914 36.09 34.381 44 24 44C12.954 44 4 35.046 4 24S12.954 4 24 4c1.948 0 3.83.278 5.61.797l-2.542.826a3.05 3.05 0 0 0-1.386.957M20 19.5a2.5 2.5 0 1 1-5 0a2.5 2.5 0 0 1 5 0M30.5 22a2.5 2.5 0 1 0 0-5a2.5 2.5 0 0 0 0 5M18.452 34.681A11.7 11.7 0 0 0 24 36a11.72 11.72 0 0 0 9.816-5.1a1.249 1.249 0 1 0-2.13-1.307A9.21 9.21 0 0 1 24 33.5a9.22 9.22 0 0 1-7.687-3.907a1.248 1.248 0 1 0-2.13 1.307a11.7 11.7 0 0 0 4.269 3.781"
          />
        </svg>
        <!-- <img
          @click="changeStatinonEmoji"
          class="smile-img"
          src="/chats/smile.svg"
          alt=""
        /> -->
      </article>
      <!-- <img @click="sendMessage" class="send-img" src="/chats/send.svg" alt="" /> -->
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="26"
        height="26"
        viewBox="0 0 24 24"
        class="pointer send-icon"
        @click="sendMessage"
      >
        <path
          d="M21.426 11.095l-17-8A1 1 0 0 0 3.03 4.242l1.212 4.849L12 12l-7.758 2.909l-1.212 4.849a.998.998 0 0 0 1.396 1.147l17-8a1 1 0 0 0 0-1.81z"
          fill="#54656F"
        />
      </svg>
    </div>
  </section>
</template>

<script setup>
import {
  ref,
  toRefs,
  reactive,
  provide,
  onBeforeUnmount,
  onMounted,
  watch,
} from "vue";
import axios from "axios";
import { useRouter } from "vue-router";
import checkImg from "./MessageContent/checkContent/CheckImg.vue";
import Camera from "./MessageContent/checkContent/Camera.vue";
import Emoji from "./MessageContent/Emoji.vue";
import MessageContent from "./MessageContent/MessageContent.vue";
import ErrorBlock from "@/components/ErrorBlock/ErrorBlock.vue";
const apiCheckUrl = import.meta.env.VITE_API_CHECK_BE_CHAT;

const router = useRouter();
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

const { chatInfo, replyToData, replyToDataBolean } = toRefs(props);

const errorBlock = ref(false);
const chaneErrorBlock = () => {
  errorBlock.value = errorBlock.value;
};

const messageText = ref("");
const contentText = ref("");
const urlImg = ref("");
const typeUrl = ref(false);
const cameraContainerStyle = ref({});

const station = reactive({
  messageContent: false,
  cameraStation: false,
  emoji: false,
});

// Переменная для хранения высоты текстового поля
const inputHeight = ref("auto");

// Функция для настройки высоты текстового поля
const adjustHeight = (event) => {
  const textarea = event.target;
  textarea.style.height = "auto"; // Сбрасываем высоту
  textarea.style.height = textarea.scrollHeight + "px"; // Устанавливаем новую высоту
};

// Обработчик нажатий клавиш
const handleKeyDown = (event) => {
  if (event.key === "Enter") {
    if (event.shiftKey) {
      // Если нажата клавиша Shift + Enter, добавляем новую строку
      event.preventDefault(); // Предотвращаем стандартное поведение
      const textarea = event.target;
      textarea.value += "\n"; // Добавляем новую строку
      adjustHeight(event); // Обновляем высоту текстового поля
    } else {
      // Если просто нажата клавиша Enter, отправляем сообщение
      event.preventDefault(); // Предотвращаем стандартное поведение
      sendMessage(); // Вызываем функцию отправки сообщения
    }
  }
};

const updateCameraPosition = () => {
  // Получаем координаты контейнера сообщений (замени '.messages-container' на свой класс)
  const messagesContainer = document.querySelector(".send-message"); // Найди свой контейнер
  if (messagesContainer) {
    const rect = messagesContainer.getBoundingClientRect();
    // Устанавливаем стили для camera-container
    cameraContainerStyle.value = {
      top: `${rect.top}px`,
      left: `${rect.left}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
    };
  }
};

const changeStatinonEmoji = () => {
  station.emoji = !station.emoji;
};

const closeEmojiModal = () => {
  station.emoji = false;
};

const openCameraStation = () => {
  station.cameraStation = !station.cameraStation;
  updateCameraPosition();
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

const extractPhoneNumber = (fullId) => {
  const atIndex = fullId.indexOf("@");
  if (atIndex !== -1) {
    return fullId.substring(0, atIndex);
  }
  return fullId; // Вернуть исходную строку, если '@' не найдено
};

const specificMicroseconds = convertToMicroseconds(date);
console.log(chatInfo.value);
const emit = defineEmits(["updateMessages"]);
const sendMessage = async () => {
  if (!messageText.value) {
    return;
  }
  closeEmojiModal();
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const replyToUniq = replyToData.value.uniq;
  const sourceUser = localStorage.getItem("accountStation");
  const apiUrl = import.meta.env.VITE_API_URL;

  const message = {
    tempId: generateItemNew(),
    to: `${chatInfo.value.phone}`,
    text: contentText.value ? contentText.value : messageText.value || null,
    content: contentText.value
      ? [
          {
            type: "video",
            src: urlImg.value,
          },
        ]
      : [],
    from:
      sourceUser === "whatsapp"
        ? extractPhoneNumber(chatInfo.value.lastMessage.from)
        : chatInfo.value.lastMessage.from,
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
    source: chatInfo.value.sourceUser,
    login: chatInfo.value.loginUser,
    msg: message,
    errorMessage: front_message,
    mUniq: chatInfo.value.lastMessage.id.remote,
    replyTo: replyToDataBolean ? replyToUniq : null,
  };
  if (apiUrl === apiCheckUrl) {
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
      contentText.value = "";
      urlImg.value = "";

      // Сбрасываем высоту текстового поля
      inputHeight.value = "auto"; // Устанавливаем в дефолтное значение
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

onMounted(() => {
  // Вызываем функцию для установки позиции камеры после монтирования компонента
  updateCameraPosition();
  // Также можно добавить listener на изменение размера окна, чтобы обновлять позицию
  window.addEventListener("resize", updateCameraPosition);

  // Удаляем listener при размонтировании компонента
  onBeforeUnmount(() => {
    window.removeEventListener("resize", updateCameraPosition);
  });
});

provide(cameraContainerStyle, "cameraContainerStyle");
</script>
<style scoped>
.send-message {
  width: 100%;
  padding: 10px 36px; /* Отступы сверху и снизу 10px, слева и справа 20px */
  gap: 11px;
  box-sizing: border-box; /* Включаем отступы в ширину элемента */
}

.img-cont {
  display: flex;
  align-items: flex-end;
  gap: 14px;
  flex: 1;
}

.smile-img-cont {
  display: flex;
  position: relative;
  flex: 1;
}

.file-icon {
  margin-bottom: 10px;
}

.send-icon {
  margin-bottom: 10px;
}

.file-img,
.smile-img,
.send-img {
  cursor: pointer;
}

.send-message-input {
  font-family: system-ui;
  border-radius: 5px;
  width: 100%;
  height: auto; /* Убираем фиксированную высоту */
  min-height: 50px; /* Минимальная высота */
  border: none;
  outline: none;
  overflow: hidden; /* Скрываем переполнение */
  padding: 16px 16px 16px 40px;
  box-sizing: border-box; /* Включаем отступы в ширину элемента */
  resize: none; /* Запрещаем изменение размера вручную */
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.08), 0 0 6px 0 rgba(0, 0, 0, 0.02);
}

.reply-section {
  display: flex;
  align-items: center;
  justify-content: center;
}

.emoji-icon {
  position: absolute;
  bottom: 12px;
  left: 8px;
}

.content {
  height: 60px;
  background-color: rgb(236, 236, 236);
  width: 85%;
  margin-bottom: 10px;
  border-radius: 5px;
  border-left: 6px solid #007bff; /* Цвет левой границы */
}

.number-user {
  font-weight: bold;
  margin: 0;
}

.message-user {
  margin: 0;
}

.close-img {
  cursor: pointer;
  margin-left: 10px;
}
</style>
