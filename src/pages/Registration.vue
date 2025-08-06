<template>
  <ErrorBlock
    v-if="inputStyle.incorrectPassword"
    :errorMessage="inputStyle.incorrectPasswordMessage"
    :changeIncorrectPassword="changeIncorrectPassword"
  />
  <section v-if="!sendEmail" class="registration-section">
    <form @submit.prevent="logAccoutn">
      <div class="title-cont">
        <h2 class="title">{{ t("registration.title") }}</h2>
      </div>

      <div class="input-cont">
        <label class="name-input" for="name">{{
          t("registration.mail")
        }}</label>
        <input
          type="email"
          placeholder="name@company.com"
          id="name"
          v-model="formData.login"
          @blur="validateEmail"
          @input="clearEmailError"
          required
          :class="{ error: error.login }"
          class="input-reg"
        />
        <div class="error-container">
          <transition name="slide-fade">
            <p v-if="error.login" class="error-message">
              {{ emailError }}
            </p>
          </transition>
        </div>
      </div>

      <div class="input-cont">
        <label class="name-input" for="email">{{
          t("registration.password")
        }}</label>
        <input
          placeholder="••••••••••••"
          type="password"
          id="email"
          v-model="formData.password"
          @blur="validatePassword"
          @input="clearPasswordError"
          :class="{ error: error.password }"
          required
          class="input-reg"
        />
        <div class="error-container">
          <transition name="slide-fade">
            <p v-if="error.password" class="error-message">
              {{ passwordError }}
            </p>
          </transition>
        </div>
      </div>

      <div class="input-cont">
        <label class="name-input" for="email">{{
          t("registration.passwordTwo")
        }}</label>
        <input
          placeholder="••••••••••••"
          type="password"
          id="email"
          v-model="formData.fogoutPassword"
          @blur="validatePasswordConfirmation"
          @input="clearPasswordConfirmationError"
          required
          :class="{ error: error.fogoutPassword }"
          class="input-reg"
        />
        <div class="error-container">
          <transition name="slide-fade">
            <p v-if="error.fogoutPassword" class="error-message">
              {{ passwordConfirmationError }}
            </p>
          </transition>
        </div>
      </div>

      <div class="checkbox-cont">
        <input
          type="checkbox"
          id="checkbox"
          v-model="formData.check"
          required
        />
        <label
          class="name-checkbox"
          :class="{ error: error.check }"
          for="email"
        >
          {{ t("registration.checkbox") }}
        </label>
        <div class="error-container">
          <transition name="slide-fade">
            <p v-if="error.check" class="error-message">
              {{ checkboxError }}
            </p>
          </transition>
        </div>
      </div>

      <button type="submit" class="registration-account-button">
        {{ t("registration.button") }}
      </button>

      <p class="login-account-button">
        {{ t("registration.haveAccount") }}
        <span @click="navigateTo('/Login')">{{ t("registration.login") }}</span>
      </p>
    </form>
  </section>

  <div v-if="sendEmail" class="cont">
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
      На ваш E-mail отправлено письмо, перейдите по ссылке, чтобы подтвердить
      почту
    </h2>
  </div>
</template>

<script setup>
import axios from "axios";
const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL;
import { reactive, ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import LoginForGoogle from "@/components/Login/LoginForGoogle.vue";
import { useAccountStore } from "@/stores/accountStore";
import { useStationLoading } from "@/composables/useStationLoading";
import ErrorBlock from "@/components/ErrorBlock/ErrorBlock.vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const sendEmail = ref(false);
const { setLoadingStatus } = useStationLoading();
const accountStore = useAccountStore();

const formData = reactive({
  login: "",
  password: "",
  fogoutPassword: "",
  check: false,
});

// Error messages
const emailError = ref("");
const passwordError = ref("");
const passwordConfirmationError = ref("");
const checkboxError = ref("");

const inputStyle = reactive({
  incorrectPassword: false,
  incorrectPasswordMessage: "",
});

const error = reactive({
  login: false,
  password: false,
  fogoutPassword: false,
  check: false,
});

// Validation functions
const validateEmail = () => {
  const email = formData.login.trim();
  if (!email) {
    emailError.value = "Пожалуйста, введите email";
    error.login = true;
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    emailError.value = "Пожалуйста, введите корректный email";
    error.login = true;
    return false;
  }

  if (email.length > 30) {
    emailError.value = "Email должен быть не длиннее 30 символов";
    error.login = true;
    return false;
  }

  emailError.value = "";
  error.login = false;
  return true;
};

const validatePassword = () => {
  const password = formData.password.trim();
  if (!password) {
    passwordError.value = "Пожалуйста, введите пароль";
    error.password = true;
    return false;
  }

  if (password.length < 8) {
    passwordError.value = "Пароль должен содержать минимум 8 символов";
    error.password = true;
    return false;
  }

  passwordError.value = "";
  error.password = false;
  return true;
};

const validatePasswordConfirmation = () => {
  if (formData.password !== formData.fogoutPassword) {
    passwordConfirmationError.value = "Пароли не совпадают";
    error.fogoutPassword = true;
    return false;
  }

  passwordConfirmationError.value = "";
  error.fogoutPassword = false;
  return true;
};

const validateCheckbox = () => {
  if (!formData.check) {
    checkboxError.value = "Необходимо принять условия";
    error.check = true;
    return false;
  }

  checkboxError.value = "";
  error.check = false;
  return true;
};

// Clear error functions
const clearEmailError = () => {
  if (error.login) {
    emailError.value = "";
    error.login = false;
  }
};

const clearPasswordError = () => {
  if (error.password) {
    passwordError.value = "";
    error.password = false;
  }
};

const clearPasswordConfirmationError = () => {
  if (error.fogoutPassword) {
    passwordConfirmationError.value = "";
    error.fogoutPassword = false;
  }
};

const changeIncorrectPassword = () => {
  inputStyle.incorrectPassword = false;
};

const navigateTo = (page) => {
  router.push(page);
};

import useFrontendLogger from "@/composables/useFrontendLogger";
const { sendLog } = useFrontendLogger();

const handleSendLog = async (location, method, params, results, answer) => {
  try {
    await sendLog(location, method, params, results, answer);
  } catch (err) {
    console.error("Ошибка при парсинге JSON:", err);
  }
};

const loginAccount = async () => {
  try {
    const response = await axios.post(
      `https://bapi88.developtech.ru/api/v1/auth/register`,
      {
        email: formData.login,
        password: formData.password,
        type: "frontend_vue",
      },
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
      }
    );

    if (response.data) {
      await handleSendLog(
        "create_account",
        "login",
        { username: formData.login, password: formData.password },
        response.data.ok,
        response.data
      );
    }

    if (response.data.ok != true) {
      inputStyle.incorrectPassword = true;
      inputStyle.incorrectPasswordMessage =
        response.data.error_message || "Ошибка регистрации";
      return;
    }

    if (response.data.data.result === true) {
      sendEmail.value = true;
      loginRefAccount();
    }
  } catch (error) {
    inputStyle.incorrectPassword = true;
    if (error.response) {
      inputStyle.incorrectPasswordMessage = error.response.data?.errors[0];
      console.error("Ошибка сервера:", error.response.data);
    } else {
      inputStyle.incorrectPasswordMessage = "Сетевая ошибка";
    }
  }
};

