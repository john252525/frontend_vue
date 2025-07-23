<template>
  <section v-if="!emailSendStation" class="password-recovery-section">
    <form>
      <h2 class="title">{{ t("fogoutPassword.title") }}</h2>
      <p class="subtitle">
        {{ t("fogoutPassword.subtitle") }}
      </p>
      <div class="input-cont">
        <label class="name-input" for="name">{{
          t("fogoutPassword.mail")
        }}</label>
        <input
          type="email"
          placeholder="name@company.com"
          id="name"
          v-model="email"
          required
        />
      </div>
      <button @click="sendEmail" class="send-сode-button">
        {{ t("fogoutPassword.send") }}
      </button>
      <p class="login-account-button">
        {{ t("fogoutPassword.pas") }}
        <span @click="navigateToLogin"> {{ t("fogoutPassword.login") }}</span>
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
      На ваш E-mail отправлено письмо, перейдите по ссылке, чтобы изменить
      пароль
    </h2>
  </div>
</template>

<script setup>
import { useI18n } from "vue-i18n";
const { t } = useI18n();
import axios from "axios";
const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL;
import { useRoute, useRouter } from "vue-router";
const route = useRoute();
const router = useRouter();
import { ref } from "vue";

const emailSendStation = ref(false);
const email = ref("");

const navigateToLogin = (page) => {
  router.push("/Login");
};

const sendEmail = async () => {
  emailSendStation.value = true;
  try {
    const response = await axios.post(
      `https://bapi88.developtech.ru/api/v1/auth/forgotPassword`,
      {
        email: email.value,
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
</script>

<!-- <script>
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
</script> -->

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

.title {
  font-weight: 600;
  font-size: 28px;
  color: var(--text);
  margin-bottom: 24px;
}

.subtitle {
  font-weight: 400;
  font-size: 18px;
  color: var(--text);
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
  color: var(--text);
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
}

.text-email-sent {
  /* text-align: center; */
  font-size: 20px;
  width: 300px;
  font-weight: 500;
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

.send-сode-button {
  border-radius: 5px;
  width: 565px;
  height: 44px;
  background: #4950ca;
  font-weight: 600;
  font-size: 14px;
  color: white;
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
  color: var(--text);
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
