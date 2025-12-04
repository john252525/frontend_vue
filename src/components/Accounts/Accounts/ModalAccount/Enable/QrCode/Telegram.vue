<template>
  <ErrorBlock v-if="errorBlock" :changeIncorrectPassword="chaneErrorBlock" />
  <section v-if="!station.phone" class="qr-telegram-section">
    <LoadingModal :stationLoading="stationLoading" />
    <article v-if="qrCodeData.station" class="qr-container">
      <div class="header">
        <h2 class="title">Подключение Telegram</h2>
        <button @click="changeEnableStation" class="close-button">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M18 6L6 18M6 6L18 18"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
        </button>
      </div>

      <div class="qr-content">
        <div class="qr-wrapper">
          <qrcode-vue :value="qrCodeData.link" :size="260" class="qr-code" />
          <div class="scan-line"></div>
        </div>

        <p class="instruction">Отсканируйте QR-код через приложение Telegram</p>

        <button @click="enableCode" class="phone-link-button">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M22 16.92V19.92C22 20.47 21.55 20.93 21 20.98C20.5 21.03 19.99 21.05 19.5 21C16.74 20.52 14.19 19.24 12.11 17.34C10.39 15.78 9.05 13.87 8.15 11.73C7.59 10.29 7.25 8.76 7.15 7.18C7.11 6.63 7.52 6.14 8.07 6.09C8.57 6.05 9.06 6 9.55 6.05H12.55C13.07 6.05 13.52 6.42 13.59 6.93C13.71 7.79 13.93 8.63 14.25 9.43C14.38 9.76 14.3 10.14 14.05 10.39L13.11 11.33C14.41 13.48 16.52 15.59 18.67 16.89L19.61 15.95C19.74 15.82 19.91 15.74 20.09 15.74C20.17 15.74 20.25 15.75 20.33 15.77C21.13 16.09 21.97 16.31 22.83 16.43C23.34 16.5 23.71 16.95 23.71 17.47V17.48H22.83H22Z"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          Связать через телефон
        </button>
      </div>
    </article>
  </section>

  <!-- ОБНОВЛЕННАЯ СЕКЦИЯ С ТЕЛЕФОНОМ -->
  <section v-if="station.phone" class="phone-section">
    <div class="phone-container">
      <div class="phone-header">
        <h2 class="phone-title">Подключение по телефону</h2>
        <button @click="station.phone = false" class="phone-close-button">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M18 6L6 18M6 6L18 18"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
        </button>
      </div>

      <div class="phone-content">
        <p class="phone-description">
          Введите номер телефона для подключения Telegram
        </p>

        <div class="phone-input-wrapper">
          <div class="phone-input-container">
            <input
              :class="station.errorPhone ? 'num-input-error' : 'num-input'"
              :placeholder="
                showMask ? '+7 (___) ___-__-__' : 'Введите номер телефона'
              "
              @input="formatPhone"
              @keydown.delete="handleBackspace"
              class="num-input"
              type="text"
              id="phone"
              v-model="phoneNumber"
              ref="phoneInput"
            />
          </div>

          <div v-if="station.errorPhone" class="error-message">
            Пожалуйста, введите корректный номер телефона
          </div>
        </div>

        <button @click="getCode" class="phone-next-button">
          {{ t("enable.next") }}
        </button>

        <button @click="station.phone = false" class="back-button">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M19 12H5M12 19L5 12L12 5"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          Вернуться к QR-коду
        </button>
      </div>
    </div>
  </section>
</template>
<script setup>
import {
  inject,
  ref,
  reactive,
  onMounted,
  onBeforeUnmount,
  computed,
  nextTick,
} from "vue";
import axios from "axios";
const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL;
import QrcodeVue from "qrcode.vue";
import LoadingModal from "../LoadingModal.vue";
import ErrorBlock from "@/components/ErrorBlock/ErrorBlock.vue";
import { useRouter } from "vue-router";
const router = useRouter();
const { startFunc, offQrCodeStation } = inject("accountItems");
const { changeEnableStation } = inject("changeEnableStation");
const { selectedItem } = inject("accountItems");
const { source, login, storage } = selectedItem.value;
import { useI18n } from "vue-i18n";
const { t } = useI18n();
const errorBlock = ref(false);
const chaneErrorBlock = () => {
  errorBlock.value = errorBlock.value;
};

