<template>
  <div @click="changeAddAccountStation" class="black-fon"></div>
  <div class="create-new-user">
    <div v-if="!loading && result === null">
      <div class="img-cont">
        <img class="user-icon" src="/chats/user-chat-icon.svg" alt="" />
        <input
          class="send-message-input-to"
          placeholder="Номер телефона"
          @input="formatPhoneNumber"
          maxlength="18"
          :value="formattedNumber"
          :class="{ error: error.number }"
        />
      </div>
      <div class="cont">
        <textarea
          class="send-message-input"
          placeholder="Введите сообщение"
          v-model="messageText"
          @keydown="handleKeyDown"
          @input="adjustHeight"
          rows="1"
          :class="{ error: error.message }"
          :style="{ height: inputHeight }"
        ></textarea>

        <!-- <div @click="sendMessage" class="send-icon-cont">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="30"
            height="30"
            viewBox="0 0 24 24"
            class="pointer send-icon"
          >
            <path
              d="M21.426 11.095l-17-8A1 1 0 0 0 3.03 4.242l1.212 4.849L12 12l-7.758 2.909l-1.212 4.849a.998.998 0 0 0 1.396 1.147l17-8a1 1 0 0 0 0-1.81z"
              fill="#54656F"
            />
          </svg>
        </div> -->
        <button @click="sendMessage" class="send-message">Отправить</button>
      </div>
    </div>
    <True v-if="result" />
    <False :message="errorMesssage" v-if="result === false" />
    <Loading v-if="loading" />
  </div>
</template>

<script setup>
import { ref, watch, reactive, computed } from "vue";
import axios from "axios";
import Loading from "./Loading.vue";
import True from "./ResultModal/True.vue";
import False from "./ResultModal/False.vue";

const messageText = ref("");
const contentText = ref(null);
const replyToDataBolean = false;
const loading = ref(false);
const result = ref(null);
const errorMesssage = ref("");

const props = defineProps({
  changeAddAccountStation: {
    type: Function,
  },
});

const formattedNumber = ref("");

const inputHeight = ref("auto");

const error = reactive({
  number: false,
  message: false,
});

// Функция для настройки высоты текстового поля
const adjustHeight = (event) => {
  const textarea = event.target;
  textarea.style.height = "auto"; // Сбрасываем высоту
  textarea.style.height = textarea.scrollHeight + "px"; // Устанавливаем новую высоту
};

const rawNumber = ref("");

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

const sendMessage = async () => {
  loading.value = true;
  error.number = false;
  error.message = false;

  if (!formattedNumber.value) {
    error.number = true;
    return;
  }

  if (!messageText.value) {
    error.message = true;
    return;
  }

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  const apiUrl = import.meta.env.VITE_API_URL;

  const message = {
    to: rawNumber.value,

    text: messageText.value,
    content: contentText.value
      ? [
          {
            type: "video",
            src: urlImg.value,
          },
        ]
      : [],
    from: "79228933680",
    time: Date.now(),
    replyTo: replyToDataBolean ? replyToUniq : null,
    outgoing: true,
    state: "send",
  };
  const newMessage = {
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
    // to: `${chatInfo.value.phone}`,
    text: contentText.value ? contentText.value : messageText.value || null, // Используем contentText, если он есть, иначе messageText

    content: contentText.value
      ? [
          {
            type: "video",
            src: urlImg.value,
          },
        ]
      : [],
    state: "error",

    time: Date.now(),
    from: "79027631667",
    outgoing: true,
    replyTo: replyToDataBolean ? replyToUniq : null,
  };

  //   emit("updateMessages", newMessage);
  const userLogin = JSON.parse(localStorage.getItem("userInfo"));
  let messageDataRes = {
    source: "telegram",
    login: "79228933680",
    msg: message,
    errorMessage: front_message,
    mUniq: "79228556998@.us",
    replyTo: replyToDataBolean ? replyToUniq : null,
  };
  if (apiUrl === "https://hellychat.apitter.com/api") {
    // messageDataRes.login = chatInfo.value.loginUser;
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
    if (response.data.ok === true) {
      loading.value = false;
      result.value = true;
      // location.reload();
    } else {
      loading.value = false;
    }
  } catch (error) {
    console.error("Ошибка при отправке сообщения:", error);
    errorMesssage.value = error.error;
    result.value = false;
    loading.value = false;
    if (replyToDataBolean.value) {
    }

    messageText.value = "";
    if (error.response) {
      console.error("Ошибка сервера:", error.response.data);
      errorMesssage.value = error.response.data.error;
      result.value = false;
      loading.value = false;
    }
  }
};

const formatPhoneNumber = (event) => {
  let input = event.target;
  let value = input.value.replace(/\D/g, "");
  let formattedValue = "";

  if (value.length > 0) {
    formattedValue = "+" + value.substring(0, 1);
  }

  if (value.length > 1) {
    formattedValue += " (" + value.substring(1, 4);
  }

  if (value.length > 4) {
    formattedValue += ") " + value.substring(4, 7);
  }

  if (value.length > 7) {
    formattedValue += "-" + value.substring(7, 9);
  }

  if (value.length > 9) {
    formattedValue += "-" + value.substring(9, 11);
  }

  formattedNumber.value = formattedValue;
  input.value = formattedValue;
  rawNumber.value = value; // Update rawNumber directly
};
</script>

<style scoped>
.create-new-user {
  padding: 20px;
  background-color: white;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
  border-radius: 5px;
  display: flex;
  gap: 56px;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.send-icon-cont {
  width: 50px;
  height: 50px;
  background-color: red;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgb(240, 240, 240);
  border-radius: 100%;
}

.user-icon {
  width: 150px;
}

.img-cont {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 16px;
}

.cont {
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 16px;
}

.send-message-input-to {
  font-family: system-ui;
  border-radius: 5px;
  width: 300px;
  height: 40px; /* Убираем фиксированную высоту */
  min-height: 20px; /* Минимальная высота */
  border: none;
  font-size: 14px;
  padding-left: 14px;
  box-sizing: border-box;
  border: 0.5px solid rgb(209, 209, 209);
  /* box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.08), 0 0 6px 0 rgba(0, 0, 0, 0.02); */
  margin-bottom: 36px;
}

.send-message-input-to.error {
  border: 0.5px solid rgb(252, 98, 98);
  /* box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.08), 0 0 6px 0 rgba(0, 0, 0, 0.02); */
}

.send-message-input {
  font-family: system-ui;
  border-radius: 5px;
  width: 300px;
  height: auto; /* Убираем фиксированную высоту */
  min-height: 160px; /* Минимальная высота */
  border: none;
  outline: none;
  overflow: hidden; /* Скрываем переполнение */
  padding: 16px 16px 16px 16px;
  box-sizing: border-box; /* Включаем отступы в ширину элемента */
  resize: none; /* Запрещаем изменение размера вручную */
  border: 0.5px solid rgb(209, 209, 209);
  /* box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.08), 0 0 6px 0 rgba(0, 0, 0, 0.02); */
}

.send-message {
  border-radius: 5px;
  width: 300px;
  height: 34px;
  background: #4950ca;
  font-weight: 600;
  font-size: 13px;
  color: #fff;
  transition: all 0.25s;
}

.send-message-input.error {
  border: 0.5px solid rgb(252, 98, 98);
  /* box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.08), 0 0 6px 0 rgba(0, 0, 0, 0.02); */
}
</style>
