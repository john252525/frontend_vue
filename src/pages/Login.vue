<template>
  <ErrorBlock
    v-if="inputStyle.incorrectPassword"
    :errorMessage="inputStyle.incorrectPasswordMessage"
    :changeIncorrectPassword="changeIncorrectPassword"
  />
  <section class="login-section">
    <form>
      <h2 class="title">{{ t("login.title") }}</h2>
      <div class="input-cont">
        <label class="name-input" for="name">{{ t("login.mail") }}</label>
        <input
          :style="inputStyle.login"
          type="email"
          placeholder="name@company.com"
          id="login"
          v-model="formData.login"
          required
        />
        <p v-if="inputStyle.loginStation" class="error-message">
          {{ t("login.errorMail") }}
        </p>
      </div>
      <div class="input-cont">
        <label class="name-input" for="email">{{ t("login.password") }}</label>
        <input
          :style="inputStyle.password"
          placeholder="••••••••••••"
          type="password"
          id="password"
          v-model="formData.password"
          required
        />
        <p v-if="inputStyle.passwordStation" class="error-message">
          {{ t("login.errorPassword") }}
        </p>
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
    <LoginForGoogle class="login-for-google" />
  </section>
</template>

<script setup>
import { useRouter } from "vue-router";
import { ref, reactive, computed } from "vue";
import ErrorBlock from "@/components/ErrorBlock/ErrorBlock.vue";
import LoginForGoogle from "@/components/Login/LoginForGoogle.vue";
import { useAccountStore } from "@/stores/accountStore";
const accountStore = useAccountStore();

import { useI18n } from "vue-i18n";
const { t } = useI18n();

import { useThemeStore } from "@/stores/theme";
const theme = useThemeStore();

import axios from "axios";
const router = useRouter();
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
  // accountStore.setAccountToken(
  //   "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ2ZW5kb3JfaWQiOiIyNDQiLCJlbWFpbCI6Iml0Lm1ha3NpbTEyM0BtYWlsLnJ1IiwiZXhwIjoxNzUxNTgzNTA1fQ.cuydzIW_u_zw4Y8pFqTj7vwYb6sI9ZNuiosaR2MZ-7g"
  // );
  // accountStore.setAccountData("it.maksim123@mail.ru");
  // accountStore.setAccountStation("telegram");
  // accountStore.setAccountStationText("Telegram");
  // navigateTo("/");

  try {
    const response = await axios.post(
      `https://b2288.developtech.ru/api/v1/auth/login`,
      {
        email: formData.login,
        password: formData.password,
        withCredentials: false,
      }
    );

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
      accountStore.setAccountToken(response.data.data.token);
      accountStore.setAccountData(formData.login);
      accountStore.setAccountStation("telegram");
      accountStore.setAccountStationText("Telegram");
      navigateTo("/");
    } else {
      console.log(false);
    }
  } catch (error) {
    inputStyle.incorrectPassword = true;
    inputStyle.incorrectPasswordMessage = response.data.error_message;
    console.error(`${response} - Ошибка`, error);

    if (error.response) {
      console.error("Ошибка сервера:", error.response.data);
    }
  }
};

const sendEmail = async () => {
  try {
    const response = await axios.post(
      `https://b2288.developtech.ru/api/v1/auth/resetPassword`,
      {
        token:
          "reset_token040e7de2983957b758951105da059313705c8f1f838ce3c5c5c8d8ce1b53b5b2",
        password: "zaqxsw",
      },
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: `Bearer reset_token040e7de2983957b758951105da059313705c8f1f838ce3c5c5c8d8ce1b53b5b2`,
        },
      }
    );

    conole.log(response.data);
    if (response.data.ok === true) {
    }
  } catch (error) {
    console.error(`${request} - Ошибка`, error);
    if (error.response) {
      console.error("Ошибка сервера:", error.response.data);
    }
  }
};

const getUUID = async () => {
  try {
    const response = await axios.post(
      `https://b2288.developtech.ru/api/v1/auth/login`,
      {
        email: "it.maksim123@mail.ru",
        password: "123123",
      },
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
      }
    );

    conole.log(response.data);
    if (response.data.ok === true) {
    }
  } catch (error) {
    console.error(`${request} - Ошибка`, error);
    if (error.response) {
      console.error("Ошибка сервера:", error.response.data);
    }
  }
};

const changeIncorrectPassword = () => {
  inputStyle.incorrectPassword = !inputStyle.incorrectPassword;
};

function login() {
  const login = formData.login;
  const password = formData.password;

  const stationAuth = reactive({
    login: false,
    password: false,
  });

  if (login.length === 0) {
    errorStyleStation("login", "on");
  } else if (login.length > 30) {
    errorStyleStation("login", "on");
  } else if (login.length < 10) {
    errorStyleStation("login", "on");
  } else if (!login.includes("@")) {
    errorStyleStation("login", "on");
  } else {
    errorStyleStation("login", "off");
    stationAuth.login = true;
  }

  if (password.length === 0) {
    errorStyleStation("password", "on");
  } else {
    errorStyleStation("password", "off");
    stationAuth.password = true;
  }

  if (stationAuth.password === true && stationAuth.login === true) {
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
  margin-bottom: 44px;
}

.input-cont {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 28px;
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

.error-message {
  font-weight: 500;
  font-size: 16px;
  color: #d33838;
}

.forgot-password-text {
  font-weight: 500;
  font-size: 14px;
  text-align: right;
  color: var(--text);
  margin-top: 10px;
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
