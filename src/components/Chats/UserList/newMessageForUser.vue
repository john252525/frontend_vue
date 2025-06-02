<template>
  <div @click="changeAddAccountStation" class="black-fon"></div>
  <div class="create-new-user">
    <div v-if="!loading && result === null">
      <div class="img-cont">
        <svg
          viewBox="0 0 152 152"
          xmlns="http://www.w3.org/2000/svg"
          width="120"
          height="120"
          class="user-chat-icon-svg"
        >
          <g id="Layer_2" data-name="Layer 2">
            <g id="_18.Avatar" data-name="18.Avatar">
              <path
                id="icon"
                d="m76 0a76 76 0 0 0 0 152h2a76 76 0 0 0 -2-152zm-15.89 37.35a20.94 20.94 0 0 1 15.32-6.35 5.43 5.43 0 0 1 .57 0 20.76 20.76 0 0 1 14.76 6.33 21 21 0 0 1 6.35 15.32 20.91 20.91 0 0 1 -6.35 15.35 20.76 20.76 0 0 1 -14.76 6.33 5.43 5.43 0 0 1 -.57 0 21.68 21.68 0 0 1 -21.67-21.66 21 21 0 0 1 6.35-15.32zm49 79.48c-2.92 2.78-6.76 4.17-11.44 4.17h-43.34c-4.68 0-8.52-1.39-11.44-4.17s-4.44-6.6-4.44-11.3c0-1.82.06-3.6.18-5.32a53.31 53.31 0 0 1 .74-5.69 43.4 43.4 0 0 1 1.39-5.71 28.71 28.71 0 0 1 2.35-5.34 20.32 20.32 0 0 1 3.54-4.63 15.66 15.66 0 0 1 5.11-3.19 17.27 17.27 0 0 1 6.49-1.17c.92 0 1.8.36 3.53 1.48 1.06.7 2.29 1.51 3.67 2.37a20.23 20.23 0 0 0 4.73 2.09 18.43 18.43 0 0 0 11.62 0 20.9 20.9 0 0 0 4.75-2.09c1.38-.88 2.63-1.67 3.67-2.37 1.73-1.12 2.61-1.48 3.53-1.48a17.27 17.27 0 0 1 6.49 1.17 15.66 15.66 0 0 1 5.11 3.19 20.32 20.32 0 0 1 3.54 4.63 28.71 28.71 0 0 1 2.35 5.34 43.4 43.4 0 0 1 1.39 5.71 53.31 53.31 0 0 1 .74 5.69c.11 1.7.18 3.5.18 5.32 0 4.7-1.55 8.47-4.44 11.3z"
              />
            </g>
          </g>
        </svg>
        <div class="username-cont">
          <div class="phone-input-container">
            <input
              class="send-message-input-to"
              placeholder="Введите номер телефона"
              v-model="formattedPhone"
              @input="formatPhone"
              @keydown.delete="handleBackspace"
              ref="phoneInput"
              :class="{ error: error.number }"
              v-if="stationMess.loginType === 'number'"
            />
          </div>
          <input
            class="send-message-input-to-name"
            placeholder="@username"
            :class="{ error: error.number }"
            v-model="userLoginVal"
            v-if="
              stationMess.source === 'telegram' &&
              stationMess.loginType === 'username'
            "
          />

          <p
            v-if="
              stationMess.loginType === 'number' &&
              stationMess.source === 'telegram'
            "
            @click="changeUserloginStation"
            class="select-username"
          >
            Указать @имя
          </p>
          <p
            v-if="
              stationMess.loginType === 'username' &&
              stationMess.source === 'telegram'
            "
            @click="changeUserloginStation"
            class="select-username"
          >
            Указать номер
          </p>
        </div>
      </div>
      <Checbox
        :accounts="accounts"
        :selectedAccount="selectedAccount"
        @update:selectedAccount="updateSelectedAccount"
      />
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
        <button @click="sendMessage" class="send-message">Отправить</button>
      </div>
    </div>
    <True v-if="result" />
    <False :message="errorMesssage" v-if="result === false" />
    <Loading v-if="loading" />
  </div>
</template>

