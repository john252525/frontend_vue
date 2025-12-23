<template>
  <ErrorBlock
    v-if="showErrorBlock"
    :errorMessage="errorMessage"
    :changeIncorrectPassword="hideErrorBlock"
  />

  <section v-if="!emailSendStation" class="password-recovery-section">
    <form @submit.prevent="sendEmail">
      <h2 class="title">{{ t("forgotPassword.title") }}</h2>
      <p class="subtitle">
        {{ t("forgotPassword.subtitle") }}
      </p>

      <div class="input-cont">
        <label class="name-input" for="email">{{
          t("forgotPassword.mail")
        }}</label>
        <input
          type="email"
          :placeholder="t('forgotPassword.placeholder')"
          id="email"
          v-model="email"
          @blur="validateEmail"
          @input="clearEmailError"
          :class="{ error: emailError }"
          required
        />
        <div class="error-container">
          <transition name="slide-fade">
            <p v-if="emailError" class="error-message">
              {{ emailErrorMessage }}
            </p>
          </transition>
        </div>
      </div>

      <button type="submit" class="send-code-button" :disabled="isSubmitting">
        {{
          isSubmitting ? t("forgotPassword.sending") : t("forgotPassword.send")
        }}
      </button>

      <p class="login-account-button">
        {{ t("forgotPassword.remember") }}
        <span @click="navigateToLogin">{{ t("forgotPassword.login") }}</span>
      </p>
    </form>
  </section>

  <div v-else class="cont">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="60"
      height="60"
      viewBox="0 0 32 32"
    >
      <path
        fill="#4950ca"
        d="m7.416 3.604l4.605 4.98l-3.251 6.395l6.855-1.229l3.12 7.532L32 3.902zm-.843 10.781l1.276-1.047l-1.647.521l-.172-.24l.683-.661l-.891.359c-3.407 1.323-5.823 4.62-5.823 8.485a9.043 9.043 0 0 0 2.844 6.593A9.006 9.006 0 0 1 1.66 23.92c0-3.817 2.417-7.219 5.755-8.557l.423-1.02l-1 .437l-.281-.38zm5.818-2.625L14.522 8l12.531-2.932z"
      />
    </svg>
    <h2 class="text-email-sent">
      {{ t("forgotPassword.emailSent") }}
    </h2>
  </div>
</template>

<script setup>
import { useI18n } from "vue-i18n";
const { t } = useI18n();
import axios from "axios";
const FRONTEND_URL_AUTH = import.meta.env.VITE_FRONTEND_URL_AUTH;
import { useRouter } from "vue-router";
import { ref } from "vue";
import ErrorBlock from "@/components/ErrorBlock/ErrorBlock.vue";

const router = useRouter();

const emailSendStation = ref(false);
const email = ref("");
const emailError = ref(false);
const emailErrorMessage = ref("");
const showErrorBlock = ref(false);
const errorMessage = ref("");
const isSubmitting = ref(false);

const navigateToLogin = () => {
  router.push("/Login");
};

const validateEmail = () => {
  const emailValue = email.value.trim();
  if (!emailValue) {
    emailErrorMessage.value = t("forgotPassword.errorEmailRequired");
    emailError.value = true;
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(emailValue)) {
    emailErrorMessage.value = t("forgotPassword.errorInvalidEmail");
    emailError.value = true;
    return false;
  }

  if (emailValue.length > 30) {
    emailErrorMessage.value = t("forgotPassword.errorEmailTooLong");
    emailError.value = true;
    return false;
  }

  emailErrorMessage.value = "";
  emailError.value = false;
  return true;
};

const clearEmailError = () => {
  if (emailError.value) {
    emailErrorMessage.value = "";
    emailError.value = false;
  }
};

const hideErrorBlock = () => {
  showErrorBlock.value = false;
};

