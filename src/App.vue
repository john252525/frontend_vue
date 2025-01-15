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

// Получаем текущий маршрут
const router = useRouter();

function phoneMenuOn() {
  phoneMenuStation.value = !phoneMenuStation.value;
}

const isAuthPage = computed(() => {});

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
</style>
