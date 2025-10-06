<template>
  <ErrorBlock
    v-if="inputStyle.incorrectPassword"
    :errorMessage="inputStyle.incorrectPasswordMessage"
    :changeIncorrectPassword="changeIncorrectPassword"
  />

  <div class="registration-wrapper">
    <section v-if="!sendEmail" class="registration-section">
      <div class="form-container">
        <form @submit.prevent="logAccoutn" class="registration-form">
          <div class="title-cont">
            <h2 class="title">
              Регистрация в
              <img
                class="url-img-logo"
                :src="stationDomain.cosmetics.urlLogo"
                alt=""
              />
              <span class="b-logo">{{
                stationDomain.cosmetics.titleLogo
              }}</span>
            </h2>
          </div>

          <div class="input-row">
            <div class="input-cont">
              <label class="name-input">Email</label>
              <input
                type="email"
                placeholder="name@company.com"
                v-model="formData.login"
                @blur="validateEmail"
                @input="clearEmailError"
                required
                :class="{ error: error.login }"
                class="input-reg"
              />
              <div class="error-container">
                <p v-if="error.login" class="error-message">{{ emailError }}</p>
              </div>
            </div>

            <div class="input-cont">
              <label class="name-input">Телефон</label>
              <div class="phone-input-container">
                <input
                  type="tel"
                  placeholder="7 900 000 0000"
                  v-model="formData.phone"
                  @input="handlePhoneInput"
                  required
                  class="input-reg phone-input"
                />
              </div>
            </div>
          </div>

          <div class="input-cont compact-field">
            <label class="name-input">Способы связи</label>
            <div class="messengers-cont">
              <label
                v-for="channel in availableChannels"
                :key="channel.value"
                class="messenger-label"
              >
                <input
                  type="checkbox"
                  :value="channel.value"
                  v-model="formData.contact_preferred_channels"
                  class="messenger-checkbox"
                />
                <span class="messenger-text">{{ channel.label }}</span>
              </label>
            </div>
          </div>

          <div class="input-row">
            <div class="input-cont">
              <label class="name-input">Пароль</label>
              <input
                placeholder="••••••••"
                type="password"
                v-model="formData.password"
                @blur="validatePassword"
                @input="clearPasswordError"
                :class="{ error: error.password }"
                required
                class="input-reg"
              />
              <div class="error-container">
                <p v-if="error.password" class="error-message">
                  {{ passwordError }}
                </p>
              </div>
            </div>

            <div class="input-cont">
              <label class="name-input">Подтверждение</label>
              <input
                placeholder="••••••••"
                type="password"
                v-model="formData.fogoutPassword"
                @blur="validatePasswordConfirmation"
                @input="clearPasswordConfirmationError"
                required
                :class="{ error: error.fogoutPassword }"
                class="input-reg"
              />
              <div class="error-container">
                <p v-if="error.fogoutPassword" class="error-message">
                  {{ passwordConfirmationError }}
                </p>
              </div>
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
              for="checkbox"
            >
              Принимаю
              <a
                href="https://chatserv.ru/documents"
                target="_blank"
                class="terms-link"
              >
                условия использования
              </a>
            </label>
            <div class="error-container">
              <p v-if="error.check" class="error-message">
                {{ checkboxError }}
              </p>
            </div>
          </div>

          <button type="submit" class="registration-account-button">
            Зарегистрироваться
          </button>

          <p class="login-account-button">
            Есть аккаунт? <span @click="navigateTo('/Login')">Войти</span>
          </p>
        </form>
      </div>
    </section>

    <div v-if="sendEmail" class="email-confirmation">
      <svg width="32" height="32" viewBox="0 0 32 32">
        <path
          fill="#4950ca"
          d="m7.416 3.604l4.605 4.98l-3.251 6.395l6.855-1.229l3.12 7.532L32 3.902zm-.843 10.781l1.276-1.047l-1.647.521l-.172-.24l.683-.661l-.891.359c-3.407 1.323-5.823 4.62-5.823 8.485a9.043 9.043 0 0 0 2.844 6.593A9.006 9.006 0 0 1 1.66 23.92c0-3.817 2.417-7.219 5.755-8.557l.423-1.02l-1 .437l-.281-.38zm5.818-2.625L14.522 8l12.531-2.932z"
        />
      </svg>
      <p class="text-email-sent">
        На ваш E-mail отправлено письмо для подтверждения
      </p>
    </div>
  </div>
