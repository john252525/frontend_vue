<template>
  <LoadingModal
    :textLoadin="'Загрузка кода'"
    :station-loading="station.loading"
  />

  <CodeWarningModal :isOpen="isWarningModalOpen" @close="closeWarningModal" />

  <div class="code-auth-container">
    <!-- ВВОД КОДА -->
    <div class="code-auth-modal">
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

        <button @click="handleClose" class="back-button">
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

    <ErrorBlock v-if="errorBlock" :changeIncorrectPassword="chaneErrorBlock" />
  </div>
</template>

<script setup>
import { ref, inject, reactive, computed } from "vue";
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

const { selectedItem } = inject("accountItems");
const { source: injectedSource, login, storage } = selectedItem.value;

// Используем source из props или inject
const source = computed(() => props.source || injectedSource);

// ===== СОСТОЯНИЕ =====
const station = reactive({
  loading: false,
});

const errorBlock = ref(false);
const isWarningModalOpen = ref(false);

// ===== КОД =====
const code = ref("");

// ===== COMPUTED =====
const isCodeValid = computed(() => {
  return code.value.length === 5 && /^\d+$/.test(code.value);
});

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

const handleSendLog = async (location, method, params, results, answer) => {
  try {
    await sendLog(location, method, params, results, answer);
  } catch (err) {
    console.error("error", err);
  }
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
  props.close();
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

  .back-button {
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

  .code-submit-button,
  .back-button {
    font-size: 13px;
    padding: 10px 16px;
  }
}
</style>
