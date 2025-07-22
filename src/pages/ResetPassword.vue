<template>
  <div class="cont">
    <template v-if="!passwordChanged">
      <form @submit.prevent="handleResetPassword">
        <h2 class="title">{{ t("PasswordReset.title") }}</h2>

        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <div class="input-cont">
          <label class="name-input" for="password">{{
            t("PasswordReset.inputOne")
          }}</label>
          <input
            type="password"
            placeholder="••••••••••••"
            id="password"
            v-model="formData.password"
            required
            :class="{ 'input-error': errors.password }"
            @input="clearError('password')"
          />
          <span v-if="errors.password" class="error-text">{{
            errors.password
          }}</span>
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
            required
            :class="{ 'input-error': errors.repeatPassword }"
            @input="clearError('repeatPassword')"
          />
          <span v-if="errors.repeatPassword" class="error-text">{{
            errors.repeatPassword
          }}</span>
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
const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL;
import { useI18n } from "vue-i18n";
const { t } = useI18n();

const route = useRoute();
const router = useRouter();
const token = ref("");

onMounted(() => {
  token.value = route.query.token;
});

const formData = reactive({
  password: "",
  repeatPassword: "",
});

const errors = reactive({
  password: "",
  repeatPassword: "",
  form: "",
});

const isLoading = ref(false);
const errorMessage = ref("");
const passwordChanged = ref(false);
const countdown = ref(5);
let countdownInterval = null;

const clearError = (field) => {
  errors[field] = "";
  errorMessage.value = "";
};

const validateForm = () => {
  let isValid = true;

  // Clear previous errors
  errors.password = "";
  errors.repeatPassword = "";
  errors.form = "";

  if (!formData.password) {
    errors.password = t("PasswordReset.errorOne");
    isValid = false;
  } else if (formData.password.length < 8) {
    errors.password = t("PasswordReset.errorTwo");
    isValid = false;
  }

  if (!formData.repeatPassword) {
    errors.repeatPassword = t("PasswordReset.errorThree");
    isValid = false;
  } else if (formData.password !== formData.repeatPassword) {
    errors.repeatPassword = t("PasswordReset.errorFour");
    isValid = false;
  }

  if (!token.value) {
    errors.form = t("PasswordReset.errorFive");
    isValid = false;
  }

  return isValid;
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
  if (!validateForm()) {
    errorMessage.value = errors.form;
    return;
  }

  isLoading.value = true;
  errorMessage.value = "";

  try {
    const response = await axios.post(
      `https://bapi88.developtech.ru/api/v1/auth/auth/resetPassword`,
      {
        token: token.value,
        password: formData.password,
      }
    );

    if (response.data.ok) {
      passwordChanged.value = true;
      startCountdown();
    } else {
      errorMessage.value = response.data.message || t("PasswordReset.errorSix");
    }
  } catch (error) {
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
  margin-bottom: 28px;
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
  color: #000;
  border: none;
  background-color: #fcfcfc;
  border: 0.5px solid #c1c1c1;
}

.input-error {
  border: 1px solid #ff3333 !important;
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
  transition: all 0.25s;
}

.login-account-button:active:not(:disabled) {
  background: #2f36af;
}

.login-account-button:disabled {
  background: #a0a0a0;
  cursor: not-allowed;
}

.error-message {
  color: #ff3333;
  margin-bottom: 20px;
  text-align: center;
  width: 100%;
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

.error-text {
  color: #ff3333;
  font-size: 14px;
  margin-top: 4px;
}

@media (max-width: 700px) {
  .cont {
    width: 450px;
    height: 504px;
  }

  form {
    width: 400px;
  }

  input {
    width: 350px;
    height: 45px;
    font-size: 14px;
  }

  .login-account-button {
    width: 365px;
    height: 44px;
    font-size: 14px;
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
  .error-message {
    font-size: 14px;
  }

  input {
    width: 250px;
    height: 35px;
    font-size: 14px;
  }

  .login-account-button {
    width: 265px;
    height: 44px;
    font-size: 14px;
  }

  .create-account-button {
    font-size: 14px;
  }
}
</style>