<script setup>
import { ref, toRefs, reactive, computed, onMounted, nextTick } from "vue";
import axios from "axios";
import { useStationLoading } from "@/composables/useStationLoading";
const { setLoadingStatus } = useStationLoading();
import Loading from "./Loading.vue";
import True from "./ResultModal/True.vue";
import False from "./ResultModal/False.vue";
import { useRouter, useRoute } from "vue-router";
import Checbox from "./newMessageComponent/Checbox.vue";

// Страны с их кодами и форматами
const countries = ref([
  { code: "+7", name: "Russia", flag: "🇷🇺", format: "(###) ###-##-##" },
  { code: "+1", name: "USA/Canada", flag: "🇺🇸", format: "(###) ###-####" },
  { code: "+44", name: "UK", flag: "🇬🇧", format: "#### ### ####" },
  { code: "+49", name: "Germany", flag: "🇩🇪", format: "### ### ####" },
  { code: "+33", name: "France", flag: "🇫🇷", format: "# ## ## ## ##" },
  { code: "+81", name: "Japan", flag: "🇯🇵", format: "##-####-####" },
  { code: "+86", name: "China", flag: "🇨🇳", format: "### #### ####" },
  { code: "+91", name: "India", flag: "🇮🇳", format: "##### #####" },
]);

const selectedCountry = ref("+7");
const formattedPhone = ref("");
const phoneInput = ref(null);
const rawNumber = ref("");
const isRussianNumber = ref(false);

// Получаем текущий формат для выбранной страны
const currentFormat = computed(() => {
  const country = countries.value.find((c) => c.code === selectedCountry.value);
  return country ? country.format : "";
});

// Плейсхолдер с учетом выбранного формата
const placeholder = computed(() => {
  const country = countries.value.find((c) => c.code === selectedCountry.value);
  if (!country) return "";

  let placeholder = country.code + " ";
  for (let i = 0; i < country.format.length; i++) {
    placeholder += country.format[i] === "#" ? "_" : country.format[i];
  }
  return placeholder;
});

// Обновляем формат при изменении страны
const updatePhoneFormat = () => {
  formattedPhone.value = selectedCountry.value + " ";
  rawNumber.value = selectedCountry.value.replace("+", "");
};

// Обработчик backspace
const handleBackspace = (e) => {
  const cursorPosition = phoneInput.value.selectionStart;
  const value = formattedPhone.value;

  // Полностью разрешаем стирание +7
  if (cursorPosition <= 2 && value.startsWith("+7")) {
    return; // Разрешаем удаление
  }

  // Для российских номеров - пропускаем разделители
  if (isRussianNumber.value) {
    const prevChar = value[cursorPosition - 1];
    if ([" ", "(", ")", "-"].includes(prevChar)) {
      e.preventDefault();
      phoneInput.value.setSelectionRange(
        cursorPosition - 1,
        cursorPosition - 1
      );
    }
  }
};

// Форматирование телефона
const formatPhone = () => {
  const value = formattedPhone.value;

  // Определяем, российский ли номер (начинается с +7 или 7 или 8)
  isRussianNumber.value = /^(\+7|7|8)/.test(value);

  if (!isRussianNumber.value) {
    // Для не-российских номеров просто сохраняем введенные цифры
    rawNumber.value = value.replace(/\D/g, "");
    return;
  }

  // Обработка российских номеров
  let digits = value.replace(/\D/g, "");

  // Если номер начинается с 8, заменяем на +7
  if (digits.startsWith("8")) {
    digits = "7" + digits.substring(1);
  }
  // Если номер начинается с 7, добавляем +
  else if (digits.startsWith("7")) {
    digits = digits; // Уже начинается с 7
  }
  // Если просто цифры без кода страны
  else if (/^\d/.test(digits)) {
    digits = "7" + digits;
  }

  // Если длина номера превышает 11 цифр, убираем маску
  if (digits.length > 11) {
    formattedPhone.value = digits; // Убираем маску и просто показываем цифры
    return;
  }

  // Применяем маску для российских номеров: +7 (XXX) XXX-XX-XX
  let formatted = "+7";
  let digitIndex = 0;

  // Пропускаем уже введенные +7
  if (digits.startsWith("7")) {
    digitIndex = 1;
  }

  // Добавляем пробел после +7
  if (digitIndex === 0) {
    formatted += " ";
  }

  if (digitIndex < digits.length) {
    formatted +=
      "(" +
      digits.substring(digitIndex, Math.min(digitIndex + 3, digits.length));
    digitIndex += 3;
  }

  if (digitIndex < digits.length) {
    formatted +=
      ") " +
      digits.substring(digitIndex, Math.min(digitIndex + 3, digits.length));
    digitIndex += 3;
  }

  if (digitIndex < digits.length) {
    formatted +=
      "-" +
      digits.substring(digitIndex, Math.min(digitIndex + 2, digits.length));
    digitIndex += 2;
  }

  if (digitIndex < digits.length) {
    formatted +=
      "-" +
      digits.substring(digitIndex, Math.min(digitIndex + 2, digits.length));
  }

  formattedPhone.value = formatted;
  rawNumber.value = "7" + digits.substring(1);
};

