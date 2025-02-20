<template>
  <div class="black-fon"></div>
  <section class="check-img-section">
    <div class="image-container">
      <img v-if="typeUrl === 'image'" class="img" :src="urlImg" alt="" />
      <video v-if="typeUrl === 'video'" class="video" :src="urlImg" controls />
      <div v-if="typeUrl === 'file'" class="file-preview">
        <p>Предварительный просмотр файла недоступен. Скачать файл:</p>
        <a :href="urlImg" target="_blank">Скачать файл</a>
      </div>
    </div>
    <div class="inp-cont">
      <input
        class="send-message-input"
        placeholder="Добавить подпись"
        type="text"
        v-model="messageText"
      />
      <img @click="sendMessage" class="send-img" src="/chats/send.svg" alt="" />
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

const emit = defineEmits(["updateMessages", "messages"]);

const messageText = ref("");

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
    props.changeImgUrl("");
    urlImg.value = "";
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
.check-img-section {
  position: fixed;
  z-index: 10;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 10px;
  width: 650px;
  height: 625px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  overflow: hidden;
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

.send-message-input {
  border-radius: 5px;
  width: 450px;
  height: 40px;
  border: 1px solid #d4d4d4;
  padding-left: 10px;
  box-sizing: border-box;
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
</style>
