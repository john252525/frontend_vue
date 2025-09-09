<template>
  <ErrorBlock v-if="errorBlock" :changeIncorrectPassword="chaneErrorBlock" />
  <section v-if="!station.phone" class="qr-whatsapp-section">
    <LoadingModal
      :textLoadin="station.text"
      :stationLoading="station.loading"
    />
    <ResultModal v-if="station.error" />
    <article v-if="qrCodeData.station && !station.error" class="qr-container">
      <div class="header">
        <h2 class="title">Подключение WhatsApp</h2>
        <button @click="changeEnableStation" class="close-button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
      
      <div class="qr-content">
        <div class="qr-wrapper">
          <qrcode-vue :value="qrCodeData.link" :size="260" class="qr-code" />
          <div class="scan-line"></div>
        </div>
        
        <p class="instruction">Отсканируйте QR-код через приложение WhatsApp</p>
        
        <button @click="stopEnableByQR" class="phone-link-button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 16.92V19.92C22 20.47 21.55 20.93 21 20.98C20.5 21.03 19.99 21.05 19.5 21C16.74 20.52 14.19 19.24 12.11 17.34C10.39 15.78 9.05 13.87 8.15 11.73C7.59 10.29 7.25 8.76 7.15 7.18C7.11 6.63 7.52 6.14 8.07 6.09C8.57 6.05 9.06 6 9.55 6.05H12.55C13.07 6.05 13.52 6.42 13.59 6.93C13.71 7.79 13.93 8.63 14.25 9.43C14.38 9.76 14.3 10.14 14.05 10.39L13.11 11.33C14.41 13.48 16.52 15.59 18.67 16.89L19.61 15.95C19.74 15.82 19.91 15.74 20.09 15.74C20.17 15.74 20.25 15.75 20.33 15.77C21.13 16.09 21.97 16.31 22.83 16.43C23.34 16.5 23.71 16.95 23.71 17.47V17.48H22.83H22Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Связать через телефон
        </button>
      </div>
    </article>
  </section>
  
  <section v-if="station.phone" class="number-section">
    <div class="phone-input-container">
      <input
        :class="station.errorPhone ? 'num-input-error' : 'num-input'"
        :placeholder="showMask ? '+7 (___) ___-__-__' : 'Введите номер телефона'"
        @input="formatPhone"
        @keydown.delete="handleBackspace"
        class="num-input"
        type="text"
        id="phone"
        v-model="phoneNumber"
        ref="phoneInput"
      />
    </div>
    <button @click="getCode" class="next-button">Продолжить</button>
  </section>
</template>

<script setup>
import { useI18n } from "vue-i18n";
const { t } = useI18n();
import {
  inject,
  ref,
  reactive,
  computed,
  onMounted,
  nextTick,
  watch,
} from "vue";
import axios from "axios";
const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL;
import QrcodeVue from "qrcode.vue";
import LoadingModal from "../LoadingModal.vue";
import ResultModal from "../ResultModal.vue";
import ErrorBlock from "@/components/ErrorBlock/ErrorBlock.vue";
import { useRouter } from "vue-router";
const router = useRouter();

const props = defineProps({
  changeForceStopItemData: {
    type: Function,
  },
  openEnableMenuTrue: {
    type: Function,
  },
});

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
const phoneNumber = ref("");
const phoneInput = ref(null);
const showMask = ref(true);

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
};

// Обработчик backspace
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

// Форматирование телефона
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

// Получаем номер в международном формате
const getInternationalFormat = () => {
  const digits = phoneNumber.value.replace(/\D/g, "");
  return digits;
};

// Остальной код компонента остается без изменений
const { changeEnableStation } = inject("changeEnableStation");
const { selectedItem, startFunc, offQrCodeStation } = inject("accountItems");
const { source, login, storage } = selectedItem.value;
import { useDomain } from "@/composables/getDomain";
const { stationDomain } = useDomain();
const station = reactive({
  phone: false,
  error: false,
  errorPhone: false,
  qrSend: false,
  text: "",
  loading: false,
});

import { useAccountStore } from "@/stores/accountStore";
const accountStore = useAccountStore();
const token = computed(() => accountStore.getAccountToken);

import useFrontendLogger from "@/composables/useFrontendLogger";
const { sendLog } = useFrontendLogger();