const apiUrl = import.meta.env.VITE_API_URL;
const selectedAccount = ref("");
const route = useRoute();
const messageText = ref("");
const contentText = ref(null);
const replyToDataBolean = false;
const loading = ref(false);
const result = ref(null);
const errorMesssage = ref("");
const userLoginVal = ref("");
const accounts = ref("");
const inputHeight = ref("auto");

const error = reactive({
  number: false,
  message: false,
});

const stationMess = reactive({
  source: "",
  loginType: "number",
  isMuilti: {
    source: "",
    login: "",
    storage: "",
    type: "",
    isMulti: false,
  },
});

const props = defineProps({
  changeAddAccountStation: {
    type: Function,
  },
  chatInfo: {
    type: Object,
  },
});

const { chatInfo } = toRefs(props);

const apiCheckUrl = import.meta.env.VITE_API_CHECK_BE_CHAT;

const getAccounts = () => {
  const storedAccounts =
    JSON.parse(localStorage.getItem("loginWhatsAppChatsStep")) || [];
  accounts.value = storedAccounts;
};

const updateSelectedAccount = (account) => {
  selectedAccount.value = account;
  stationMess.isMuilti.source = account.source;
  stationMess.isMuilti.login = account.login;
  stationMess.isMuilti.storage = account.storage;
  stationMess.isMuilti.type = account.type;
  stationMess.source = account.source;
  console.log(account);
};

const processLogin = () => {
  if (userMessageLogin.value && userMessageLogin.value.includes("@")) {
    userMessageLogin.value = userMessageLogin.value.replace("@", "");
  }
};

const adjustHeight = (event) => {
  const textarea = event.target;
  textarea.style.height = "auto";
  textarea.style.height = textarea.scrollHeight + "px";
};

const updateSource = (platform) => {
  stationMess.source = platform;
};

const handleKeyDown = (event) => {
  if (event.key === "Enter") {
    if (event.shiftKey) {
      event.preventDefault();
      const textarea = event.target;
      textarea.value += "\n";
      adjustHeight(event);
    } else {
      event.preventDefault();
      sendMessage();
    }
  }
};

function isMultiLogic() {
  if (route.query.multi === "true") {
    stationMess.isMuilti.isMulti = true;
  } else {
    if (localStorage.getItem("accountStation") === "telegram") {
      stationMess.source = "telegram";
    } else {
      stationMess.source = "whatsapp";
    }
  }
}

function changeUserloginStation() {
  if (stationMess.loginType === "number") {
    stationMess.loginType = "username";
  } else {
    stationMess.loginType = "number";
  }
}

let userMessageLogin = ref("");

