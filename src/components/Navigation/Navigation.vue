<template>
  <aside class="pc-menu">
    <nav>
      <ul>
        <li @click="navigateTo('home')">
          <img src="/navigation/accaunts.svg" alt="Главная" />
          <p class="page">Главная</p>
        </li>
        <li @click="navigateTo('accounts')">
          <img src="/navigation/accaunts.svg" alt="Аккаунты" />
          <p class="page">Аккаунты</p>
        </li>
      </ul>
    </nav>
    <div class="line"></div>
  </aside>
  <div v-if="phoneMenuStation" class="black-fon" @click="phoneMenuOn">
    <aside class="phone-menu" @click.stop>
      <header class="logo-phone-cont">
        <h2 class="logo-phone">
          <img src="/header/logo.svg" alt="Логотип" />Name-<span>API</span>
        </h2>
        <img
          @click="phoneMenuOn"
          src="/navigation/close.svg"
          alt="Закрыть меню"
        />
      </header>
      <div class="line-menu"></div>
      <nav>
        <ul>
          <li @click="navigateTo('/')">
            <img src="/navigation/home.svg" alt="Главная" />
            <p class="page">Главная</p>
          </li>
          <li @click="navigateTo('Accounts')">
            <img src="/navigation/accaunts.svg" alt="Аккаунты" />
            <p class="page">Аккаунты</p>
          </li>
        </ul>
      </nav>
    </aside>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
const router = useRouter();

const props = defineProps({
  phoneMenuOn: {
    type: Function,
    required: true,
  },
  phoneMenuStation: {
    type: Boolean,
    required: true,
  },
});

const navigateTo = (page) => {
  router.push(page);
};
</script>

<style scoped>
.pc-menu {
  display: flex;
  width: 260px;
  box-sizing: border-box;
}

nav {
  margin-top: 20px;
  margin-left: 8px;
}

.line {
  width: 0.5px;
  background-color: #d9d9d9;
  position: absolute;
  top: 72px;
  height: calc(100% - 72px);
  left: 260px;
}

li {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 4px;
  padding: 10px 0px 10px 10px;
  cursor: pointer;
}

.page {
  font-weight: 400;
  font-size: 17px;
  color: #000;
}

li:hover {
  background-color: #eeeeee;
  border-radius: 10px;
  width: 233px;
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
}

.logo-phone {
  font-weight: 600;
  font-size: 26px;
  color: #000;
  display: flex;
  align-items: center;
  gap: 8px;
}

@media (max-width: 768px) {
  .pc-menu {
    display: none;
  }
}
</style>
