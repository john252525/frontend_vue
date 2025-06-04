<template>
  <section class="registration-section">
    <form>
      <h2 class="title">{{ t("registration.title") }}</h2>
      <div class="input-cont">
        <label class="name-input" for="name">{{
          t("registration.mail")
        }}</label>
        <input
          type="email"
          placeholder="name@company.com"
          id="name"
          v-model="formData.login"
          required
          :class="{ error: error.login }"
          class="input-reg"
        />
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
          :class="{ error: error.password }"
          required
          class="input-reg"
        />
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
          required
          :class="{ error: error.fogoutPassword }"
          class="input-reg"
        />
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
          >{{ t("registration.checkbox") }}</label
        >
      </div>
      <button @click="logAccoutn" class="registration-account-button">
        {{ t("registration.button") }}
      </button>
      <p class="login-account-button">
        {{ t("registration.haveAccount") }}
        <span @click="navigateTo('/Login')">{{ t("registration.login") }}</span>
      </p>
    </form>
    <LoginForGoogle class="login-for-google" />
  </section>
</template>

<script setup>
import axios from "axios";
import { reactive } from "vue";
import { useRouter } from "vue-router";
import LoginForGoogle from "@/components/Login/LoginForGoogle.vue";
import { useAccountStore } from "@/stores/accountStore";
const accountStore = useAccountStore();
import { useI18n } from "vue-i18n";
const { t } = useI18n();
const router = useRouter();
const formData = reactive({
  login: "",
  password: "",
  fogoutPassword: "",
  check: false,
});

const error = reactive({
  login: false,
  password: false,
  fogoutPassword: false,
  check: false,
});

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
    // Optionally, update the error message ref
  }
};

const createUser = async () => {
  try {
    const response = await axios.post(
      "http://localhost:3000/createUser",
      {
        userName: formData.login,
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accountToken")}`,
        },
      }
    );
    if (response.data) {
      await handleSendLog(
        "create_account",
        "createUser",
        { userName: formData.login },
        response.data,
        response.data
      );
    }
    console.log(response.data);
  } catch (error) {
    console.error("Ошибка при создании платежа:", error);
  }
};

const loginAccount = async () => {
  try {
    const response = await axios.post(
      `https://b2288.apitter.com/login`,
      {
        username: formData.login,
        password: formData.password,
      },
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: "Bearer 342b63fd-6017-446f-adf8-d1b8e0b7bfc6",
        },
      }
    );

    if (response.data) {
      await handleSendLog(
        "create_account",
        "login",
        { sername: formData.login, password: formData.password },
        response.data.ok,
        response.data
      );
    }

    if (response.data.ok === true) {
      accountStore.setAccountToken(response.data.token);
      accountStore.setAccountData(formData.login);
      accountStore.setAccountStation("telegram");
      accountStore.setAccountStationText("Telegram");
      await createUser();
      console.log(response.data);
      navigateTo("/accounts");
    }
  } catch (error) {
    console.error(`${request} - Ошибка`, error);
    if (error.response) {
      console.error("Ошибка сервера:", error.response.data);
    }
  }
};

const logAccoutn = () => {
  if (!formData.login) {
    error.login = true;
  } else {
    error.login = false;
  }

  if (!formData.password) {
    error.password = true;
  } else {
    error.password = false;
  }

  if (formData.password != formData.fogoutPassword) {
    error.fogoutPassword = true;
  } else {
    error.fogoutPassword = false;
  }

  if (!formData.check) {
    error.check = true;
  } else {
    error.check = false;
  }

  if (
    formData.password === formData.fogoutPassword &&
    formData.password &&
    formData.login &&
    formData.check
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

.error-mes {
  color: rgb(233, 86, 86);
  margin-bottom: -8px;
}

.checkbox-cont {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 18px;
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

.input-reg.error {
  border: 0.5px solid #be2424;
  height: 45px;
  background: #ffeaea;
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