const props = defineProps({
  changeForceStopItemData: {
    type: Function,
  },
  openEnableMenuTrue: {
    type: Function,
  },
  updateLoadingStatus: {
    type: Function,
  },
});

import { useAccountStore } from "@/stores/accountStore";
const accountStore = useAccountStore();
const token = computed(() => accountStore.getAccountToken);

import { useDomain } from "@/composables/getDomain";
const { stationDomain } = useDomain();

const selectedCountry = ref("+7");
const formattedPhone = ref("");
const phoneNumber = ref("");
const phoneInput = ref(null);
const showMask = ref(true);

const station = reactive({
  phone: false,
  error: false,
  errorPhone: false,
  qrSend: false,
  text: "",
  loading: false,
});

const accountInfo = reactive({
  data: null,
  loading: false,
  error: null,
});

const stationLoading = ref(false);
const qrCodeData = reactive({
  link: "",
  station: false,
});

let intervalId = null; // Для хранения идентификатора интервала
let previousLink = ""; // Для хранения предыдущей ссылки

import useFrontendLogger from "@/composables/useFrontendLogger";
const { sendLog } = useFrontendLogger();

const handleBackspace = (e) => {
  const value = phoneNumber.value;
  const cursorPosition = phoneInput.value.selectionStart;

  if (!showMask.value) return;

  // Полное удаление +7 при нажатии Backspace на +7
  if (value === "+7" && cursorPosition <= 2) {
    phoneNumber.value = "";
    e.preventDefault();
    return;
  }

  // Удаление +7 при курсоре после них
  if (value.startsWith("+7") && cursorPosition === 2) {
    phoneNumber.value = "";
    e.preventDefault();
    return;
  }

  // Пропуск разделителей при удалении
  if (
    cursorPosition > 0 &&
    [" ", "(", ")", "-"].includes(value[cursorPosition - 1])
  ) {
    e.preventDefault();
    phoneInput.value.setSelectionRange(cursorPosition - 1, cursorPosition - 1);
  }
};

const formatPhone = () => {
  const value = phoneNumber.value;
  const cursorPosition = phoneInput.value.selectionStart;

  if (value === "") {
    showMask.value = true;
    return;
  }

  // Автодобавление +7 при вводе + или 7
  if (value === "+") {
    phoneNumber.value = "+7";
    nextTick(() => phoneInput.value.setSelectionRange(2, 2));
    return;
  }

  if (value === "7") {
    phoneNumber.value = "+7";
    nextTick(() => phoneInput.value.setSelectionRange(2, 2));
    return;
  }

  let digits = value.replace(/[^\d+]/g, "");

  if (digits.startsWith("+")) {
    digits = "+" + digits.substring(1).replace(/\D/g, "");
  } else {
    digits = digits.replace(/\D/g, "");
  }

  const digitsCount = digits.startsWith("+")
    ? digits.length - 1
    : digits.length;

  if (digitsCount > 11) {
    showMask.value = false;
    phoneNumber.value = digits;
    return;
  } else {
    showMask.value = true;
  }

  if (showMask.value) {
    let formatted = "";

    if (digits.startsWith("+")) {
      formatted = "+";
      digits = digits.substring(1);
    }

    if (digits.length > 0) {
      if (formatted === "+" && digits[0] !== "7") {
        digits = "7" + digits;
      }
      formatted += digits[0];
      digits = digits.substring(1);
    }

    // Форматирование по маске
    if (digits.length > 0) {
      formatted += " (" + digits.substring(0, 3);
      digits = digits.substring(3);
    }

    if (digits.length > 0) {
      formatted += ") " + digits.substring(0, 3);
      digits = digits.substring(3);
    }

    if (digits.length > 0) {
      formatted += "-" + digits.substring(0, 2);
      digits = digits.substring(2);
    }

    if (digits.length > 0) {
      formatted += "-" + digits.substring(0, 2);
    }

    phoneNumber.value = formatted;

    nextTick(() => {
      let newCursorPos = cursorPosition;
      const changes = phoneNumber.value.length - value.length;

      if (changes > 0) {
        newCursorPos += changes;
      }

      newCursorPos = Math.min(newCursorPos, phoneNumber.value.length);
      phoneInput.value.setSelectionRange(newCursorPos, newCursorPos);
    });
  }
};

