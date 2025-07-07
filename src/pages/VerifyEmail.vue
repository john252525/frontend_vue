<template>
  <div class="verification-container">
    <!-- Loading State -->
    <div v-if="isLoading" class="verification-state">
      <div class="spinner">
        <div class="bounce1"></div>
        <div class="bounce2"></div>
        <div class="bounce3"></div>
      </div>
      <h2 class="title">{{ t("VerifyEmail.title") }}</h2>
      <p class="message">{{ t("VerifyEmail.message") }}</p>
    </div>

    <!-- Success State -->
    <div v-else-if="!error" class="verification-state">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="80"
        height="80"
        viewBox="0 0 24 24"
        class="icon success-icon"
      >
        <path
          fill="#34C759"
          d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
        />
      </svg>
      <h2 class="title">{{ t("VerifyEmail.true") }}!</h2>
      <p class="message">
        {{ t("VerifyEmail.messageTrue") }}
      </p>
      <button class="btn success-btn" @click="redirectToApp">
        {{ t("VerifyEmail.buttonNext") }}
      </button>
    </div>

    <!-- Error State -->
    <div v-else class="verification-state">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="80"
        height="80"
        viewBox="0 0 24 24"
        class="icon error-icon"
      >
        <path
          fill="#FF3B30"
          d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
        />
      </svg>
      <h2 class="title error-text">{{ t("VerifyEmail.error") }}</h2>
      <p class="message">
        {{ errorMessage || t("VerifyEmail.errorMessage") }}
      </p>
      <button class="btn error-btn" @click="retryVerification">
        {{ t("VerifyEmail.repeat") }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import axios from "axios";

import { useI18n } from "vue-i18n";
const { t } = useI18n();

const isLoading = ref(true);
const error = ref(false);
const errorMessage = ref("");
const route = useRoute();

// Имитация проверки токена
const verifyToken = async (token) => {
  try {
    isLoading.value = true;
    error.value = false;

    const response = await axios.post(
      `https://b2288.developtech.ru/api/v1/auth/verifyEmail`,
      {
        token: token,
        withCredentials: false,
      },
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
      }
    );

    // Проверка успешного ответа
    if (response.data.ok === true) {
      error.value = false;
      isLoading.value = false;
      console.log("Email успешно подтвержден:", response.data.data.email);
      return {
        success: true,
        email: response.data.data.email,
        message: response.data.message,
      };
    } else {
      error.value = true;
      isLoading.value = false;
      console.error("Ошибка верификации:", response.data.message);
      return {
        success: false,
        message: response.data.message || t("VerifyEmail.errorOne"),
      };
    }
  } catch (err) {
    error.value = true;
    isLoading.value = false;

    if (err.response) {
      console.error("Ошибка сервера:", err.response.status, err.response.data);
      return {
        success: false,
        message:
          err.response.data.message || `Ошибка сервера: ${err.response.status}`,
      };
    } else if (err.request) {
      console.error("Нет ответа от сервера:", err.request);
      return {
        success: false,
        message: t("VerifyEmail.errorTwo"),
      };
    } else {
      // Ошибка при настройке запроса
      console.error("Ошибка настройки запроса:", err.message);
      return {
        success: false,
        message: t("VerifyEmail.errorThree"),
      };
    }
  }
};

const retryVerification = () => {
  isLoading.value = true;
  error.value = false;
  verifyToken(route.query.token);
};

const redirectToApp = () => {
  console.log("Перенаправление в приложение...");
  // window.location.href = '/app';
};

onMounted(() => {
  const token = route.query.token;
  if (token) {
    verifyToken(token);
  } else {
    error.value = true;
    errorMessage.value = t("VerifyEmail.errorFour");
    isLoading.value = false;
  }
});
</script>

<style scoped>
.verification-container {
  max-width: 420px;
  width: 100%;
  margin: 0 auto;
  padding: 2.5rem;
  background: #ffffff;
  border-radius: 14px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.verification-state {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.title {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 1.5rem 0 0.5rem;
  color: #000000;
}

.error-text {
  color: #ff3b30;
}

.message {
  font-size: 1rem;
  color: #666666;
  margin-bottom: 2rem;
  line-height: 1.5;
}

.btn {
  padding: 0.8rem 2rem;
  font-size: 1rem;
  font-weight: 500;
  border-radius: 50px;
  cursor: pointer;
  border: none;
  transition: all 0.3s ease;
}

.success-btn {
  background: #007aff;
  color: white;
  box-shadow: 0 4px 6px rgba(0, 122, 255, 0.2);
}

.success-btn:hover {
  background: #0062cc;
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 122, 255, 0.25);
}

.error-btn {
  background: #ff3b30;
  color: white;
  box-shadow: 0 4px 6px rgba(255, 59, 48, 0.2);
}

.error-btn:hover {
  background: #e0352b;
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(255, 59, 48, 0.25);
}

/* Spinner */
.spinner {
  width: 70px;
  height: 70px;
  position: relative;
  margin: 0 auto 2rem;
  text-align: center;
}

.bounce1,
.bounce2,
.bounce3 {
  width: 18px;
  height: 18px;
  background-color: #007aff;
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

/* Icons animations */
.success-icon {
  animation: bounceIn 0.6s;
}

.error-icon {
  animation: shake 0.6s;
}

@keyframes bounceIn {
  0% {
    transform: scale(0.1);
    opacity: 0;
  }
  60% {
    transform: scale(1.2);
    opacity: 1;
  }
  100% {
    transform: scale(1);
  }
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  10%,
  30%,
  50%,
  70%,
  90% {
    transform: translateX(-5px);
  }
  20%,
  40%,
  60%,
  80% {
    transform: translateX(5px);
  }
}

@media (max-width: 480px) {
  .verification-container {
    padding: 1.5rem;
    margin: 1rem;
  }

  .title {
    font-size: 1.3rem;
  }
}
</style>
