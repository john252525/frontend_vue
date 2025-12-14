<template>
  <div class="error-container">
    <section v-if="!station.phone" class="result-section">
      <div class="error-icon">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          viewBox="0 0 24 24"
        >
          <path
            fill="#ff4757"
            d="M11.953 2C6.465 2 2 6.486 2 12s4.486 10 10 10s10-4.486 10-10S17.493 2 11.953 2M13 17h-2v-2h2zm0-4h-2V7h2z"
          />
        </svg>
      </div>
      <p class="error-message">
        {{ t("result.false.message.one") }}<br />
        {{ t("result.false.message.two") }}
      </p>

      <div class="action-buttons">
        <button @click="enableCode" class="connect-button code-button">
          <svg width="14" height="14" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M8.7 17.3q-.275-.275-.275-.7t.275-.7l3.9-3.9l-3.9-3.9q-.275-.275-.275-.7t.275-.7q.275-.275.7-.275t.7.275l4.6 4.6q.15.15.213.325t.062.375q0 .2-.063.375t-.212.325l-4.6 4.6q-.275.275-.7.275t-.7-.275Zm3.6 0q-.275-.275-.275-.7t.275-.7l3.9-3.9l-3.9-3.9q-.275-.275-.275-.7t.275-.7q.275-.275.7-.275t.7.275l4.6 4.6q.15.15.213.325t.062.375q0 .2-.063.375t-.212.325l-4.6 4.6q-.275.275-.7.275t-.7-.275Z"
            />
          </svg>
          Связать через код
        </button>
        <button @click="getQr" class="connect-button qr-button">
          <svg width="14" height="14" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M3 11V3h8v8H3Zm2-2h4V5H5v4ZM3 21v-8h8v8H3Zm2-2h4v-4H5v4Zm8-12V3h8v8h-8Zm2-2h4V5h-4v4Zm2 12h2v-2h2v-2h-4v4Zm-2 2v-4h4v4h-4Zm4-4v-2h2v2h-2Zm-2 0h-2v-2h2v2Zm2-6h2V7h-2v2Zm-2 0v-2h2v2h-2Z"
            />
          </svg>
          Связать через qr
        </button>
      </div>

      <button @click="startFunc" class="reload-button">
        {{ t("result.false.button") }}
      </button>
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
            Введите номер телефона для подключения WhatsApp
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
            Вернуться к выбору способа
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { inject, computed, reactive, nextTick, ref } from "vue";
const { selectedItem, startFunc, offQrQrStation, offQrCodeStation } =
  inject("accountItems");
import { useI18n } from "vue-i18n";
const { t } = useI18n();
import axios from "axios";
const { source, login, storage } = selectedItem.value;

const props = defineProps({
  changeEnableStation: {
    type: Function,
  },
});

import { useAccountStore } from "@/stores/accountStore";
const accountStore = useAccountStore();
const token = computed(() => accountStore.getAccountToken);

const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL;

import { useStationLoading } from "@/composables/useStationLoading";
const { setLoadingStatus } = useStationLoading();

import { useDomain } from "@/composables/getDomain";
const { stationDomain } = useDomain();

const connectViaCode = () => console.log("Connect via code");
const connectViaQR = () => console.log("Connect via QR");
//

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

const currentFormat = computed(() => {
  const country = countries.value.find((c) => c.code === selectedCountry.value);
  return country ? country.format : "";
});

const placeholder = computed(() => {
  const country = countries.value.find((c) => c.code === selectedCountry.value);
  if (!country) return "";

  let placeholder = country.code + " ";
  for (let i = 0; i < country.format.length; i++) {
    placeholder += country.format[i] === "#" ? "_" : country.format[i];
  }
  return placeholder;
});

const updatePhoneFormat = () => {
  formattedPhone.value = selectedCountry.value + " ";
};

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

const station = reactive({
  phone: false,
  error: false,
  errorPhone: false,
  qrSend: false,
  text: "",
  loading: false,
});

// Получаем номер в международном формате
const getInternationalFormat = () => {
  const digits = phoneNumber.value.replace(/\D/g, "");
  return digits;
};

//
const disablePhoneAuth = async () => {
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
    const response = await axios.post(
      `${FRONTEND_URL}disablePhoneAuth`,
      params,
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: `Bearer ${token.value}`,
        },
      }
    );

    if (response.data.status === "ok") {
    } else if (response.data === 401) {
      setLoadingStatus(true, "error");
      setTimeout(() => {
        localStorage.removeItem("accountToken");
        router.push("/login");
      }, 2000);
    } else {
      setLoadingStatus(true, "error");
    }
  } catch (error) {
    setLoadingStatus(true, "error");
    console.error("error", error);
    if (error.response) {
      setLoadingStatus(true, "error");
      console.error("error", error.response.data);
    }
  }
};

const getQr = async () => {
  await disablePhoneAuth();
  await offQrQrStation();
  await startFunc();
};

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
</script>

<style scoped>
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.result-section {
  min-width: 350px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.error-icon {
  margin-bottom: 1rem;
}

.error-message {
  margin: 1rem 0;
  font-size: 0.95rem;
  font-weight: 500;
  color: #495057;
  text-align: center;
  line-height: 1.5;
}

.action-buttons {
  display: flex;
  gap: 0.75rem;
  width: 100%;
  margin: 1rem 0;
}

.connect-button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.6rem;
  border-radius: 6px;
  font-weight: 500;
  font-size: 0.85rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.code-button {
  background-color: #4dabf7;
  color: white;
}

.code-button:hover {
  background-color: #339af0;
}

.qr-button {
  background-color: #40c057;
  color: white;
}

.qr-button:hover {
  background-color: #37b24d;
}

.reload-button {
  width: 100%;
  padding: 0.6rem;
  border-radius: 6px;
  background: #ff6b6b;
  font-weight: 500;
  font-size: 0.85rem;
  color: white;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.reload-button:hover {
  background: #ff5252;
}

/* Анимации */
.error-icon,
.error-message,
.action-buttons,
.reload-button {
  animation: fadeIn 0.4s ease-out forwards;
}

.action-buttons {
  animation-delay: 0.1s;
}

.reload-button {
  animation-delay: 0.2s;
}

/* ОБНОВЛЕННАЯ СЕКЦИЯ С ТЕЛЕФОНОМ */
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

.country-select {
  width: 80px;
  height: 45px;
  border-radius: 5px;
  border: 0.5px solid #c1c1c1;
  background: #fcfcfc;
  padding: 0 5px;
  font-size: 14px;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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

  .result-section {
    padding: 1.25rem;
  }

  .action-buttons {
    flex-direction: column;
    gap: 0.5rem;
  }

  .error-message {
    font-size: 0.9rem;
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

/* Медиа-запросы для старой версии */
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
