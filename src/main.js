import "./assets/main.css";
import { createRouter, createWebHashHistory } from "vue-router";
import { createApp, computed } from "vue";
import App from "./App.vue";
import PersonalAccount from "./pages/Account.vue";
import Login from "./pages/Login.vue";
import Registration from "./pages/Registration.vue";
import PasswordRecovery from "./pages/PasswordRecovery.vue";
import VerifyEmail from "./pages/VerifyEmail.vue";
import test from "./pages/test.vue";
import MainPage from "./pages/MainPage.vue";
import Mailing from "./pages/Mailing.vue";
import Chats from "./pages/Chats.vue";
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
import { useAccountStore } from "@/stores/accountStore"; // Путь к вашему store
import { hookManager } from "@/hooks/HookManager";

import { useRequestsStore } from "@/stores/requests";
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

if ("Notification" in window) {
  Notification.requestPermission();
}

const routes = [
  {
    path: "/Accounts",
    name: "PersonalAccount",
    component: PersonalAccount,
    meta: { title: "Аккаунты" },
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
    component: () => import("./pages/Redirect.vue"),
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
  history: createWebHashHistory(),
  routes,
});

// Обновленная конфигурация ограничений по доменам
const DOMAIN_CONFIG = {
  "app1.developtech.ru": {
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
  const config = DOMAIN_CONFIG[domain];
  if (!config) return { allowed: true };

  // Для app1 разрешаем только указанные маршруты
  if (domain === "app1.developtech.ru") {
    return {
      allowed: config.allowedRoutes.includes(to.name),
      redirect: config.redirectRoute,
    };
  }

  // Для app2 запрещаем только указанные маршруты
  if (domain === "app2.developtech.ru") {
    return {
      allowed: !config.blockedRoutes.includes(to.name),
      redirect: config.redirectRoute,
    };
  }

  // Для app4 разрешаем только указанные маршруты
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
  const currentDomain = window.location.hostname;
  const accountStore = useAccountStore();
  const token = accountStore.getAccountToken;

  // Сначала проверяем страницу сброса пароля
  if (to.name === "ResetPassword" && to.query.token) {
    return next(); // Разрешаем доступ к странице сброса пароля с токеном
  }

  // Затем проверяем доступ по домену
  const access = checkRouteAccess(to, currentDomain);
  if (!access.allowed) {
    console.warn(`Доступ запрещен для ${currentDomain}`);
    return next(access.redirect || "/");
  }

  // Страницы, доступные без токена
  const publicPages = [
    "Login",
    "Registration",
    "PasswordRecovery",
    "ResetPassword", // Добавляем сюда, но проверка уже выше
    "VerifyEmail",
  ];

  if (to.name === "NotFound") {
    return next();
  }

  // Если нет токена и это не публичная страница - на логин
  if (!token && !publicPages.includes(to.name)) {
    return next({ name: "Login" });
  }

  // Если есть токен и пользователь на публичной странице - на аккаунт
  if (token && publicPages.includes(to.name) && to.name !== "ResetPassword") {
    return next({ name: "PersonalAccount" });
  }

  // Обновление метаданных
  try {
    const { stationDomain } = useDomain();
    const pageTitle = stationDomain?.cosmetics?.titleLogo
      ? `${to.meta.title} | ${stationDomain.cosmetics.titleLogo}`
      : to.meta.title || "Touch-API";
    updatePageMetadata(pageTitle, stationDomain?.cosmetics?.urlLogo);
  } catch (error) {
    console.error("Ошибка метаданных:", error);
    updatePageMetadata(to.meta.title);
  }

  next();
});

const app = createApp(App);

app.config.errorHandler = (err) => {
  console.error("Global error", err);
};

app.use(pinia);
app.use(router);
app.use(i18n);

const themeStore = useThemeStore();
document.documentElement.setAttribute(
  "data-theme",
  themeStore.isDark ? "dark" : "light"
);

import axios from "axios";

axios.interceptors.request.use((config) => {
  config.metadata = { startTime: Date.now() };

  // Сохраняем тело запроса, если оно есть
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
      requestBody: response.config.metadata.requestBody, // Добавляем тело запроса
      responseHeaders: response.headers,
      responseBody: response.data, // Добавляем тело ответа
    };

    const requestsStore = useRequestsStore();
    requestsStore.addRequest(requestData);

    return response;
  },
  (error) => {
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
        requestBody: error.config.metadata?.requestBody, // Добавляем тело запроса
        responseHeaders: error.response.headers,
        responseBody: error.response.data, // Добавляем тело ответа
      };

      const requestsStore = useRequestsStore();
      requestsStore.addRequest(requestData);
    }

    return Promise.reject(error);
  }
);

app.mount("#app");
