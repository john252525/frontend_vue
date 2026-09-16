<template>
  <div v-if="isLoading" class="loading-container">
    <div class="loader">Загрузка...</div>
  </div>

  <div v-else class="app-wrapper">
    <HelpModal />
    <FeedbackModal />
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
        class="navigation-wrapper"
      />
      <Navigation
        v-else
        :phoneMenuStation="phoneMenuStation"
        :phoneMenuOn="phoneMenuOn"
        :chatStation="chatStation"
        :isWidgetMode="isWidgetMode"
        :chatsLoading="chatsLoading"
        :isMailingMode="isMailingMode"
        class="navigation-wrapper"
      />

      <ResultModal
        :changeStationLoadingModal="offModal"
        :stationLoading="stationLoading"
      />

      <main class="main-content">
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
import { ref, watch, computed, onMounted, provide, nextTick } from "vue";
import { useRoute } from "vue-router";
import Header from "./components/Header/Header.vue";
import Navigation from "./components/Navigation/Navigation.vue";
import ResultModal from "./components/GlobalModal/ResutModal.vue";
import DownloadsBox from "./components/GlobalModal/GlobalLoadingBlock/DownloadsBox.vue";
import HelpModal from "./components/GlobalModal/HeplModal/HelpModal.vue";
import FeedbackModal from "./components/GlobalModal/FeedbackModal/FeedbackModal.vue";

import { useStationLoading } from "@/composables/useStationLoading";
const { stationLoading, setLoadingStatus } = useStationLoading();

import { usePermissions } from "@/composables/usePermissions";
import { useCompanyApi } from "@/composables/useCompanyApi";
import { useCompanyStore } from "@/stores/companyStore";
const { isOwner, currentRole } = usePermissions();
const { fetchRolePermissions } = useCompanyApi();
const companyStore = useCompanyStore();

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
  if (!route.name) return true;
  const routeName = route.name.toString();
  return [
    "Login",
    "Registration",
    "PasswordRecovery",
    "VerifyEmail",
    "ResetPassword",
    "LoginByLink",
  ].includes(routeName);
});

const isMailingMode = computed(() => {
  return route?.query?.mode === "mailing";
});

const isWidgetMode = computed(() => {
  return route?.query?.mode === "widget";
});

const currentDomain = ref("");

onMounted(async () => {
  currentDomain.value = window.location.hostname;
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

  // Реальные (возможно, изменённые владельцем) права роли нужны сразу везде
  // в приложении, а не только на странице "Организация" — иначе can()
  // молча падает на DEFAULT_PERMISSIONS, даже если владелец уже урезал
  // права этой роли и сохранил их на бэке. Важно: запрашиваем ТОЛЬКО права
  // своей собственной роли (fetchRolePermissions), а не всех трёх разом
  // (fetchRolesAll) — тот метод предназначен для владельца, который
  // настраивает матрицу целиком в RolesTab.vue; сотруднику бэк на попытку
  // посмотреть чужие роли отвечает 403 "Access denied".
  if (!isOwner.value && currentRole.value) {
    fetchRolePermissions(currentRole.value)
      .then((permissions) => {
        // Пустой объект — не то же самое, что "прав нет": это бэковский
        // ответ для роли, которую ещё ни разу не сохраняли. Не кладём его в
        // стор — иначе он (truthy) перебьёт DEFAULT_PERMISSIONS в
        // usePermissions.js.
        if (permissions && Object.keys(permissions).length > 0) {
          companyStore.setRolePermissions(currentRole.value, permissions);
        }
      })
      .catch(() => {
        // Роль ещё ни разу не сохранялась или бэк отказал — молча остаёмся
        // на DEFAULT_PERMISSIONS, это ожидаемое состояние, а не сбой.
      });
  }

  await nextTick();
  setTimeout(() => {
    isLoading.value = false;
  }, 150);
});

watch(
  () => route?.fullPath,
  (newPath) => {
    if (newPath) {
      setTimeout(() => {
        isLoading.value = false;
      }, 100);
    }
  },
  { immediate: true },
);

provide("domen", currentDomain);
provide("chatsLoadingChange", chatsLoadingChange);
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
}

html,
body {
  height: 100%;
  width: 100%;
}

.app-wrapper {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  overflow: hidden;
  background-color: var(--bg); /* Гарантируем фон */
}

/* Контейнер страницы (Меню + Контент) */
.page-container {
  display: flex;
  flex: 1; /* Занимает всю высоту под хедером */
  overflow: hidden; /* Скроллится только контент внутри */
  position: relative;
}

/* Обертка для навигации */
.navigation-wrapper {
  flex-shrink: 0; /* Меню не сжимается меньше своего размера */
  height: 100%;
  z-index: 10;
  /* Ширину не задаем! Она придет из компонента Navigation */
}

/* Основной контент */
.main-content {
  flex: 1; /* РЕЗИНОВАЯ ВЕРСТКА: Занимает всё оставшееся место */
  min-width: 0; /* Критично для flexbox, чтобы контент не распирал контейнер */
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;

  /* Убрали margin-left: 230px, так как теперь флекс сам распределяет место */
  margin-left: 0;
  transition: all 0.3s ease; /* Плавность, если будут изменения */
}

.main-content > section {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: auto; /* Скролл только внутри секции */
  padding: 0;
}

/* Loading / Auth screens */
.auth-container,
.loading-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  height: 100vh;
  overflow-y: auto;
  background-color: var(--authBg);
}

.loader {
  font-size: 18px;
  color: var(--text-color);
}

/* Адаптивность */
@media (max-width: 768px) {
  .page-container {
    flex-direction: column;
  }

  .navigation-wrapper {
    /* На мобилках меню часто position: fixed или скрыто */
    position: absolute;
    height: 100%;
  }

  .main-content {
    margin-left: 0;
  }
}
</style>
