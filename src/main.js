import "./assets/main.css";
import { createRouter, createWebHistory } from "vue-router";
import { createApp } from "vue";
import App from "./App.vue";
import FloatingVue from "floating-vue";
import "floating-vue/dist/style.css";
import PersonalAccount from "./pages/Account.vue";
import Login from "./pages/Login.vue";
import Registration from "./pages/Registration.vue";
import PasswordRecovery from "./pages/PasswordRecovery.vue";
import VerifyEmail from "./pages/VerifyEmail.vue";
import test from "./pages/test.vue";
import MainPage from "./pages/MainPage.vue";
import Mailing from "./pages/Mailing.vue";
import Chats from "./pages/Chats.vue";
import ViewChats from "./pages/ViewChats.vue";
import Payments from "./pages/Payments.vue";
import ChatsDataBase from "./pages/ChatsDataBase.vue";
import MessagesDataBase from "./pages/MessagesDataBase.vue";
import ResetPassword from "./pages/ResetPassword.vue";
import Referrals from "./pages/ReferralsPage.vue";
import Setings from "./pages/Setings.vue";
import NotFound from "./pages/NotFound.vue";
import { useDomain } from "@/composables/getDomain";
import i18n from "./i18n";
import { createPinia } from "pinia";
import { useThemeStore } from "@/stores/theme";
import Logs from "./pages/RequestLogger.vue";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import { useRequestsStore } from "@/stores/requests";
import axios from "axios";
import Support from "./pages/Support.vue";
import Help from "./pages/Help.vue";
import Profile from "./pages/Profile.vue";
import UserChats from "./pages/UserChats.vue";
import Docs from "./pages/Docs.vue";

const FRONTEND_URL_AUTH = import.meta.env.VITE_FRONTEND_URL_AUTH;
const LOG_SETTINGS = import.meta.env.VITE_LOG_SETTINGS || "off"; // off, all, error

import { computed } from "vue";

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

// ==================== УПРОЩЕННАЯ СИСТЕМА ЛОГИРОВАНИЯ ДЛЯ AXIOS ====================
class AxiosLogger {
  constructor() {
    this.settings = LOG_SETTINGS;
    this.isEnabled = this.settings !== "off";
    console.log(`[AxiosLogger] Инициализация с настройками: ${this.settings}`);
  }

  // Универсальный метод получения токена
  getToken() {
    try {
      // Сначала пробуем получить токен из localStorage/sessionStorage
      const tokenFromStorage =
        localStorage.getItem("accountToken") ||
        sessionStorage.getItem("accountToken");
      if (tokenFromStorage) {
        return tokenFromStorage;
      }

      // Если в хранилище нет, пробуем получить из accountStore
      if (typeof useAccountStore === "function") {
        const accountStore = useAccountStore();
        return accountStore.getAccountToken;
      }
    } catch (error) {
      // Игнорируем ошибки при получении токена
    }
    return null;
  }

  // Проверяем, доступно ли логирование (с учетом токена)
  canLog() {
    if (!this.isEnabled) return false;
    if (this.settings === "off") return false;

    const token = this.getToken();
    return !!token;
  }

