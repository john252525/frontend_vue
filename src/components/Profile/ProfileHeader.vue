<template>
  <h1 class="profile-title">{{ t("profilePage.title") }}</h1>
</template>

<script setup>
import { useI18n } from "vue-i18n";

const { t } = useI18n();
</script>

<style scoped>
.profile-title {
  font-weight: 500;
  font-size: 22px;
  color: var(--text);
}

@media (min-width: 1200px) {
  .profile-title {
    font-size: 1.7rem;
    margin-bottom: 2rem;
  }
}
</style>
