<template>
  <section class="login-section">
    <form>
      <h2 class="title">Авторизация</h2>
      <div class="input-cont">
        <label class="name-input" for="name">Почта</label>
        <input
          type="email"
          placeholder="name@company.com"
          id="name"
          v-model="name"
          required
        />
      </div>
      <div class="input-cont">
        <label class="name-input" for="email">Пароль</label>
        <input
          placeholder="Введите пароль"
          type="password"
          id="email"
          v-model="email"
          required
        />
        <p @click="navigateToForgot" class="forgot-password-text">
          Забыли пароль?
        </p>
      </div>
      <button class="login-account-button">Войти</button>
      <p class="create-account-button">
        Нет аккаунта? <span @click="navigateToRegister">Создать аккаунт</span>
      </p>
    </form>
  </section>
</template>

<script>
export default {
  data() {
    return {
      form: {
        login: "",
        password: "",
      },
    };
  },
  methods: {
    navigateToRegister() {
      this.$router.push("/Registration");
    },
    navigateToForgot() {
      this.$router.push("/Forgot");
    },
  },
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
  border: 0.5px solid #c1c1c1;
  border-radius: 5px;
  padding-left: 10px;
  width: 550px;
  height: 45px;
  background: #fcfcfc;
  font-weight: 400;
  font-size: 14px;
  color: #000;
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
