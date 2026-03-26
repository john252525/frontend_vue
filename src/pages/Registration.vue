<template>
  <div class="registration-container">
    <div v-if="errorMessage" class="error-banner">
      {{ errorMessage }}
    </div>

    <div v-if="sendEmail" class="email-sent">
      <h2>{{ t("registration.emailSent") }}</h2>
      <p>Проверьте вашу почту для подтверждения аккаунта.</p>
      <p class="redirect-timer">Перенаправление через {{ countdown }} сек...</p>
      <router-link to="/" class="redirect-btn">На главную</router-link>
    </div>

    <form v-else @submit.prevent="handleSubmit" class="reg-form">
      <h1>
        {{ t("registration.title") }}
        <img
          class="url-img-logo"
          :src="stationDomain.cosmetics.urlLogo"
          alt=""
        />
        <span class="b-logo">{{ stationDomain.cosmetics.titleLogo }}</span>
      </h1>

      <div class="field" :class="{ 'has-error': fieldErrors.company_name }">
        <label>Название компании</label>
        <input
          type="text"
          v-model="formData.company_name"
          placeholder="Введите название компании"
          required
          :disabled="loading"
          @blur="touch('company_name')"
        />
        <span v-if="fieldErrors.company_name" class="field-error">{{
          fieldErrors.company_name
        }}</span>
      </div>

      <div class="field" :class="{ 'has-error': fieldErrors.contact_name }">
        <label>Контактное лицо</label>
        <input
          type="text"
          v-model="formData.contact_name"
          placeholder="Введите имя контактного лица"
          required
          :disabled="loading"
          @blur="touch('contact_name')"
        />
        <span v-if="fieldErrors.contact_name" class="field-error">{{
          fieldErrors.contact_name
        }}</span>
      </div>

      <div class="field" :class="{ 'has-error': fieldErrors.login }">
        <label>{{ t("registration.mail") }}</label>
        <input
          type="email"
          v-model="formData.login"
          :placeholder="t('registration.emailPlaceholder')"
          required
          :disabled="loading"
          @blur="touch('login')"
        />
        <span v-if="fieldErrors.login" class="field-error">{{
          fieldErrors.login
        }}</span>
      </div>

      <div class="field" :class="{ 'has-error': fieldErrors.password }">
        <label>{{ t("registration.password") }}</label>
        <div class="input-wrapper">
          <input
            :type="showPass ? 'text' : 'password'"
            v-model="formData.password"
            :placeholder="t('registration.passwordPlaceholder')"
            required
            :disabled="loading"
            @blur="touch('password')"
          />
          <span class="eye-icon" @click="showPass = !showPass">
            <svg
              v-if="!showPass"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path
                d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
              ></path>
              <line x1="1" y1="1" x2="23" y2="23"></line>
            </svg>
            <svg
              v-else
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          </span>
        </div>
        <span v-if="fieldErrors.password" class="field-error">{{
          fieldErrors.password
        }}</span>
      </div>

      <div class="field" :class="{ 'has-error': fieldErrors.confirmPassword }">
        <label>{{ t("registration.passwordConfirm") }}</label>
        <div class="input-wrapper">
          <input
            :type="showPassConfirm ? 'text' : 'password'"
            v-model="formData.confirmPassword"
            :placeholder="t('registration.passwordPlaceholder')"
            required
            :disabled="loading"
            @blur="touch('confirmPassword')"
          />
          <span class="eye-icon" @click="showPassConfirm = !showPassConfirm">
            <svg
              v-if="!showPassConfirm"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path
                d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
              ></path>
              <line x1="1" y1="1" x2="23" y2="23"></line>
            </svg>
            <svg
              v-else
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          </span>
        </div>
        <span v-if="fieldErrors.confirmPassword" class="field-error">{{
          fieldErrors.confirmPassword
        }}</span>
      </div>

      <div class="field" :class="{ 'has-error': fieldErrors.phone }">
        <label>{{ t("registration.phone") }}</label>
        <div class="phone-input" :class="{ 'input-error': fieldErrors.phone }">
          <div class="country-prefix">
            <img src="https://flagcdn.com/w20/ru.png" width="20" alt="RU" />
            <span>+7</span>
          </div>
          <input
            type="tel"
            v-model="phoneFormatter.state.phoneNumber"
            @input="phoneFormatter.formatPhone"
            @keydown.delete="phoneFormatter.handleBackspace"
            :placeholder="
              phoneFormatter.state.showMask
                ? '(___) ___-__-__'
                : t('registration.phonePlaceholder')
            "
            :ref="(el) => (phoneFormatter.phoneInput.value = el)"
            required
            :disabled="loading"
            @blur="touch('phone')"
          />
        </div>
        <span v-if="fieldErrors.phone" class="field-error">{{
          fieldErrors.phone
        }}</span>
      </div>

      <div class="row">
        <div class="field half">
          <label>Страна</label>
          <div
            class="custom-select"
            :class="{ active: activeSelect === 'country' }"
            @click.stop="toggleSelect('country')"
          >
            <div class="select-trigger">
              {{ formData.country }}
              <span class="arrow"></span>
            </div>
            <Transition name="fade">
              <div class="select-options" v-if="activeSelect === 'country'">
                <div @click.stop="selectValue('country', 'Россия')">Россия</div>
              </div>
            </Transition>
          </div>
        </div>

        <div class="field half">
          <label>CRM</label>
          <div
            class="custom-select"
            :class="{ active: activeSelect === 'crm' }"
            @click.stop="toggleSelect('crm')"
          >
            <div class="select-trigger" :class="{ placeholder: !formData.crm }">
              {{ formData.crm || "-" }}
              <span class="arrow"></span>
            </div>
            <Transition name="fade">
              <div class="select-options" v-if="activeSelect === 'crm'">
                <div @click.stop="selectValue('crm', 'Bitrix24')">Bitrix24</div>
                <div @click.stop="selectValue('crm', 'AmoCRM')">AmoCRM</div>
                <div @click.stop="selectValue('crm', 'uon')">Uon-Travel</div>
              </div>
            </Transition>
          </div>
        </div>
      </div>

      <div class="field">
        <label>{{ t("registration.preferredChannels") }}</label>
        <div class="messengers-cont">
          <label
            v-for="channel in availableChannels"
            :key="channel.value"
            class="messenger-label"
            :class="{
              active: formData.contact_preferred_channels.includes(
                channel.value,
              ),
              disabled: loading,
            }"
          >
            <input
              type="checkbox"
              :value="channel.value"
              v-model="formData.contact_preferred_channels"
              class="messenger-checkbox-hidden"
              :disabled="loading"
            />
            <span class="messenger-check">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path
                  d="M2 6l3 3 5-5"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </span>
            <span class="messenger-text">{{ channel.label }}</span>
          </label>
        </div>
      </div>

      <div class="field">
        <label>Промокод</label>
        <input type="text" v-model="formData.promo" :disabled="loading" />
      </div>

      <div class="checkbox-group">
        <label
          class="checkbox-container"
          :class="{ 'checkbox-error': fieldErrors.agreeTerms }"
        >
          <input type="checkbox" v-model="formData.agreeTerms" />
          <span class="custom-checkmark"></span>
          <span class="checkbox-text">
            {{ t("registration.acceptTerms") }}
            <a href="https://chatserv.ru/documents" target="_blank">{{
              t("registration.termsLink")
            }}</a>
          </span>
        </label>

        <label class="checkbox-container">
          <input type="checkbox" v-model="formData.agreeCookies" />
          <span class="custom-checkmark"></span>
          <span class="checkbox-text">
            Я согласен на использование файлов cookie</span
          >
        </label>

        <label class="checkbox-container">
          <input type="checkbox" v-model="formData.agreeNews" />
          <span class="custom-checkmark"></span>
          <span class="checkbox-text"
            >Я согласен получать новостные рассылки</span
          >
        </label>

        <label
          class="checkbox-container"
          :class="{ 'checkbox-error': fieldErrors.agreePersonalData }"
        >
          <input type="checkbox" v-model="formData.agreePersonalData" />
          <span class="custom-checkmark"></span>
          <span class="checkbox-text"
            >Даю согласие на обработку персональных данных</span
          >
        </label>
        <span
          v-if="fieldErrors.agreeTerms || fieldErrors.agreePersonalData"
          class="field-error"
        >
          {{ fieldErrors.agreeTerms || fieldErrors.agreePersonalData }}
        </span>
      </div>

      <button
        type="submit"
        class="submit-btn"
        :disabled="loading"
        @click="touchAll"
      >
        <span v-if="loading" class="btn-spinner"></span>
        {{ loading ? t("registration.loading") : t("registration.button") }}
      </button>

      <div class="footer-link">
        {{ t("registration.haveAccount") }}
        <span @click="navigateTo('/Login')">{{ t("registration.login") }}</span>
      </div>
    </form>
  </div>
