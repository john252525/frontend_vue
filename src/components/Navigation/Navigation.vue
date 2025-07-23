<template>
  <aside class="pc-menu" v-if="stationDomain.navigate.value">
    <nav v-if="!isWidgetMode">
      <LangSwither
        :isWidgetMode="isWidgetMode"
        class="theme-block"
        v-if="stationDomain.navigate.value !== 'settings'"
      />
      
      <!-- Основные секции меню -->
       
      <div v-for="(section, sectionName) in navSections" :key="sectionName" class="menu-section">
        <h3 class="section-title">{{ sectionName }}</h3>
        <ul>
          <li
            v-for="item in section.items"
            :key="item.name"
            class="list"
            :class="{ active: item.isActive }"
            @click="item.action ? item.action() : navigateTo(item.name)"
          >
            <img
              :src="`data:image/svg+xml;utf8,${encodeURIComponent(item.icon)}`"
              class="svg-icon"
            />
            <p class="page">{{ item.text }}</p>
          </li>
        </ul>
        <!-- <div class="section-divider" v-if="sectionName !== 'Помощь'"></div> -->
      </div>
    </nav>

    <nav class="nav-chat" v-else>
      <LangSwither
        :isWidgetMode="isWidgetMode"
        class="theme-block"
        v-if="stationDomain.navigate.value !== 'settings'"
      />
      <div @click="navigateTo('accounts')" class="logo-header-cont-chat">
        <!-- Логотип -->
      </div>
      <ul>
        <li
          v-for="item in filteredItems"
          :key="item.name"
          :class="{ active: item.isActive }"
          class="list-chat"
          @click="item.action ? item.action() : navigateTo(item.name)"
        >
          <img
            :src="`data:image/svg+xml;utf8,${encodeURIComponent(item.icon)}`"
            class="svg-icon-chat"
          />
        </li>
      </ul>
    </nav>
    <div v-if="!isWidgetMode" class="line"></div>
    <div v-else class="line-chat"></div>
  </aside>
</template>

<script setup>
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useDomain } from "@/composables/getDomain";
import LangSwither from "../LangSwither.vue";
import { useNavigationConfig } from "@/config/navigation";
import { useI18n } from "vue-i18n";
import { onMounted } from "vue";

const { t } = useI18n();
const { stationDomain } = useDomain();
const { navConfig } = useNavigationConfig();

const props = defineProps({
  phoneMenuOn: Function,
  phoneMenuStation: Boolean,
  chatStation: Boolean,
  chatsLoading: Boolean,
  isWidgetMode: Boolean,
});

const route = useRoute();
const router = useRouter();
const isOpen = ref(false);

const navSections = computed(() => {
  const currentNav = stationDomain.navigate.value;
  if (!navConfig.value[currentNav]) return {};
  
  return {
    'Основное': {
      items: (navConfig.value[currentNav].main || []).filter(item => item.condition)
    },
    'Настройки': {
      items: (navConfig.value[currentNav].settings || []).filter(item => item.condition)
    },
    'Помощь': {
      items: (navConfig.value[currentNav].help || []).filter(item => item.condition)
    }
  };
});

const filteredItems = computed(() => {
  const currentNav = stationDomain.navigate.value;
  return navConfig.value[currentNav]?.items?.filter(item => item.condition) || [];
});

const navigateTo = (page) => {
  router.push(page);
};

const isActive = (routeName) => {
  return route.name === routeName;
};

const isChatPage = computed(() => {
  return route.name === "Chats";
});
</script>

<style scoped>
.pc-menu {
  display: flex;
  width: 200px;
  box-sizing: border-box;
  background: var(--bg);
}

nav {
  margin-top: 20px;
  width: 100%;
}

.logo-header {
  font-family: system-ui;
  font-weight: 500;
  font-size: 24px;
  color: var(--text);
  display: flex;
  align-items: center;
  gap: 8px;
}

.menu-section {
  margin-bottom: 30px;
  border-bottom: 1.5px solid var(--line);
}

.section-title {
  font-family: system-ui;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
  margin-left: 8px;
  margin-bottom: 12px;
  text-transform: uppercase;
}

.section-divider {
  height: 1px;
  background-color: var(--line);
  margin: 16px 0;
  /* background-color: red; */
}

.svg-icon {
  width: 22px;
  height: 22px;
  fill: var(--svgColor);
  transition: all 75ms;
}

.svg-icon-chat {
  width: 26px;
  height: 26px;
  fill: var(--svgColor);
  transition: all 75ms;
}

.line {
  width: 0.5px;
  background-color: var(--line);
  position: absolute;
  z-index: 2;
  top: 45px;
  height: calc(100% - 57px);
  left: 230px;
}

.line-chat {
  width: 0.5px;
  background-color: var(--line);
  position: absolute;
  z-index: 2;
  left: 60px;
  top: 56px;
  height: calc(100% - 57px);
}

.logo-img {
  height: 2rem;
}

.list-chats-loading {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 4px;
  padding: 8px 0px 8px 8px;
  cursor: pointer;
}

.list-chats-loading.disabled {
  opacity: 0.5; /* Делаем элемент полупрозрачным */
  pointer-events: none; /* Отключаем возможность клика */
  cursor: not-allowed; /* Меняем курсор на "запрещено" */
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
.list {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 4px;
  padding: 8px 0px 8px 16px;
  cursor: pointer;
}

.list.active {
  background-color: var(--textNavHover);
  border-radius: 10px;
  width: 200px;
}

.list-chat {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 4px;
  padding: 8px 0px 8px 8px;
  cursor: pointer;
}

.list-chat.active {
  background-color: var(--textNavHover);
  border-radius: 10px;
  width: 35px;
}

.drop-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
  padding: 8px 0px 8px 20px;
  cursor: pointer;
  /* background-color: red; */
}

.logo-header-cont-chat {
  margin-bottom: 20px;
  margin-left: 2px;
  cursor: pointer;
}

.drop-item:hover {
  background-color: #eeeeee;
  border-radius: 10px;
  width: 190px;
}

.drop-item:hover .svg-icon path {
  fill: #111827;
}

.theme-block {
  position: absolute;
  bottom: 0;
  left: 0;
}

.page {
  font-family: system-ui;
  font-size: 16px;
  font-weight: 400;
  color: var(--text);
}

.page-drop {
  font-family: system-ui;
  font-size: 16px;
  font-weight: 400;
  color: black;
}

.list:hover {
  background-color: var(--textNavHover);
  border-radius: 10px;
  width: 200px;
}

.list:hover .svg-icon path {
  fill: var(--iconNavHover);
}


.phone-menu nav ul {
  opacity: 0;
  transition: opacity 0.2s ease-in-out 0.1s;
}

.phone-menu.active nav ul {
  opacity: 1;
}

.phone-menu-chat {
  /* width: 260px; */
  height: 100vh;
  box-sizing: border-box;
  position: fixed;
  z-index: 10;
  background-color: white;
}

.phone-menu {
  position: fixed;
  top: 0;
  left: -230px; /* Скрыто за пределами экрана */
  width: 230px;
  height: 100vh;
  background: var(--bg);
  /* transition: all 0.3s ease; */
  z-index: 1000; /* Должен быть выше оверлея */
}

.phone-menu.active {
  left: 0;
  /* transition: all 0.3s ease; */
}

.phone-menu {
  will-change: transform, left;
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