  // Логируем axios запросы
  logRequest(config) {
    if (!this.canLog()) return;

    const logData = {
      level: "INFO",
      message: `HTTP Request: ${config.method?.toUpperCase()} ${config.url}`,
      data: {
        method: config.method?.toUpperCase(),
        url: config.url,
        headers: this.sanitizeHeaders(config.headers),
        timestamp: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
      domain: "frontend_vue",
      serverDomain: window.location.hostname || "none",
      url: window.location.href,
    };

    this.sendToServer(logData);
  }

  // Логируем axios ответы
  logResponse(response) {
    if (!this.canLog()) return;

    const duration = Date.now() - response.config.metadata.startTime;

    const logData = {
      level: response.status >= 400 ? "ERROR" : "SUCCESS",
      message: `HTTP Response: ${
        response.status
      } ${response.config.method?.toUpperCase()} ${response.config.url}`,
      data: {
        method: response.config.method?.toUpperCase(),
        url: response.config.url,
        status: response.status,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
      domain: "frontend_vue",
      serverDomain: window.location.hostname || "none",
      url: window.location.href,
    };

    this.sendToServer(logData);
  }

  // Логируем axios ошибки
  logError(error) {
    if (!this.canLog()) return;

    const duration = error.config
      ? Date.now() - error.config.metadata.startTime
      : 0;

    const logData = {
      level: "ERROR",
      message: `HTTP Error: ${
        error.response?.status || "NETWORK"
      } ${error.config?.method?.toUpperCase()} ${error.config?.url}`,
      data: {
        method: error.config?.method?.toUpperCase(),
        url: error.config?.url,
        status: error.response?.status || 0,
        duration: `${duration}ms`,
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
      domain: "frontend_vue",
      serverDomain: window.location.hostname || "none",
      url: window.location.href,
    };

    this.sendToServer(logData);
  }

  // Очищаем заголовки от чувствительных данных
  sanitizeHeaders(headers) {
    if (!headers) return {};

    const sanitized = { ...headers };
    const sensitiveKeys = [
      "authorization",
      "cookie",
      "token",
      "password",
      "secret",
    ];

    Object.keys(sanitized).forEach((key) => {
      if (
        sensitiveKeys.some((sensitive) => key.toLowerCase().includes(sensitive))
      ) {
        sanitized[key] = "***REDACTED***";
      }
    });

    return sanitized;
  }

  async sendToServer(logData) {
    if (!this.canLog()) return;

    try {
      const token = this.getToken();
      if (!token) {
        return;
      }

      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        timeout: 5000,
      };

      // Используем fetch вместо axios чтобы избежать рекурсивного логирования
      fetch("https://api28.apitter.com/api/createLog", {
        method: "POST",
        headers: config.headers,
        body: JSON.stringify(logData),
      }).catch(() => {
        // Игнорируем ошибки отправки логов
      });
    } catch (error) {
      // Игнорируем все ошибки при логировании
    }
  }
}

// Создаем глобальный экземпляр логгера для axios
const axiosLogger = new AxiosLogger();

const routes = [
  {
    path: "/Accounts",
    name: "PersonalAccount",
    component: PersonalAccount,
    meta: { title: "Аккаунты" },
  },
  {
    path: "/UserChats",
    name: "UserChats",
    component: UserChats,
    meta: { title: "Чаты" },
  },
  {
    path: "/help",
    name: "Help",
    component: Help,
    meta: { title: "Помощь" },
  },
  {
    path: "/profile",
    name: "Profile",
    component: Profile,
    meta: { title: "Профиль" },
  },
  {
    path: "/docs",
    name: "Docs",
    component: Docs,
    meta: { title: "База Знаний" },
  },
  {
    path: "/support",
    name: "Support",
    component: Support,
    meta: { title: "Тех. поддержка" },
  },
  {
    path: "/view-chats",
    name: "ViewChatsPage",
    component: ViewChats,
    meta: { title: "Просмотр чатов" },
  },
  {
    path: "/close",
    name: "close",
    component: () => import("@/pages/ClosePage.vue"),
  },
  {
    path: "/logs",
    name: "Logs",
    component: Logs,
    meta: { title: "Настройки" },
  },
  {
    path: "/referrals",
    name: "Referrals",
    component: Referrals,
    meta: { title: "Рефералы" },
  },
  {
    path: "/settings",
    name: "Setings",
    component: Setings,
    meta: { title: "Настройки" },
  },
  {
    path: "/reset-password",
    name: "ResetPassword",
    component: ResetPassword,
    meta: { title: "Сброс пароля" },
  },
  {
    path: "/",
    name: "MainPage",
    redirect: (to) => {
      const accountStore = useAccountStore();
      const token = accountStore.getAccountToken;

      if (token) {
        return { name: "PersonalAccount", query: to.query };
      }
      return { name: "Login", query: to.query };
    },
    meta: { title: "Главная страница" },
  },
  {
    path: "/ChatsDataBase",
    name: "ChatsDataBase",
    component: ChatsDataBase,
    meta: { title: "База данных чатов" },
  },
  {
    path: "/MessagesDataBase",
    name: "MessagesDataBase",
    component: MessagesDataBase,
    meta: { title: "База данных сообщений" },
  },
  {
    path: "/chats",
    name: "Chats",
    component: Chats,
    props: (route) => ({
      initialThread: route.query.thread,
      initialMode: route.query.mode,
      initialUserLink: route.query.userLink,
      initialSourse: route.query.source,
      initialLogin: route.query.login,
      initialMulti: route.query.multi,
    }),
    meta: { title: "Чаты" },
  },
  {
    path: "/Mailing",
    name: "Mailing",
    component: Mailing,
    meta: { title: "Рассылки" },
  },
  {
    path: "/verify-email",
    name: "VerifyEmail",
    component: VerifyEmail,
    meta: { title: "Подтверждение Email" },
  },
  { path: "/login", name: "Login", component: Login, meta: { title: "Вход" } },
  {
    path: "/registration",
    name: "Registration",
    component: Registration,
    meta: { title: "Регистрация" },
  },
  {
    path: "/forgot",
    name: "PasswordRecovery",
    component: PasswordRecovery,
    meta: { title: "Восстановление пароля" },
  },
  {
    path: "/test",
    name: "test",
    component: test,
    meta: { title: "Тестовая страница" },
  },
  {
    path: "/payments",
    name: "payments",
    component: Payments,
    meta: { title: "Платежи" },
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: NotFound,
    meta: { title: "Страница не найдена" },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

const app = createApp(App);
app.use(pinia);
app.use(router);
app.use(i18n);

app.use(FloatingVue, {
  themes: {
    "light-dropdown": {
      $extend: "dropdown",
      backgroundColor: "#ffffff",
      borderColor: "#e5e7eb",
      boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
      borderRadius: "10px",
    },
  },
});

import { useAccountStore } from "@/stores/accountStore";
const accountStore = useAccountStore();

// ==================== ФУНКЦИЯ ДЛЯ ОЧИСТКИ ДАННЫХ И ПЕРЕНАПРАВЛЕНИЯ ====================
const clearAuthDataAndRedirect = () => {
  console.log("Очистка данных и перенаправление на логин");

  // Очищаем localStorage
  localStorage.clear();
  sessionStorage.clear();

  // Очищаем хранилище Pinia
  const accountStore = useAccountStore();
  accountStore.$reset();

  // Перенаправляем на страницу логина
  if (router.currentRoute.value.name !== "Login") {
    router.push({ name: "Login" });
  }
};

// ==================== ПЕРЕХВАТЧИКИ AXIOS ====================
axios.interceptors.request.use((config) => {
  config.metadata = {
    startTime: Date.now(),
    url: config.url,
    method: config.method?.toUpperCase() || "GET",
    isLogRequest: config.url?.includes("/api/createLog"),
  };

  // Логируем запрос (только если не логируем сами логи)
  if (!config.metadata.isLogRequest) {
    axiosLogger.logRequest(config);
  }

  return config;
});

axios.interceptors.response.use(
  (response) => {
    // Пропускаем логирование запросов самих логов
    if (response.config.metadata.isLogRequest) {
      return response;
    }

    const endTime = Date.now();
    const duration = endTime - response.config.metadata.startTime;

    const requestData = {
      url: response.config.url,
      method: response.config.method.toUpperCase(),
      status: response.status,
      duration: duration,
      timestamp: Date.now(),
      requestBody: response.config.metadata.requestBody,
      endpoint: response.config.url,
      message: `Request completed in ${duration}ms`,
    };

    // Локальное хранение (синхронно)
    const requestsStore = useRequestsStore();
    requestsStore.addRequest({
      ...requestData,
      responseHeaders: response.headers,
      responseBody: response.data,
      statusText: response.statusText,
      requestHeaders: response.config.headers,
    });

    // Логируем успешный ответ
    axiosLogger.logResponse(response);

    return response;
  },
  (error) => {
    // Пропускаем логирование ошибок запросов самих логов
    if (error.config?.metadata?.isLogRequest) {
      return Promise.reject(error);
    }

    // Обработка 401 ошибки - перенаправление на страницу авторизации
    if (error.response?.status === 401) {
      console.error("Обнаружена 401 ошибка - перенаправление на авторизацию");
      clearAuthDataAndRedirect();
      return Promise.reject(error);
    }

    if (error.response) {
      const endTime = Date.now();
      const duration = endTime - error.config.metadata.startTime;

      const requestData = {
        url: error.config.url,
        method: error.config.method.toUpperCase(),
        status: error.response.status,
        duration: duration,
        timestamp: Date.now(),
        requestBody: error.config.metadata?.requestBody,
        endpoint: error.config.url,
        message: error.response.statusText || "Request failed",
        error: error.message,
      };

      // Локальное хранение (синхронно)
      const requestsStore = useRequestsStore();
      requestsStore.addRequest({
        ...requestData,
        responseHeaders: error.response.headers,
        responseBody: error.response.data,
        statusText: error.response.statusText,
        requestHeaders: error.config.headers,
      });

      // Логируем ошибку
      axiosLogger.logError(error);
    } else {
      // Обработка сетевых ошибок
      axiosLogger.logError(error);
    }

    return Promise.reject(error);
  },
);

// Конфигурация ограничений по доменам
const DOMAIN_CONFIG = {
  "app1.developtech.ru": {
    allowedRoutes: [
      "PersonalAccount",
      "test",
      "Login",
      "Registration",
      "PasswordRecovery",
      "payments",
      "VerifyEmail",
      "ResetPassword",
      "Referrals",
    ],
    defaultRoute: "/Accounts",
    redirectRoute: "/Accounts",
  },
  "app2.touch-api.com": {
    allowedRoutes: [
      "PersonalAccount",
      "Login",
      "Registration",
      "PasswordRecovery",
      "payments",
      "VerifyEmail",
      "ResetPassword",
      "Referrals",
    ],
    defaultRoute: "/Accounts",
    redirectRoute: "/Accounts",
  },
  "app2.developtech.ru": {
    allowedRoutes: null,
    blockedRoutes: ["Setings"],
    defaultRoute: "/Accounts",
    redirectRoute: "/Accounts",
  },
  "app4.developtech.ru": {
    allowedRoutes: [
      "Setings",
      "Login",
      "Registration",
      "PasswordRecovery",
      "VerifyEmail",
      "ResetPassword",
      "Referrals",
    ],
    defaultRoute: "/settings",
    redirectRoute: "/settings",
  },
};

const checkRouteAccess = (to, domain) => {
  const publicPages = [
    "Login",
    "Registration",
    "PasswordRecovery",
    "VerifyEmail",
    "ResetPassword",
  ];

  if (publicPages.includes(to.name)) {
    return { allowed: true };
  }

  const config = DOMAIN_CONFIG[domain];
  if (!config) {
    return { allowed: true };
  }

  if (domain === "app1.developtech.ru") {
    return {
      allowed: config.allowedRoutes.includes(to.name),
      redirect: config.redirectRoute,
    };
  }

  if (domain === "app2.developtech.ru") {
    return {
      allowed: !config.blockedRoutes.includes(to.name),
      redirect: config.redirectRoute,
    };
  }

  if (domain === "app4.developtech.ru") {
    return {
      allowed: config.allowedRoutes.includes(to.name),
      redirect: config.redirectRoute,
    };
  }

  return { allowed: true };
};

const updatePageMetadata = (title, logoUrl) => {
  document.title = title || "Touch-API";
  let favicon = document.querySelector('link[rel="icon"]');
  if (!favicon) {
    favicon = document.createElement("link");
    favicon.rel = "icon";
    document.head.appendChild(favicon);
  }
  favicon.href = logoUrl || "/favicon.ico";
};

router.beforeEach(async (to, from, next) => {
  try {
    const accountStore = useAccountStore();
    const token = accountStore.getAccountToken;

    // Определяем публичные страницы
    const publicPages = [
      "Login",
      "Registration",
      "PasswordRecovery",
      "VerifyEmail",
      "ResetPassword",
    ];

    // Пропускаем NotFound
    if (to.name === "NotFound") {
      return next();
    }

    // Разрешаем публичные страницы без проверки токена
    if (publicPages.includes(to.name)) {
      // Проверка доступа по домену
      const currentDomain = window.location.hostname;
      const access = checkRouteAccess(to, currentDomain);

      if (!access.allowed) {
        if (to.path !== access.redirect) {
          return next({ path: access.redirect || "/", query: to.query });
        }
        return next({ name: "Login", query: to.query });
      }

      // Обновление метаданных
      try {
        const { stationDomain } = useDomain();
        const pageTitle = stationDomain?.cosmetics?.titleLogo
          ? `${to.meta.title} | ${stationDomain.cosmetics.titleLogo}`
          : to.meta.title || "Touch-API";
        updatePageMetadata(pageTitle, stationDomain?.cosmetics?.urlLogo);
      } catch (error) {
        updatePageMetadata(to.meta.title);
      }
      return next();
    }

    // Проверка запрошенного URL для verify-email и reset-password
    const requestedPath = window.location.pathname;

    if (requestedPath.includes("/verify-email") && to.name !== "VerifyEmail") {
      return next({ name: "VerifyEmail", query: to.query });
    } else if (
      requestedPath.includes("/reset-password") &&
      to.name !== "ResetPassword"
    ) {
      return next({ name: "ResetPassword", query: to.query });
    }

    // Проверка доступа по домену для непубличных страниц
    const currentDomain = window.location.hostname;
    const access = checkRouteAccess(to, currentDomain);

    if (!access.allowed) {
      if (to.path !== access.redirect) {
        return next({ path: access.redirect || "/", query: to.query });
      }
      return next({ name: "Login", query: to.query });
    }

    // Если нет токена и это не публичная страница, перенаправляем на логин
    if (!token && !publicPages.includes(to.name)) {
      if (to.name !== "Login") {
        return next({ name: "Login", query: to.query });
      }
      return next();
    }

    // Если есть токен и пользователь на публичной странице (кроме VerifyEmail и ResetPassword), перенаправляем на PersonalAccount
    if (
      token &&
      publicPages.includes(to.name) &&
      !["VerifyEmail", "ResetPassword"].includes(to.name)
    ) {
      if (to.name !== "PersonalAccount") {
        return next({ name: "PersonalAccount", query: to.query });
      }
      return next();
    }

    // Обновление метаданных для остальных страниц
    try {
      const { stationDomain } = useDomain();
      const pageTitle = stationDomain?.cosmetics?.titleLogo
        ? `${to.meta.title} | ${stationDomain.cosmetics.titleLogo}`
        : to.meta.title || "Touch-API";
      updatePageMetadata(pageTitle, stationDomain?.cosmetics?.urlLogo);
    } catch (error) {
      updatePageMetadata(to.meta.title);
    }

    next();
  } catch (error) {
    next({ name: "Login", query: to.query });
  }
});

app.config.errorHandler = (err) => {
  console.error("Global error:", err);
};

const themeStore = useThemeStore();
document.documentElement.setAttribute(
  "data-theme",
  themeStore.isDark ? "dark" : "light",
);

// Дублирующие перехватчики (убрать если они дублируют функциональность выше)
axios.interceptors.request.use((config) => {
  config.metadata = { startTime: Date.now() };
  if (config.data) {
    config.metadata.requestBody = config.data;
  }
  return config;
});

axios.interceptors.response.use(
  (response) => {
    const endTime = Date.now();
    const duration = endTime - response.config.metadata.startTime;

    const requestData = {
      url: response.config.url,
      method: response.config.method.toUpperCase(),
      status: response.status,
      statusText: response.statusText,
      duration: duration,
      timestamp: Date.now(),
      requestHeaders: response.config.headers,
      requestBody: response.config.metadata.requestBody,
      responseHeaders: response.headers,
      responseBody: response.data,
    };

    const requestsStore = useRequestsStore();
    requestsStore.addRequest(requestData);

    return response;
  },
  (error) => {
    // Обработка 401 ошибки в дублирующем интерсепторе
    if (error.response?.status === 401) {
      clearAuthDataAndRedirect();
    }

    if (error.response) {
      const endTime = Date.now();
      const duration = endTime - error.config.metadata.startTime;

      const requestData = {
        url: error.config.url,
        method: error.config.method.toUpperCase(),
        status: error.response.status,
        statusText: error.response.statusText,
        duration: duration,
        timestamp: Date.now(),
        requestHeaders: error.config.headers,
        requestBody: error.config.metadata?.requestBody,
        responseHeaders: error.response.headers,
        responseBody: error.response.data,
      };

      const requestsStore = useRequestsStore();
      requestsStore.addRequest(requestData);
    }

    return Promise.reject(error);
  },
);

app.mount("#app");

export { axiosLogger as logger };