</template>

<script setup>
import axios from "axios";
const FRONTEND_URL_AUTH = import.meta.env.VITE_FRONTEND_URL_AUTH;
import { reactive, ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { useDomain } from "@/composables/getDomain";
import useFrontendLogger from "@/composables/useFrontendLogger";
import { usePhoneFormatter } from "@/composables/usePhoneFormatter";

const { t } = useI18n();
const { sendLog } = useFrontendLogger();
const { stationDomain } = useDomain();
const router = useRouter();
const route = useRoute();

const sendEmail = ref(false);
const loading = ref(false);
const errorMessage = ref("");
const showPass = ref(false);
const showPassConfirm = ref(false);
const activeSelect = ref(null);
const countdown = ref(5);
const redirectInterval = ref(null);
const submitted = ref(false);

const phoneFormatter = usePhoneFormatter();

const touched = reactive({
  company_name: false,
  contact_name: false,
  login: false,
  password: false,
  confirmPassword: false,
  phone: false,
});

const touch = (field) => {
  touched[field] = true;
};

const touchAll = () => {
  Object.keys(touched).forEach((key) => {
    touched[key] = true;
  });
  submitted.value = true;
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const formData = reactive({
  company_name: "",
  contact_name: "",
  login: "",
  contact_preferred_channels: [],
  password: "",
  confirmPassword: "",
  country: "Россия",
  crm: "",
  promo: "",
  agreeTerms: false,
  agreeCookies: false,
  agreeNews: false,
  agreePersonalData: false,
});

const fieldErrors = computed(() => {
  const errors = {};

  if (touched.company_name && !formData.company_name.trim()) {
    errors.company_name = "Введите название компании";
  }

  if (touched.contact_name && !formData.contact_name.trim()) {
    errors.contact_name = "Введите имя контактного лица";
  }

  if (touched.login) {
    if (!formData.login.trim()) {
      errors.login = "Введите email";
    } else if (!emailRegex.test(formData.login)) {
      errors.login = "Некорректный формат email";
    }
  }

  if (touched.password) {
    if (!formData.password) {
      errors.password = "Введите пароль";
    } else if (formData.password.length < 6) {
      errors.password = "Пароль должен содержать минимум 6 символов";
    }
  }

  if (touched.confirmPassword) {
    if (!formData.confirmPassword) {
      errors.confirmPassword = "Подтвердите пароль";
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Пароли не совпадают";
    }
  }

  if (touched.phone) {
    const digits = phoneFormatter.state.phoneNumber.replace(/\D/g, "");
    if (!digits) {
      errors.phone = "Введите номер телефона";
    } else if (digits.length !== 10) {
      errors.phone = "Номер телефона должен содержать 10 цифр";
    }
  }

  if (!formData.agreeTerms && submitted.value) {
    errors.agreeTerms = "Необходимо принять условия использования";
  }

  if (!formData.agreePersonalData && submitted.value) {
    errors.agreePersonalData =
      "Необходимо дать согласие на обработку персональных данных";
  }

  return errors;
});

const availableChannels = [
  { value: "call", label: t("profileSection.channels.call") },
  { value: "telegram", label: t("profileSection.channels.telegram") },
  { value: "whatsapp", label: t("profileSection.channels.whatsapp") },
  { value: "viber", label: t("profileSection.channels.viber") },
];

// Селекты
const toggleSelect = (type) => {
  activeSelect.value = activeSelect.value === type ? null : type;
};
const selectValue = (type, val) => {
  formData[type] = val;
  activeSelect.value = null;
};
const closeSelects = () => {
  activeSelect.value = null;
};

onMounted(() => window.addEventListener("click", closeSelects));
onUnmounted(() => {
  window.removeEventListener("click", closeSelects);
  if (redirectInterval.value) {
    clearInterval(redirectInterval.value);
    redirectInterval.value = null;
  }
});

const navigateTo = (page) => router.push(page);

const isFormValid = computed(() => {
  return (
    formData.company_name &&
    formData.contact_name &&
    formData.login &&
    formData.password.length >= 6 &&
    formData.password === formData.confirmPassword &&
    phoneFormatter.state.phoneNumber.replace(/\D/g, "").length === 10 &&
    formData.agreeTerms &&
    formData.agreePersonalData
  );
});

const handleSubmit = async () => {
  touchAll();
  if (!isFormValid.value) return;

  loading.value = true;
  errorMessage.value = "";

  try {
    const internationalPhone = phoneFormatter.getInternationalFormat();
    const requestData = {
      company_name: formData.company_name,
      contact_name: formData.contact_name,
      email: formData.login,
      phone: "+7" + internationalPhone,
      country: formData.country,
      ref_id: route.query.ref,
      password: formData.password,
    };

    if (formData.crm) {
      requestData.crm = formData.crm;
    }

    if (formData.promo) {
      requestData.promo = formData.promo;
    }

    if (formData.contact_preferred_channels.length > 0) {
      requestData.contact_preferred_channels =
        formData.contact_preferred_channels;
    }

    requestData.agree_cookies = formData.agreeCookies;
    requestData.agree_news = formData.agreeNews;

    const response = await axios.post(
      `${FRONTEND_URL_AUTH}register`,
      requestData,
      {
        headers: { "Content-Type": "application/json; charset=utf-8" },
      },
    );

    if (response.data) {
      await sendLog(
        "create_account",
        "login",
        {
          username: formData.login,
          phone: internationalPhone,
          channels: formData.contact_preferred_channels,
        },
        response.data.ok,
        response.data,
      );
    }

    if (!response.data.ok) {
      errorMessage.value =
        response.data.error_message || t("registration.errorRegistration");
      setTimeout(() => (errorMessage.value = ""), 5000);
      return;
    }

    if (response.data.data.result === true) {
      sendEmail.value = true;
      startRedirectTimer();
    }
  } catch (err) {
    const serverError = err.response?.data?.errors?.[0];
    errorMessage.value =
      serverError === "User with this credentials already exists."
        ? t("registration.errorUserExists")
        : t("registration.errorRegistration");
    setTimeout(() => (errorMessage.value = ""), 5000);
  } finally {
    loading.value = false;
  }
};

const startRedirectTimer = () => {
  redirectInterval.value = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      clearInterval(redirectInterval.value);
      redirectInterval.value = null;
      router.push("/");
    }
  }, 1000);
};
</script>

