<template>
  <section class="send-message">
    <div class="img-cont">
      <img class="file-img" src="/chats/file.svg" alt="" />
      <article class="smile-img-cont">
        <input
          class="send-message-input"
          placeholder="Введите сообщение"
          type="text"
        />
        <img class="smile-img" src="/chats/smile.svg" alt="" />
      </article>
      <img @click="sendMessage" class="send-img" src="/chats/send.svg" alt="" />
    </div>
  </section>
</template>

<script setup>
import { ref } from "vue";
import axios from "axios";
const messageText = ref("dsds");

const sendMessage = async () => {
  const token = localStorage.getItem("accountToken");
  const login = "helly";

  const message = {
    to: "+227 94 59 19 01",
    text: messageText.value || null,
    content: messageText.value
      ? []
      : [{ type: "text", src: messageText.value }],
  };

  try {
    const response = await axios.post(
      "https://cloud.controller.touch-api.com/api/sendMessage",
      {
        source: "whatsapp",
        token: token,
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

    console.log("Сообщение отправлено:", response.data);
    messageText.value = ""; // Очистить поле ввода после отправки
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