</template>

<script setup>
import axios from "axios";
const FRONTEND_URL_AUTH = import.meta.env.VITE_FRONTEND_URL_AUTH;
import { reactive, ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import ErrorBlock from "@/components/ErrorBlock/ErrorBlock.vue";
import { useDomain } from "@/composables/getDomain";
import useFrontendLogger from "@/composables/useFrontendLogger";

const { sendLog } = useFrontendLogger();
const { stationDomain } = useDomain();
const router = useRouter();
const route = useRoute();
const sendEmail = ref(false);

const formData = reactive({
  login: "",
  phone: "",
  contact_preferred_channels: [],
  password: "",
  fogoutPassword: "",
  check: false,
});

const availableChannels = [
  { value: "call", label: "Звонок" },
  { value: "telegram", label: "Telegram" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "max", label: "Max" },
];

const emailError = ref("");
const phoneError = ref("");
const passwordError = ref("");
const passwordConfirmationError = ref("");
const checkboxError = ref("");

const inputStyle = reactive({
  incorrectPassword: false,
  incorrectPasswordMessage: "",
});

const error = reactive({
  login: false,
  phone: false,
  password: false,
  fogoutPassword: false,
  check: false,
});

const handlePhoneInput = () => {
  formData.phone = formData.phone.replace(/\D/g, "");
};

const validateEmail = () => {
  const email = formData.login.trim();
  if (!email) {
    emailError.value = "Введите email";
    error.login = true;
    return false;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    emailError.value = "Введите корректный email";
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
    passwordError.value = "Введите пароль";
    error.password = true;
    return false;
  }
  if (password.length < 8) {
    passwordError.value = "Минимум 8 символов";
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
    checkboxError.value = "Примите условия";
    error.check = true;
    return false;
  }
  checkboxError.value = "";
  error.check = false;
  return true;
};

const clearEmailError = () =>
  error.login && ((emailError.value = ""), (error.login = false));
const clearPasswordError = () =>
  error.password && ((passwordError.value = ""), (error.password = false));
const clearPasswordConfirmationError = () =>
  error.fogoutPassword &&
  ((passwordConfirmationError.value = ""), (error.fogoutPassword = false));
const changeIncorrectPassword = () => (inputStyle.incorrectPassword = false);
const navigateTo = (page) => router.push(page);

const loginAccount = async () => {
  try {
    const requestData = {
      email: formData.login,
      phone: "+7" + formData.phone,
      ref_id: route.query.ref,
      password: formData.password,
    };

    if (formData.contact_preferred_channels.length > 0) {
      requestData.contact_preferred_channels =
        formData.contact_preferred_channels;
    }

    const response = await axios.post(
      `${FRONTEND_URL_AUTH}register`,
      requestData,
      {
        headers: { "Content-Type": "application/json; charset=utf-8" },
      }
    );

    if (response.data) {
      await sendLog(
        "create_account",
        "login",
        {
          username: formData.login,
          phone: "+7" + formData.phone,
          channels: formData.contact_preferred_channels,
        },
        response.data.ok,
        response.data
      );
    }

    if (!response.data.ok) {
      inputStyle.incorrectPassword = true;
      inputStyle.incorrectPasswordMessage =
        response.data.error_message || "Ошибка";
      setTimeout(() => (inputStyle.incorrectPassword = false), 5000);
      return;
    }

    if (response.data.data.result === true) {
      sendEmail.value = true;
    }
  } catch (error) {
    inputStyle.incorrectPassword = true;
    inputStyle.incorrectPasswordMessage =
      error.response?.data?.errors?.[0] ===
      "User with this credentials already exists."
        ? "Пользователь уже существует"
        : "Ошибка";
    setTimeout(() => (inputStyle.incorrectPassword = false), 5000);
  }
};

const logAccoutn = () => {
  if (
    validateEmail() &&
    validatePassword() &&
    validatePasswordConfirmation() &&
    validateCheckbox()
  ) {
    loginAccount();
  }
};
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.registration-wrapper {
  width: 100%;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
}

.registration-section {
  border-radius: 6px;
  width: 100%;
  max-width: 440px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  background: var(--bg);
  border: 1px solid var(--line);
  margin: auto;
}

.form-container {
  width: 100%;
  padding: 20px 16px;
}

.registration-form {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.title-cont {
  margin-bottom: 12px;
  text-align: center;
}

.title {
  font-weight: 600;
  font-size: 18px;
  color: var(--text);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  flex-wrap: wrap;
}

.url-img-logo {
  width: 24px;
  height: 24px;
}

.b-logo {
  font-weight: 600;
  font-size: 18px;
}

.input-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  width: 100%;
}

.input-cont {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
}

.compact-field {
  grid-column: 1 / -1;
}

.name-input {
  font-weight: 500;
  font-size: 12px;
  color: var(--text);
}

.input-reg {
  border: 1px solid #c1c1c1;
  border-radius: 3px;
  padding: 0 8px;
  width: 100%;
  height: 34px;
  background: var(--input);
  font-size: 13px;
  color: var(--text);
  box-sizing: border-box;
}

.input-reg.error {
  border-color: #be2424;
  background: #ffeaea;
}

.phone-input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.phone-prefix {
  position: absolute;
  left: 8px;
  font-size: 13px;
  color: var(--text);
}

.error-container {
  min-height: 14px;
}

.error-message {
  font-size: 11px;
  color: #d33838;
  margin: 1px 0 0;
}

.messengers-cont {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 4px;
  margin-top: 2px;
}

.messenger-label {
  display: flex;
  align-items: center;
  gap: 3px;
  cursor: pointer;
  padding: 4px 6px;
  border: 1px solid #c1c1c1;
  border-radius: 3px;
  font-size: 11px;
  background: var(--input);
  min-height: 26px;
}

.messenger-checkbox {
  margin: 0;
  transform: scale(0.8);
}

.checkbox-cont {
  display: flex;
  align-items: flex-start;
  gap: 4px;
  margin: 4px 0;
  width: 100%;
}

.name-checkbox {
  font-size: 11px;
  color: var(--text);
  line-height: 1.2;
}

.name-checkbox.error {
  color: #d33838;
}

.terms-link {
  color: #4950ca;
  text-decoration: none;
}

.terms-link:hover {
  text-decoration: underline;
}

.registration-account-button {
  border-radius: 3px;
  width: 100%;
  height: 36px;
  background: #4950ca;
  font-weight: 600;
  font-size: 13px;
  color: #fff;
  border: none;
  cursor: pointer;
  margin-top: 4px;
}

.registration-account-button:hover {
  background: #595fd1;
}

.login-account-button {
  font-size: 12px;
  color: var(--text);
  text-align: center;
  margin-top: 8px;
}

.login-account-button span {
  color: #4950ca;
  cursor: pointer;
}

.login-account-button span:hover {
  text-decoration: underline;
}

.email-confirmation {
  border-radius: 6px;
  width: 90%;
  max-width: 360px;
  padding: 24px 16px;
  background: var(--bg);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 12px;
  text-align: center;
}

.text-email-sent {
  font-size: 14px;
  font-weight: 500;
  line-height: 1.3;
}

@media (max-width: 480px) {
  .registration-wrapper {
    padding: 4px;
  }

  .form-container {
    padding: 16px 12px;
  }

  .title {
    font-size: 16px;
  }

  .input-row {
    grid-template-columns: 1fr;
    gap: 6px;
  }

  .messengers-cont {
    grid-template-columns: repeat(2, 1fr);
  }

  .registration-account-button {
    height: 34px;
    font-size: 12px;
  }

  .input-reg {
    height: 32px;
    font-size: 12px;
  }
}

@media (max-width: 360px) {
  .form-container {
    padding: 12px 8px;
  }

  .messengers-cont {
    grid-template-columns: 1fr;
  }

  .messenger-label {
    padding: 3px 4px;
    font-size: 10px;
    min-height: 24px;
  }
}
</style>
