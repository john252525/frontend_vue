<template>
  <aside
    class="pc-menu"
    :class="{ 'is-collapsed': isCollapsed }"
    v-if="stationDomain.navigate.value && !isMailingMode && !isWidgetMode"
  >
    <button class="menu-toggle-btn" @click="toggleMenu">
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        class="arrow-icon"
      >
        <path
          d="M15 18L9 12L15 6"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>

    <nav class="nav-container">
      <div
        v-for="(section, sectionName) in navSections"
        :key="sectionName"
        class="menu-section"
      >
        <div class="section-title-wrapper">
          <h3 class="section-title">{{ sectionName }}</h3>
        </div>

        <ul>
          <li
            v-for="item in section.items"
            :key="item.name"
            class="list-item"
            :class="{ active: item.isActive }"
            @click="handleItemClick(item)"
            :title="isCollapsed ? item.text : ''"
          >
            <div class="icon-container">
              <img
                :src="`data:image/svg+xml;utf8,${encodeURIComponent(item.icon)}`"
                class="svg-icon"
              />
            </div>
            <div class="text-container">
              <span class="page-text">{{ item.text }}</span>
            </div>
          </li>
        </ul>
      </div>
    </nav>
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
        class="menu-section-simple"
      >
        <ul>
          <li
            v-for="item in section.items"
            :key="item.name"
            class="list-item-simple"
            :class="{ active: item.isActive }"
            @click="handleItemClick(item)"
          >
            <img
              :src="`data:image/svg+xml;utf8,${encodeURIComponent(item.icon)}`"
              class="svg-icon"
            />
          </li>
        </ul>
      </div>
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
            class="list-item-simple"
            :class="{ active: item.isActive }"
            @click="handleItemClick(item)"
          >
            <img
              :src="`data:image/svg+xml;utf8,${encodeURIComponent(item.icon)}`"
              class="svg-icon"
            />
          </li>
        </ul>
      </div>
    </nav>
  </aside>

  <div class="mobile-menu" v-if="stationDomain.navigate.value && isMobile">
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
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
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
          <h3 class="section-title mobile-title">{{ sectionName }}</h3>
          <ul>
            <li
              v-for="item in section.items"
              :key="item.name"
              @click="handleMobileItemClick(item)"
              class="list-item mobile-item"
              :class="{ active: item.isActive }"
            >
              <template v-if="item.name === 'Support'">
                <a
                  href="mailto:maksim.test@mail.ru"
                  class="mobile-link"
                  @click.prevent="handleMobileItemClick(item)"
                >
                  <img
                    :src="`data:image/svg+xml;utf8,${encodeURIComponent(item.icon)}`"
                    class="svg-icon"
                  />
                  <p class="page">{{ item.text }}</p>
                </a>
              </template>
              <template v-else>
                <img
                  :src="`data:image/svg+xml;utf8,${encodeURIComponent(item.icon)}`"
                  class="svg-icon"
                />
                <p class="page">{{ item.text }}</p>
              </template>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <button
      class="mobile-menu-toggle"
      v-if="!mobileMenuOpen"
      @click="toggleMobileMenu"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
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
import { useNavigationConfig } from "@/config/navigation";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const { stationDomain } = useDomain();
const { navConfig } = useNavigationConfig();

const props = defineProps({
  isMailingMode: Boolean,
  isWidgetMode: Boolean,
});

const isWidgetMode = computed(() => props.isWidgetMode);
const route = useRoute();
const router = useRouter();

const isCollapsed = ref(false);
const toggleMenu = () => {
  isCollapsed.value = !isCollapsed.value;
};

const mobileMenuOpen = ref(false);
const isMobile = ref(false);

const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768;
};

onMounted(() => {
  checkMobile();
  window.addEventListener("resize", checkMobile);
});

const handleItemClick = (item) => {
  if (item.action) item.action();
  else navigateTo(item.name);
};

const handleMobileItemClick = (item) => {
  if (item.action) item.action();
  else navigateTo(item.name);
  toggleMobileMenu();
};

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value;
};

