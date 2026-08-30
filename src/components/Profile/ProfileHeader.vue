<template>
  <header class="profile-header">
    <h1 class="profile-title">{{ t("profilePage.title") }}</h1>

    <button
      @click="$emit('start-tour')"
      class="help-tour-button"
      title="Как пользоваться"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 2-3 4" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
      Как пользоваться
    </button>
  </header>
</template>

<script setup>
import { useI18n } from "vue-i18n";

const { t } = useI18n();

defineEmits(["start-tour"]);
</script>

<style scoped>
.profile-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.profile-title {
  font-weight: 500;
  font-size: 22px;
  color: var(--text);
}

.help-tour-button {
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  flex: 0 0 auto;
  background: transparent;
  border: 1px solid var(--border, #e2e8f0);
  font-weight: 600;
  font-size: 12px;
  color: var(--headerAccountButtonColor, #64748b);
  padding: 10px 12px;
  transition: all 0.25s;
}

.help-tour-button:hover {
  background: rgba(var(--primary-rgb), 0.1);
  border-color: var(--primary);
}

@media (min-width: 1200px) {
  .profile-title {
    font-size: 1.7rem;
  }

  .profile-header {
    margin-bottom: 2rem;
  }
}
</style>
