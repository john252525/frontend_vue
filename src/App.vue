<template>
  <div v-if="isLoading" class="loading-container">
    <div class="loader">Загрузка...</div>
  </div>

  <div v-else>
    <DownloadsBox />
    <Header
      v-if="!isAuthPage && !isWidgetMode && !isMailingMode"
      :phoneMenuOn="phoneMenuOn"
    />
    <div class="page-container" v-if="!isAuthPage">
      <Navigation
        v-if="isWidgetMode || isMailingMode"
        :phoneMenuStation="phoneMenuStation"
        :phoneMenuOn="phoneMenuOn"
        :chatStation="chatStation"
        :isWidgetMode="isWidgetMode"
        :chatsLoading="chatsLoading"
        :isMailingMode="isMailingMode"
        class="navigation-chat"
      />
      <Navigation
        v-else
        :phoneMenuStation="phoneMenuStation"
        :phoneMenuOn="phoneMenuOn"
        :chatStation="chatStation"
        :isWidgetMode="isWidgetMode"
        :chatsLoading="chatsLoading"
        :isMailingMode="isMailingMode"
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
  </div>
</template>

<script setup>
import {
  ref,
  watch,
  computed,
  onMounted,
  reactive,
  provide,
  nextTick,
} from "vue"; // Добавили nextTick
import { useRoute } from "vue-router";
import Header from "./components/Header/Header.vue";
import Navigation from "./components/Navigation/Navigation.vue";
import ResultModal from "./components/GlobalModal/ResutModal.vue";
import DownloadsBox from "./components/GlobalModal/GlobalLoadingBlock/DownloadsBox.vue";

import { useStationLoading } from "@/composables/useStationLoading";
const { stationLoading, setLoadingStatus } = useStationLoading();

const offModal = () => {
  setLoadingStatus(false);
};

const chatStation = ref(true);
const phoneMenuStation = ref(false);
const route = useRoute();
const chatsLoading = ref(true);
const isLoading = ref(true);

const chatsLoadingChange = () => {
  chatsLoading.value = !chatsLoading.value;
};

const phoneMenuOn = () => {
  phoneMenuStation.value = !phoneMenuStation.value;
  console.log("меню");
};

const checkChatStation = () => {
  chatStation.value = route?.name === "Chats";
};

const isAuthPage = computed(() => {
  if (!route.name) return true; // Пока роутер не инициализирован, считаем auth страницей
  const routeName = route.name.toString();
  return [
    "Login",
    "Registration",
    "PasswordRecovery",
    "VerifyEmail",
    "ResetPassword",
  ].includes(routeName);
});

const isMailingMode = computed(() => {
  return route?.query?.mode === "mailing";
});

const isWidgetMode = computed(() => {
  return route?.query?.mode === "widget";
});

const currentDomain = ref("");

// Убрали дублирующий onMounted и улучшили логику
onMounted(async () => {
  // Получаем текущий домен
  currentDomain.value = window.location.hostname;

  // Проверяем домены
  const myDomains = [
    "app1.developtech.ru",
    "app2.developtech.ru",
    "app3.developtech.ru",
    "app4.developtech.ru",
  ];

  if (myDomains.includes(currentDomain.value)) {
    console.log("Текущий домен:", currentDomain.value);
  } else {
    console.log("Неизвестный домен:", currentDomain.value);
  }

  // Ждем следующего тика для инициализации
  await nextTick();

  // Даем дополнительное время для полной инициализации роутера
  setTimeout(() => {
    isLoading.value = false;
  }, 150);
});

// Альтернативно: используем watch для отслеживания готовности роутера
watch(
  () => route?.fullPath,
  (newPath) => {
    if (newPath) {
      // Роутер готов, скрываем лоадер
      setTimeout(() => {
        isLoading.value = false;
      }, 100);
    }
  },
  { immediate: true }
);

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

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: var(--authBg);
}

.loader {
  font-size: 18px;
  color: var(--text-color);
}
</style>
