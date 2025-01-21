<template>
  <aside class="pc-menu" v-if="!isChatPage">
    <nav>
      <ul>
        <li @click="navigateTo('/')">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="svg-icon"
            viewBox="0 0 16 16"
          >
            <path
              d="M8.707 1.5a1 1 0 0 0-1.414 0L.646 8.146a.5.5 0 0 0 .708.708L2 8.207V13.5A1.5 1.5 0 0 0 3.5 15h9a1.5 1.5 0 0 0 1.5-1.5V8.207l.646.647a.5.5 0 0 0 .708-.708L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293zM13 7.207V13.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V7.207l5-5z"
            ></path>
          </svg>
          <p class="page">Главная</p>
        </li>
        <li @click="navigateTo('accounts')">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="svg-icon"
            viewBox="0 0 16 16"
          >
            <path
              d="M15 14s1 0 1-1-1-4-5-4-5 3-5 4 1 1 1 1zm-7.978-1L7 12.996c.001-.264.167-1.03.76-1.72C8.312 10.629 9.282 10 11 10c1.717 0 2.687.63 3.24 1.276.593.69.758 1.457.76 1.72l-.008.002-.014.002zM11 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4m3-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0M6.936 9.28a6 6 0 0 0-1.23-.247A7 7 0 0 0 5 9c-4 0-5 3-5 4q0 1 1 1h4.216A2.24 2.24 0 0 1 5 13c0-1.01.377-2.042 1.09-2.904.243-.294.526-.569.846-.816M4.92 10A5.5 5.5 0 0 0 4 13H1c0-.26.164-1.03.76-1.724.545-.636 1.492-1.256 3.16-1.275ZM1.5 5.5a3 3 0 1 1 6 0 3 3 0 0 1-6 0m3-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4"
            ></path>
          </svg>
          <p class="page">Аккаунты</p>
        </li>
        <li @click="navigateTo('Mailing')">
          <img src="/navigation/accaunts.svg" alt="Аккаунты" />
          <p class="page">Рассылки</p>
        </li>
      </ul>
    </nav>
    <div class="line"></div>
  </aside>

  <div
    v-if="phoneMenuStation && (chatStation || isChatPage)"
    class="black-fon"
    @click="phoneMenuOn"
  >
    <aside class="phone-menu" @click.stop>
      <div class="logo-header-cont">
        <h2 class="logo-header">
          <img
            src="https://static.tildacdn.com/tild3630-6562-4930-b532-356635636363/favicon.ico"
            class="logo-img"
            alt="Logo"
          />
          Touch-API
        </h2>
      </div>
      <div class="line-menu"></div>
      <nav>
        <ul>
          <li @click="clickMenu('/')">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="svg-icon"
              viewBox="0 0 16 16"
            >
              <path
                d="M8.707 1.5a1 1 0 0 0-1.414 0L.646 8.146a.5.5 0 0 0 .708.708L2 8.207V13.5A1.5 1.5 0 0 0 3.5 15h9a1.5 1.5 0 0 0 1.5-1.5V8.207l.646.647a.5.5 0 0 0 .708-.708L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293zM13 7.207V13.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V7.207l5-5z"
              ></path>
            </svg>
            <p class="page">Главная</p>
          </li>
          <li @click="clickMenu('accounts')">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              class="svg-icon"
              viewBox="0 0 16 16"
            >
              <path
                d="M15 14s1 0 1-1-1-4-5-4-5 3-5 4 1 1 1 1zm-7.978-1L7 12.996c.001-.264.167-1.03.76-1.72C8.312 10.629 9.282 10 11 10c1.717 0 2.687.63 3.24 1.276.593.69.758 1.457.76 1.72l-.008.002-.014.002zM11 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4m3-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0M6.936 9.28a6 6 0 0 0-1.23-.247A7 7 0 0 0 5 9c-4 0-5 3-5 4q0 1 1 1h4.216A2.24 2.24 0 0 1 5 13c0-1.01.377-2.042 1.09-2.904.243-.294.526-.569.846-.816M4.92 10A5.5 5.5 0 0 0 4 13H1c0-.26.164-1.03.76-1.724.545-.636 1.492-1.256 3.16-1.275ZM1.5 5.5a3 3 0 1 1 6 0 3 3 0 0 1-6 0m3-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4"
              ></path>
            </svg>
            <p class="page">Аккаунты</p>
          </li>
          <li @click="clickMenu('Mailing')">
            <img src="/navigation/accaunts.svg" alt="Рассылки" />
            <p class="page">Рассылки</p>
          </li>
        </ul>
      </nav>
    </aside>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";

