<template>
  <div class="login-by-link-page">
    <!-- Проверяем link_token из ссылки -->
    <div v-if="phase === 'loading'" class="state-card state-center">
      <div class="brand-logo">
        <img class="url-img-logo" :src="stationDomain.cosmetics.urlLogo" alt="" />
        <img v-if="stationDomain.cosmetics.additionallyLogo" class="url-img-logo-text" :src="stationDomain.cosmetics.additionallyLogo" alt="" />
        <h2 v-else class="b-logo">{{ stationDomain.cosmetics.titleLogo }}</h2>
      </div>
      <div class="spinner">
        <div class="bounce1"></div>
        <div class="bounce2"></div>
        <div class="bounce3"></div>
      </div>
      <h2 class="state-title">Проверяем ссылку...</h2>
      <p class="state-message">Это займёт пару секунд</p>
    </div>

    <!-- Ссылка недействительна/уже использована/истекла -->
    <div v-else-if="phase === 'error'" class="state-card state-center">
      <div class="brand-logo">
        <img class="url-img-logo" :src="stationDomain.cosmetics.urlLogo" alt="" />
        <img v-if="stationDomain.cosmetics.additionallyLogo" class="url-img-logo-text" :src="stationDomain.cosmetics.additionallyLogo" alt="" />
        <h2 v-else class="b-logo">{{ stationDomain.cosmetics.titleLogo }}</h2>
      </div>
      <svg xmlns="http://www.w3.org/2000/svg" width="72" height="72" viewBox="0 0 24 24" class="error-icon">
        <path
          fill="#FF3B30"
          d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
        />
      </svg>
      <h2 class="state-title error-text">Ссылка недействительна</h2>
      <p class="state-message">{{ errorMessage }}</p>
      <button class="btn error-btn" @click="goToLogin">Перейти на страницу входа</button>
    </div>

    <!-- Ссылка обменяна на токен — задаём пароль при первом входе -->
    <section v-else-if="phase === 'need-password'" class="state-card">
      <ErrorBlock v-if="showErrorBlock" :errorMessage="errorMessage" :changeIncorrectPassword="hideErrorBlock" />

      <form @submit.prevent="handleSetPassword" class="recovery-form">
        <h2 class="title" v-if="stationDomain.cosmetics.additionallyLogo">
          Добро пожаловать
          <div class="logo-cont">
            в
            <img class="url-img-logo" :src="stationDomain.cosmetics.urlLogo" alt="" />
            <img class="url-img-logo-text" :src="stationDomain.cosmetics.additionallyLogo" alt="" />
          </div>
        </h2>
        <h2 class="title" v-else>
          Добро пожаловать
          <div class="logo-cont">
            в
            <img class="url-img-logo" :src="stationDomain.cosmetics.urlLogo" alt="" />
            <h2 class="b-logo">{{ stationDomain.cosmetics.titleLogo }}</h2>
          </div>
        </h2>
        <p class="subtitle">
          Придумайте пароль для входа в личный кабинет — не менее 8 символов.
        </p>

        <div class="input-cont">
          <label class="name-input" for="password">Новый пароль</label>
          <input
            type="password"
            placeholder="Введите пароль"
            id="password"
            v-model="password"
            @input="clearErrors"
            :class="{ error: passwordError }"
            required
          />
          <div class="error-container">
            <transition name="slide-fade">
              <p v-if="passwordError" class="error-message">{{ passwordErrorMessage }}</p>
            </transition>
          </div>
        </div>

        <div class="input-cont">
          <label class="name-input" for="confirmPassword">Подтвердите пароль</label>
          <input
            type="password"
            placeholder="Повторите пароль"
            id="confirmPassword"
            v-model="confirmPassword"
            @input="clearErrors"
            :class="{ error: confirmError }"
            required
          />
          <div class="error-container">
            <transition name="slide-fade">
              <p v-if="confirmError" class="error-message">{{ confirmErrorMessage }}</p>
            </transition>
          </div>
        </div>

        <button type="submit" class="send-code-button" :disabled="isSubmitting">
          {{ isSubmitting ? "Сохранение..." : "Установить пароль и войти" }}
        </button>
      </form>
    </section>

    <!-- У аккаунта уже есть пароль — здесь его не переустановить, сессию
         намеренно не выдаём (сначала пароль, потом вход). -->
    <div v-else-if="phase === 'already-set'" class="state-card state-center">
      <div class="brand-logo">
        <img class="url-img-logo" :src="stationDomain.cosmetics.urlLogo" alt="" />
        <img v-if="stationDomain.cosmetics.additionallyLogo" class="url-img-logo-text" :src="stationDomain.cosmetics.additionallyLogo" alt="" />
        <h2 v-else class="b-logo">{{ stationDomain.cosmetics.titleLogo }}</h2>
      </div>
      <svg xmlns="http://www.w3.org/2000/svg" width="72" height="72" viewBox="0 0 24 24" class="error-icon">
        <path
          fill="#FF3B30"
          d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
        />
      </svg>
      <h2 class="state-title error-text">Пароль уже установлен</h2>
      <p class="state-message">{{ errorMessage }}</p>
      <div class="success-actions">
        <button class="btn error-btn" @click="goToLogin">Перейти на страницу входа</button>
        <button class="btn secondary-btn" @click="goToPasswordRecovery">Восстановить пароль</button>
      </div>
    </div>

    <!-- Пароль успешно установлен — только теперь сотрудник вошёл -->
    <div v-else-if="phase === 'success'" class="state-card state-center">
      <div class="brand-logo">
        <img class="url-img-logo" :src="stationDomain.cosmetics.urlLogo" alt="" />
        <img v-if="stationDomain.cosmetics.additionallyLogo" class="url-img-logo-text" :src="stationDomain.cosmetics.additionallyLogo" alt="" />
        <h2 v-else class="b-logo">{{ stationDomain.cosmetics.titleLogo }}</h2>
      </div>
      <svg xmlns="http://www.w3.org/2000/svg" width="72" height="72" viewBox="0 0 24 24" class="success-icon">
        <path
          fill="#34C759"
          d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
        />
      </svg>
      <h2 class="state-title">Готово</h2>
      <p class="state-message">Пароль установлен — теперь вы можете пользоваться личным кабинетом.</p>
      <button class="btn success-btn" @click="goToApp">Перейти в личный кабинет</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";
