<template>
  <section class="login-section">
    <form>
      <h2 class="title">Авторизация</h2>
      <div class="input-cont">
        <label class="name-input" for="name">Почта</label>
        <input
          :style="inputStyle.login"
          type="email"
          placeholder="name@company.com"
          id="login"
          v-model="formData.login"
          required
        />
        <p v-if="inputStyle.loginStation" class="error-message">
          Введите корректный E-mail
        </p>
      </div>
      <div class="input-cont">
        <label class="name-input" for="email">Пароль</label>
        <input
          :style="inputStyle.password"
          placeholder="Введите пароль"
          type="password"
          id="password"
          v-model="formData.password"
          required
        />
        <p v-if="inputStyle.passwordStation" class="error-message">
          Введите корректный Пароль
        </p>
        <p @click="navigateTo('/Forgot')" class="forgot-password-text">
          Забыли пароль?
        </p>
      </div>
      <button @click="login" class="login-account-button">Войти</button>
      <p class="create-account-button">
        Нет аккаунта?
        <span @click="navigateTo('/Registration')">Создать аккаунт</span>
      </p>
    </form>
  </section>
</template>

<script setup>
import { useRouter } from "vue-router";
import { ref, reactive } from "vue";

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
});

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
  } else if (password.length > 20) {
    errorStyleStation("password", "on");
  } else if (password.length < 8) {
    errorStyleStation("password", "on");
  } else {
    errorStyleStation("password", "off");
    stationAuth.password = true;
  }

  if (stationAuth.password === true && stationAuth.login === true) {
    console.log("авторизация");
  }
}

const navigateTo = (page) => {
  const router = useRouter();
  router.push(page);
};
</script>

<style scoped>
.login-section {
  border-radius: 10px;
  width: 685px;
  height: 504px;
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.06), 0 0 4px 0 rgba(0, 0, 0, 0.04);
  background: #fff;
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
  color: #000;
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
  color: #000;
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
  color: #5e5e5e;
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
  color: #5e5e5e;
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
