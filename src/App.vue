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
  <div v-else>
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

// Получаем текущий маршрут
const route = useRoute();

// Проверяем, является ли текущая страница одной из страниц: Login, Registration или PasswordRecovery
const isAuthPage = computed(() => {
  return (
    route.name === "Login" ||
    route.name === "Registration" ||
    route.name === "PasswordRecovery"
  );
});

function phoneMenuOn() {
  phoneMenuStation.value = !phoneMenuStation.value;
}
</script>

<style scoped>
main {
  flex: 1;
  box-sizing: border-box;
}

.page-container {
  display: flex;
}

.navigation {
  width: 260px;
}
</style>

Найти еще