const props = defineProps({
  phoneMenuOn: Function,
  phoneMenuStation: Boolean,
  chatStation: Boolean,
});

const route = useRoute();
const router = useRouter();

const clickMenu = (page) => {
  props.phoneMenuOn();
  router.push(page);
};

const navigateTo = (page) => {
  router.push(page);
};

const isChatPage = computed(() => {
  return route.name === "Chats";
});
</script>

<style scoped>
.pc-menu {
  display: flex;
  width: 230px;
  box-sizing: border-box;
}

nav {
  margin-top: 20px;
  margin-left: 8px;
}

.logo-header {
  font-family: system-ui;
  font-weight: 500;
  font-size: 24px;
  color: #000;
  display: flex;
  align-items: center;
  gap: 8px;
}

.svg-icon {
  width: 22px; /* 24px */
  height: 22px; /* 24px */
  fill: #6b7280; /* Tailwind gray-500 */
  transition: all 75ms; /* Переход для всех свойств за 75 мс */
}

.line {
  width: 0.5px;
  background-color: #ebebeb;
  position: absolute;
  top: 56px;
  height: calc(100% - 57px);
  left: 230px;
}

.logo-img {
  height: 2rem;
}

li {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 4px;
  padding: 8px 0px 8px 8px;
  cursor: pointer;
}

.page {
  font-family: system-ui;
  font-size: 16px;
  font-weight: 400;
  color: black;
}

li:hover {
  background-color: #eeeeee;
  border-radius: 10px;
  width: 200px;
}

li:hover .svg-icon path {
  fill: #111827;
}

.black-fon {
  position: absolute;
  z-index: 5;
  width: 100%;
  height: 100vh;
  background: rgba(117, 117, 117, 0.3);
  top: 0;
  left: 0;
}

.phone-menu-chat {
  width: 260px;
  height: 100vh;
  box-sizing: border-box;
  position: fixed;
  z-index: 10;
  background-color: white;
}

.phone-menu {
  width: 260px;
  height: 100vh;
  box-sizing: border-box;
  position: fixed;
  z-index: 10;
  background-color: white;
}

.logo-phone-cont {
  display: flex;
  align-items: center;
  gap: 30px;
  margin-left: 15px;
  margin-top: 20px;
}

.line-menu {
  width: 100%;
  height: 0.5px;
  background-color: #d9d9d9;
  margin-top: 20px;
  margin-bottom: 20px;
}

.logo-phone {
  font-weight: 600;
  font-size: 26px;
  color: #000;
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo-header-cont {
  display: flex;
  align-items: center;
  gap: 20px;
  width: 215px;
  margin-left: 16px;
  margin-top: 20px;
}

.icon {
  width: 24px; /* Adjust the size if necessary */
  height: 24px; /* Adjust the size if necessary */
  fill: currentColor; /* Allows for color inheritance */
  transition: fill 0.3s; /* Smooth transition for color changes */
}

.icon:hover {
  fill: #1a202c; /* Change color on hover */
}

.dark .icon {
  fill: #a0aec0; /* Dark mode color */
}

.dark .icon:hover {
  fill: #f7fafc; /* Dark mode hover color */
}

@media (max-width: 768px) {
  .pc-menu {
    display: none; /* Hide PC menu on mobile */
  }

  .phone-menu {
    display: block; /* Show mobile menu */
  }
}
</style>