const loginRefAccount = async () => {
  if (!route.query.ref) return;

  try {
    const response = await axios.post(
      `https://bapi88.developtech.ru/api/v1/users/addReferral`,
      {
        email: formData.login,
        ref_id: route.query.ref,
      },
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
      }
    );

    if (response.data.ok != true) {
      console.error("Ошибка при добавлении реферала");
    }
  } catch (error) {
    console.error("Ошибка при добавлении реферала:", error);
  }
};

const logAccoutn = () => {
  const isEmailValid = validateEmail();
  const isPasswordValid = validatePassword();
  const isPasswordConfirmed = validatePasswordConfirmation();
  const isCheckboxChecked = validateCheckbox();

  if (
    isEmailValid &&
    isPasswordValid &&
    isPasswordConfirmed &&
    isCheckboxChecked
  ) {
    loginAccount();
  }
};
</script>

<style scoped>
.registration-section {
  border-radius: 10px;
  width: 685px;
  height: 600px;
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

.input-reg.error {
  border: 0.5px solid #be2424;
  background: #ffeaea;
}

/* Остальные стили остаются без изменений */
.login-for-google {
  position: absolute;
  top: 108%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.title {
  font-weight: 600;
  font-size: 28px;
  color: var(--text);
  text-align: left;
}

.input-cont {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.checkbox-cont {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 18px;
  position: relative;
}

.name-input {
  font-weight: 500;
  font-size: 16px;
  color: var(--text);
}

.name-checkbox {
  font-weight: 500;
  font-size: 16px;
  color: var(--text);
}

.name-checkbox.error {
  color: rgb(247, 150, 150);
  font-weight: 400;
}

.input-reg {
  border: 0.5px solid #c1c1c1;
  border-radius: 5px;
  padding-left: 10px;
  width: 550px;
  height: 45px;
  background: var(--input);
  font-weight: 400;
  font-size: 14px;
  color: var(--text);
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

.text-email-sent {
  font-size: 20px;
  width: 300px;
  font-weight: 500;
  text-align: center;
}

.title-cont {
  margin-bottom: 44px;
  display: flex;
  align-items: flex-end;
  gap: 6px;
}

.registration-account-button {
  border-radius: 5px;
  width: 560px;
  height: 44px;
  background: #4950ca;
  font-weight: 600;
  font-size: 14px;
  color: #fff;
  transition: all 0.25s;
}

.registration-account-button:hover {
  background: #595fd1;
  transition: all 0.25s;
}

.registration-account-button:active {
  background: #2f36af;
}

.login-account-button {
  font-weight: 600;
  font-size: 14px;
  color: var(--text);
  text-align: left;
  margin-top: 24px;
}

.login-account-button span:hover {
  text-decoration: underline;
  cursor: pointer;
}

@media (max-width: 700px) {
  .registration-section {
    width: 450px;
    height: 570px;
  }

  .input-reg {
    width: 350px;
    height: 45px;
    font-size: 14px;
  }

  .registration-account-button {
    width: 365px;
    height: 44px;
    font-size: 14px;
  }
}

@media (max-width: 450px) {
  .registration-section {
    width: 350px;
    height: 550px;
  }

  .input-reg {
    width: 250px;
    height: 35px;
    font-size: 14px;
  }

  .registration-account-button {
    width: 265px;
    height: 44px;
    font-size: 14px;
  }

  .name-checkbox {
    font-weight: 500;
    font-size: 12px;
    color: #5e5e5e;
  }
}
</style>
