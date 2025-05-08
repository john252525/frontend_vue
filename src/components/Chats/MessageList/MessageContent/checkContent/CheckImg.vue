<template>
  <section class="check-img-section">
    <section @click="changeImgUrl('')" class="navigate">
      <h2 class="navigate-title">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
        >
          <path
            fill="none"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="m18 18l-6-6m0 0L6 6m6 6l6-6m-6 6l-6 6"
          />
        </svg>
        Сделать снимок
      </h2>
    </section>
    <div v-if="!errorBoolean" class="image-container">
      <img v-if="typeUrl === 'image'" class="img" :src="urlImg" alt="" />
      <video v-if="typeUrl === 'video'" class="video" :src="urlImg" controls />
      <div v-if="typeUrl === 'file'" class="file-preview">
        <p>Предварительный просмотр файла недоступен. Скачать файл:</p>
        <a :href="urlImg" target="_blank">Скачать файл</a>
      </div>
    </div>
    <div class="error-cont" v-if="errorBoolean">
      <div class="error-section">Произошла ошиба при отправке сообщения</div>
    </div>
    <div class="inp-cont">
      <input
        class="send-message-input"
        placeholder="Добавить подпись"
        type="text"
        v-model="messageText"
      />
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
import { toRefs, ref, computed } from "vue";
import axios from "axios";

const props = defineProps({
  urlImg: {
    type: String,
  },
  chatInfo: {
    type: Object,
  },
  typeUrl: {
    type: Boolean,
  },
  messages: {
    type: Array,
    default: () => [],
  },
  changeImgUrl: {
    type: Function,
  },
});

const { urlImg, chatInfo, typeUrl } = toRefs(props);

const errorBoolean = ref(false);
const emit = defineEmits(["updateMessages", "messages"]);

import useFrontendLogger from "@/composables/useFrontendLogger";
const { sendLog } = useFrontendLogger();

const handleSendLog = async (location, method, params, results, answer) => {
  try {
    await sendLog(location, method, params, results, answer);
  } catch (err) {
    console.error("Ошибка при парсинге JSON:", err);
    // Optionally, update the error message ref
  }
};

const messageText = ref("");
const userLogin = JSON.parse(localStorage.getItem("userInfo"));
const sendMessage = async () => {
  console.log(typeUrl.value);
  const apiUrl = import.meta.env.VITE_API_URL;
  console.log(22794591901);
  const message = {
    to: `${chatInfo.value.phone}`,
    text: messageText.value || null, // Используем contentText, если он есть, иначе messageText
    content: [
      {
        type: typeUrl.value,
        src: urlImg.value,
      },
    ],
    time: Date.now() / 1000,
    outgoing: true,
  };
  console.log(message);

  const login = ref("");
  const apiCheckUrl = import.meta.env.VITE_API_CHECK_BE_CHAT;
  if (apiUrl === apiCheckUrl) {
    login.value = chatInfo.value.loginUser;
  } else {
    login.value = userLogin.login;
  }

  try {
    const response = await axios.post(
      `${apiUrl}/sendMessage`,
      {
        source: chatInfo.value.sourceUser,
        login: login.value,
        msg: message,
      },
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: `Bearer ${localStorage.getItem("accountToken")}`,
        },
      }
    );

    if (response.data) {
      await handleSendLog(
        "chats",
        "sendMessage",
        { source: chatInfo.value.sourceUser, login: login.value, msg: message },
        response.data,
        response.data
      );
    }

    if (response.data === 401) {
      errorBlock.value = true;
      setTimeout(() => {
        localStorage.removeItem("accountToken");
        router.push("/login");
      }, 2000);
    }
    props.changeImgUrl("");
    urlImg.value = "";
    console.log("Сообщение отправлено:", response.data);
    emit("updateMessages", message); // Обновляем список сообщений

    messageText.value = "";
  } catch (error) {
    console.error("Ошибка при отправке сообщения:", error);
    errorBoolean.value = true;
    if (error.response) {
      console.error("Ошибка сервера:", error.response.data);
      errorBoolean.value = true;
    }
  }
};
</script>

<style scoped>
.check-img-section {
  position: fixed;
  z-index: 10;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 100vh;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  overflow: hidden;
  /* Убираем transform: translate(-50%, -50%) отсюда */
}

.check-img-section .fade-enter-active,
.check-img-section .fade-leave-active {
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.check-img-section .fade-enter,
.check-img-section .fade-leave-to {
  opacity: 0;
  transform: translate(-50%, calc(100% + 50%)); /* Объединяем трансформации */
}

.check-img-section {
  animation: fadeIn 0.5s forwards;
  transform-origin: bottom;
  transform: translate(-50%, -50%); /* Добавляем центрирование здесь */
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translate(-50%, 100%); /* Убираем 50% */
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%);
  }
}

.file-preview {
  width: 90%;
  height: 400px;
  background-color: rgb(247, 246, 246);
  border-radius: 10px;
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
}

.error-section {
  width: 100%;
  padding: 0px 20px 0px 20px;
  height: 400px;
  /* background-color: rgb(247, 246, 246); */
  border-radius: 10px;
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  color: rgb(249, 53, 53);
}

.navigate {
  width: 100%;
  height: 50px;
  position: fixed;
  top: 0;
  background-color: #4950ca;
  display: flex;
  align-items: center;
}

.navigate-title {
  font-size: 18px;
  font-weight: 600;
  display: flex;
  align-items: center;
  color: white;
  cursor: pointer;
  gap: 4px;
  border-radius: 5px;
  margin-left: 20px;
}

.send-message-input {
  font-family: system-ui;
  border-radius: 5px;
  width: 845px;
  height: auto; /* Убираем фиксированную высоту */
  min-height: 50px; /* Минимальная высота */
  border: none;
  outline: none;
  overflow: hidden;
  padding: 16px 16px 16px 16px;
  box-sizing: border-box;
  resize: none;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.08), 0 0 6px 0 rgba(0, 0, 0, 0.02);
}

.inp-cont {
  margin-top: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%; /* Added width to occupy full width */
  justify-content: center; /* Added to center align inp-cont */
}

.image-container {
  width: 100%;
  max-height: 500px;
  overflow: auto;
  display: flex;
  justify-content: center;
  align-items: center;
}

.error-container {
  width: 100%;
  max-height: 500px;
  overflow: auto;
  display: flex;
  justify-content: center;
  align-items: center;
}

.img,
.video {
  max-width: 100%;
  max-height: 100%;
  display: block;
}

.video {
  controls: true;
}

.close-img {
  position: absolute;
  right: 20px;
  top: 20px;
}

button {
  margin-top: 20px;
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

@media (max-width: 900px) {
  .image-container {
    max-height: 400px;
  }

  .error-container {
    min-height: 400px;
  }
  .send-message-input {
    width: 675px;
  }
}

@media (max-width: 750px) {
  .image-container {
    max-height: 300px;
  }

  .error-container {
    min-height: 300px;
  }

  .send-message-input {
    width: 495px;
  }
}

@media (max-width: 550px) {
  .image-container {
    max-height: 200px;
  }

  .error-container {
    min-height: 200px;
  }

  .send-message-input {
    width: 320px;
  }
}
</style>
