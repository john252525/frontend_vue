<template>
  <Header v-if="!isAuthPage && !isWidgetMode" :phoneMenuOn="phoneMenuOn" />
  <div class="page-container" v-if="!isAuthPage && !isWidgetMode">
    <Navigation
      :phoneMenuStation="phoneMenuStation"
      :phoneMenuOn="phoneMenuOn"
      :chatStation="chatStation"
      :chatsLoading="chatsLoading"
      class="navigation"
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
import { ref, computed, provide } from "vue";
import { useRoute } from "vue-router";
import Header from "./components/Header/Header.vue";
import Navigation from "./components/Navigation/Navigation.vue";

const chatStation = ref(true);
const phoneMenuStation = ref(false);
const route = useRoute();
const chatsLoading = ref(true);

const chatsLoadingChange = () => {
  chatsLoading.value = !chatsLoading.value;
};

const phoneMenuOn = () => {
  phoneMenuStation.value = !phoneMenuStation.value;
};

const checkChatStation = () => {
  chatStation.value = route.name === "Chats";
};

const isAuthPage = computed(() => {
  return ["Login", "Registration", "PasswordRecovery"].includes(route.name);
});

const isWidgetMode = computed(() => {
  return route.query.mode === "widget";
});

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
  height: 100vh;
  background-color: #f0f0f0;
}
</style>
