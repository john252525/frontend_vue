<template>
  <ErrorBlock
    v-if="showErrorBlock"
    :errorMessage="errorMessage"
    :changeIncorrectPassword="hideErrorBlock"
  />
  <div class="cont">
    <template v-if="!passwordChanged">
      <form @submit.prevent="handleResetPassword">
        <h2 class="title">{{ t("PasswordReset.title") }}</h2>

        <div class="input-cont">
          <label class="name-input" for="password">{{
            t("PasswordReset.inputOne")
          }}</label>
          <input
            type="password"
            placeholder="••••••••••••"
            id="password"
            v-model="formData.password"
            @blur="validatePassword"
            @input="clearPasswordError"
            required
            :class="{ 'input-error': errors.password }"
          />
          <div class="error-container">
            <transition name="slide-fade">
              <span v-if="errors.password" class="error-text">{{
                errors.password
              }}</span>
            </transition>
          </div>
        </div>

        <div class="input-cont">
          <label class="name-input" for="repeatPassword">{{
            t("PasswordReset.inputTwo")
          }}</label>
          <input
            placeholder="••••••••••••"
            type="password"
            id="repeatPassword"
            v-model="formData.repeatPassword"
            @blur="validatePasswordConfirmation"
            @input="clearPasswordConfirmationError"
            required
            :class="{ 'input-error': errors.repeatPassword }"
          />
          <div class="error-container">
            <transition name="slide-fade">
              <span v-if="errors.repeatPassword" class="error-text">{{
                errors.repeatPassword
              }}</span>
            </transition>
          </div>
        </div>

        <button
          type="submit"
          class="login-account-button"
          :disabled="isLoading"
        >
          <span v-if="!isLoading">{{ t("PasswordReset.button") }}</span>
          <span v-else>{{ t("PasswordReset.loadin") }}</span>
        </button>
      </form>
    </template>

    <template v-else>
      <div class="success-container">
        <h2 class="title-changed">{{ t("PasswordReset.true") }}</h2>
        <p class="redirect-message">
          {{ t("PasswordReset.redirect") }}
          {{ countdown }}
        </p>
        <button class="login-account-button" @click="redirectToLogin">
          {{ t("PasswordReset.redirectButton") }}
        </button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";
import { useI18n } from "vue-i18n";
import ErrorBlock from "@/components/ErrorBlock/ErrorBlock.vue";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const token = ref("");
const formData = reactive({
  password: "",
  repeatPassword: "",
});

const errors = reactive({
  password: "",
  repeatPassword: "",
});

const isLoading = ref(false);
const showErrorBlock = ref(false);
const errorMessage = ref("");
const passwordChanged = ref(false);
const countdown = ref(5);
let countdownInterval = null;

onMounted(() => {
  token.value = route.query.token;
  if (!token.value) {
    showErrorBlock.value = true;
    errorMessage.value = "Неверная ссылка для сброса пароля";
  }
});

const validatePassword = () => {
  if (!formData.password) {
    errors.password = t("PasswordReset.errorOne");
    return false;
  } else if (formData.password.length < 8) {
    errors.password = t("PasswordReset.errorTwo");
    return false;
  }
  errors.password = "";
  return true;
};

const validatePasswordConfirmation = () => {
  if (!formData.repeatPassword) {
    errors.repeatPassword = t("PasswordReset.errorThree");
    return false;
  } else if (formData.password !== formData.repeatPassword) {
    errors.repeatPassword = t("PasswordReset.errorFour");
    return false;
  }
  errors.repeatPassword = "";
  return true;
};

const clearPasswordError = () => {
  if (errors.password) {
    errors.password = "";
  }
};

const clearPasswordConfirmationError = () => {
  if (errors.repeatPassword) {
    errors.repeatPassword = "";
  }
};

const hideErrorBlock = () => {
  showErrorBlock.value = false;
};