import ErrorBlock from "@/components/ErrorBlock/ErrorBlock.vue";
import { useAccountStore } from "@/stores/accountStore";
import { useDomain } from "@/composables/getDomain";

const FRONTEND_URL_AUTH = import.meta.env.VITE_FRONTEND_URL_AUTH;
const route = useRoute();
const router = useRouter();
const accountStore = useAccountStore();
const { stationDomain } = useDomain();

const phase = ref("loading"); // loading | error | need-password | already-set | success
const errorMessage = ref("");
// JWT/refresh_token, которые вернул loginByLink — держим только локально в
// компоненте, а не в accountStore, до успешной установки пароля. Пока
// сотрудник не задал пароль, он не считается вошедшим — accountStore
// получает токен только в момент успеха handleSetPassword ниже.
const sessionToken = ref("");
const sessionRefreshToken = ref("");

const password = ref("");
const confirmPassword = ref("");
const isSubmitting = ref(false);
const passwordError = ref(false);
const passwordErrorMessage = ref("");
const confirmError = ref(false);
const confirmErrorMessage = ref("");
const showErrorBlock = ref(false);

const hideErrorBlock = () => (showErrorBlock.value = false);
const clearErrors = () => {
  passwordError.value = false;
  confirmError.value = false;
  passwordErrorMessage.value = "";
  confirmErrorMessage.value = "";
};

const goToLogin = () => router.push("/login");
const goToApp = () => router.push("/");
const goToPasswordRecovery = () => router.push("/forgot");

const validateForm = () => {
  let isValid = true;
  if (password.value.length < 8) {
    passwordErrorMessage.value = "Пароль должен быть не менее 8 символов";
    passwordError.value = true;
    isValid = false;
  }
  if (password.value !== confirmPassword.value) {
    confirmErrorMessage.value = "Пароли не совпадают";
    confirmError.value = true;
    isValid = false;
  }
  return isValid;
};

// Обменивает одноразовый link_token из письма на JWT сотрудника.
const exchangeLinkToken = async (linkToken) => {
  try {
    const response = await axios.post(
      `${FRONTEND_URL_AUTH}loginByLink`,
      { link_token: linkToken },
      { headers: { "Content-Type": "application/json; charset=utf-8" } },
    );

    if (response.data.ok !== true) {
      phase.value = "error";
      errorMessage.value = response.data.message || "Не удалось войти по ссылке";
      return;
    }

    const data = response.data.data || {};
    // Только сохраняем токен локально для setSubuserPassword ниже — саму
    // сессию (accountStore) не трогаем, пока пароль не будет успешно задан.
    sessionToken.value = data.token;
    sessionRefreshToken.value = data.refresh_token || "";
    phase.value = "need-password";
  } catch (error) {
    phase.value = "error";
    errorMessage.value =
      error.response?.data?.message || "Ссылка недействительна или уже была использована";
  }
};

