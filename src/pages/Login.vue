<template>
  <ErrorBlock
    v-if="inputStyle.incorrectPassword"
    :errorMessage="inputStyle.incorrectPasswordMessage"
    :changeIncorrectPassword="changeIncorrectPassword"
  />
  <section class="login-section">
    <form>
      <h2 class="title" v-if="stationDomain.cosmetics.additionallyLogo">
        {{ t("login.title") }}
        <div class="logo-cont">
          в
          <img
            class="url-img-logo"
            :src="stationDomain.cosmetics.urlLogo"
            alt=""
          />
          <img
            class="url-img-logo-text"
            :src="stationDomain.cosmetics.additionallyLogo"
            alt=""
          />
        </div>
      </h2>
      <h2 class="title" v-else>
        {{ t("login.title") }}
        <div class="logo-cont">
          в
          <img
            class="url-img-logo"
            :src="stationDomain.cosmetics.urlLogo"
            alt=""
          />
          <h2 class="b-logo">{{ stationDomain.cosmetics.titleLogo }}</h2>
        </div>
      </h2>
      <div class="input-cont">
        <label class="name-input" for="name">{{ t("login.mail") }}</label>
        <input
          :style="inputStyle.login"
          type="email"
          placeholder="name@company.com"
          id="login"
          v-model="formData.login"
          @blur="validateEmail"
          @input="clearEmailError"
          required
        />
        <div class="error-container">
          <transition name="slide-fade">
            <p v-if="inputStyle.loginStation" class="error-message">
              {{ emailError }}
            </p>
          </transition>
        </div>
      </div>
      <div class="input-cont">
        <label class="name-input" for="email">{{ t("login.password") }}</label>
        <input
          :style="inputStyle.password"
          placeholder="••••••••••••"
          type="password"
          id="password"
          v-model="formData.password"
          @blur="validatePassword"
          @input="clearPasswordError"
          required
        />
        <div class="error-container">
          <transition name="slide-fade">
            <p v-if="inputStyle.passwordStation" class="error-message">
              {{ passwordError }}
            </p>
          </transition>
        </div>
        <p @click="navigateTo('/Forgot')" class="forgot-password-text">
          {{ t("login.fogoutPassword") }}
        </p>
      </div>
      <button @click="login" type="button" class="login-account-button">
        {{ t("login.button") }}
      </button>
      <p class="create-account-button">
        {{ t("login.noAccaunt") }}
        <span @click="navigateTo('/Registration')">{{
          t("login.createAccount")
        }}</span>
      </p>
    </form>
    <!-- <LoginForGoogle class="login-for-google" /> -->
  </section>
</template>

<script setup>
import { useRouter } from "vue-router";
import { ref, reactive } from "vue";
import ErrorBlock from "@/components/ErrorBlock/ErrorBlock.vue";
import { useAccountStore } from "@/stores/accountStore";
import { useI18n } from "vue-i18n";
import { useThemeStore } from "@/stores/theme";
import axios from "axios";
import LoginForGoogle from "@/components/Login/LoginForGoogle.vue";
import useFrontendLogger from "@/composables/useFrontendLogger";

import { useDomain } from "@/composables/getDomain";
const { stationDomain } = useDomain();

const { t } = useI18n();
const router = useRouter();
const accountStore = useAccountStore();
const theme = useThemeStore();
const { sendLog } = useFrontendLogger();

const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL;
const FRONTEND_URL_AUTH = import.meta.env.VITE_FRONTEND_URL_AUTH;

const formData = reactive({
  login: "",
  password: "",
});

const inputStyle = reactive({
  password: {
    border: "0.5px solid #c1c1c1",
    background: "#fcfcfc",
  },
  login: {
    border: "0.5px solid #c1c1c1",
    background: "#fcfcfc",
  },
  passwordStation: false,
  loginStation: false,
  incorrectPassword: false,
  incorrectPasswordMessage: "",
});

const emailError = ref("");
const passwordError = ref("");

if (theme.isDark) {
  inputStyle.password.background = "#1f2937";
  inputStyle.login.background = "#1f2937";
}

function errorStyleStation(input, station) {
  if (input === "login") {
    if (station === "on") {
      inputStyle.login.border = "0.5px solid #be2424";
      inputStyle.login.background = "#ffeaea";
      inputStyle.loginStation = true;
    } else if (station === "off") {
      inputStyle.login.border = "0.5px solid #c1c1c1";
      inputStyle.login.background = "#fcfcfc";
      inputStyle.loginStation = false;
    }
  } else if (input === "password") {
    if (station === "on") {
      inputStyle.password.border = "0.5px solid #be2424";
      inputStyle.password.background = "#ffeaea";
      inputStyle.passwordStation = true;
    } else if (station === "off") {
      inputStyle.password.border = "0.5px solid #c1c1c1";
      inputStyle.password.background = "#fcfcfc";
      inputStyle.passwordStation = false;
    }
  }
}

const validateEmail = () => {
  const email = formData.login.trim();
  if (!email) {
    emailError.value = "Пожалуйста, введите email";
    errorStyleStation("login", "on");
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    emailError.value = "Пожалуйста, введите корректный email";
    errorStyleStation("login", "on");
    return false;
  }

  if (email.length > 30) {
    emailError.value = "Email должен быть не длиннее 30 символов";
    errorStyleStation("login", "on");
    return false;
  }

  emailError.value = "";
  errorStyleStation("login", "off");
  return true;
};