const sendMessage = async () => {
  if (stationMess.loginType === "number") {
    if (!rawNumber.value || rawNumber.value.length < 11) {
      error.number = true;
      return;
    } else {
      userMessageLogin.value = rawNumber.value;
      error.number = false;
    }
  } else {
    if (!userLoginVal.value) {
      error.number = true;
      return;
    } else {
      userMessageLogin.value = userLoginVal.value;
      error.number = false;
    }
  }

  if (!messageText.value) {
    error.message = true;
    return;
  } else {
    error.message = false;
  }

  const source = ref("");
  const login = ref("");

  if (stationMess.isMuilti.isMulti) {
    source.value = stationMess.isMuilti.source;
  } else {
    source.value = stationMess.isMuilti.source;
  }

  await processLogin();

  loading.value = true;
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  const message = {
    to: userMessageLogin.value,
    text: messageText.value,
    content: contentText.value
      ? [
          {
            type: "video",
            src: urlImg.value,
          },
        ]
      : [],
    from: "",
    time: Date.now(),
    replyTo: replyToDataBolean ? replyToUniq : null,
    outgoing: true,
    state: "send",
  };
  const front_message = {
    text: contentText.value ? contentText.value : messageText.value || null,
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

  const userLogin = JSON.parse(localStorage.getItem("userInfo"));
  console.log(stationMess);
  let messageDataRes = {
    source: source.value,
    storage: stationMess.isMuilti.storage,
    type: stationMess.isMuilti.type,
    login: "",
    msg: message,
    errorMessage: front_message,
    mUniq: "79228556998@.us",
    replyTo: replyToDataBolean ? replyToUniq : null,
  };
  if (apiUrl === apiCheckUrl) {
    if (stationMess.isMuilti.isMulti) {
      messageDataRes.login = stationMess.isMuilti.login;
      message.from = stationMess.isMuilti.login;
    } else {
      messageDataRes.login = userLogin.login;
      message.from = userLogin.login;
    }
  } else {
    messageDataRes.login = userLogin.login;
    message.from = userLogin.login;
  }
  try {
    const response = await axios.post(`${apiUrl}/sendMessage`, messageDataRes, {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Authorization: `Bearer ${localStorage.getItem("accountToken")}`,
      },
    });
    if (response.data.ok === true) {
      loading.value = false;
      result.value = true;
      setTimeout(() => {
        location.reload();
      }, 3000);
    } else {
      loading.value = false;
    }
  } catch (error) {
    setLoadingStatus(true, "error");
    console.error("Ошибка при отправке сообщения:", error);
    errorMesssage.value = error.error;
    result.value = false;
    loading.value = false;
    messageText.value = "";
    if (error.response) {
      errorMesssage.value = error.response.data.error;
    }
  }
};

onMounted(() => {
  getAccounts();
  isMultiLogic();
  updatePhoneFormat();
  formattedPhone.value = "+7 ";
});
</script>

<style scoped>
.black-fon {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 9;
}

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

.img-cont {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 16px;
}

.user-chat-icon-svg path#icon {
  fill: #808080;
}

.phone-input-container {
  display: flex;
  gap: 10px;
  align-items: center;
}

.country-select {
  width: 80px;
  height: 45px;
  border-radius: 5px;
  border: 0.5px solid #c1c1c1;
  background: #fcfcfc;
  padding: 0 5px;
  font-size: 14px;
}

.send-message-input-to-name {
  font-family: system-ui;
  border-radius: 5px;
  width: 300px;
  height: 45px;
  border: none;
  font-size: 14px;
  padding-left: 14px;
  box-sizing: border-box;
  border: 0.5px solid rgb(209, 209, 209);
}

.send-message-input-to-name.error {
  border: 0.5px solid rgb(252, 98, 98);
}

.send-message-input-to {
  font-family: system-ui;
  border-radius: 5px;
  width: 300px;
  height: 45px;
  border: none;
  font-size: 14px;
  padding-left: 14px;
  box-sizing: border-box;
  border: 0.5px solid rgb(209, 209, 209);
}

.send-message-input-to.error {
  border: 0.5px solid rgb(252, 98, 98);
}

.cont {
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 16px;
}

.username-cont {
  margin-bottom: 36px;
}

.select-username {
  font-size: 12px;
  color: rgb(172, 172, 172);
  margin-top: 4px;
  cursor: pointer;
  transition: all 0.25s;
  text-align: left;
}

.select-username:hover {
  color: rgb(126, 126, 126);
}

.send-message-input {
  font-family: system-ui;
  border-radius: 5px;
  width: 300px;
  height: auto;
  min-height: 160px;
  border: none;
  outline: none;
  overflow: hidden;
  padding: 16px;
  box-sizing: border-box;
  resize: none;
  border: 0.5px solid rgb(209, 209, 209);
}

.send-message-input.error {
  border: 0.5px solid rgb(252, 98, 98);
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
  border: none;
  cursor: pointer;
}

.send-message:hover {
  background: #3a40a0;
}

@media (max-width: 500px) {
  .create-new-user {
    /* width: 90%; */
    padding: 15px;
    gap: 30px;
  }

  .send-message-input,
  .send-message {
    width: 100%;
  }

  .phone-input-container {
    align-items: stretch;
  }

  .country-select {
    width: 100%;
  }

  .send-message-input-to {
    width: 300px;
  }
}
</style>
