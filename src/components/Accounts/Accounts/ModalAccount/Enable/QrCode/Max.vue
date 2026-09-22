<template>
  <ErrorBlock v-if="errorBlock" :changeIncorrectPassword="chaneErrorBlock" />
  <section v-if="!station.phone" class="qr-whatsapp-section">
    <LoadingModal
      :textLoadin="station.text"
      :stationLoading="station.loading"
    />
    <ResultModal v-if="station.error" />
    <article v-if="qrCodeData.station && !station.error" class="qr-container">
      <!-- ПРОГРЕССБАР СВЕРХУ -->
      <div class="session-timer-bar">
        <div
          class="session-progress"
          :style="{ width: sessionProgress + '%' }"
        ></div>
      </div>

      <div class="header">
        <h2 class="title">Подключение Max</h2>
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
        <!-- ЕСЛИ СЕССИЯ АКТИВНА - ПОКАЗЫВАЕМ QR -->
        <template v-if="!sessionExpired">
          <div class="qr-wrapper">
            <qrcode-vue :value="qrCodeData.link" :size="260" class="qr-code" />
            <div class="scan-line"></div>
          </div>

          <p class="instruction">Отсканируйте QR-код через приложение Max</p>

          <!-- ТАЙМЕР ОСТАВШЕГОСЯ ВРЕМЕНИ -->
          <div class="timer-display">
            <span class="timer-text"
              >Сессия истечет через {{ sessionTimeRemaining }}с</span
            >
          </div>
        </template>

        <!-- ЕСЛИ СЕССИЯ ИСТЕКЛА - ПОКАЗЫВАЕМ СООБЩЕНИЕ И КНОПКУ РЕГЕНЕРАЦИИ -->
        <template v-else>
          <div class="expired-state">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              class="expired-icon"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="2"
              />
              <path
                d="M12 6V12L16 16"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <p class="expired-text">Сессия истекла</p>
            <p class="expired-description">
              Пожалуйста, нажмите кнопку ниже для получения нового QR-кода
            </p>
            <button @click="regenerateQrCode" class="regenerate-button">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M23 4V10H17"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M20.49 15C19.9868 16.5022 18.9995 17.7217 17.7213 18.4629C16.4432 19.204 14.9229 19.4299 13.4819 19.1077C12.0409 18.7854 10.8044 17.9342 10.0322 16.7447C9.2599 15.5552 8.99856 14.0982 9.29298 12.6983"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              Получить новый QR-код
            </button>
          </div>
        </template>
      </div>
    </article>
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
  onBeforeUnmount,
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
  updateLoadingStatus: {
    type: Function,
  },
  changeMax: {
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
// Успех/переход на 2FA может прийти и от getQr ("QR is undefined" — старая
// эвристика), и от getInfo (step.value === 5 / 2.1 / 2.25) — оба опрашиваются
// в одном тике через Promise.all, поэтому нужен общий флаг: без него можно
// либо сработать дважды (openEnableMenuTrue в Enable.vue не устанавливает, а
// переключает resultTrue — повторный вызов её погасит), либо после уже
// обработанного успеха/переключения на пароль всё равно продолжить обычную
// ветку startEnableByQR и заново запустить QR-поллинг поверх.
let flowHandled = false;

const handleQrSuccess = () => {
  if (flowHandled) return;
  flowHandled = true;
  clearInterval(intervalId.value);
  isRunning.value = false;
  stopSessionTimer();
  props.changeForceStopItemData(selectedItem.value);
  props.openEnableMenuTrue();
};

// НОВЫЕ ПЕРЕМЕННЫЕ ДЛЯ ТАЙМЕРА
const SESSION_DURATION = 60; // 60 секунд
const sessionTimeRemaining = ref(SESSION_DURATION);
const sessionProgress = ref(100);
const sessionExpired = ref(false);
let sessionTimerId = null;

const enablePhoneAuth = async () => {
  const internationalPhone = getInternationalFormat();
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

    // getQr и getAccountInfo опрашиваются параллельно (см. Promise.all в
    // startEnableByQR). Если getAccountInfo в этом же тике уже увёл на
    // пароль/успех (flowHandled), ответ getQr устарел — например, бэк уже
    // отвечает "False step", потому что шаг аккаунта сменился на 2.1, и без
    // этой проверки regenerateQrCode() ниже заново запустит генерацию QR
    // поверх уже открытого экрана пароля.
    if (flowHandled) return;

    if (response.data.status === "ok") {
      previousLink = qrCodeData.link;
      qrCodeData.link = response.data.value;
      qrCodeData.station = true;
      props.updateLoadingStatus(false);
    } else if (response.data === 401) {
      errorBlock.value = true;
      setTimeout(() => {
        localStorage.removeItem("accountToken");
        router.push("/login");
      }, 2000);
    } else if (response.data.error.message === "QR is undefined") {
      qrCodeData.link = previousLink;
      handleQrSuccess();
    } else if (response.data.error.message === "False step") {
      props.updateLoadingStatus(false);
      regenerateQrCode();
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

// Параллельно с getQr опрашиваем реальный статус аккаунта — так же, как
// сделано в Telegram.vue (Enable/QrCode/Telegram.vue). До этого getQr не
// опрашивался вовсе, и успех подключения определялся только косвенно через
// ошибку "QR is undefined" у getQr, из-за чего переопрос "не всегда" ловил
// момент авторизации.
const getAccountInfo = async () => {
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
        "getQr",
        "getInfo",
        params,
        response.data.ok,
        response.data
      );
    }

    const step = Number(response.data?.step?.value);

    if (step === 5) {
      handleQrSuccess();
    } else if ((step === 2.1 || step === 2.25) && props.changeMax) {
      // Аккаунту нужен пароль/код после сканирования QR — переключаемся на
      // тот же флоу ввода пароля/кода, что и при подключении по номеру.
      if (flowHandled) return;
      flowHandled = true;
      clearInterval(intervalId.value);
      isRunning.value = false;
      stopSessionTimer();
      props.changeMax();
    }
  } catch (error) {
    console.error("Ошибка при получении статуса аккаунта:", error);
    if (error.response) {
      console.error("Ошибка сервера:", error.response.data);
    }
  }
};

