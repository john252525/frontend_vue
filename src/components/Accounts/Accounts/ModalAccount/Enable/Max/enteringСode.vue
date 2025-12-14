<!-- Второй компонент - EnteringNumber.vue -->
<template>
  <CodeWarningModal :isOpen="isWarningModalOpen" @close="closeWarningModal" />

  <div class="max-code-container">
    <div class="max-code-modal">
      <div class="max-code-header">
        <h2 class="max-code-title">Подтверждение входа</h2>
        <button class="max-code-close" @click="close">
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

      <div class="max-code-body">
        <div class="max-code-input-section">
          <p class="max-code-description">
            Введите код подтверждения, отправленный на ваш телефон
          </p>

          <div class="max-code-input-container">
            <input
              :class="[
                'max-code-input',
                { 'max-code-input-error': station.codeError },
              ]"
              type="text"
              v-model="code"
              placeholder="Введите код"
              @input="handleCodeInput"
            />
            <div class="max-code-input-underline"></div>
          </div>

          <div v-if="station.codeError" class="max-code-error-message">
            Код не верный, попробуйте еще
          </div>

          <div class="max-code-hint clickable" @click="openWarningModal">
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

      <div class="max-code-footer">
        <button
          @click="solveChallenge"
          class="max-code-submit-button"
          :disabled="!code || station.loading"
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
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, toRefs } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";
import { useAccountStore } from "@/stores/accountStore";
import useFrontendLogger from "@/composables/useFrontendLogger";
import { useDomain } from "@/composables/getDomain";

import CodeWarningModal from "../ChallengeRequired/CodeWarningModal.vue";

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
  openError: {
    type: Function,
  },
  changeStatus: {
    type: Function,
  },
  openEnableMenuTrue: {
    type: Function,
  },
});

const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL;
const { sendLog } = useFrontendLogger();

const accountStore = useAccountStore();
const token = computed(() => accountStore.getAccountToken);
const { stationDomain } = useDomain();
const router = useRouter();

const { user } = toRefs(props);
const { login, source } = user.value;

const station = reactive({
  loading: false,
  codeError: false,
});

const code = ref("");
const isWarningModalOpen = ref(false);

const handleCodeInput = () => {
  station.codeError = false;
  code.value = code.value;
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

const solveChallenge = async () => {
  if (!code.value) return;

  props.updateLoadingStatus(true, "Проверка кода...");
  station.loading = true;
  station.codeError = false;

  let params = {
    source: source,
    login: login,
    code: `{{ ${code.value} }}`,
  };

  try {
    const response = await axios.post(`${FRONTEND_URL}solveChallenge`, params, {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Authorization: `Bearer ${token.value}`,
      },
    });

    if (response.data.status === "ok") {
      props.openEnableMenuTrue();
      props.updateLoadingStatus(false);
    } else if (response.data.status === "error") {
      if ((response.data.error.message = "Two factor auth")) {
        props.changeStatus();
        props.updateLoadingStatus(false);
        return;
      }
      station.codeError = true;
      props.updateLoadingStatus(false);
    } else if (response.data.status === 401) {
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
    station.codeError = true;
    props.updateLoadingStatus(false);

    if (error.response) {
      console.error("error response:", error.response);
    }
  } finally {
    station.loading = false;
  }
};
</script>

<style scoped>
.max-code-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100%;
}

.max-code-modal {
  max-width: 400px;
  width: 100%;
  box-sizing: border-box;
  background: #ffffff;
  border-radius: 8px;
  animation: slideInUp 0.3s ease-out;
}

.max-code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.max-code-title {
  font-size: 20px;
  font-weight: 600;
  color: #000;
  margin: 0;
  line-height: 1.3;
}

.max-code-close {
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  color: #000;
  border-radius: 50%;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 36px;
  height: 36px;
}

.max-code-close:hover {
  background: #f0f2f5;
  color: #000;
}

.max-code-body {
  margin-bottom: 24px;
}

.max-code-input-section {
  text-align: center;
}

.max-code-description {
  font-size: 14px;
  color: #65676b;
  line-height: 1.5;
  margin: 0 0 24px 0;
  text-align: center;
}

.max-code-input-container {
  position: relative;
  margin-bottom: 8px;
}

.max-code-input {
  border: none;
  border-radius: 8px;
  width: 100%;
  height: 48px;
  font-weight: 500;
  font-size: 16px;
  color: #000;
  background: #f0f2f5;
  text-align: center;
  padding: 0 12px;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.max-code-input:focus {
  outline: none;
  background: #fff;
  box-shadow: 0 0 0 2px #006aff;
}

.max-code-input.max-code-input-error {
  background: #ffeaea;
  box-shadow: 0 0 0 2px #d32f2f;
}

.max-code-input.max-code-input-error:focus {
  box-shadow: 0 0 0 2px #d32f2f;
}

.max-code-input::placeholder {
  color: #65676b;
  font-weight: 400;
}

.max-code-input-underline {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: transparent;
  transition: all 0.2s ease;
}

.max-code-input:focus + .max-code-input-underline {
  background: #006aff;
  height: 2px;
}

.max-code-error-message {
  color: #d32f2f;
  font-size: 12px;
  text-align: center;
  margin-bottom: 12px;
  margin-top: 4px;
}

.max-code-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 13px;
  color: #006aff;
  margin-top: 12px;
}

.max-code-hint svg {
  color: #006aff;
}

.max-code-footer {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.max-code-submit-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #006aff;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  cursor: pointer;
  color: white;
  font-size: 15px;
  font-weight: 600;
  transition: background-color 0.2s ease;
  width: 100%;
}

.max-code-submit-button:hover:not(:disabled) {
  background: #0052cc;
}

.max-code-submit-button:active:not(:disabled) {
  background: #003d99;
}

.max-code-submit-button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.max-code-divider {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #65676b;
  font-size: 12px;
}

.max-code-divider::before,
.max-code-divider::after {
  content: "";
  flex: 1;
  height: 1px;
  background: #ccc;
}

.max-code-switch-method {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: none;
  border: 1px solid #ccc;
  padding: 12px 20px;
  border-radius: 8px;
  cursor: pointer;
  color: #006aff;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  width: 100%;
}

.max-code-switch-method:hover {
  background: #f0f2f5;
  border-color: #006aff;
}

.clickable {
  cursor: pointer;
  transition: color 0.2s ease;
}

.clickable:hover {
  color: #0052cc;
}

/* ===== АНИМАЦИИ ===== */

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
  .max-code-container {
    padding: 16px;
  }

  .max-code-modal {
    padding: 16px;
    border-radius: 12px;
  }

  .max-code-title {
    font-size: 18px;
  }

  .max-code-input {
    height: 44px;
    font-size: 15px;
  }

  .max-code-description {
    font-size: 13px;
  }

  .max-code-submit-button {
    padding: 12px 16px;
    font-size: 14px;
  }

  .max-code-switch-method {
    padding: 10px 16px;
    font-size: 13px;
  }
}

@media (max-width: 360px) {
  .max-code-modal {
    padding: 12px;
  }

  .max-code-input {
    height: 40px;
    font-size: 14px;
  }

  .max-code-title {
    font-size: 16px;
  }

  .max-code-hint {
    font-size: 11px;
  }

  .max-code-description {
    font-size: 12px;
  }

  .max-code-submit-button,
  .max-code-switch-method {
    font-size: 13px;
    padding: 10px 12px;
  }
}
</style>
