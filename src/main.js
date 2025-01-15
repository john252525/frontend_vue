import "./assets/main.css";
import { createRouter, createWebHistory } from "vue-router";
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
  {
    path: "/personal-account",
    name: "PersonalAccount",
    component: PersonalAccount,
  },
  { path: "/", name: "MainPage", component: MainPage },
  { path: "/mailing", name: "Mailing", component: Mailing },
  { path: "/login", name: "Login", component: Login },
  { path: "/registration", name: "Registration", component: Registration },
  {
    path: "/password-recovery",
    name: "PasswordRecovery",
    component: PasswordRecovery,
  },
  { path: "/test", name: "test", component: test },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("accountToken");
  const isAuthPage = ["Login", "Registration", "PasswordRecovery"].includes(
    to.name
  );

  console.log(`Navigating to: ${to.name}`);
  console.log(`Is Auth Page: ${isAuthPage}, Token: ${token}`);

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
