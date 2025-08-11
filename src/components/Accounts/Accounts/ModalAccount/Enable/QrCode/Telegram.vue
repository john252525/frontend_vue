<template>
  <ErrorBlock v-if="errorBlock" :changeIncorrectPassword="chaneErrorBlock" />
  <section v-if="!station.phone" class="qr-telegram-section">
    <LoadingModal :stationLoading="stationLoading" />
    <article v-if="qrCodeData.station">
      <qrcode-vue :value="qrCodeData.link" :size="256" />

      <h2 @click="enableCode" class="title">
        {{ t("enable.codeTitle") }}
      </h2>
    </article>
  </section>
  <section v-if="station.phone" class="number-section">
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
    <button @click="getCode" class="next-button">
      {{ t("enable.next") }}
    </button>
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
      stationLoading.value = false;
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
  return "+" + digits;
};

const enablePhoneAuth = async () => {
  const internationalPhone = getInternationalFormat();
  stationLoading.value = true;
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
  await getQr();

  let count = 0;
  intervalId = setInterval(async () => {
    await getQr();
    count++;
    if (count >= 6) {
      clearInterval(intervalId);
      changeEnableStation();
    }
  }, 20000); // 20 секунд
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
.title {
  margin-top: 16px;
  font-weight: 500;
  font-size: 18px;
  text-align: center;
  padding: 4px;
  background-color: rgb(243, 243, 243);
  border-radius: 5px;
  cursor: pointer;
}

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
</style>