const navSections = computed(() => {
  const currentNav = stationDomain?.navigate?.value;
  if (!currentNav || !navConfig.value?.[currentNav]) return {};
  return {
    [t("navPage.main")]: {
      items: (navConfig.value[currentNav].main || []).filter(
        (item) => item.condition,
      ),
    },
    [t("navPage.settings")]: {
      items: (navConfig.value[currentNav].settings || []).filter(
        (item) => item.condition,
      ),
    },
    [t("navPage.help")]: {
      items: (navConfig.value[currentNav].help || []).filter(
        (item) => item.condition,
      ),
    },
  };
});

const navigateTo = (page) => {
  router.push(page);
};
</script>

<style scoped>
.pc-menu {
  --sidebar-width: 250px;
  --sidebar-collapsed-width: 80px;
  --primary-color: var(--textNavHover, #eef2ff);
  --icon-color: var(--svgColor, #555);
  --text-color: var(--text, #333);
  --anim-speed: 0.4s;
  --anim-curve: cubic-bezier(0.25, 0.8, 0.25, 1);

  position: sticky;
  top: 0;
  display: flex;
  flex-direction: column;
  width: var(--sidebar-width);
  background: #ffffff;
  height: calc(100vh - 57px);
  z-index: 10;
  box-shadow: 4px 0 24px rgba(0, 0, 0, 0.04);
  transition: width var(--anim-speed) var(--anim-curve);
  overflow: visible;
  box-sizing: border-box;
}

/* Свернутое состояние */
.pc-menu.is-collapsed {
  width: var(--sidebar-collapsed-width);
}

/* --- КНОПКА СВОРАЧИВАНИЯ --- */
.menu-toggle-btn {
  position: absolute;
  width: 32px;
  height: 32px;
  background: white;
  border: 1px solid #eee;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #666;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
  z-index: 50;
  transition: all var(--anim-speed) var(--anim-curve);

  /* Положение по умолчанию: сверху справа внутри меню */
  top: 16px;
  right: 16px;
}

.menu-toggle-btn:hover {
  background: #f8f9fa;
  transform: scale(1.05);
  color: #000;
}

/* Положение кнопки при свернутом меню: ВНИЗУ по центру */
.pc-menu.is-collapsed .menu-toggle-btn {
  top: auto; /* Сбрасываем top */
  bottom: 24px; /* Прижимаем к низу */
  right: 50%; /* Центрируем относительно ширины 80px */
  transform: translateX(50%) rotate(180deg); /* Сдвиг для точного центра + поворот стрелки */
}

.arrow-icon {
  transition: transform var(--anim-speed) var(--anim-curve);
}

/* --- КОНТЕЙНЕР НАВИГАЦИИ --- */
.nav-container {
  padding: 20px 12px; /* Внутренние отступы, чтобы hover не касался краев */
  width: 100%;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  box-sizing: border-box;
  /* Отступ снизу, чтобы контент не перекрывался кнопкой в свернутом режиме */
  padding-bottom: 70px;
}

.menu-section {
  margin-bottom: 24px;
}

/* Заголовок секции */
.section-title-wrapper {
  overflow: hidden; /* Чтобы скрывать текст плавно */
}

.section-title {
  font-family:
    system-ui,
    -apple-system,
    sans-serif;
  font-size: 11px;
  font-weight: 700;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 12px;
  padding-left: 14px;
  white-space: nowrap;

  opacity: 1;
  transition: opacity 0.2s ease;
}

.pc-menu.is-collapsed .section-title {
  opacity: 0;
  pointer-events: none;
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

/* --- ПУНКТ МЕНЮ (LIST ITEM) --- */
.list-item {
  display: flex;
  align-items: center;
  /* Убираем gap, отступы регулируем через text-container margin, чтобы анимация была плавнее */
  padding: 10px 14px;
  margin-bottom: 4px;
  cursor: pointer;
  border-radius: 12px;
  color: var(--text-color);
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
  position: relative;
  overflow: hidden;
  box-sizing: border-box; /* Важно: ширина включает паддинги */
  width: 100%; /* Занимает всю доступную ширину внутри паддингов контейнера */
}

/* Hover/Active - теперь они внутри nav-container и не выходят за границы */
.list-item:hover {
  background: rgba(204, 212, 245, 0.4);
}

.list-item.active {
  background: rgba(204, 212, 245, 0.4);
  color: #778ff2;
  font-weight: 500;
}

.list-item.active .svg-icon {
  fill: #778ff2;
}

/* --- ИКОНКИ --- */
.icon-container {
  min-width: 24px;
  width: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.svg-icon {
  width: 22px;
  height: 22px;
  fill: var(--icon-color);
  transition: fill 0.2s ease;
}

/* --- ТЕКСТ И АНИМАЦИЯ ИСЧЕЗНОВЕНИЯ --- */
.text-container {
  overflow: hidden;
  white-space: nowrap; /* Текст не переносится */
  /* Анимация ширины и прозрачности */
  max-width: 200px; /* Достаточно для текста */
  opacity: 1;
  margin-left: 12px; /* Отступ от иконки */
  transition:
    max-width var(--anim-speed) var(--anim-curve),
    opacity 0.2s ease,
    margin-left var(--anim-speed) var(--anim-curve);
}

.page-text {
  font-family:
    system-ui,
    -apple-system,
    sans-serif;
  font-size: 15px;
  font-weight: 400;
}

/* --- Стили при свернутом состоянии --- */
.pc-menu.is-collapsed .list-item {
  justify-content: center; /* Иконка по центру */
  padding: 12px 0; /* Уменьшаем боковые паддинги */
}

.pc-menu.is-collapsed .text-container {
  max-width: 0;
  opacity: 0;
  margin-left: 0; /* Убираем отступ, чтобы иконка была ровно по центру */
}

/* --- Стили для остальных режимов (Chat/Mobile) без изменений --- */
.chat-menu {
  position: sticky;
  top: 0;
  height: 100%;
  background-color: white;
  width: 80px;
  height: calc(100vh - 57px);
  position: fixed;
  left: 0;
  top: 57px;
  border-right: 1px solid #eee;
  z-index: 50;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 10px;
}
.nav-chat {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.logo-header-cont-chat {
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f0f0f0;
  width: 100%;
  display: flex;
  justify-content: center;
  cursor: pointer;
}
.logo-img {
  width: 2rem;
  height: auto;
}
.list-item-simple {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px;
  margin: 4px 0;
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.2s;
  width: 48px;
  height: 48px;
}
.list-item-simple:hover,
.list-item-simple.active {
  background-color: var(--primary-color);
}
.menu-section-simple,
.menu-section-mailing {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 10px;
}

/* Mobile */
.mobile-menu-toggle {
  position: fixed;
  bottom: 24px;
  left: 24px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  border: none;
}
.mobile-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
  z-index: 90;
  backdrop-filter: blur(2px);
}
.mobile-menu-overlay.active {
  opacity: 1;
  pointer-events: all;
}
.mobile-menu-content {
  position: fixed;
  top: 0;
  left: -100%;
  width: 280px;
  height: 100%;
  background: white;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 100;
  display: flex;
  flex-direction: column;
  box-shadow: 4px 0 20px rgba(0, 0, 0, 0.1);
}
.mobile-menu-content.active {
  transform: translateX(100%);
}
.mobile-menu-header {
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
}
.logo-header-cont {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.mobile-logo-title-cont {
  display: flex;
  align-items: center;
  gap: 12px;
}
.title {
  font-size: 20px;
  font-weight: 600;
}
.close-menu-btn {
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
}
.mobile-menu-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}
.mobile-title {
  padding-left: 0;
  margin-top: 10px;
}
.mobile-item {
  padding: 12px 0;
  border-radius: 0;
  border-bottom: 1px solid #f9f9f9;
}
.mobile-link {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  color: inherit;
  width: 100%;
}

@media (min-width: 769px) {
  .mobile-menu {
    display: none;
  }
}
@media (max-width: 768px) {
  .pc-menu,
  .chat-menu {
    display: none;
  }
}
</style>
