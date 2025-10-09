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

const FRONTEND_URL_AUTH = import.meta.env.VITE_FRONTEND_URL_AUTH;
const LOG_SETTINGS = import.meta.env.VITE_LOG_SETTINGS || "all"; // off, all, error

import { computed } from "vue";

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

// ==================== СИСТЕМА ЛОГИРОВАНИЯ ====================
class Logger {
  constructor() {
    this.settings = LOG_SETTINGS;
    console.log(`[Logger] Инициализация с настройками: ${this.settings}`);
  }

  shouldLog(level = "info") {
    if (this.settings === "off") return false;
    if (this.settings === "error" && level !== "error") return false;
    return true;
  }

  info(message, data = null) {
    if (!this.shouldLog("info")) return;

    const timestamp = new Date().toISOString();
    const logMessage = `[INFO][${timestamp}] ${message}`;

    if (data) {
      console.log(logMessage, data);
    } else {
      console.log(logMessage);
    }

    this.sendToServer("INFO", message, data);
  }

  error(message, error = null) {
    if (!this.shouldLog("error")) return;

    const timestamp = new Date().toISOString();
    const logMessage = `[ERROR][${timestamp}] ${message}`;

    if (error) {
      console.error(logMessage, error);
    } else {
      console.error(logMessage);
    }

    this.sendToServer("ERROR", message, error);
  }

  warn(message, data = null) {
    if (!this.shouldLog("info")) return;

    const timestamp = new Date().toISOString();
    const logMessage = `[WARN][${timestamp}] ${message}`;

    if (data) {
      console.warn(logMessage, data);
    } else {
      console.warn(logMessage);
    }

    this.sendToServer("WARN", message, data);
  }

  debug(message, data = null) {
    if (!this.shouldLog("info")) return;

    const timestamp = new Date().toISOString();
    const logMessage = `[DEBUG][${timestamp}] ${message}`;

    if (data) {
      console.debug(logMessage, data);
    } else {
      console.debug(logMessage);
    }

    this.sendToServer("DEBUG", message, data);
  }

  async sendToServer(level, message, data = null) {
    // Пропускаем отправку если логирование отключено
    if (this.settings === "off") return;

    try {
      const accountStore = useAccountStore();
      const token = accountStore.getAccountToken;

      const logPayload = {
        level: level,
        message: message,
        data: data,
        timestamp: new Date().toISOString(),
        domain: "frontend_vue",
        url: window.location.href,
        userAgent: navigator.userAgent,
      };

      const config = {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      };

      // Отправляем лог в фоновом режиме без ожидания ответа
      axios
        .post("https://api28.apitter.com/api/createLog", logPayload, config)
        .then(() => {
          // Не логируем успешную отправку лога, чтобы избежать цикла
        })
        .catch((error) => {
          // Только консольная ошибка, без повторной отправки
          console.error(`[Logger] Ошибка отправки лога:`, error);
        });
    } catch (error) {
      console.error(`[Logger] Ошибка подготовки лога:`, error);
    }
  }
}

// Создаем глобальный экземпляр логгера
const logger = new Logger();

