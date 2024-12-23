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
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import Header from "./components/Header/Header.vue";
import Navigation from "./components/Navigation/Navigation.vue";

const phoneMenuStation = ref(false);

function phoneMenuOn() {
  phoneMenuStation.value = !phoneMenuStation.value;
}

// Получаем текущий маршрут и маршрутизатор
const route = useRoute();
const router = useRouter();

// Проверяем, является ли текущая страница одной из страниц: Login, Registration или PasswordRecovery
const isAuthPage = computed(() => {
  return (
    route.name === "Login" ||
    route.name === "Registration" ||
    route.name === "PasswordRecovery"
  );
});

// Проверка токена и перенаправление
onMounted(() => {
  const token = localStorage.getItem("accountToken");

  // Если токен существует и мы не на странице аутентификации, перенаправляем на Личный кабинет
  if (token && !isAuthPage.value) {
    router.push({ name: "PersonalAccount" });
  }
  // Если токена нет и мы не на странице аутентификации, перенаправляем на страницу Входа
  else if (!token && !isAuthPage.value) {
    router.push({ name: "Login" });
  }
});
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
