<template>
  <Header v-if="!isAuthPage" :phoneMenuOn="phoneMenuOn" />
  <div class="page-container" v-if="!isAuthPage">
    <Navigation
      :phoneMenuStation="phoneMenuStation"
      :phoneMenuOn="phoneMenuOn"
      class="navigation"
    />
    <main>
      <section>
        <router-view></router-view>
      </section>
    </main>
  </div>
  <div v-else class="auth-container">
    <router-view></router-view>
    <!-- Отображаем только router-view для страниц входа, регистрации и восстановления пароля -->
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRoute } from "vue-router";
import Header from "./components/Header/Header.vue";
import Navigation from "./components/Navigation/Navigation.vue";

const phoneMenuStation = ref(false);
const route = useRoute();

const phoneMenuOn = () => {
  phoneMenuStation.value = !phoneMenuStation.value;
};

const isAuthPage = computed(() => {
  return ["Login", "Registration", "PasswordRecovery"].includes(route.name);
});
</script>

<style scoped>
main {
  flex: 1;
  box-sizing: border-box;
  display: flex;
  overflow: hidden;
}
main > section {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: auto;
}
.page-container {
  display: flex;
}
.navigation {
  width: 260px;
}
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh; /* Полная высота для страниц аутентификации */
  background-color: #f0f0f0; /* Фоновый цвет для аутентификации */
}
</style>

Найти еще
