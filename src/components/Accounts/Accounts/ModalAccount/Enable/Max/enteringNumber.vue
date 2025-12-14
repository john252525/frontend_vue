<template>
  <div class="code-auth-container">
    <div class="code-auth-modal">
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
                :disabled="station.loading"
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
          :disabled="!isPhoneValid || station.loading"
        >
          <span>Привязать номер</span>
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

        <button @click="close" class="back-button" :disabled="station.loading">
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
  </div>
</template>

<script setup>
import { ref, reactive, computed, nextTick, toRefs } from "vue";
import axios from "axios";
import { useAccountStore } from "@/stores/accountStore";

const props = defineProps({
  close: {
    type: Function,
  },
  user: {
    type: Object,
  },
  updateLoadingStatus: {
    type: Function,
  },
  startFunc: {
    type: Function,
  },
});

const accountStore = useAccountStore();
const token = computed(() => accountStore.getAccountToken);
const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL;

const station = reactive({
  loading: false,
  errorPhone: false,
});

const { user } = toRefs(props);
const { login, source } = user.value;

const phoneNumber = ref("");
const phoneInput = ref(null);
const showMask = ref(true);
const logs = ref([]);

const isPhoneValid = computed(() => {
  const digits = phoneNumber.value.replace(/\D/g, "");
  return digits.length >= 8;
});

const addLog = (request, response, status = "pending", error = null) => {
  logs.value.push({
    request,
    response,
    status,
    error,
  });
};

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

const forceStop = async () => {
  const logIndex = logs.value.length;
  const params = {
    source: source,
    login: login,
  };

  addLog("forceStop", "Отправка запроса...");

  try {
    const response = await axios.post(`${FRONTEND_URL}forceStop`, params, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.value}`,
      },
    });

    logs.value[logIndex] = {
      ...logs.value[logIndex],
      response: JSON.stringify(response.data),
      status: response.data.status === "ok" ? "success" : "error",
    };
  } catch (error) {
    logs.value[logIndex] = {
      ...logs.value[logIndex],
      response: "Ошибка",
      status: "error",
      error: error.message,
    };
    console.error("forceStop error:", error);
  }
};

const enablePhoneAuth = async () => {
  const logIndex = logs.value.length;
  const internationalPhone = getInternationalFormat();

  const params = {
    source: source,
    login: login,
    phone: internationalPhone,
  };

  addLog("enablePhoneAuth", "Отправка запроса...");

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

    logs.value[logIndex] = {
      ...logs.value[logIndex],
      response: JSON.stringify(response.data),
      status: response.data.status === "ok" ? "success" : "error",
    };

    if (response.data.status === "ok") {
      return true;
    } else {
      station.errorPhone = true;
      return false;
    }
  } catch (error) {
    logs.value[logIndex] = {
      ...logs.value[logIndex],
      response: "Ошибка",
      status: "error",
      error: error.message,
    };
    station.errorPhone = true;
    console.error("enablePhoneAuth error:", error);
    return false;
  }
};

const getNewProxy = async () => {
  const logIndex = logs.value.length;
  const params = {
    source: source,
    login: login,
  };

  addLog("getNewProxy", "Отправка запроса...");

  try {
    const response = await axios.post(`${FRONTEND_URL}getNewProxy`, params, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.value}`,
      },
    });

    logs.value[logIndex] = {
      ...logs.value[logIndex],
      response: JSON.stringify(response.data),
      status: response.data.status === "ok" ? "success" : "error",
    };

    return response.data.status === "ok";
  } catch (error) {
    logs.value[logIndex] = {
      ...logs.value[logIndex],
      response: "Ошибка",
      status: "error",
      error: error.message,
    };
    console.error("getNewProxy error:", error);
    return false;
  }
};

const clearSession = async () => {
  const logIndex = logs.value.length;
  const params = {
    source: source,
    login: login,
  };

  addLog("clearSession", "Отправка запроса...");

  try {
    const response = await axios.post(`${FRONTEND_URL}clearSession`, params, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.value}`,
      },
    });

    logs.value[logIndex] = {
      ...logs.value[logIndex],
      response: JSON.stringify(response.data),
      status: response.data.status === "ok" ? "success" : "error",
    };

    return response.data.status === "ok";
  } catch (error) {
    logs.value[logIndex] = {
      ...logs.value[logIndex],
      response: "Ошибка",
      status: "error",
      error: error.message,
    };
    console.error("clearSession error:", error);
    return false;
  }
};

const submitPhoneNumber = async () => {
  if (!isPhoneValid.value) {
    station.errorPhone = true;
    return;
  }

  logs.value = [];
  station.loading = true;
  station.errorPhone = false;

  try {
    await forceStop();
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const phoneAuthSuccess = await enablePhoneAuth();
    if (!phoneAuthSuccess) {
      station.loading = false;
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 3. getNewProxy
    await getNewProxy();
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 4. clearSession
    await clearSession();

    await props.startFunc();
  } catch (error) {
    console.error("Error during phone binding:", error);
  } finally {
    station.loading = false;
  }
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
  animation: slideInUp 0.3s ease-out;
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

.code-auth-close:hover:not(:disabled) {
  background: #f5f5f5;
  color: #333;
}

.code-auth-close:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.code-auth-body {
  margin-bottom: 24px;
}

/* ===== ЛОГИРОВАНИЕ ===== */

.logs-section {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 20px;
  max-height: 200px;
  overflow-y: auto;
}

.logs-title {
  font-size: 12px;
  font-weight: 600;
  color: #666;
  margin-bottom: 8px;
}

.logs-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.log-item {
  background: white;
  border-left: 3px solid #e9ecef;
  padding: 8px;
  border-radius: 4px;
  font-size: 11px;
}

.log-item.success {
  border-left-color: #28a745;
  background: #f0fff4;
}

.log-item.error {
  border-left-color: #dc3545;
  background: #fff5f5;
}

.log-item.pending {
  border-left-color: #ffc107;
  background: #fffbf0;
}

.log-request {
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.log-response {
  color: #666;
  word-break: break-word;
  margin-bottom: 4px;
  max-height: 50px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.log-error {
  color: #dc3545;
  font-size: 10px;
  margin-top: 4px;
}

/* ===== ТЕЛЕФОН ===== */

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
  transition: all 0.2s ease;
}

.num-input:disabled {
  background: #f0f0f0;
  color: #999;
  cursor: not-allowed;
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
  transition: all 0.2s ease;
}

.num-input-error:disabled {
  background: #f0f0f0;
  color: #999;
  cursor: not-allowed;
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

.back-button:hover:not(:disabled) {
  background: #e9ecef;
  border-color: #dee2e6;
}

.back-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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

@media (max-width: 480px) {
  .code-auth-container {
    padding: 16px;
  }

  .code-auth-title {
    font-size: 18px;
  }

  .code-submit-button {
    padding: 14px 20px;
    font-size: 14px;
  }

  .num-input,
  .num-input-error {
    width: 100%;
    max-width: 280px;
  }

  .phone-description {
    font-size: 13px;
  }

  .logs-section {
    font-size: 10px;
  }
}

@media (max-width: 360px) {
  .code-auth-title {
    font-size: 16px;
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