// Запрос разрешения на уведомления
if ("Notification" in window) {
  try {
    Notification.requestPermission()
      .then((permission) => {
        logger.info("Разрешение на уведомления:", permission);
      })
      .catch((error) => {
        logger.error("Ошибка при запросе уведомлений:", error);
      });
  } catch (error) {
    logger.error("Ошибка в Notification API:", error);
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
      logger.info("Запрошенный URL:", {
        path: window.location.pathname,
        token: token ? "present" : "absent",
      });

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

// Делаем логгер доступным глобально
app.config.globalProperties.$logger = logger;

import { useAccountStore } from "@/stores/accountStore";
const accountStore = useAccountStore();
const storedData = computed(() => accountStore.getAccountData);
const getAccountRefreshToken = computed(
  () => accountStore.getAccountRefreshToken
);

// ==================== ПЕРЕХВАТЧИК AXIOS ДЛЯ ОБНОВЛЕНИЯ ТОКЕНА ====================
const setupAxiosInterceptors = () => {
  logger.info("Настройка axios interceptors", {
    email: storedData.value,
    refreshToken: getAccountRefreshToken.value ? "present" : "absent",
  });

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

  // Функция для очистки данных и выхода
  const clearAuthDataAndRedirect = () => {
    logger.info("Очистка данных и перенаправление на логин");

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

  // Интерсептор для ответов
  axios.interceptors.response.use(
    (response) => {
      return response;
    },
    async (error) => {
      const originalRequest = error.config;

      // Если статус 401 и это не повторная попытка
      if (error.response?.status === 401 && !originalRequest._retry) {
        // Если это запрос на обновление токена - сразу выходим
        if (originalRequest.url?.includes("refreshToken")) {
          logger.error("Ошибка при обновлении токена - выход из системы");
          clearAuthDataAndRedirect();
          return Promise.reject(error);
        }

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
          logger.info("Попытка обновления токена");

          // Запрос на обновление токена
          const response = await axios.post(
            `${FRONTEND_URL_AUTH}refreshToken`,
            {
              refresh_token: getAccountRefreshToken.value,
              email: storedData.value,
            }
          );

          if (response.data.ok) {
            const newToken = response.data.data.token;

            accountStore.setAccountRefreshToken(
              response.data.data.refresh_token
            );
            accountStore.setAccountToken(response.data.data.token);

            // Обновляем заголовок и повторяем запрос
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            processQueue(null, newToken);

            logger.info("Токен успешно обновлен");
            return axios(originalRequest);
          } else {
            throw new Error("Token refresh failed");
          }
        } catch (refreshError) {
          logger.error("Не удалось обновить токен:", refreshError);

          // При любой ошибке обновления токена очищаем данные и выходим
          clearAuthDataAndRedirect();
          processQueue(refreshError, null);
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      // Если это другая 401 ошибка (не для обновления токена)
      if (error.response?.status === 401) {
        logger.error("Неавторизованный доступ - выход из системы");
        clearAuthDataAndRedirect();
      }

      return Promise.reject(error);
    }
  );
};

// ==================== ФУНКЦИЯ ДЛЯ ОТПРАВКИ ЛОГОВ (НЕБЛОКИРУЮЩАЯ) ====================
const sendLogToServer = async (logData) => {
  // Пропускаем логирование если отключено
  if (LOG_SETTINGS === "off") return;

  try {
    // Пропускаем логирование самих логов, чтобы избежать цикла
    if (logData.endpoint && logData.endpoint.includes("/api/createLog")) {
      return;
    }

    const accountStore = useAccountStore();
    const token = accountStore.getAccountToken;

    // Формируем payload только с данными, которые отправил пользователь
    const payloadData = {
      request: {
        body: logData.requestBody,
      },
    };

    const logPayload = {
      level: logData.status >= 400 ? "ERROR" : "SUCCESS",
      payload: payloadData,
      error: logData.error || null,
      message: logData.message || "",
      method: logData.method,
      endpoint: logData.endpoint,
      status: logData.status,
      domain: "frontend_vue",
      timestamp: new Date().toISOString(),
    };

    const config = {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    };

    // Отправляем лог в фоновом режиме без ожидания ответа
    axios
      .post("https://api28.apitter.com/api/createLog", logPayload, config)
      .then(() => {
        // Не логируем успешную отправку
      })
      .catch((error) => {
        // Только консольная ошибка
        console.error("[Log] Ошибка отправки лога:", error);
      });
  } catch (error) {
    console.error("[Log] Ошибка подготовки лога:", error);
  }
};

// ==================== ПЕРЕХВАТЧИКИ AXIOS ====================
axios.interceptors.request.use((config) => {
  config.metadata = {
    startTime: Date.now(),
    url: config.url,
    method: config.method?.toUpperCase() || "GET",
    isLogRequest: config.url?.includes("/api/createLog"),
    isRefreshToken: config.url?.includes("refreshToken"),
  };
  if (config.data) {
    config.metadata.requestBody = config.data;
  }
  return config;
});

axios.interceptors.response.use(
  (response) => {
    // Пропускаем логирование запросов самих логов И refreshToken
    if (
      response.config.metadata.isLogRequest ||
      response.config.metadata.isRefreshToken
    ) {
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

    // Отправка лога на сервер только если логирование включено
    if (LOG_SETTINGS !== "off") {
      // Для режима 'error' отправляем только ошибки
      if (
        LOG_SETTINGS === "all" ||
        (LOG_SETTINGS === "error" && response.status >= 400)
      ) {
        setTimeout(() => {
          sendLogToServer(requestData).catch((error) => {
            console.error("[Log] Фоновая отправка лога не удалась:", error);
          });
        }, 0);
      }
    }

    // Логируем в консоль в зависимости от настроек
    if (LOG_SETTINGS === "all") {
      logger.info(
        `HTTP ${response.status} ${response.config.method?.toUpperCase()} ${
          response.config.url
        }`,
        {
          duration: `${duration}ms`,
          status: response.status,
        }
      );
    } else if (LOG_SETTINGS === "error" && response.status >= 400) {
      logger.error(
        `HTTP ${response.status} ${response.config.method?.toUpperCase()} ${
          response.config.url
        }`,
        {
          duration: `${duration}ms`,
          status: response.status,
        }
      );
    }

    return response;
  },
  (error) => {
    // Пропускаем логирование ошибок запросов самих логов И refreshToken
    if (
      error.config?.metadata?.isLogRequest ||
      error.config?.metadata?.isRefreshToken
    ) {
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

      // Отправка лога на сервер только если логирование включено
      if (LOG_SETTINGS !== "off") {
        setTimeout(() => {
          sendLogToServer(requestData).catch((error) => {
            console.error("[Log] Фоновая отправка лога не удалась:", error);
          });
        }, 0);
      }

      // Логируем ошибки в консоль
      if (LOG_SETTINGS === "all" || LOG_SETTINGS === "error") {
        logger.error(
          `HTTP ${
            error.response.status
          } ${error.config.method?.toUpperCase()} ${error.config.url}`,
          {
            duration: `${duration}ms`,
            error: error.message,
            status: error.response.status,
          }
        );
      }
    } else {
      // Обработка сетевых ошибок
      const requestData = {
        url: error.config?.url || "unknown",
        method: error.config?.method?.toUpperCase() || "UNKNOWN",
        status: 0,
        duration: 0,
        timestamp: Date.now(),
        requestBody: error.config?.metadata?.requestBody,
        endpoint: error.config?.url || "unknown",
        message: "Network error",
        error: error.message,
      };

      // Отправка лога на сервер только если логирование включено
      if (LOG_SETTINGS !== "off") {
        setTimeout(() => {
          sendLogToServer(requestData).catch((error) => {
            console.error("[Log] Фоновая отправка лога не удалась:", error);
          });
        }, 0);
      }

      // Логируем сетевые ошибки
      if (LOG_SETTINGS === "all" || LOG_SETTINGS === "error") {
        logger.error(
          `NETWORK ERROR ${error.config?.method?.toUpperCase()} ${
            error.config?.url
          }`,
          {
            error: error.message,
          }
        );
      }
    }

    return Promise.reject(error);
  }
);

// Вызываем настройку перехватчиков
setupAxiosInterceptors();

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
  logger.info(`Проверка маршрута ${to.name} для домена ${domain}`);

  const publicPages = [
    "Login",
    "Registration",
    "PasswordRecovery",
    "VerifyEmail",
    "ResetPassword",
  ];

  if (publicPages.includes(to.name)) {
    logger.info(`Разрешен доступ к публичной странице ${to.name}`);
    return { allowed: true };
  }

  const config = DOMAIN_CONFIG[domain];
  if (!config) {
    logger.info(`Конфигурация для домена ${domain} отсутствует`);
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
    logger.info("Начало навигации", {
      from: from.fullPath,
      to: to.fullPath,
      routeName: to.name,
      query: to.query,
      domain: window.location.hostname,
    });

    const accountStore = useAccountStore();
    const token = accountStore.getAccountToken;
    logger.info("Токен авторизации", { token: token ? "present" : "absent" });

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
      logger.info("Страница NotFound, пропускаем");
      return next();
    }

    // Разрешаем публичные страницы без проверки токена
    if (publicPages.includes(to.name)) {
      logger.info(`Доступ к публичной странице ${to.name} разрешен`, {
        urlToken: to.query.token ? "present" : "absent",
      });

      // Проверка доступа по домену
      const currentDomain = window.location.hostname;
      const access = checkRouteAccess(to, currentDomain);
      logger.info("Результат проверки доступа", access);

      if (!access.allowed) {
        logger.warn(
          `Доступ запрещен для ${currentDomain} на маршрут ${to.name}`
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
        logger.error("Ошибка метаданных:", error);
        updatePageMetadata(to.meta.title);
      }
      return next();
    }

    // Проверка запрошенного URL для verify-email и reset-password
    const requestedPath = window.location.pathname;
    logger.info("Запрошенный URL", { path: requestedPath });

    if (requestedPath.includes("/verify-email") && to.name !== "VerifyEmail") {
      logger.info("Перенаправление на VerifyEmail");
      return next({ name: "VerifyEmail", query: to.query });
    } else if (
      requestedPath.includes("/reset-password") &&
      to.name !== "ResetPassword"
    ) {
      logger.info("Перенаправление на ResetPassword");
      return next({ name: "ResetPassword", query: to.query });
    }

    // Проверка доступа по домену для непубличных страниц
    const currentDomain = window.location.hostname;
    const access = checkRouteAccess(to, currentDomain);
    logger.info("Результат проверки доступа", access);

    if (!access.allowed) {
      logger.warn(`Доступ запрещен для ${currentDomain} на маршрут ${to.name}`);
      if (to.path !== access.redirect) {
        return next({ path: access.redirect || "/", query: to.query });
      }
      return next({ name: "Login", query: to.query });
    }

    // Если нет токена и это не публичная страница, перенаправляем на логин
    if (!token && !publicPages.includes(to.name)) {
      logger.info("Нет токена, перенаправление на Login");
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
      logger.info("Есть токен, перенаправление на PersonalAccount");
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
      logger.error("Ошибка метаданных:", error);
      updatePageMetadata(to.meta.title);
    }

    logger.info("Переход разрешен на", { route: to.name });
    next();
  } catch (error) {
    logger.error("Ошибка в router.beforeEach:", error);
    next({ name: "Login", query: to.query });
  }
});

app.config.errorHandler = (err) => {
  logger.error("Global error:", err);
};

const themeStore = useThemeStore();
document.documentElement.setAttribute(
  "data-theme",
  themeStore.isDark ? "dark" : "light"
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

export { logger };