const enableCode = () => {
  station.phone = true;
};

const handleSendLog = async (location, method, params, results, answer) => {
  try {
    await sendLog(location, method, params, results, answer);
  } catch (err) {
    console.error("error", err);
    // Optionally, update the error message ref
  }
};

const getQr = async () => {
  let params = {
    source: source,
    login: login,
  };
  if (stationDomain.navigate.value != "whatsapi") {
    params = {
      source: source,
      login: login,
    };
  } else {
    params = {
      source: source,
      login: login,
      storage: storage,
    };
  }
  try {
    const response = await axios.post(`${FRONTEND_URL}getQr`, params, {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Authorization: `Bearer ${token.value}`,
      },
    });

    if (response.data) {
      await handleSendLog(
        "getQr",
        "getQr",
        params,
        response.data.ok,
        response.data
      );
    }

    if (response.data.status === "ok") {
      previousLink = qrCodeData.link; // Сохраняем предыдущую ссылку
      qrCodeData.link = response.data.value;
      qrCodeData.station = true;
      props.updateLoadingStatus(false);
    } else if (response.data === 401) {
      errorBlock.value = true;
      setTimeout(() => {
        localStorage.removeItem("accountToken");
        router.push("/login");
      }, 2000);
    } else {
      // Если значение пустое, останавливаем запросы
      if (!response.data.value) {
        clearInterval(intervalId);
        qrCodeData.link = previousLink; // Отображаем предыдущую ссылку
        changeEnableStation();
      }
    }
  } catch (error) {
    console.error("error", error);
    if (error.response) {
      console.error("error", error.response.data);
    }
  }
};

const getInternationalFormat = () => {
  const digits = phoneNumber.value.replace(/\D/g, "");
  return digits;
};

