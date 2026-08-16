<template>
  <div class="theme-switcher" role="radiogroup" aria-label="Тема оформления">
    <button
      type="button"
      class="theme-option"
      :class="{ 'theme-option--active': theme.mode === 'light' }"
      title="Светлая тема"
      aria-label="Светлая тема"
      :aria-pressed="theme.mode === 'light'"
      @click="theme.setMode('light')"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <circle cx="12" cy="12" r="4" />
        <path
          d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
        />
      </svg>
    </button>

    <button
      type="button"
      class="theme-option"
      :class="{ 'theme-option--active': theme.mode === 'system' }"
      title="Системная тема"
      aria-label="Системная тема"
      :aria-pressed="theme.mode === 'system'"
      @click="theme.setMode('system')"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <rect x="2" y="4" width="20" height="13" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    </button>

    <button
      type="button"
      class="theme-option"
      :class="{ 'theme-option--active': theme.mode === 'dark' }"
      title="Тёмная тема"
      aria-label="Тёмная тема"
      :aria-pressed="theme.mode === 'dark'"
      @click="theme.setMode('dark')"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
      </svg>
    </button>
  </div>
</template>

<script setup>
import { useThemeStore } from "@/stores/theme";
const theme = useThemeStore();
</script>

<style scoped>
.theme-switcher {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 3px;
  border-radius: 8px;
  background: var(--tableAccountBg);
  flex-shrink: 0;
}

.theme-option {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--headerAccountText);
  cursor: pointer;
  transition:
    background 0.15s ease,
    color 0.15s ease;
}

.theme-option:hover {
  color: var(--text);
}

.theme-option--active {
  background: var(--bg);
  color: var(--primary);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
}
</style>
