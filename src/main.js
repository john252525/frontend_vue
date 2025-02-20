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

const routes = [
  {
    path: "/Accounts",
    name: "PersonalAccount",
    component: PersonalAccount,
    meta: { title: "Аккаунты" },
  },
  {
    path: "/",
    name: "MainPage",
    component: MainPage,
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

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("accountToken");
  const isAuthPage = ["Login", "Registration", "PasswordRecovery"].includes(
    to.name
  );

  console.log(`Navigating to: ${to.name}`);
  console.log(`Is Auth Page: ${isAuthPage}, Token: ${token}`);

  // Устанавливаем заголовок страницы
  document.title = to.meta.title || "Ваше приложение";

  if (token) {
    if (isAuthPage) {
      console.log("Redirecting to PersonalAccount");
      next({ name: "PersonalAccount" });
    } else {
      next();
    }
  } else {
    if (!isAuthPage) {
      console.log("Redirecting to Login");
      next({ name: "Login" });
    } else {
      next();
    }
  }
});

const app = createApp(App);
app.use(router);
app.mount("#app");
