import "./assets/main.css";
import { createRouter, createWebHashHistory } from "vue-router";
import { createApp } from "vue";
import App from "./App.vue";
import PersonalAccount from "./pages/Account.vue";
import Login from "./pages/Login.vue";
import Registration from "./pages/Registration.vue";
import PasswordRecovery from "./pages/PasswordRecovery.vue";
import test from "./pages/test.vue";
import MainPage from "./pages/MainPage.vue";
import Mailing from "./pages/Mailing.vue";
import Chats from "./pages/Chats.vue";
import Payments from "./pages/Payments.vue";
import ChatsDataBase from "./pages/ChatsDataBase.vue";
import MessagesDataBase from "./pages/MessagesDataBase.vue";
import Setings from "./pages/Setings.vue";
import NotFound from "./pages/NotFound.vue";
import { useDomain } from "@/composables/getDomen";
import i18n from "./i18n";
import { createPinia } from "pinia";
import { useThemeStore } from "@/stores/theme";

const pinia = createPinia();

const routes = [
  {
    path: "/Accounts",
    name: "PersonalAccount",
    component: PersonalAccount,
    meta: { title: "Аккаунты" },
  },
  {
    path: "/settings",
    name: "Setings",
    component: Setings,
    meta: { title: "Настройки" },
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
  { path: "/chats", name: "Chats", component: Chats, meta: { title: "Чаты" } },
  {
    path: "/Mailing",
    name: "Mailing",
    component: Mailing,
    meta: { title: "Рассылки" },
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
    allowedRoutes: ["Setings", "Login", "Registration", "PasswordRecovery"],
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
  const token = localStorage.getItem("accountToken");

  // Пропускаем проверку для NotFound
  if (to.name === "NotFound") {
    return next();
  }

  // Проверка ограничений доступа по домену
  const access = checkRouteAccess(to, currentDomain);
  if (!access.allowed) {
    console.warn(`error`);
    return next(access.redirect || "/");
  }

  // Проверка авторизации
  const isAuthPage = ["Login", "Registration", "PasswordRecovery"].includes(
    to.name
  );

  if (token) {
    if (isAuthPage) {
      return next({ name: "PersonalAccount" });
    }
  } else {
    if (!isAuthPage) {
      return next({ name: "Login" });
    }
  }

  // Обновление метаданных страницы
  try {
    const { stationDomen } = useDomain();
    const pageTitle = stationDomen?.cosmetics?.titleLogo
      ? `${to.meta.title} | ${stationDomen.cosmetics.titleLogo}`
      : to.meta.title || "Touch-API";

    updatePageMetadata(pageTitle, stationDomen?.cosmetics?.urlLogo);
  } catch (error) {
    console.error("error", error);
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

app.mount("#app");
