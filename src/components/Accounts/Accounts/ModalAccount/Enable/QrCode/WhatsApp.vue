<template>
  <ErrorBlock v-if="errorBlock" :changeIncorrectPassword="chaneErrorBlock" />
  <section v-if="!station.phone" class="qr-whatsapp-section">
    <LoadingModal
      :textLoadin="station.text"
      :stationLoading="station.loading"
    />
    <ResultModal v-if="station.error" />
    <article v-if="qrCodeData.station">
      <qrcode-vue :value="qrCodeData.link" :size="256" />
      <h2 @click="stopEnableByQR" class="title">{{ t("enable.codeTitle") }}</h2>
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
    <button @click="getCode" class="next-button">{{ t("enable.next") }}</button>
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
  return "+" + digits;
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
  stationLoading.value = true;
  station.loading = true;
  station.text = "Генерируем QR-код...";
  await getQr();

  let count = 0;
  isRunning.value = true;

  intervalId.value = setInterval(async () => {
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

.blak-fon {
  position: fixed;
  z-index: 10;
  width: 100%;
  height: 100vh;
  background: rgba(117, 117, 117, 0.3);
  top: 0;
  left: 0;
}

.number-section {
  display: flex;
  flex-direction: column;
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

.country-select {
  width: 80px;
  height: 45px;
  border-radius: 5px;
  border: 0.5px solid #c1c1c1;
  background: #fcfcfc;
  padding: 0 5px;
  font-size: 14px;
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

  .country-select {
    width: 70px;
  }
}
</style>