const sendEmail = async () => {
  if (!validateEmail()) return;

  isSubmitting.value = true;

  try {
    const response = await axios.post(
      `${FRONTEND_URL_AUTH}forgotPassword`,
      {
        email: email.value,
      },
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
      }
    );

    if (response.data.ok === true) {
      emailSendStation.value = true;
    } else {
      showErrorBlock.value = true;
      errorMessage.value =
        response.data.error_message || t("forgotPassword.errorSendFailed");
    }
  } catch (error) {
    showErrorBlock.value = true;
    if (error.response) {
      errorMessage.value =
        error.response.data?.error_message ||
        t("forgotPassword.errorServerError");
      console.error("Ошибка сервера:", error.response.data);
    } else {
      errorMessage.value = t("forgotPassword.errorNetworkError");
    }
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
.password-recovery-section {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 10px;
  width: 650px;
  height: 420px;
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.06), 0 0 4px 0 rgba(0, 0, 0, 0.04);
  background: var(--bg);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.error-container {
  min-height: 24px;
  position: relative;
  overflow: hidden;
}

.error-message {
  font-weight: 500;
  font-size: 14px;
  color: #d33838;
  margin: 4px 0 0;
  position: absolute;
  width: 100%;
}

.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}

input.error {
  border: 0.5px solid #be2424 !important;
  background: #ffeaea !important;
}

.title {
  font-weight: 600;
  font-size: 28px;
  color: var(--text);
  margin-bottom: 24px;
  margin: 0;
}

.subtitle {
  font-weight: 400;
  font-size: 18px;
  color: var(--text);
  margin-bottom: 38px;
  width: 500px;
  margin-top: 0;
}

.input-cont {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 10px;
  width: 100%;
}

.name-input {
  font-weight: 500;
  font-size: 16px;
  color: var(--text);
  margin: 0;
}

input {
  border: 0.5px solid #c1c1c1;
  border-radius: 5px;
  padding-left: 10px;
  width: 550px;
  height: 45px;
  background: var(--input);
  font-weight: 400;
  font-size: 14px;
  color: var(--text);
  box-sizing: border-box;
}

input:focus {
  outline: none;
  border-color: #4950ca;
}

.text-email-sent {
  font-size: 20px;
  width: 300px;
  font-weight: 500;
  text-align: center;
  color: var(--text);
  margin: 0;
}

.cont {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 10px;
  width: 350px;
  height: 400px;
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.06), 0 0 4px 0 rgba(0, 0, 0, 0.04);
  background: var(--bg);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 40px;
}

.send-code-button {
  border-radius: 5px;
  width: 565px;
  height: 44px;
  background: #4950ca;
  font-weight: 600;
  font-size: 14px;
  color: white;
  transition: all 0.25s;
  border: none;
  cursor: pointer;
  margin: 0;
}

.send-code-button:hover:not(:disabled) {
  background: #595fd1;
}

.send-code-button:active:not(:disabled) {
  background: #2f36af;
}

.send-code-button:disabled {
  background: #a0a0a0;
  cursor: not-allowed;
}

.login-account-button {
  font-weight: 600;
  font-size: 14px;
  color: var(--text);
  text-align: center;
  margin-top: 24px;
  margin: 0;
  padding-top: 24px;
}

.login-account-button span {
  cursor: pointer;
  text-decoration: underline;
  color: #4950ca;
}

.login-account-button span:hover {
  color: #595fd1;
}

@media (max-width: 650px) {
  .password-recovery-section {
    width: 450px;
    height: 420px;
  }

  input {
    width: 350px;
    height: 45px;
  }

  .send-code-button {
    width: 365px;
    height: 44px;
  }

  .subtitle {
    font-size: 16px;
    width: 350px;
  }
}

@media (max-width: 450px) {
  .password-recovery-section {
    width: 350px;
    height: 420px;
  }

  input {
    width: 250px;
    height: 45px;
  }

  .send-code-button {
    width: 265px;
    height: 44px;
  }

  .title {
    font-size: 20px;
  }

  .subtitle {
    font-size: 14px;
    width: 250px;
  }
}
</style>
