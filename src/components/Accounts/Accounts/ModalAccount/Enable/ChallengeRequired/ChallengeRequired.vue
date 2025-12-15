<template>
  <LoadingModal
    :textLoadin="'Загрузка кода'"
    :station-loading="station.loading"
  />

  <CodeWarningModal :isOpen="isWarningModalOpen" @close="closeWarningModal" />

  <div class="code-auth-container">
    <!-- ФАЗА 1: ВВОД ТЕЛЕФОНА (только для source === 'max') -->
    <div v-if="source === 'max' && !showCodeInput" class="code-auth-modal">
      <div class="code-auth-header">
        <h2 class="code-auth-title">Подключение по телефону</h2>
        <button class="code-auth-close" @click="close">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M18 6L6 18M6 6L18 18"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
        </button>
      </div>

      <div class="code-auth-body">
        <div class="phone-input-section">
          <p class="phone-description">
            Введите номер телефона для подключения
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
        </div>
      </div>

      <div class="code-auth-footer">
        <button
          @click="submitPhoneNumber"
          class="code-submit-button"
          :disabled="!isPhoneValid"
        >
          <span>Далее</span>
          <svg
            v-if="station.loading"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M12 2V6M12 18V22M6 12H2M22 12H18M19.0784 19.0784L16.25 16.25M19.0784 4.99994L16.25 7.82837M4.92157 19.0784L7.75 16.25M4.92157 4.99994L7.75 7.82837"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
        </button>

        <button @click="close" class="back-button">
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
          Вернуться
        </button>
      </div>
    </div>

    <!-- ФАЗА 2: ВВОД КОДА -->
    <div v-if="showCodeInput" class="code-auth-modal">
      <div class="code-auth-header">
        <h2 class="code-auth-title">Подтверждение входа</h2>
        <button class="code-auth-close" @click="handleClose">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M18 6L6 18M6 6L18 18"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
        </button>
      </div>

      <div class="code-auth-body">
        <div class="code-input-section">
          <p class="code-description">
            Введите 5-значный код подтверждения, отправленный на ваш телефон
          </p>

          <div class="code-input-container">
            <input
              class="code-input"
              type="text"
              v-model="code"
              maxlength="5"
              required
              placeholder="00000"
              @input="formatCode"
              @keypress="validateNumber"
            />
            <div class="code-input-underline"></div>
          </div>

          <div class="code-hint clickable" @click="openWarningModal">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 16V12M12 8H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
            Код не пришел?
          </div>
        </div>
      </div>

      <div class="code-auth-footer">
        <button
          @click="solveChallenge"
          class="code-submit-button"
          :disabled="!isCodeValid"
        >
          <span>Подтвердить</span>
          <svg
            v-if="station.loading"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M12 2V6M12 18V22M6 12H2M22 12H18M19.0784 19.0784L16.25 16.25M19.0784 4.99994L16.25 7.82837M4.92157 19.0784L7.75 16.25M4.92157 4.99994L7.75 7.82837"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
        </button>

        <div class="code-auth-divider">
          <span>или</span>
        </div>

        <button @click="goBackToPhone" class="code-switch-method">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M19 12H5M12 19L5 12L12 5"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          Вернуться к номеру телефона
        </button>
      </div>
    </div>

    <ErrorBlock v-if="errorBlock" :changeIncorrectPassword="chaneErrorBlock" />
  </div>
</template>

<script setup>
import { ref, inject, reactive, computed, nextTick } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";
import { useAccountStore } from "@/stores/accountStore";
import useFrontendLogger from "@/composables/useFrontendLogger";
import { useDomain } from "@/composables/getDomain";
import ErrorBlock from "@/components/ErrorBlock/ErrorBlock.vue";
import CodeWarningModal from "./CodeWarningModal.vue";
import LoadingModal from "../LoadingModal.vue";

const props = defineProps({
  changeChallengeRequired: {
    type: Function,
  },
  openEnableMenuTrue: {
    type: Function,
  },
  source: {
    type: String,
  },
  updateLoadingStatus: {
    type: Function,
  },
  openError: {
    type: Function,
  },
  close: {
    type: Function,
  },
});

const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL;
const { sendLog } = useFrontendLogger();

const accountStore = useAccountStore();
const token = computed(() => accountStore.getAccountToken);
const { stationDomain } = useDomain();
const router = useRouter();

const { selectedItem, startFunc, offQrCodeStation } = inject("accountItems");
const { source: injectedSource, login, storage } = selectedItem.value;

// Используем source из props или inject
const source = computed(() => props.source || injectedSource);

// ===== СОСТОЯНИЕ =====
const station = reactive({
  loading: false,
  errorPhone: false,
});

const errorBlock = ref(false);
const isWarningModalOpen = ref(false);

// ===== ФАЗА 1: ТЕЛЕФОН =====
const phoneNumber = ref("");
const phoneInput = ref(null);
const showMask = ref(true);