<style scoped>
/* ПЕРЕМЕННЫЕ ЦВЕТОВ */
.registration-container {
  --primary-color: #4950ca;
  --primary-hover: #595fd1;
  --primary-light: rgba(73, 80, 202, 0.15);
  --border-color: #e1e5eb;
  --text-main: #1a1a1a;
  --text-secondary: #7a828a;
  --bg-input: #fcfdfe;

  font-family: "Inter", sans-serif;
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
  padding: 40px 30px 60px;
  color: var(--text-main);
  box-sizing: border-box;
}

.reg-form {
  box-sizing: border-box;
}

.reg-form *,
.reg-form *::before,
.reg-form *::after {
  box-sizing: border-box;
}

h1 {
  text-align: center;
  font-size: 26px;
  font-weight: 600;
  margin-bottom: 30px;
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
  font-size: 22px;
}

.field {
  margin-bottom: 20px;
}

label {
  display: block;
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

/* ИНПУТЫ */
input[type="text"],
input[type="email"],
input[type="password"],
input[type="tel"] {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid var(--border-color);
  background: var(--bg-input);
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px var(--primary-light);
}

input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
  opacity: 0.7;
}

/* ПАРОЛЬ */
.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}
.input-wrapper input {
  padding-right: 40px;
}
.eye-icon {
  position: absolute;
  right: 12px;
  cursor: pointer;
  color: var(--text-secondary);
  display: flex;
}
.eye-icon:hover {
  color: var(--text-main);
}