const validatePassword = () => {
  const password = formData.password.trim();
  if (!password) {
    passwordError.value = "Пожалуйста, введите пароль";
    errorStyleStation("password", "on");
    return false;
  }

  if (password.length < 8) {
    passwordError.value = "Пароль должен содержать минимум 8 символов";
    errorStyleStation("password", "on");
    return false;
  }

  passwordError.value = "";
  errorStyleStation("password", "off");
  return true;
};

const handleSendLog = async (location, method, params, results, answer) => {
  try {
    await sendLog(location, method, params, results, answer);
  } catch (err) {
    console.error("Ошибка при парсинге JSON:", err);
  }
};

const clearEmailError = () => {
  if (inputStyle.loginStation) {
    emailError.value = "";
    errorStyleStation("login", "off");
  }
};

const clearPasswordError = () => {
  if (inputStyle.passwordStation) {
    passwordError.value = "";
    errorStyleStation("password", "off");
  }
};

const loginAccount = async () => {
  // accountStore.setAccountToken(
  //   "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJicmFuZF9zbHVnIjoidG91Y2hhcGkiLCJ1c2VyX2lkIjoiNTkiLCJlbWFpbCI6ImphdGlnbzI4NjlAY291cnNvcmEuY29tIiwiZXhwIjoxNzU0OTQ0NzE2fQ.vRy3-OkB1O3Ks1IC1Kaz1Bq-BOKEI4_Em48WplBeqr8"
  // );
  // accountStore.setAccountData("jatigo2869@coursora.com");
  // accountStore.setAccountStation("telegram");
  // accountStore.setAccountStationText("Telegram");
  // navigateTo("/");
  try {
    const response = await axios.post(`${FRONTEND_URL_AUTH}login`, {
      email: formData.login,
      password: formData.password,
      withCredentials: false,
    });

    if (response.data) {
      await handleSendLog(
        "login",
        "login",
        {
          username: formData.login,
          password: formData.password,
        },
        response.data.ok,
        response.data
      );
    }

    if (response.data.ok === true) {
      accountStore.setAccountToken("fake_token");
      // accountStore.setAccountToken(response.data.data.token);
      accountStore.setAccountData(formData.login);
      accountStore.setAccountStation("telegram");
      accountStore.setAccountRefreshToken(response.data.data.refresh_token);
      accountStore.setAccountStationText("Telegram");
      navigateTo("/");
    } else {
      inputStyle.incorrectPassword = true;
      setTimeout(() => {
        inputStyle.incorrectPassword = false;
      }, 5000);
      inputStyle.incorrectPasswordMessage = "Ошибка при авторизации";
    }
  } catch (error) {
    inputStyle.incorrectPassword = true;
    setTimeout(() => {
      inputStyle.incorrectPassword = false;
    }, 5000);
    if (error.response) {
      if (error.response.data.errors[0] === "Wrong password or login.") {
        inputStyle.incorrectPasswordMessage = "Неверный логин или пароль";
      } else if (error.response.data.errors[0] === "User not found.") {
        inputStyle.incorrectPasswordMessage = "Пользователь не найден";
      } else {
        inputStyle.incorrectPasswordMessage = "Ошибка при авторизации";
      }

      console.error("Ошибка сервера:", error.response.data);
    } else {
      inputStyle.incorrectPasswordMessage = "Ошибка сервера";
    }
  }
};

const changeIncorrectPassword = () => {
  inputStyle.incorrectPassword = !inputStyle.incorrectPassword;
};

function login() {
  const isEmailValid = validateEmail();
  const isPasswordValid = validatePassword();

  if (isEmailValid && isPasswordValid) {
    loginAccount();
  }
}

const navigateTo = (page) => {
  router.push(page);
};
</script>

<style scoped>
.login-section {
  border-radius: 10px;
  width: 685px;
  height: 504px;
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
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.b-logo {
  font-weight: 600;
  font-size: 28px;
  text-align: left;
}

.logo-cont {
  display: flex;
  align-items: center;
  gap: 6px;
}

.url-img-logo-text {
  width: 80px;
}

.url-img-logo {
  width: 40px;
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
  max-height: 50px;
  overflow: hidden;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-5px);
}

.input-cont {
  display: flex;
  flex-direction: column;
  gap: 8px;
  position: relative;
}

.name-input {
  font-weight: 500;
  font-size: 16px;
  color: var(--text);
}

input {
  border-radius: 5px;
  padding-left: 10px;
  width: 550px;
  height: 45px;
  font-weight: 400;
  font-size: 14px;
  color: #000;
}

.error-container {
  min-height: 24px; /* Фиксированная высота для контейнера ошибок */
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

.forgot-password-text {
  font-weight: 500;
  font-size: 14px;
  text-align: right;
  color: var(--text);
  margin-bottom: 10px;
  cursor: pointer;
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
}

.login-account-button:hover {
  background: #595fd1;
  transition: all 0.25s;
}

.login-account-button:active {
  background: #2f36af;
}

.create-account-button {
  font-weight: 600;
  font-size: 14px;
  color: var(--text);
  text-align: left;
  margin-top: 24px;
}

.create-account-button span:hover {
  text-decoration: underline;
  cursor: pointer;
}

@media (max-width: 700px) {
  .login-section {
    width: 450px;
    height: 504px;
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
  .logo-cont {
    display: none;
  }

  .login-section {
    width: 350px;
    height: 504px;
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