// ===== ФАЗА 2: КОД =====
const code = ref("");
const showCodeInput = ref(false);

// ===== COMPUTED =====
const isPhoneValid = computed(() => {
  const digits = phoneNumber.value.replace(/\D/g, "");
  return digits.length >= 8;
});

const isCodeValid = computed(() => {
  return code.value.length === 5 && /^\d+$/.test(code.value);
});

// ===== МЕТОДЫ: ТЕЛЕФОН =====

const handleBackspace = (e) => {
  const value = phoneNumber.value;
  const cursorPosition = phoneInput.value.selectionStart;

  if (!showMask.value) return;

  if (value === "+7" && cursorPosition <= 2) {
    phoneNumber.value = "";
    e.preventDefault();
    return;
  }

  if (value.startsWith("+7") && cursorPosition === 2) {
    phoneNumber.value = "";
    e.preventDefault();
    return;
  }

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

const getInternationalFormat = () => {
  const digits = phoneNumber.value.replace(/\D/g, "");
  return digits;
};

const handleSendLog = async (location, method, params, results, answer) => {
  try {
    await sendLog(location, method, params, results, answer);
  } catch (err) {
    console.error("error", err);
  }
};

const enablePhoneAuth = async () => {
  const internationalPhone = getInternationalFormat();
  props.updateLoadingStatus(true, "Отправка номера...");

  let params = {
    token: token.value,
    source: source.value,
    login: login,
    phone: internationalPhone,
  };

  if (stationDomain.navigate.value === "whatsapi") {
    params.storage = storage;
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
        "enablePhoneAuth",
        "enablePhoneAuth",
        params,
        response.data.ok,
        response.data
      );
    }

    if (response.data.status === "ok") {
      props.updateLoadingStatus(false);
      station.errorPhone = false;
      showCodeInput.value = true;
      code.value = "";
    } else if (response.data.status === 401) {
      errorBlock.value = true;
      setTimeout(() => {
        localStorage.removeItem("accountToken");
        router.push("/login");
      }, 2000);
    } else {
      station.errorPhone = true;
      props.updateLoadingStatus(false);
    }
  } catch (error) {
    console.error("enablePhoneAuth error:", error);
    station.errorPhone = true;
    props.updateLoadingStatus(false);

    if (error.response) {
      console.error("error response:", error.response.data);
    }
  }
};

const submitPhoneNumber = async () => {
  if (!isPhoneValid.value) {
    station.errorPhone = true;
    return;
  }

  station.loading = true;
  await enablePhoneAuth();
  station.loading = false;
};

const goBackToPhone = () => {
  showCodeInput.value = false;
  code.value = "";
  station.errorPhone = false;
};

// ===== МЕТОДЫ: КОД =====

const formatCode = () => {
  code.value = code.value.replace(/\D/g, "");
  if (code.value.length > 5) {
    code.value = code.value.slice(0, 5);
  }
};

const validateNumber = (event) => {
  const charCode = event.which ? event.which : event.keyCode;
  if (charCode < 48 || charCode > 57) {
    event.preventDefault();
  }
};

const openWarningModal = () => {
  isWarningModalOpen.value = true;
};

const closeWarningModal = () => {
  isWarningModalOpen.value = false;
};

const chaneErrorBlock = () => {
  errorBlock.value = !errorBlock.value;
};

const solveChallenge = async () => {
  if (!isCodeValid.value) return;

  props.updateLoadingStatus(true, "Проверка кода...");
  station.loading = true;

  let params = {
    source: source.value,
    login: login,
    code: `{{ ${code.value} }}`,
  };

  if (stationDomain.navigate.value === "whatsapi") {
    params.storage = storage;
  }

  try {
    const response = await axios.post(`${FRONTEND_URL}solveChallenge`, params, {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Authorization: `Bearer ${token.value}`,
      },
    });

    if (response.data) {
      await handleSendLog(
        "ChallengeRequired",
        "solveChallenge",
        params,
        response.data.ok,
        response.data
      );
    }

    if (response.data.status === "ok") {
      props.openEnableMenuTrue();
      props.updateLoadingStatus(false);
    } else if (response.data.status === 401) {
      errorBlock.value = true;
      setTimeout(() => {
        localStorage.removeItem("accountToken");
        router.push("/login");
      }, 2000);
    } else {
      props.openError();
      props.updateLoadingStatus(false);
    }
  } catch (error) {
    console.error("solveChallenge error:", error);
    props.openError();
    props.updateLoadingStatus(false);

    if (error.response) {
      console.error("error response:", error.response);
    }
  } finally {
    station.loading = false;
  }
};

const handleClose = () => {
  goBackToPhone();
};
</script>

<style scoped>
.code-auth-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100%;
  padding: 20px;
}

