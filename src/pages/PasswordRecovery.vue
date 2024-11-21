<template>
  <section class="password-recovery-section">
    <form>
      <h2 class="title">Востановление пароля</h2>
      <p class="subtitle">
        Введите свою электронную почту, и мы пришлем вам код для сброса вашего
        пароля!
      </p>
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
      <button class="send-сode-button">Отправить</button>
      <p class="login-account-button">
        Вспомнили пароль? <span @click="navigateToLogin"> Войти</span>
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
    navigateToLogin() {
      this.$router.push("/Login");
    },
  },
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
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.title {
  font-weight: 600;
  font-size: 28px;
  color: #000;
  margin-bottom: 24px;
}

.subtitle {
  font-weight: 400;
  font-size: 18px;
  color: #6d6d6d;
  margin-bottom: 38px;
  width: 500px;
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

.send-сode-button {
  border-radius: 5px;
  width: 565px;
  height: 44px;
  background: #4950ca;
  font-weight: 600;
  font-size: 14px;
  color: #fff;
}

.send-сode-button:hover {
  background: #595fd1;
  transition: all 0.25s;
}

.send-сode-button:active {
  background: #2f36af;
}

.login-account-button {
  font-weight: 600;
  font-size: 14px;
  color: #5e5e5e;
  text-align: left;
  margin-top: 24px;
}

.login-account-button span:hover {
  text-decoration: underline;
  cursor: pointer;
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

  .send-сode-button {
    width: 365px;
    height: 44px;
  }

  .subtitle {
    font-weight: 400;
    font-size: 16px;
    color: #6d6d6d;
    margin-bottom: 38px;
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

  .send-сode-button {
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
