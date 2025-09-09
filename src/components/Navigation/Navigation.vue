<template>
  <!-- Desktop Menu -->
  <aside
    class="pc-menu"
    v-if="stationDomain.navigate.value && !isMailingMode && !isWidgetMode"
  >
    <nav v-if="!isWidgetMode">
      <!-- Основные секции меню -->
      <div
        v-for="(section, sectionName) in navSections"
        :key="sectionName"
        class="menu-section"
      >
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
            <p class="page">
              {{ item.text }}
            </p>
          </li>
        </ul>
      </div>
      <!-- <div class="footer-pc-menu">
        <LangSwither
          :isWidgetMode="isWidgetMode"
          class="theme-block"
          v-if="stationDomain.navigate.value !== 'settings'"
        />
      </div> -->
    </nav>

    <div v-if="!isWidgetMode" class="line"></div>
    <div v-else class="line-chat"></div>
  </aside>

  <aside v-if="isWidgetMode" class="chat-menu">
    <nav class="nav-chat">
      <div @click="navigateTo('accounts')" class="logo-header-cont-chat">
        <img
          :src="stationDomain.cosmetics.urlLogo"
          class="logo-img"
          alt="Logo"
        />
      </div>
      <div
        v-for="(section, sectionName) in navSections"
        :key="sectionName"
        class="menu-section"
      >
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
          </li>
        </ul>
      </div>
      <!-- <LangSwither
        :isWidgetMode="isWidgetMode"
        class="theme-block"
        v-if="stationDomain.navigate.value !== 'settings'"
      /> -->
    </nav>
  </aside>

  <aside v-if="isMailingMode" class="chat-menu">
    <nav class="nav-chat">
      <div
        v-for="(section, sectionName) in navSections"
        :key="sectionName"
        class="menu-section-mailing"
      >
        <ul>
          <li
            v-for="item in section.items"
            :key="item.name"
            class="list-mailing"
            :class="{ active: item.isActive }"
            @click="item.action ? item.action() : navigateTo(item.name)"
          >
            <img
              :src="`data:image/svg+xml;utf8,${encodeURIComponent(item.icon)}`"
              class="svg-icon"
            />
          </li>
        </ul>
      </div>
      <!-- <LangSwither
        :isWidgetMode="isWidgetMode"
        class="theme-block"
        v-if="stationDomain.navigate.value !== 'settings'"
      /> -->
    </nav>
    <div class="line-mailing"></div>
  </aside>

  <!-- Mobile Menu -->
  <div class="mobile-menu" v-if="stationDomain.navigate.value && isMobile">
    <!-- Mobile menu overlay -->
    <div
      class="mobile-menu-overlay"
      :class="{ active: mobileMenuOpen }"
      @click="toggleMobileMenu"
    ></div>

    <div class="mobile-menu-content" :class="{ active: mobileMenuOpen }">
      <div class="mobile-menu-header">
        <div class="logo-header-cont">
          <div
            v-if="!stationDomain.cosmetics.additionallyLogo"
            class="mobile-logo-title-cont"
          >
            <img
              :src="stationDomain.cosmetics.urlLogo"
              class="phone-logo"
              alt="Logo"
              @click="handleMobileItemClick({ name: 'accounts' })"
            />
            <h1 class="title">{{ stationDomain.cosmetics.logo }}</h1>
          </div>
          <div v-else class="mobile-logo-additionallyLogo-title-cont">
            <img
              :src="stationDomain.cosmetics.urlLogo"
              class="phone-logo-additionallyLogo"
              alt="Logo"
              @click="handleMobileItemClick({ name: 'accounts' })"
            />
            <img
              :src="stationDomain.cosmetics.additionallyLogo"
              class="phone-logo"
              alt="Logo"
              @click="handleMobileItemClick({ name: 'accounts' })"
            />
          </div>
          <button class="close-menu-btn" @click="toggleMobileMenu">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18 6L6 18"
                stroke="var(--text)"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M6 6L18 18"
                stroke="var(--text)"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      <div class="mobile-menu-body">
        <div
          v-for="(section, sectionName) in navSections"
          :key="sectionName"
          class="menu-section"
        >
          <h3 class="section-title">{{ sectionName }}</h3>
          <ul>
            <li
              v-for="item in section.items"
              :key="item.name"
              @click="handleMobileItemClick(item)"
              class="list"
              :class="{ active: item.isActive }"
            >
              <!-- Если это Support, используем <a href="mailto:"> -->
              <a
                v-if="item.name === 'Support'"
                href="mailto:maksim.test@mail.ru"
                style="
                  display: flex;
                  align-items: center;
                  gap: 12px;
                  text-decoration: none;
                  color: inherit;
                "
                @click.prevent="handleMobileItemClick(item)"
              >
                <img
                  :src="`data:image/svg+xml;utf8,${encodeURIComponent(
                    item.icon
                  )}`"
                  class="svg-icon"
                />
                <p class="page">{{ item.text }}</p>
              </a>

              <!-- Остальные пункты меню -->
              <template v-else>
                <img
                  :src="`data:image/svg+xml;utf8,${encodeURIComponent(
                    item.icon
                  )}`"
                  class="svg-icon"
                />
                <p class="page">{{ item.text }}</p>
              </template>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Mobile menu toggle button (hamburger) -->
    <button
      class="mobile-menu-toggle"
      v-if="!mobileMenuOpen"
      @click="toggleMobileMenu"
    >
    <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M3 12H21"
      stroke="var(--text)"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M3 6H21"
      stroke="var(--text)"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M3 18H21"
      stroke="var(--text)"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
    </button>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useDomain } from "@/composables/getDomain";
import LangSwither from "../LangSwither.vue";
import { useNavigationConfig } from "@/config/navigation";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const { stationDomain } = useDomain();
const { navConfig } = useNavigationConfig();

const props = defineProps({
  isMailingMode: Boolean,
  phoneMenuOn: Function,
  phoneMenuStation: Boolean,
  chatStation: Boolean,
  chatsLoading: Boolean,
  isWidgetMode: Boolean,
});

// Исправление ошибки с toRefs
const isWidgetMode = computed(() => props.isWidgetMode);

const route = useRoute();
const router = useRouter();
const mobileMenuOpen = ref(false);
const isMobile = ref(false);

// Проверка на мобильное устройство
const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768;
};

onMounted(() => {
  checkMobile();
  window.addEventListener("resize", checkMobile);
});

// Остальные функции без изменений
const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value;
};

const testbtn = () => {
  window.location.href = "mailto:maksim.test@mail.ru";
};

const handleMobileItemClick = (item) => {
  if (item.action) {
    item.action();
  } else {
    navigateTo(item.name);
  }
  toggleMobileMenu(); // Закрываем меню после клика
};
const navSections = computed(() => {
  const currentNav = stationDomain?.navigate?.value;
  if (!currentNav || !navConfig.value?.[currentNav]) return {};

  return {
    [t("navPage.main")]: {
      items: (navConfig.value[currentNav].main || []).filter(
        (item) => item.condition
      ),
    },
    [t("navPage.settings")]: {
      items: (navConfig.value[currentNav].settings || []).filter(
        (item) => item.condition
      ),
    },
    [t("navPage.help")]: {
      items: (navConfig.value[currentNav].help || []).filter(
        (item) => item.condition
      ),
    },
  };
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
/* Desktop Styles */
.pc-menu {
  display: flex;
  width: 230px;
  box-sizing: border-box;
  background: var(--bg);
}

nav {
  margin-top: 20px;
  width: 100%;
}

.chat-menu {
  border-right: 1px solid black;
  background-color: white;
  width: 60px;
  height: calc(100% - 57px);
}

.line-mailing {
  width: 0.5px;
  background-color: var(--line);
  position: absolute;
  z-index: 2;
  top: 56px;
  height: calc(100% - 57px);
  left: 60px;
}

.nav-chat {
  width: 60px;
  position: fixed;
  left: 0;
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

.menu-section-mailing {
  margin-bottom: 6px;
  border-bottom: 1.5px solid var(--line);
}

.menu-section {
  margin-bottom: 30px;
  border-bottom: 1.5px solid var(--line);
}

.logo-img {
  width: 2rem;
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

.mobile-logo-title-cont {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.title {
  font-size: 24px;
  font-weight: 500;
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
  height: 100vh;
}

.logo-img {
  height: 2rem;
  margin-left: 12px;
  margin-top: 10px;
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
  opacity: 0.5;
  pointer-events: none;
  cursor: not-allowed;
}

.list {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 4px;
  padding: 8px 0px 8px 16px;
  cursor: pointer;
}

.list-mailing {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 4px;
  padding: 8px 8px 8px 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.list-mailing:hover {
  background-color: var(--textNavHover);
  transition: all 0.3s ease;
  border-radius: 10px;
}

.list-mailing.active {
  background-color: var(--textNavHover);
  border-radius: 10px;
}

.list.active {
  background-color: var(--textNavHover);
  border-radius: 10px;
  width: 200px;
}

.logo-header-cont-chat {
  border-bottom: 1.5px solid var(--line);
  margin-bottom: 10px;
}

.list-mode {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 4px;
  padding: 8px 0px 8px 16px;
  cursor: pointer;
  border-radius: 10px;
  transition: all 0.3s ease;
}

.list-mode:hover {
  background-color: var(--textNavHover);
  transition: all 0.3s ease;
}

.list-mode.active {
  background-color: var(--textNavHover);
}

.mobile-logo-additionallyLogo-title-cont {
  display: flex;
  gap: 6px;
}

.list-chat {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 4px;
  padding: 8px 0px 8px 8px;
  cursor: pointer;
}

.phone-logo-additionallyLogo {
  width: 20%;
}

.list-chat.active {
  background-color: var(--textNavHover);
  border-radius: 10px;
  width: 35px;
}

.footer-pc-menu {
  position: absolute;
  bottom: 0;
  border-top: 1.5px solid var(--line);
  display: flex;
  align-items: center;
  justify-self: center;
}

.page {
  font-family: system-ui;
  font-size: 16px;
  font-weight: 400;
  color: var(--text);
}

.list:hover {
  background-color: var(--textNavHover);
  border-radius: 10px;
  width: 200px;
}

.list:hover .svg-icon path {
  fill: var(--iconNavHover);
}

/* Mobile Styles */
.mobile-menu {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
}

.mobile-menu-toggle {
  position: fixed;
  bottom: 30px;
  left: 20px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: var(--bg);
  border: 1px solid var(--line);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.mobile-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
  z-index: 999;
}

.mobile-menu-overlay.active {
  opacity: 1;
  pointer-events: all;
}

.mobile-menu-content {
  position: fixed;
  top: 0;
  left: -100%;
  width: 80%;
  max-width: 300px;
  height: 100%;
  background: var(--bg);
  transition: left 0.3s ease;
  z-index: 1000;
  display: flex;
  flex-direction: column;
}

.mobile-menu-content.active {
  left: 0;
}

.mobile-menu-header {
  padding: 12px 6px;
  border-bottom: 1px solid var(--line);
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.logo-header-cont {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.close-menu-btn {
  background: none;
  border: none;
  padding: 8px;
}

.mobile-menu-body {
  flex: 1;
  overflow-y: auto;
  /* padding: 16px; */
}

.mobile-menu-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border-top: 1px solid var(--line);
}

/* Responsive adjustments */
@media (min-width: 769px) {
  .mobile-menu {
    display: none;
  }
}

@media (max-width: 768px) {
  .pc-menu {
    display: none;
  }
  .chat-menu {
    display: none;
  }
}
</style>