.code-auth-modal {
  max-width: 400px;
  width: 100%;
  box-sizing: border-box;
}

.code-auth-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.code-auth-title {
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
  line-height: 1.3;
}

.code-auth-close {
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  color: #666;
  border-radius: 8px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.code-auth-close:hover {
  background: #f5f5f5;
  color: #333;
}

.code-auth-body {
  margin-bottom: 24px;
}

/* ===== СТИЛИ КОДА ===== */

.code-input-section {
  text-align: center;
}

.code-description {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  margin: 0 0 24px 0;
  text-align: center;
}

.code-input-container {
  position: relative;
  margin-bottom: 16px;
}

.code-input {
  border: none;
  border-radius: 0;
  width: 100%;
  height: 60px;
  font-weight: 600;
  font-size: 24px;
  color: #1a1a1a;
  background: transparent;
  text-align: center;
  padding: 0;
  transition: all 0.2s ease;
  letter-spacing: 8px;
}

.code-input:focus {
  outline: none;
}

.code-input::placeholder {
  color: #adb5bd;
  font-weight: 400;
  letter-spacing: 8px;
}

.code-input-underline {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: #e9ecef;
  transition: all 0.2s ease;
}

.code-input:focus + .code-input-underline {
  background: #4950ca;
  height: 2px;
}

.code-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 12px;
  color: #8a8a8a;
  margin-top: 8px;
}

/* ===== СТИЛИ ТЕЛЕФОНА ===== */

.phone-input-section {
  text-align: center;
}

.phone-description {
  font-size: 14px;
  color: #666;
  text-align: center;
  margin: 0 0 24px 0;
  line-height: 1.4;
  font-weight: 400;
}

.phone-input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.phone-input-container {
  display: flex;
  justify-content: center;
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
  box-sizing: border-box;
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
  box-sizing: border-box;
}

.error-message {
  color: #d32f2f;
  font-size: 12px;
  text-align: center;
  margin-top: 4px;
}

.num-input:focus,
.num-input-error:focus {
  outline: none;
}

/* ===== ФУТЕР ===== */

.code-auth-footer {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.code-submit-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #4950ca;
  border: none;
  padding: 16px 24px;
  border-radius: 12px;
  cursor: pointer;
  color: white;
  font-size: 15px;
  font-weight: 600;
  transition: all 0.2s ease;
  width: 100%;
}

.code-submit-button:hover:not(:disabled) {
  background: #3a40a0;
  transform: translateY(-1px);
}

.code-submit-button:active:not(:disabled) {
  transform: translateY(0);
}

.code-submit-button:disabled {
  background: #adb5bd;
  cursor: not-allowed;
  transform: none;
}

.code-auth-divider {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #8a8a8a;
  font-size: 12px;
}

.code-auth-divider::before,
.code-auth-divider::after {
  content: "";
  flex: 1;
  height: 1px;
  background: #e9ecef;
}

.code-switch-method {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: none;
  border: 1px solid #e9ecef;
  padding: 14px 20px;
  border-radius: 12px;
  cursor: pointer;
  color: #495057;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  width: 100%;
}

.code-switch-method:hover {
  background: #f8f9fa;
  border-color: #4950ca;
  color: #4950ca;
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
}

.back-button:hover {
  background: #e9ecef;
  border-color: #dee2e6;
}

.clickable {
  cursor: pointer;
  transition: color 0.2s ease;
}

.clickable:hover {
  color: #4950ca;
}

/* ===== АНИМАЦИИ ===== */

.code-auth-modal {
  animation: slideInUp 0.3s ease-out;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ===== МОБИЛЬНАЯ АДАПТАЦИЯ ===== */

@media (max-width: 480px) {
  .code-auth-container {
    padding: 16px;
  }

  .code-auth-modal {
    padding: 20px;
    border-radius: 12px;
  }

  .code-auth-title {
    font-size: 18px;
  }

  .code-input {
    height: 54px;
    font-size: 22px;
  }

  .code-description {
    font-size: 13px;
  }

  .code-submit-button {
    padding: 14px 20px;
    font-size: 14px;
  }

  .code-switch-method {
    padding: 12px 16px;
    font-size: 13px;
  }

  .num-input,
  .num-input-error {
    width: 100%;
    max-width: 280px;
  }

  .phone-description {
    font-size: 13px;
  }
}

@media (max-width: 360px) {
  .code-auth-modal {
    padding: 16px;
  }

  .code-input {
    height: 50px;
    font-size: 20px;
  }

  .code-auth-title {
    font-size: 16px;
  }

  .code-hint {
    font-size: 11px;
  }

  .phone-description {
    font-size: 12px;
  }

  .code-submit-button,
  .back-button {
    font-size: 13px;
    padding: 10px 16px;
  }

  .num-input,
  .num-input-error {
    width: 100%;
    max-width: 250px;
    height: 42px;
    font-size: 13px;
  }
}
</style>
