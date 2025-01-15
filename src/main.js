import "./assets/main.css";
import { createRouter, createWebHistory } from "vue-router"; // Измените здесь
import { createApp } from "vue";
import App from "./App.vue";
import PersonalAccount from "./pages/Account.vue";
import Login from "./pages/Login.vue";
import Registration from "./pages/Registration.vue";
import PasswordRecovery from "./pages/PasswordRecovery.vue";
import test from "./pages/test.vue";
import MainPage from "./pages/MainPage.vue";
import Mailing from "./pages/Mailing.vue";

const routes = [
  { path: "/Accounts", name: "PersonalAccount", component: PersonalAccount },
  { path: "/", name: "MainPage", component: MainPage },
  { path: "/Mailing", name: "Mailing", component: Mailing },
  { path: "/login", name: "Login", component: Login },
  { path: "/registration", name: "Registration", component: Registration },
  { path: "/forgot", name: "PasswordRecovery", component: PasswordRecovery },
  { path: "/test", name: "test", component: test },
];

const router = createRouter({
  history: createWebHistory(), // Измените здесь
  routes,
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("accountToken");
  const isAuthPage = ["Login", "Registration", "PasswordRecovery"].includes(
    to.name
  );

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
app.use(router);
app.mount("#app");