const handleSendLog = async (location, method, params, results, answer) => {
  try {
    await sendLog(location, method, params, results, answer);
  } catch (err) {
    console.error("Ошибка при парсинге JSON:", err);
  }
};

const qrCodeData = reactive({
  link: "",
  station: false,
});

const errorBlock = ref(false);
const chaneErrorBlock = () => {
  errorBlock.value = errorBlock.value;
};

const stationLoading = ref(true);
const intervalId = ref(null);
const isRunning = ref(false);
let previousLink = "";

const enablePhoneAuth = async () => {
  const internationalPhone = getInternationalFormat();
  station.loading = true;
  let params = {
    source: source,
    login: login,
  };
  if (stationDomain.navigate.value != "whatsapi") {
    params = {
      source: source,
      login: login,
      phone: internationalPhone,
    };
  } else {
    params = {
      source: source,
      login: login,
      storage: storage,
      phone: internationalPhone,
    };
  }
  try {
    const response = await axios.post(
      `${FRONTEND_URL}enablePhoneAuth`,
      params,
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
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
      console.log(response.data);
    } else if (response.data === 401) {
      errorBlock.value = true;
      setTimeout(() => {
        localStorage.removeItem("accountToken");
        router.push("/login");
      }, 2000);
    } else {
      // console.log(response.data.ok);
    }
  } catch (error) {
    console.error("Ошибка:", error);
    if (error.response) {
      console.error("Ошибка сервера:", error.response.data);
    }
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
      previousLink = qrCodeData.link;
      qrCodeData.link = response.data.value;
      qrCodeData.station = true;
      station.loading = false;
    } else if (response.data === 401) {
      errorBlock.value = true;
      setTimeout(() => {
        localStorage.removeItem("accountToken");
        router.push("/login");
      }, 2000);
    } else if (
      response.data.error.message === "False step" ||
      response.data.error.message === "QR is undefined"
    ) {
      props.changeForceStopItemData(selectedItem.value);
      props.openEnableMenuTrue();
      clearInterval(intervalId.value); // Используем .value для ref
      isRunning.value = false; // Добавляем эту строку
      qrCodeData.link = previousLink;
      // changeEnableStation();
    } else {
      if (!response.data.value) {
        clearInterval(intervalId);
        qrCodeData.link = previousLink;
        changeEnableStation();
      }
    }
  } catch (error) {
    console.error("Ошибка при создании аккаунта:", error);
    station.error = true;
    return;
  }
};

const startEnableByQR = async () => {
  if (isRunning.value) return; // Если уже работает, не запускаем снова

  stationLoading.value = true;
  station.loading = true;
  station.text = "Генерируем QR-код...";
  await getQr();

  let count = 0;
  isRunning.value = true;

  intervalId.value = setInterval(async () => {
    if (!isRunning.value) {
      // Добавляем проверку
      clearInterval(intervalId.value);
      return;
    }

    await getQr();
    count++;
    if (count >= 6) {
      clearInterval(intervalId.value);
      isRunning.value = false;
      changeEnableStation();
    }
  }, 20000);
};

const stopEnableByQR = () => {
  clearInterval(intervalId.value);
  isRunning.value = false;
  station.phone = true;
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
  startEnableByQR();
  updatePhoneFormat();
});

defineExpose({ stopEnableByQR });
</script>

<style scoped>
.qr-whatsapp-section {
  /* background: #ffffff; */
  border-radius: 16px;
  /* padding: 20px; */
  /* box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12); */
  max-width: 360px;
  width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
}

.number-section {
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
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
  background: linear-gradient(90deg, transparent, #25D366, transparent);
  animation: scan 2s ease-in-out infinite;
  border-radius: 1px;
}

@keyframes scan {
  0%, 100% {
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

/* Phone Number Section - ОРИГИНАЛЬНАЯ ВЕРСТКА */
.phone-input-container {
  display: flex;
  gap: 10px;
}

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

/* Responsive Design */
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

@media (max-width: 480px) {
  .qr-whatsapp-section {
    padding: 16px;
    border-radius: 12px;
    margin: 12px;
    max-width: calc(100% - 24px);
  }
  
  .header {
    margin-bottom: 16px;
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
  .qr-whatsapp-section {
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
</style>