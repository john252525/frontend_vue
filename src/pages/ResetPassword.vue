<template>
  <ErrorBlock
    v-if="showErrorBlock"
    :errorMessage="errorMessage"
    :changeIncorrectPassword="hideErrorBlock"
  />

  <section v-if="!isSuccess" class="password-recovery-section">
    <form @submit.prevent="handleSubmit" class="recovery-form">
      <h2 class="title">Установка нового пароля</h2>
      <p class="subtitle">
        Пожалуйста, придумайте сложный пароль, содержащий не менее 8 символов.
      </p>

      <div class="input-cont">
        <label class="name-input" for="password">Новый пароль</label>
        <input
          type="password"
          placeholder="Введите новый пароль"
          id="password"
          v-model="password"
          @input="clearErrors"
          :class="{ error: passwordError }"
          required
        />
        <div class="error-container">
          <transition name="slide-fade">
            <p v-if="passwordError" class="error-message">
              {{ passwordErrorMessage }}
            </p>
          </transition>
        </div>
      </div>

      <div class="input-cont">
        <label class="name-input" for="confirmPassword"
          >Подтвердите пароль</label
        >
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
            <p v-if="confirmError" class="error-message">
              {{ confirmErrorMessage }}
            </p>
          </transition>
        </div>
      </div>

      <button type="submit" class="send-code-button" :disabled="isSubmitting">
        {{ isSubmitting ? "Сохранение..." : "Сохранить пароль" }}
      </button>

      <p class="login-account-button">
        Вспомнили пароль? <span @click="navigateToLogin">Войти</span>
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
    <h2 class="text-email-sent">Пароль успешно изменен!</h2>
    <button
      @click="navigateToLogin"
      class="send-code-button"
      style="width: 200px; margin-top: 0"
    >
      Войти в аккаунт
    </button>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import axios from "axios";
import ErrorBlock from "@/components/ErrorBlock/ErrorBlock.vue";

const router = useRouter();
const route = useRoute(); // Используем для получения токена из URL
const FRONTEND_URL_AUTH = import.meta.env.VITE_FRONTEND_URL_AUTH;

const password = ref("");
const confirmPassword = ref("");
const isSuccess = ref(false);
const isSubmitting = ref(false);

const passwordError = ref(false);
const passwordErrorMessage = ref("");
const confirmError = ref(false);
const confirmErrorMessage = ref("");
const showErrorBlock = ref(false);
const errorMessage = ref("");

const navigateToLogin = () => router.push("/Login");
const hideErrorBlock = () => (showErrorBlock.value = false);

const clearErrors = () => {
  passwordError.value = false;
  confirmError.value = false;
  passwordErrorMessage.value = "";
  confirmErrorMessage.value = "";
};

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

const handleSubmit = async () => {
  if (!validateForm()) return;

  // Извлекаем токен из ссылки (?token=...)
  const token = route.query.token;

  if (!token) {
    showErrorBlock.value = true;
    errorMessage.value = "Токен сброса пароля отсутствует или недействителен.";
    return;
  }

  isSubmitting.value = true;

  try {
    // Отправляем запрос согласно документации
    const response = await axios.post(
      `${FRONTEND_URL_AUTH}resetPassword`,
      {
        token: token,
        new_password: password.value, // Ключ из вашей доки
      },
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
      },
    );

    // Проверяем ответ (обычно response.data.ok или статус 200)
    if (response.status === 200 || response.data.ok === true) {
      isSuccess.value = true;
    } else {
      showErrorBlock.value = true;
      errorMessage.value =
        response.data.error_message || "Не удалось сбросить пароль";
    }
  } catch (error) {
    showErrorBlock.value = true;
    errorMessage.value =
      error.response?.data?.error_message ||
      "Произошла ошибка при обращении к серверу";
    console.error("API Error:", error);
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
.password-recovery-section {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: var(--bg);
  width: 100%;
  max-width: 650px;
  min-height: 450px;
  padding: 60px 40px;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: center;
  box-sizing: border-box;
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
}

.subtitle {
  font-size: 16px;
  color: #666;
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

.login-account-button {
  margin-top: 24px;
  font-size: 14px;
  color: var(--text);
}

.login-account-button span {
  color: #4950ca;
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
}

.cont {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  background: var(--bg);
  padding: 60px 40px;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  width: 400px;
}

.text-email-sent {
  font-size: 22px;
  color: var(--text);
  margin: 0;
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
  .password-recovery-section {
    width: 95%;
    padding: 40px 20px;
  }
}
</style>
