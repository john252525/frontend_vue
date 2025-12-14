<!-- EnteringPassword.vue -->
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
            Введите пароль для двухфакторной аутентификации
          </p>

          <div class="max-code-input-container">
            <input
              :class="[
                'max-code-input',
                { 'max-code-input-error': station.passwordError },
              ]"
              :type="isPasswordVisible ? 'text' : 'password'"
              v-model="password"
              placeholder="Введите пароль"
              @input="handlePasswordInput"
            />
            <button
              class="max-code-toggle-password"
              @click="togglePasswordVisibility"
              type="button"
              :aria-label="
                isPasswordVisible ? 'Скрыть пароль' : 'Показать пароль'
              "
            >
              <svg
                v-if="!isPasswordVisible"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
              >
                <!-- Иконка "глаз открыт" -->
                <path
                  d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <circle
                  cx="12"
                  cy="12"
                  r="3"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              <svg
                v-else
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
              >
                <!-- Иконка "глаз закрыт" -->
                <path
                  d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <line
                  x1="1"
                  y1="1"
                  x2="23"
                  y2="23"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </button>
            <div class="max-code-input-underline"></div>
          </div>

          <div v-if="station.passwordError" class="max-code-error-message">
            Пароль не верный, попробуйте еще
          </div>
        </div>
      </div>

      <div class="max-code-footer">
        <button
          @click="solveChallenge"
          class="max-code-submit-button"
          :disabled="!password || station.loading"
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
  passwordError: false,
});

const password = ref("");
const isPasswordVisible = ref(false);
const isWarningModalOpen = ref(false);

const handlePasswordInput = () => {
  station.passwordError = false;
};

const togglePasswordVisibility = () => {
  isPasswordVisible.value = !isPasswordVisible.value;
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
  if (!password.value) return;

  props.updateLoadingStatus(true, "Проверка пароля...");
  station.loading = true;
  station.passwordError = false;

  let params = {
    source: source,
    login: login,
    code: password.value,
  };

  try {
    const response = await axios.post(`${FRONTEND_URL}twoFactorAuth`, params, {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Authorization: `Bearer ${token.value}`,
      },
    });

    if (response.data.status === "ok") {
      props.openEnableMenuTrue();
      props.updateLoadingStatus(false);
    } else if (response.data.status === "error") {
      station.passwordError = true;
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
    console.error("twoFactorAuth error:", error);
    station.passwordError = true;
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
  display: flex;
  align-items: center;
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
  padding-right: 48px;
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

.max-code-toggle-password {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  color: #65676b;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s ease;
  flex-shrink: 0;
}

.max-code-toggle-password:hover {
  color: #006aff;
}

.max-code-toggle-password:focus {
  outline: none;
  color: #006aff;
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

  .max-code-toggle-password {
    right: 8px;
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

  .max-code-submit-button {
    font-size: 13px;
    padding: 10px 12px;
  }
}
</style>
