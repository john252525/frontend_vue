<template>
  <LoadingModal
    :textLoadin="'Загрузка кода'"
    :station-loading="station.loading"
  />

  <CodeWarningModal :isOpen="isWarningModalOpen" @close="closeWarningModal" />

  <div class="code-auth-container">
    <div class="code-auth-modal">
      <div class="code-auth-header">
        <h2 class="code-auth-title">Подтверждение входа</h2>
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
        <div class="code-input-section">
          <p class="code-description">
            Введите 6-значный код подтверждения, отправленный на ваш телефон
          </p>

          <div class="code-input-container">
            <input
              class="code-input"
              type="text"
              v-model="code"
              maxlength="6"
              required
              placeholder="000000"
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

        <button @click="getQr" class="code-switch-method">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M2 9V7C2 5.89543 2.89543 5 4 5H7M16 5H20C21.1046 5 22 5.89543 22 7V9M22 16V20C22 21.1046 21.1046 22 20 22H16M7 22H4C2.89543 22 2 21.1046 2 20V16"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
          Перейти к QR-коду
        </button>
      </div>
    </div>

    <ErrorBlock v-if="errorBlock" :changeIncorrectPassword="chaneErrorBlock" />
  </div>
</template>

<script setup>
import axios from "axios";
import ErrorBlock from "@/components/ErrorBlock/ErrorBlock.vue";
import CodeWarningModal from "./CodeWarningModal.vue";
import LoadingModal from "../LoadingModal.vue";

import { ref, inject, reactive, computed } from "vue";
import { useRouter } from "vue-router";
import { useAccountStore } from "@/stores/accountStore";
import useFrontendLogger from "@/composables/useFrontendLogger";

const props = defineProps({
  changeChallengeRequired: {
    type: Function,
  },
  openEnableMenuTrue: {
    type: Function,
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

import { useDomain } from "@/composables/getDomain";
const { stationDomain } = useDomain();

const { selectedItem, startFunc } = inject("accountItems");
const { source, login, storage } = selectedItem.value;

const station = reactive({
  station: undefined,
  loading: false,
  code: true,
  resultTrue: false,
});

const router = useRouter();

const code = ref("");
const errorBlock = ref(false);
const isWarningModalOpen = ref(false);

const chaneErrorBlock = () => {
  errorBlock.value = errorBlock.value;
};

const openWarningModal = () => {
  isWarningModalOpen.value = true;
};

const closeWarningModal = () => {
  isWarningModalOpen.value = false;
};

const handleSendLog = async (location, method, params, results, answer) => {
  try {
    await sendLog(location, method, params, results, answer);
  } catch (err) {
    console.error("error", err);
  }
};

const isCodeValid = computed(() => {
  return code.value.length === 6 && /^\d+$/.test(code.value);
});

// Форматирование кода
const formatCode = () => {
  // Удаляем все нецифровые символы
  code.value = code.value.replace(/\D/g, "");
  // Ограничиваем длину 6 символами
  if (code.value.length > 6) {
    code.value = code.value.slice(0, 6);
  }
};

// Валидация ввода только цифр
const validateNumber = (event) => {
  const charCode = event.which ? event.which : event.keyCode;
  if (charCode < 48 || charCode > 57) {
    event.preventDefault();
  }
};

const handleClose = () => {
  // Логика закрытия компонента
};

const solveChallenge = async () => {
  if (!isCodeValid.value) return;

  console.log("Token value:", token.value);
  console.log("Token type:", typeof token.value);

  props.updateLoadingStatus(true, "Проверка кода...");
  station.code = false;

  let params = {
    source: source,
    login: login,
  };

  if (stationDomain.navigate.value != "whatsapi") {
    params = {
      source: source,
      login: login,
      code: `{{ ${code.value} }}`,
    };
  } else {
    params = {
      source: source,
      login: login,
      storage: storage,
      code: `{{ ${code.value} }}`,
    };
  }

  try {
    console.log("Sending request with token:", token.value);

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
    } else if (response.data === 401) {
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
    console.error("Request error:", error);
    console.error("Error config:", error.config);

    if (error.response) {
      console.error("Error response:", error.response);
    }
  }
};

const disablePhoneAuth = async () => {
  try {
    console.log("Disable phone auth token:", token.value);

    const response = await axios.post(
      `${FRONTEND_URL}disablePhoneAuth`,
      {
        source: source,
        login: login,
      },
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: `Bearer ${token.value}`,
        },
      }
    );

    if (response.data.status === "ok") {
    } else {
      props.openError();
      updateLoadingStatus(false);
    }
  } catch (error) {
    console.error("Disable phone auth error:", error);

    if (error.response) {
      console.error("Error response:", error.response.data);
    }
  }
};

const getQr = async () => {
  props.updateLoadingStatus(true, "Смена статуса...");
  await disablePhoneAuth();
  await startFunc();
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

.clickable {
  cursor: pointer;
  transition: color 0.2s ease;
}

.clickable:hover {
  color: #4950ca;
}

/* Анимации */
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

/* Мобильная адаптация */
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
}
</style>