const startCountdown = () => {
  countdownInterval = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      clearInterval(countdownInterval);
      redirectToLogin();
    }
  }, 1000);
};

const redirectToLogin = () => {
  clearInterval(countdownInterval);
  router.push("/login");
};

const handleResetPassword = async () => {
  const isPasswordValid = validatePassword();
  const isPasswordConfirmed = validatePasswordConfirmation();

  if (!isPasswordValid || !isPasswordConfirmed || !token.value) {
    if (!token.value) {
      showErrorBlock.value = true;
      errorMessage.value = t("PasswordReset.errorFive");
    }
    return;
  }

  isLoading.value = true;
  showErrorBlock.value = false;

  try {
    const response = await axios.post(
      `https://bapi88.developtech.ru/api/v1/auth/resetPassword`,
      {
        token: token.value,
        new_password: formData.password,
      }
    );

    if (response.data.ok) {
      passwordChanged.value = true;
      startCountdown();
    } else {
      showErrorBlock.value = true;
      errorMessage.value = response.data.message || t("PasswordReset.errorSix");
    }
  } catch (error) {
    showErrorBlock.value = true;
    if (error.response) {
      errorMessage.value =
        error.response.data.message || t("PasswordReset.errorSeven");
    } else if (error.request) {
      errorMessage.value = t("PasswordReset.errorEight");
    } else {
      errorMessage.value = t("PasswordReset.errorNine");
    }
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.cont {
  border-radius: 10px;
  width: 685px;
  height: 500px;
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.06), 0 0 4px 0 rgba(0, 0, 0, 0.04);
  background: var(--bg);
  border: 1px solid var(--line);
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.title {
  font-weight: 600;
  font-size: 28px;
  color: var(--text);
  text-align: left;
  margin-bottom: 44px;
}

.title-changed {
  font-weight: 600;
  font-size: 28px;
  color: var(--text);
  text-align: center;
  margin-bottom: 44px;
}

.input-cont {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 14px;
  width: 550px;
}

.name-input {
  font-weight: 500;
  font-size: 16px;
  color: var(--text);
}

input {
  border-radius: 5px;
  padding-left: 10px;
  width: 100%;
  height: 45px;
  font-weight: 400;
  font-size: 14px;
  color: var(--text);
  border: 0.5px solid #c1c1c1;
  background: var(--input);
  transition: all 0.3s ease;
}

.input-error {
  border: 0.5px solid #be2424 !important;
  background: #ffeaea;
}

.login-account-button {
  border-radius: 5px;
  width: 560px;
  height: 44px;
  background: #4950ca;
  font-weight: 600;
  font-size: 14px;
  color: #fff;
  transition: all 0.25s;
  border: none;
  cursor: pointer;
}

.login-account-button:hover:not(:disabled) {
  background: #595fd1;
}

.login-account-button:active:not(:disabled) {
  background: #2f36af;
}

.login-account-button:disabled {
  background: #a0a0a0;
  cursor: not-allowed;
}

.success-container {
  text-align: center;
  padding: 20px;
}

.redirect-message {
  font-size: 16px;
  color: var(--text);
  margin-bottom: 30px;
}

.error-container {
  min-height: 24px;
  position: relative;
  overflow: hidden;
}

.error-text {
  color: #d33838;
  font-size: 14px;
  margin-top: 4px;
  position: absolute;
  width: 100%;
}

/* Анимация для появления/исчезания ошибок */
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

@media (max-width: 700px) {
  .cont {
    width: 450px;
    height: 504px;
  }

  form {
    width: 400px;
  }

  .input-cont {
    width: 350px;
  }

  input {
    width: 100%;
  }

  .login-account-button {
    width: 365px;
  }
}

@media (max-width: 450px) {
  .cont {
    width: 350px;
    height: 504px;
  }

  form {
    width: 300px;
  }

  .input-cont {
    width: 250px;
  }

  .login-account-button {
    width: 265px;
  }
}
</style>
