<template>
  <button
    class="mobile-toggle"
    @click="isOpen = !isOpen"
    :class="{ 'is-active': isOpen }"
  >
    <svg
      width="18"
      height="22"
      viewBox="0 0 18 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0.75 6.75C0.75 3.922 0.75 2.507 1.629 1.629C2.507 0.75 3.922 0.75 6.75 0.75H10.75C13.578 0.75 14.993 0.75 15.871 1.629C16.75 2.507 16.75 3.922 16.75 6.75V14.75C16.75 17.578 16.75 18.993 15.871 19.871C14.993 20.75 13.578 20.75 10.75 20.75H6.75C3.922 20.75 2.507 20.75 1.629 19.871C0.75 18.993 0.75 17.578 0.75 14.75V6.75Z"
        stroke="white"
        stroke-width="1.5"
      />
      <path
        d="M16.648 14.75H4.648C3.718 14.75 3.253 14.75 2.871 14.852C2.36231 14.9884 1.89849 15.2563 1.52618 15.6288C1.15386 16.0013 0.886165 16.4652 0.75 16.974"
        stroke="white"
        stroke-width="1.5"
      />
      <path
        d="M4.75 5.75H12.75M4.75 9.25H9.75"
        stroke="white"
        stroke-width="1.5"
        stroke-linecap="round"
      />
    </svg>
  </button>

  <div
    class="black-background"
    :class="{ 'is-visible': isOpen }"
    @click="isOpen = false"
  ></div>

  <aside class="sidebar" :class="{ 'is-open': isOpen }">
    <div class="sidebar-blur"></div>
    <div class="sidebar-header">
      <span class="logo-text">База Знаний</span>
    </div>

    <nav class="nav-content">
      <NavItem
        v-for="item in items"
        :key="item.path"
        :item="item"
        :loadDoc="loadDoc"
        :selectedPath="selectedPath"
        @click="handleNavClick"
      />
    </nav>
  </aside>
</template>

<script setup>
import { ref } from "vue";
import NavItem from "./NavItem.vue";

defineProps(["items", "loadDoc", "selectedPath"]);

const isOpen = ref(false);

// Закрываем меню при клике на пункт (актуально для мобилок)
const handleNavClick = () => {
  if (window.innerWidth <= 1024) {
    isOpen.value = false;
  }
};
</script>

<style scoped>
/* Базовые стили сайдбара (Десктоп) */
.sidebar {
  width: 280px;
  height: 100vh;
  position: sticky;
  top: 0;
  box-sizing: border-box;
  /* background: rgba(255, 255, 255, 0.8); */
  background: white;
  backdrop-filter: blur(10px);
  border-right: 1px solid #f3f4f6;
  display: flex;
  flex-direction: column;
  z-index: 1000;
  transition: transform 0.3s ease;
}

.sidebar-header {
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-text {
  font-weight: 700;
  font-size: 1.1rem;
  letter-spacing: -0.02em;
  color: #111827;
}

.nav-content {
  flex: 1;
  overflow-y: auto;
  padding: 0px 10px 40px;
}

.mobile-toggle {
  display: none;
  position: fixed;
  right: 20px;
  bottom: 20px;
  z-index: 101;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #10b981;
  color: white;
  border: none;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
  cursor: pointer;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.mobile-toggle.is-active {
  transform: rotate(-90deg);
  background: #1f2937;
}

/* Затемнение фона */
.black-background {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 99;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
}

.black-background.is-visible {
  opacity: 1;
  pointer-events: auto;
}

/* Мобильная адаптация */
@media (max-width: 1024px) {
  .sidebar {
    position: fixed;
    left: 0;
    transform: translateX(-100%);
  }

  .sidebar.is-open {
    transform: translateX(0);
  }

  .mobile-toggle,
  .black-background {
    display: flex;
  }
}
</style>