/* ТЕЛЕФОН */
.phone-input {
  display: flex;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
  transition: 0.2s;
}
.phone-input:focus-within {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px var(--primary-light);
}
.country-prefix {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 14px;
  background: #f4f6f8;
  border-right: 1px solid var(--border-color);
  font-size: 14px;
}
.phone-input input {
  border: none;
  flex: 1;
  box-shadow: none;
}

/* МЕССЕНДЖЕРЫ */
.messengers-cont {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.messenger-label {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  padding: 9px 12px;
  border: 1.5px solid var(--border-color);
  border-radius: 8px;
  font-size: 13px;
  background: var(--bg-input);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  user-select: none;
}

.messenger-label:hover:not(.disabled) {
  border-color: var(--primary-color);
}

.messenger-label.active {
  border-color: var(--primary-color);
  background: var(--bg-input);
}

.messenger-label.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.messenger-checkbox-hidden {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
  pointer-events: none;
}

.messenger-check {
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  border: 2px solid var(--border-color);
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  color: transparent;
  background: #fff;
}

.messenger-label:hover:not(.disabled) .messenger-check {
  border-color: var(--primary-color);
}

.messenger-label.active .messenger-check {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: #fff;
  box-shadow: 0 2px 6px rgba(73, 80, 202, 0.3);
  transform: scale(1.05);
}

.messenger-text {
  white-space: nowrap;
}

/* СЕЛЕКТЫ */
.row {
  display: flex;
  gap: 15px;
}
.half {
  flex: 1;
}
.custom-select {
  position: relative;
  cursor: pointer;
}
.select-trigger {
  padding: 12px 14px;
  border: 1px solid var(--border-color);
  background: var(--bg-input);
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  transition: 0.2s;
}
.active .select-trigger {
  border-color: var(--primary-color);
}
.arrow {
  border: solid var(--text-secondary);
  border-width: 0 2px 2px 0;
  display: inline-block;
  padding: 3px;
  transform: rotate(45deg);
  transition: 0.2s;
}
.active .arrow {
  transform: rotate(-135deg);
  margin-top: 4px;
}
.select-options {
  position: absolute;
  top: 110%;
  left: 0;
  right: 0;
  background: #fff;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
  z-index: 10;
  overflow: hidden;
}
.select-options div {
  padding: 10px 14px;
  font-size: 14px;
  transition: 0.2s;
}
.select-options div:hover {
  background: #f4f6f8;
  color: var(--primary-color);
}

/* ЧЕКБОКСЫ */
.checkbox-group {
  margin: 25px 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.checkbox-container {
  display: flex;
  align-items: flex-start;
  cursor: pointer;
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid var(--border-color);
  background: var(--bg-input);
  transition: all 0.25s ease;
}
.checkbox-container:hover {
  border-color: var(--primary-color);
}
.checkbox-container input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
  pointer-events: none;
}
.custom-checkmark {
  flex-shrink: 0;
  height: 22px;
  width: 22px;
  background: #fff;
  border: 2px solid var(--border-color);
  border-radius: 6px;
  margin-right: 12px;
  margin-top: 1px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}
.checkbox-container:hover .custom-checkmark {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px var(--primary-light);
}
input:checked ~ .custom-checkmark {
  background: var(--primary-color);
  border-color: var(--primary-color);
  box-shadow: 0 2px 8px rgba(73, 80, 202, 0.35);
  transform: scale(1.05);
}
.custom-checkmark::after {
  content: "";
  width: 6px;
  height: 10px;
  border: solid white;
  border-width: 0 2.5px 2.5px 0;
  transform: rotate(45deg) scale(0);
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  margin-bottom: 2px;
}
input:checked ~ .custom-checkmark::after {
  transform: rotate(45deg) scale(1);
}
.checkbox-text {
  font-size: 13px;
  line-height: 1.5;
  color: #4a4a4a;
  padding-top: 2px;
}
.checkbox-text a {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 600;
  border-bottom: 1px dashed rgba(73, 80, 202, 0.4);
  transition: border-color 0.2s;
}
.checkbox-text a:hover {
  border-bottom-color: var(--primary-color);
}

/* КНОПКА */
.submit-btn {
  width: 100%;
  padding: 14px;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.submit-btn:hover:not(:disabled) {
  background: var(--primary-hover);
  transform: translateY(-1px);
}
.submit-btn:disabled {
  background: #e1e5eb;
  color: #a0a5ab;
  cursor: not-allowed;
}

.footer-link {
  text-align: center;
  margin-top: 25px;
  font-size: 12px;
  font-weight: 700;
}
.footer-link span {
  color: var(--primary-color);
  cursor: pointer;
  margin-left: 4px;
}
.footer-link span:hover {
  text-decoration: underline;
}

/* ОШИБКИ ПОЛЕЙ */
.field-error {
  display: block;
  color: #dc2626;
  font-size: 12px;
  margin-top: 6px;
  padding-left: 2px;
}

.has-error input[type="text"],
.has-error input[type="email"],
.has-error input[type="password"],
.has-error input[type="tel"] {
  border-color: #dc2626;
}

.has-error input:focus {
  border-color: #dc2626;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.15);
}

.has-error .phone-input,
.phone-input.input-error {
  border-color: #dc2626;
}

.has-error .phone-input:focus-within {
  border-color: #dc2626;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.15);
}

.checkbox-error {
  border-color: #dc2626 !important;
}

/* ОШИБКА */
.error-banner {
  background: #fee2e2;
  color: #dc2626;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  margin-bottom: 16px;
  text-align: center;
}

/* ЭКРАН ПОДТВЕРЖДЕНИЯ */
.email-sent {
  text-align: center;
  padding: 60px 20px;
}
.email-sent h2 {
  font-size: 24px;
  margin-bottom: 12px;
  color: var(--primary-color);
}
.email-sent p {
  font-size: 16px;
  color: var(--text-secondary);
}
.redirect-timer {
  margin-top: 8px;
  font-size: 14px;
}
.redirect-btn {
  display: inline-block;
  margin-top: 20px;
  padding: 12px 28px;
  background: var(--primary-color);
  color: #fff;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  font-size: 15px;
  transition: background 0.2s;
}
.redirect-btn:hover {
  background: var(--primary-hover);
}

/* СПИННЕР КНОПКИ */
.btn-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-right: 6px;
  vertical-align: middle;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* АНИМАЦИИ */
.fade-enter-active,
.fade-leave-active {
  transition: 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@media (max-width: 480px) {
  .registration-container {
    padding: 24px 16px 40px;
  }

  h1 {
    font-size: 20px;
  }

  .row {
    flex-direction: column;
    gap: 0;
  }

  .messengers-cont {
    grid-template-columns: repeat(2, 1fr);
  }

  .checkbox-container {
    padding: 8px 10px;
  }

  .custom-checkmark {
    height: 20px;
    width: 20px;
  }
}
</style>