const enablePhoneAuth = async () => {
  const internationalPhone = getInternationalFormat();
  props.updateLoadingStatus(true, "Изменение статуса...");
  let params = {
    token: token.value,
    source: source,
    login: login,
  };
  if (stationDomain.navigate.value != "whatsapi") {
    params = {
      token: token.value,
      source: source,
      login: login,
      phone: internationalPhone,
    };
  } else {
    params = {
      token: token.value,
      source: source,
      login: login,
      phone: internationalPhone,
      storage: storage,
    };
  }
  try {
    const response = await axios.post(
      `${FRONTEND_URL}enablePhoneAuth`,
      params,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.value}`,
        },
      }
    );

    if (response.data) {
      await handleSendLog(
        "getQr",
        "enablePhoneAuth",
        params,
        response.data.ok,
        response.data
      );
    }

    if (response.data.status === "ok") {
    } else if (response.data === 401) {
      errorBlock.value = true;
      setTimeout(() => {
        localStorage.removeItem("accountToken");
        router.push("/login");
      }, 2000);
    } else {
    }
  } catch (error) {
    console.error(`error`, error);
    if (error.response) {
      console.error("error", error.response.data);
    }
  }
};

const EnablebyQR = async () => {
  await Promise.all([getQr(), getAccountInfo()]);

  let count = 0;
  intervalId = setInterval(async () => {
    if (accountInfo.data?.step?.value === 5) {
      clearInterval(intervalId);
      return;
    }

    await Promise.all([getQr(), getAccountInfo()]);
    count++;
    if (count >= 6) {
      clearInterval(intervalId);
      changeEnableStation();
    }
  }, 20000);
};

const getAccountInfo = async () => {
  accountInfo.loading = true;
  accountInfo.error = null;

  let params = {
    source: source,
    login: login,
  };

  if (stationDomain.navigate.value === "whatsapi") {
    params.storage = storage;
  }

  try {
    const response = await axios.post(`${FRONTEND_URL}getInfo`, params, {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Authorization: `Bearer ${token.value}`,
      },
    });

    if (response.data) {
      await handleSendLog(
        "getInfo",
        "getInfo",
        params,
        response.data.ok,
        response.data
      );

      if (response.data.step?.value === 5) {
        clearInterval(intervalId); // Останавливаем интервал
        props.changeForceStopItemData(selectedItem.value); // Вызываем функцию из props
        props.openEnableMenuTrue();
        // changeEnableStation(); // Отключаем компонент (если нужно)
        return; // Прекращаем дальнейшие действия
      }
    }
  } catch (error) {
    console.error("Error fetching account info:", error);
    accountInfo.error = error;
    if (error.response) {
      console.error("Error response:", error.response.data);
    }
  } finally {
    accountInfo.loading = false;
  }
};

const closeModal = () => {
  qrCodeData.station = false;
};

const getCode = async () => {
  const phone = getInternationalFormat();
  if (phone.length < 8) {
    console.log("error");
    station.errorPhone = true;
    return;
  }
  await enablePhoneAuth();
  await offQrCodeStation();
  await startFunc();
};

onMounted(() => {
  EnablebyQR();
});

onBeforeUnmount(() => {
  clearInterval(intervalId);
});
</script>

<style scoped>
.qr-telegram-section {
  border-radius: 16px;
  max-width: 360px;
  width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  gap: 12px;
}

.title {
  font-weight: 600;
  font-size: 18px;
  color: #1a1a1a;
  margin: 0;
  line-height: 1.3;
}

.close-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  border-radius: 50%;
  transition: all 0.2s ease;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.close-button:hover {
  background-color: #f5f5f5;
  color: #333;
}

/* QR Code Section */
.qr-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.qr-wrapper {
  position: relative;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #e9ecef;
}

.qr-code {
  border-radius: 8px;
  display: block;
  width: 240px;
  height: 240px;
}

.scan-line {
  position: absolute;
  top: 16px;
  left: 16px;
  right: 16px;
  height: 2px;
  background: linear-gradient(90deg, transparent, #0088cc, transparent);
  animation: scan 2s ease-in-out infinite;
  border-radius: 1px;
}

@keyframes scan {
  0%,
  100% {
    top: 16px;
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  50% {
    top: calc(100% - 16px);
  }
}

.instruction {
  font-size: 14px;
  color: #666;
  text-align: center;
  margin: 0;
  line-height: 1.4;
  font-weight: 400;
}

.phone-link-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 10px;
  color: #495057;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
  justify-content: center;
}

.phone-link-button:hover {
  background: #e9ecef;
  border-color: #dee2e6;
}

/* НОВЫЕ СТИЛИ ДЛЯ СЕКЦИИ ТЕЛЕФОНА */
.phone-section {
  max-width: 400px;
  width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
}

.phone-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.phone-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  gap: 12px;
}

.phone-title {
  font-weight: 600;
  font-size: 18px;
  color: #1a1a1a;
  margin: 0;
  line-height: 1.3;
}

.phone-close-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  border-radius: 50%;
  transition: all 0.2s ease;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.phone-close-button:hover {
  background-color: #f5f5f5;
  color: #333;
}

.phone-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
  flex-grow: 1;
}

.phone-description {
  font-size: 14px;
  color: #666;
  text-align: center;
  margin: 0;
  line-height: 1.4;
  font-weight: 400;
}

.phone-input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.phone-input-container {
  display: flex;
  justify-content: center;
}

/* ОРИГИНАЛЬНЫЕ СТИЛИ ДЛЯ ИНПУТА (НЕ МЕНЯТЬ) */
.num-input {
  border-radius: 5px;
  padding-left: 10px;
  width: 280px;
  height: 45px;
  font-weight: 400;
  font-size: 14px;
  color: #000;
  border: 0.5px solid #c1c1c1;
  background: #fcfcfc;
  flex-grow: 1;
}

.num-input-error {
  border-radius: 5px;
  padding-left: 10px;
  width: 280px;
  height: 45px;
  font-weight: 400;
  font-size: 14px;
  color: #000;
  border: 0.5px solid #be2424;
  background: #ffeaea;
  flex-grow: 1;
}

.error-message {
  color: #d32f2f;
  font-size: 12px;
  text-align: center;
  margin-top: 4px;
}

.phone-next-button {
  width: 100%;
  height: 45px;
  border-radius: 10px;
  background-color: #0088cc;
  font-size: 14px;
  color: rgb(255, 255, 255);
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 10px;
}

.phone-next-button:hover {
  background-color: #0077b3;
}

.phone-next-button:active {
  transform: translateY(1px);
}

.back-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 10px;
  color: #495057;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
  margin-top: 8px;
}

.back-button:hover {
  background: #e9ecef;
  border-color: #dee2e6;
}

/* Старые стили для обратной совместимости */
.number-section {
  display: flex;
  flex-direction: column;
}

.next-button {
  width: 100%;
  height: 35px;
  border-radius: 5px;
  background-color: #4950ca;
  font-size: 14px;
  color: rgb(255, 255, 255);
  font-weight: 600;
  margin-top: 20px;
  border: none;
  cursor: pointer;
}

/* Responsive Design для телефонной секции */
@media (max-width: 500px) {
  .phone-section {
    padding: 16px;
    margin: 12px;
    max-width: calc(100% - 24px);
  }

  .phone-header {
    margin-bottom: 20px;
  }

  .phone-title {
    font-size: 16px;
  }

  .phone-content {
    gap: 16px;
  }

  .num-input,
  .num-input-error {
    width: 100%;
    max-width: 280px;
  }
}

@media (max-width: 400px) {
  .phone-section {
    padding: 14px;
    margin: 8px;
    max-width: calc(100% - 16px);
  }

  .phone-title {
    font-size: 15px;
  }

  .phone-close-button {
    padding: 4px;
  }
}

@media (max-width: 360px) {
  .phone-section {
    padding: 12px;
  }

  .phone-title {
    font-size: 14px;
  }

  .phone-description {
    font-size: 13px;
  }

  .phone-next-button,
  .back-button {
    font-size: 13px;
    padding: 10px 16px;
  }
}

/* Оригинальные медиа-запросы для QR секции */
@media (max-width: 480px) {
  .qr-telegram-section {
    padding: 16px;
    border-radius: 12px;
    margin: 12px;
    max-width: calc(100% - 24px);
  }

  .header {
    margin-bottom: 20px;
  }

  .title {
    font-size: 16px;
  }

  .qr-content {
    gap: 16px;
  }

  .qr-wrapper {
    padding: 12px;
  }

  .qr-code {
    width: 200px;
    height: 200px;
  }

  .instruction {
    font-size: 13px;
  }

  .phone-link-button {
    padding: 10px 16px;
    font-size: 13px;
  }
}

@media (max-width: 360px) {
  .qr-telegram-section {
    padding: 14px;
    margin: 8px;
    max-width: calc(100% - 16px);
  }

  .title {
    font-size: 15px;
  }

  .close-button {
    padding: 4px;
  }

  .qr-code {
    width: 180px;
    height: 180px;
  }

  .instruction {
    font-size: 12px;
  }

  .phone-link-button {
    padding: 8px 12px;
    font-size: 12px;
  }
}

/* Для очень маленьких экранов */
@media (max-width: 320px) {
  .qr-code {
    width: 160px;
    height: 160px;
  }

  .title {
    font-size: 14px;
  }
}

/* Медиа-запросы для старой версии секции с номером */
@media (max-width: 500px) {
  .number-section {
    width: 300px;
  }

  .num-input,
  .num-input-error {
    width: 220px;
  }
}

@media (max-width: 400px) {
  .number-section {
    width: 250px;
  }

  .num-input,
  .num-input-error {
    width: 170px;
  }
}
</style>