const handleSetPassword = async () => {
  clearErrors();
  if (!validateForm()) return;
  isSubmitting.value = true;
  try {
    const response = await axios.post(
      `${FRONTEND_URL_AUTH}setSubuserPassword`,
      { new_password: password.value },
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: `Bearer ${sessionToken.value}`,
        },
      },
    );

    if (response.data.ok === true) {
      // Пароль реально задан бэком только сейчас — вот теперь и только
      // теперь считаем сотрудника вошедшим.
      accountStore.setAccountToken(sessionToken.value);
      accountStore.setAccountRefreshToken(sessionRefreshToken.value);
      accountStore.setAccountStation("telegram");
      accountStore.setAccountStationText("Telegram");
      phase.value = "success";
    } else {
      showErrorBlock.value = true;
      errorMessage.value = response.data.message || "Не удалось установить пароль";
    }
  } catch (error) {
    // У этого сотрудника пароль уже был установлен раньше (например, он уже
    // проходил эту ссылку, или запись создалась через employees/add с уже
    // существующим пользователем) — бэк ОТКЛОНЯЕТ попытку задать новый через
    // этот метод. Раз пароль не задан именно сейчас — не логиним: сотрудник
    // должен сначала ввести пароль, а не просто перейти по ссылке.
    const errors = error.response?.data?.errors || [];
    const alreadySet = errors.some((e) => /already set/i.test(e));
    if (alreadySet) {
      errorMessage.value =
        "У этого аккаунта уже есть пароль. Войдите обычным способом по email и паролю, либо восстановите пароль, если не помните его.";
      phase.value = "already-set";
    } else {
      showErrorBlock.value = true;
      errorMessage.value =
        error.response?.data?.message || "Произошла ошибка при обращении к серверу";
    }
  } finally {
    isSubmitting.value = false;
  }
};

onMounted(() => {
  const linkToken = route.query.link_token;
  if (!linkToken) {
    phase.value = "error";
    errorMessage.value = "Ссылка неполная — отсутствует токен входа.";
    return;
  }
  exchangeLinkToken(linkToken);
});
</script>

<style scoped>
.login-by-link-page {
  position: relative;
  width: 100%;
  min-height: 100vh;
}

.state-card {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: var(--bg);
  width: 100%;
  max-width: 650px;
  min-height: 300px;
  padding: 60px 40px;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
  box-sizing: border-box;
  display: flex;
  justify-content: center;
}

.state-center {
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 12px;
  max-width: 420px;
}

.brand-logo {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
}

.logo-cont {
  display: flex;
  align-items: center;
  gap: 6px;
}

.url-img-logo {
  width: 40px;
}

.url-img-logo-text {
  width: 80px;
}

.b-logo {
  font-weight: 600;
  font-size: 28px;
  text-align: left;
  margin: 0;
  color: var(--text);
}

.state-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0.5rem 0 0;
  color: var(--text);
}

.error-text {
  color: #ff3b30;
}

.state-message {
  font-size: 1rem;
  color: var(--headerAccountText);
  margin: 0 0 0.5rem;
  line-height: 1.5;
}

.btn {
  padding: 0.8rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 50px;
  cursor: pointer;
  border: none;
  transition: all 0.3s ease;
}

.success-btn {
  background: #4950ca;
  color: white;
}

.success-btn:hover {
  background: #3c42a8;
}

.error-btn {
  background: #ff3b30;
  color: white;
}

.error-btn:hover {
  background: #e0352b;
}

.success-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.secondary-btn {
  background: transparent;
  color: #4950ca;
  padding: 0.5rem 1rem;
}

.secondary-btn:hover {
  text-decoration: underline;
}

.spinner {
  width: 70px;
  height: 70px;
  position: relative;
  margin: 0 auto 0.5rem;
  text-align: center;
}

.bounce1,
.bounce2,
.bounce3 {
  width: 18px;
  height: 18px;
  background-color: #4950ca;
  border-radius: 100%;
  display: inline-block;
  animation: sk-bouncedelay 1.4s infinite ease-in-out both;
}

.bounce1 {
  animation-delay: -0.32s;
}

.bounce2 {
  animation-delay: -0.16s;
  margin: 0 10px;
}

@keyframes sk-bouncedelay {
  0%,
  80%,
  100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

.recovery-form {
  width: 100%;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.title {
  font-size: 28px;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 12px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
}

.subtitle {
  font-size: 16px;
  color: var(--headerAccountText);
  text-align: center;
  margin-bottom: 32px;
  line-height: 1.4;
}

.input-cont {
  width: 100%;
  display: flex;
  flex-direction: column;
}

.name-input {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--text);
  text-align: left;
  width: 100%;
}

input {
  width: 100%;
  height: 48px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 0 16px;
  font-size: 15px;
  background: var(--input);
  color: var(--text);
  box-sizing: border-box;
}

input:focus {
  outline: none;
  border-color: #4950ca;
}

input.error {
  border-color: #d33838 !important;
  background: #fffafa !important;
}

.error-container {
  min-height: 24px;
  width: 100%;
  margin-top: 4px;
}

.error-message {
  color: #d33838;
  font-size: 12px;
  margin: 0;
}

.send-code-button {
  width: 100%;
  height: 50px;
  background: #4950ca;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 10px;
}

.send-code-button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.2s ease;
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}

@media (max-width: 650px) {
  .state-card {
    width: 95%;
    padding: 40px 20px;
  }
}
</style>
