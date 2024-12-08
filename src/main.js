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
const routes = [
  { path: "/Accounts", name: "PersonalAccount", component: PersonalAccount },
  { path: "/", name: "MainPage", component: MainPage },
  { path: "/login", name: "Login", component: Login },
  { path: "/registration", name: "Registration", component: Registration },
  { path: "/forgot", name: "PasswordRecovery", component: PasswordRecovery },
  { path: "/test", name: "test", component: test },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

const app = createApp(App);
app.use(router);
app.mount("#app");
