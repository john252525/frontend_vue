<template>
  <div>
    <!-- Кастомный контейнер для кнопки -->
    <div class="custom-google-btn" @click="triggerGoogleAuth">
      <div class="google-icon">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
      </div>
      <span class="btn-text">{{ t("google.text") }}</span>
    </div>

    <!-- Скрытый оригинальный контейнер -->
    <div id="google-signin-button" style="display: none"></div>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
const router = useRouter();
import { useRouter } from "vue-router";
const apiUrl = import.meta.env.VITE_GOOGLE_AUTH_URL;
import { useI18n } from "vue-i18n";
const { t } = useI18n();

import { useAccountStore } from "@/stores/accountStore";
const accountStore = useAccountStore();

const handleCredentialResponse = async (response) => {
  try {
    const res = await fetch(`${apiUrl}/api/auth/google/callback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: response.credential }),
    });

    const data = await res.json();
    console.log("Auth result:", data);
    if (data.apiResponse.ok === true || data.apiResponse.ok === "true") {
      accountStore.setAccountToken(data.apiResponse.token);
      accountStore.setAccountData(data.email);
      accountStore.setAccountStation("telegram");
      accountStore.setAccountStationText("Telegram");
      location.reload();
    }
    if (res.ok) {
      localStorage.setItem("auth_token", data.token);
      // Редирект или обновление состояния
    }
  } catch (err) {
    console.error("Auth error:", err);
  }
};

const triggerGoogleAuth = () => {
  // Программный клик по скрытой кнопке Google
  const googleButton = document.querySelector(
    "#google-signin-button div[role=button]"
  );
  if (googleButton) googleButton.click();
};

onMounted(() => {
  const script = document.createElement("script");
  script.src = "https://accounts.google.com/gsi/client";
  script.async = true;
  script.defer = true;
  script.onload = () => {
    window.google.accounts.id.initialize({
      client_id:
        "536063598199-18bggcm8gcrsf1o92jejfkfmktt73c9g.apps.googleusercontent.com",
      callback: handleCredentialResponse,
      ux_mode: "popup",
    });

    window.google.accounts.id.renderButton(
      document.getElementById("google-signin-button"),
      {
        type: "icon", // Скрываем стандартный текст
        size: "large",
        theme: "outline",
      }
    );
  };
  document.head.appendChild(script);
});
</script>

<style scoped>
.custom-google-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--googleAuthButton);
  color: var(--googleAuthButtonText);
  border-radius: 6px;
  padding: 10px 18px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s, box-shadow 0.3s;
  width: 650px;
  margin: 0 auto;
}

.custom-google-btn:hover {
  background: var(--googleAuthButtonTextHover);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.google-icon {
  margin-right: 12px;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
}

.btn-text {
  flex-grow: 1;
  text-align: center;
}

/* Альтернативные стили для темной темы */
.dark-mode .custom-google-btn {
  background: #2b2b2b;
  color: #e3e3e3;
  border-color: #5f6368;
}

.dark-mode .custom-google-btn:hover {
  background: #3c4043;
}

@media (max-width: 700px) {
  .custom-google-btn {
    width: 420px;
  }
}

@media (max-width: 450px) {
  .custom-google-btn {
    width: 310px;
  }
}
</style>
