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
    component: PersonalAccount,
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
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

// Функция для обновления метаданных страницы
const updatePageMetadata = (title, logoUrl) => {
  document.title = title || "Ваше приложение";

  // Обновляем favicon
  let favicon = document.querySelector('link[rel="icon"]');
  if (!favicon) {
    favicon = document.createElement("link");
    favicon.rel = "icon";
    document.head.appendChild(favicon);
  }
  favicon.href = logoUrl || "/favicon.ico";
};

router.beforeEach(async (to, from, next) => {
  const token = localStorage.getItem("accountToken");
  const isAuthPage = ["Login", "Registration", "PasswordRecovery"].includes(
    to.name
  );

  // Получаем данные домена
  const { stationDomen } = useDomain();

  try {
    // Устанавливаем заголовок страницы с учетом доменных данных
    const pageTitle = stationDomen?.cosmetics?.titleLogo
      ? `${to.meta.title} | ${stationDomen.cosmetics.titleLogo}`
      : to.meta.title || "Ваше приложение";

    updatePageMetadata(pageTitle, stationDomen?.cosmetics?.urlLogo);
  } catch (error) {
    console.error("Ошибка при обновлении метаданных:", error);
    updatePageMetadata(to.meta.title);
  }

  if (token) {
    if (isAuthPage) {
      next({ name: "PersonalAccount" });
    } else {
      next();
    }
  } else {
    if (!isAuthPage) {
      next({ name: "Login" });
    } else {
      next();
    }
  }
});

const app = createApp(App);

// Глобальная обработка ошибок
app.config.errorHandler = (err) => {
  console.error("Глобальная ошибка Vue:", err);
};

app.use(pinia);
app.use(router);
app.use(i18n);

const theme = useThemeStore();
document.documentElement.setAttribute(
  "data-theme",
  theme.isDark ? "dark" : "light"
);

// Отложенное монтирование для инициализации данных
app.mount("#app").then(() => {
  console.log("Приложение успешно монтировано");
});