// ФУНКЦИЯ ЗАПУСКА ТАЙМЕРА СЕССИИ
const startSessionTimer = () => {
  sessionTimeRemaining.value = SESSION_DURATION;
  sessionProgress.value = 100;
  sessionExpired.value = false;

  // Таймер для отсчета времени
  sessionTimerId = setInterval(() => {
    sessionTimeRemaining.value--;
    sessionProgress.value =
      (sessionTimeRemaining.value / SESSION_DURATION) * 100;

    if (sessionTimeRemaining.value <= 0) {
      clearInterval(sessionTimerId);
      sessionExpired.value = true;
      clearInterval(intervalId.value); // Останавливаем запросы QR
      isRunning.value = false;
    }
  }, 1000);
};

// ФУНКЦИЯ ОСТАНОВКИ ТАЙМЕРА
const stopSessionTimer = () => {
  if (sessionTimerId) {
    clearInterval(sessionTimerId);
    sessionTimerId = null;
  }
};

// ФУНКЦИЯ РЕГЕНЕРАЦИИ QR-КОДА
const regenerateQrCode = async () => {
  sessionExpired.value = false;
  stopSessionTimer();
  clearInterval(intervalId.value);
  isRunning.value = false;
  await startEnableByQR();
};

const startEnableByQR = async () => {
  if (isRunning.value) return;

  flowHandled = false;
  props.updateLoadingStatus(true, "Генерирация QR-кода");
  await Promise.all([getQr(), getAccountInfo()]);
  if (flowHandled) return; // getInfo/getQr уже увели на успех или на 2FA

  // ЗАПУСКАЕМ ТАЙМЕР СЕССИИ
  startSessionTimer();

  let count = 0;
  isRunning.value = true;

  intervalId.value = setInterval(async () => {
    if (!isRunning.value) {
      clearInterval(intervalId.value);
      return;
    }

    await Promise.all([getQr(), getAccountInfo()]);
    if (flowHandled) return;
    count++;
    if (count >= 6) {
      clearInterval(intervalId.value);
      stopSessionTimer();
      isRunning.value = false;
      sessionExpired.value = true;
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
  props.updateLoadingStatus(true, "Изменение статуса...");
  await enablePhoneAuth();
  await offQrCodeStation();
  await startFunc();
};

onMounted(() => {
  startEnableByQR();
  updatePhoneFormat();
});

onBeforeUnmount(() => {
  clearInterval(intervalId.value);
  stopSessionTimer();
});

defineExpose({ stopEnableByQR });
</script>

<style scoped>
.qr-whatsapp-section {
  border-radius: 16px;
  max-width: 360px;
  width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
}

/* СТИЛЬ ДЛЯ ПРОГРЕССБАРА */
.session-timer-bar {
  height: 4px;
  background-color: #e9ecef;
  border-radius: 16px 16px 0 0;
  overflow: hidden;
  margin: 0 0 24px 0;
}

.session-progress {
  height: 100%;
  background: linear-gradient(90deg, #25d366, #1da851);
  border-radius: 16px;
  transition: width 0.1s linear;
  box-shadow: 0 0 8px rgba(37, 211, 102, 0.3);
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
  padding: 0 16px;
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

.qr-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 0 16px 16px 16px;
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
  background: linear-gradient(90deg, transparent, #25d366, transparent);
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

/* СТИЛЬ ДЛЯ ТАЙМЕРА */
.timer-display {
  width: 100%;
  padding: 12px 16px;
  background: #e8f7f0;
  border: 1px solid #b3e5d8;
  border-radius: 8px;
  text-align: center;
}

.timer-text {
  font-size: 13px;
  font-weight: 500;
  color: #25d366;
}

/* СТИЛЬ ДЛЯ ИСТЕКШЕЙ СЕССИИ */
.expired-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 32px 16px;
  text-align: center;
}

.expired-icon {
  color: #be2424;
  opacity: 0.8;
}

.expired-text {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.expired-description {
  font-size: 14px;
  color: #666;
  margin: 0;
  line-height: 1.4;
}

.regenerate-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  background-color: #25d366;
  border: none;
  border-radius: 10px;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
  max-width: 280px;
}

.regenerate-button:hover {
  background-color: #1da851;
  box-shadow: 0 4px 12px rgba(37, 211, 102, 0.25);
}

.regenerate-button:active {
  transform: translateY(1px);
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

/* ОРИГИНАЛЬНЫЕ СТИЛИ ДЛЯ ИНПУТА И КНОПКИ */
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
  background-color: #25d366;
  font-size: 14px;
  color: rgb(255, 255, 255);
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 10px;
}

.phone-next-button:hover {
  background-color: #1da851;
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

/* Responsive Design для телефонной секции */
@media (max-width: 500px) {
  .qr-whatsapp-section {
    padding: 0;
    border-radius: 12px;
  }

  .session-timer-bar {
    border-radius: 12px 12px 0 0;
  }

  .header {
    padding: 16px;
    margin-bottom: 16px;
  }

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

  .qr-code {
    width: 180px;
    height: 180px;
  }
}

@media (max-width: 360px) {
  .qr-whatsapp-section {
    padding: 12px;
  }

  .title {
    font-size: 14px;
  }

  .qr-code {
    width: 160px;
    height: 160px;
  }

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

  .expired-description {
    font-size: 13px;
  }

  .regenerate-button {
    font-size: 13px;
    padding: 10px 16px;
  }
}

@media (max-width: 320px) {
  .qr-code {
    width: 140px;
    height: 140px;
  }

  .title {
    font-size: 13px;
  }

  .timer-text {
    font-size: 12px;
  }
}
</style>
