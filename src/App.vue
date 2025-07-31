<template>
  <Header v-if="!isAuthPage && !isWidgetMode" :phoneMenuOn="phoneMenuOn" />
  <div class="page-container" v-if="!isAuthPage">
    <Navigation
      v-if="isWidgetMode"
      :phoneMenuStation="phoneMenuStation"
      :phoneMenuOn="phoneMenuOn"
      :chatStation="chatStation"
      :isWidgetMode="isWidgetMode"
      :chatsLoading="chatsLoading"
      class="navigation-chat"
    />
    <Navigation
      v-else
      :phoneMenuStation="phoneMenuStation"
      :phoneMenuOn="phoneMenuOn"
      :chatStation="chatStation"
      :isWidgetMode="isWidgetMode"
      :chatsLoading="chatsLoading"
      class="navigation"
    />
    <ResultModal
      :changeStationLoadingModal="offModal"
      :stationLoading="stationLoading"
    />
    <main>
      <section>
        <router-view @routeChanged="checkChatStation"></router-view>
      </section>
    </main>
  </div>
  <div v-else class="auth-container">
    <router-view></router-view>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive, provide } from "vue";
import { useRoute } from "vue-router";
import Header from "./components/Header/Header.vue";
import Navigation from "./components/Navigation/Navigation.vue";
import ResultModal from "./components/GlobalModal/ResutModal.vue";

import { useStationLoading } from "@/composables/useStationLoading";
const { stationLoading, setLoadingStatus } = useStationLoading();

const offModal = () => {
  setLoadingStatus(false);
};

const chatStation = ref(true);
const phoneMenuStation = ref(false);
const route = useRoute();
const chatsLoading = ref(true);

const chatsLoadingChange = () => {
  chatsLoading.value = !chatsLoading.value;
};

const phoneMenuOn = () => {
  phoneMenuStation.value = !phoneMenuStation.value;
  console.log("меню");
};

const checkChatStation = () => {
  chatStation.value = route.name === "Chats";
};

const isAuthPage = computed(() => {
  return [
    "Login",
    "Registration",
    "PasswordRecovery",
    "VerifyEmail",
    "ResetPassword",
  ].includes(route.name);
});

const isWidgetMode = computed(() => {
  return route.query.mode === "widget";
});

const currentDomain = ref("");

onMounted(() => {
  // Получаем текущий домен
  currentDomain.value = window.location.hostname;

  // Выводим в консоль

  // Дополнительно можно проверить, какой это домен из ваших 4 вариантов
  const myDomains = [
    "app1.developtech.ru",
    "app2.developtech.ru",
    "app3.developtech.ru",
    "app4.developtech.ru",
  ];

  if (myDomains.includes(currentDomain.value)) {
  } else {
  }
});

function getDomen() {
  return currentDomain.value;
}

provide("domen", currentDomain);
provide("chatsLoadingChange", chatsLoadingChange);
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
  /* overflow: auto; */
}

.page-container {
  display: flex;
}

.navigation-chat {
  width: 60px;
}

.navigation {
  width: 230px;
}

.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: var(--authBg);
}
</style>
