import "./assets/main.css";
import { createRouter, createWebHistory } from "vue-router";
import { createApp } from "vue";
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
// import { useAccountStore } from "@/stores/accountStore";
// import { hookManager } from "@/hooks/HookManager";
import { useRequestsStore } from "@/stores/requests";
import axios from "axios";
import Support from "./pages/Support.vue";
import Help from "./pages/Help.vue";
import Profile from "./pages/Profile.vue";
import UserChats from "./pages/UserChats.vue";

import { computed } from "vue";

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

// Запрос разрешения на уведомления
if ("Notification" in window) {
  try {
    Notification.requestPermission()
      .then((permission) => {
        console.log("[main.js] Разрешение на уведомления:", permission);
      })
      .catch((error) => {
        console.error("[main.js] Ошибка при запросе уведомлений:", error);
      });
  } catch (error) {
    console.error("[main.js] Ошибка в Notification API:", error);
  }
}

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
    path: "/support",
    name: "Support",
    component: Support,
    meta: { title: "Тех. поддержка" },
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
      console.log(
        "[MainPage] Запрошенный URL:",
        window.location.pathname,
        "Токен:",
        token
      );
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

import { useAccountStore } from "@/stores/accountStore";
const accountStore = useAccountStore();
const storedData = computed(() => accountStore.getAccountData);
const getAccountRefreshToken = computed(
  () => accountStore.getAccountRefreshToken
);

// ==================== ПЕРЕХВАТЧИК AXIOS ДЛЯ ОБНОВЛЕНИЯ ТОКЕНА ====================
const setupAxiosInterceptors = () => {
  console.log(storedData.value, "email");
  console.log(getAccountRefreshToken.value, "token");
  let isRefreshing = false;
  let failedQueue = [];

  const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token);
      }
    });
    failedQueue = [];
  };

  // Интерсептор для ответов
  axios.interceptors.response.use(
    (response) => {
      return response;
    },
    async (error) => {
      const originalRequest = error.config;

      // Если статус 401 и это не повторная попытка
      if (error.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          // Если уже происходит обновление токена, добавляем запрос в очередь
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return axios(originalRequest);
            })
            .catch((err) => {
              return Promise.reject(err);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          // ЗАГЛУШКИ - замените на свою логику получения токенов
          const refreshToken = "your_refresh_token_here"; // useAccountStore().getRefreshToken
          const email = "user@example.com"; // useAccountStore().getAccountEmail

          // Запрос на обновление токена
          const response = await axios.post("/api/v1/auth/refreshToken", {
            refresh_token: refreshToken,
            email: email,
          });

          if (response.data.ok) {
            const newToken = response.data.data.token;

            // ЗАГЛУШКА - замените на свою логику сохранения токена
            // useAccountStore().setAccountToken(newToken);

            // Обновляем заголовок и повторяем запрос
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            processQueue(null, newToken);

            return axios(originalRequest);
          } else {
            throw new Error("Token refresh failed");
          }
        } catch (refreshError) {
          processQueue(refreshError, null);
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    }
  );
};

// Вызываем настройку перехватчиков
setupAxiosInterceptors();

// Конфигурация ограничений по доменам
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
  console.log(
    `[checkRouteAccess] Проверка маршрута ${to.name} для домена ${domain}`
  );
  const publicPages = [
    "Login",
    "Registration",
    "PasswordRecovery",
    "VerifyEmail",
    "ResetPassword",
  ];
  if (publicPages.includes(to.name)) {
    console.log(
      `[checkRouteAccess] Разрешен доступ к публичной странице ${to.name}`
    );
    return { allowed: true };
  }

  const config = DOMAIN_CONFIG[domain];
  if (!config) {
    console.log(
      `[checkRouteAccess] Конфигурация для домена ${domain} отсутствует`
    );
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
    console.log(
      "[main.js] Начало навигации. От:",
      from.fullPath,
      "К:",
      to.fullPath
    );
    console.log("[main.js] Имя маршрута:", to.name);
    console.log("[main.js] Query параметры:", to.query);
    console.log("[main.js] Домен:", window.location.hostname);

    const accountStore = useAccountStore();
    const token = accountStore.getAccountToken;
    console.log("[main.js] Токен:", token);

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
      console.log("[main.js] Страница NotFound, пропускаем");
      return next();
    }

    // Разрешаем публичные страницы без проверки токена
    if (publicPages.includes(to.name)) {
      console.log(`[main.js] Доступ к публичной странице ${to.name} разрешен`);
      if (to.query.token) {
        console.log(`[main.js] URL-токен:`, to.query.token);
      } else {
        console.log(`[main.js] URL-токен отсутствует`);
      }

      // Проверка доступа по домену
      const currentDomain = window.location.hostname;
      const access = checkRouteAccess(to, currentDomain);
      console.log("[main.js] Результат проверки доступа:", access);
      if (!access.allowed) {
        console.warn(
          `[main.js] Доступ запрещен для ${currentDomain} на маршрут ${to.name}`
        );
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
        console.error("[main.js] Ошибка метаданных:", error);
        updatePageMetadata(to.meta.title);
      }
      return next();
    }

    // Проверка запрошенного URL для verify-email и reset-password
    const requestedPath = window.location.pathname;
    console.log("[main.js] Запрошенный URL:", requestedPath);
    if (requestedPath.includes("/verify-email") && to.name !== "VerifyEmail") {
      console.log("[main.js] Перенаправление на VerifyEmail");
      return next({ name: "VerifyEmail", query: to.query });
    } else if (
      requestedPath.includes("/reset-password") &&
      to.name !== "ResetPassword"
    ) {
      console.log("[main.js] Перенаправление на ResetPassword");
      return next({ name: "ResetPassword", query: to.query });
    }

    // Проверка доступа по домену для непубличных страниц
    const currentDomain = window.location.hostname;
    const access = checkRouteAccess(to, currentDomain);
    console.log("[main.js] Результат проверки доступа:", access);
    if (!access.allowed) {
      console.warn(
        `[main.js] Доступ запрещен для ${currentDomain} на маршрут ${to.name}`
      );
      if (to.path !== access.redirect) {
        return next({ path: access.redirect || "/", query: to.query });
      }
      return next({ name: "Login", query: to.query });
    }

    // Если нет токена и это не публичная страница, перенаправляем на логин
    if (!token && !publicPages.includes(to.name)) {
      console.log("[main.js] Нет токена, перенаправление на Login");
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
      console.log("[main.js] Есть токен, перенаправление на PersonalAccount");
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
      console.error("[main.js] Ошибка метаданных:", error);
      updatePageMetadata(to.meta.title);
    }

    console.log("[main.js] Переход разрешен на", to.name);
    next();
  } catch (error) {
    console.error("[main.js] Ошибка в router.beforeEach:", error);
    next({ name: "Login", query: to.query });
  }
});

app.config.errorHandler = (err) => {
  console.error("[main.js] Global error:", err);
};

const themeStore = useThemeStore();
document.documentElement.setAttribute(
  "data-theme",
  themeStore.isDark ? "dark" : "light"
);

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
  }
);

app.mount("#app");
