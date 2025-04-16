<script setup>
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()

const switchLanguage = (lang) => {
  locale.value = lang
  localStorage.setItem('lang', lang)
}
</script>

<template>
  <div class="lang-switcher">
    <button 
      @click="switchLanguage('ru')"
      :class="{ active: locale === 'ru' }"
    >RU</button>
    <button 
      @click="switchLanguage('en')"
      :class="{ active: locale === 'en' }"
    >EN</button>
  </div>
</template>

<style scoped>
.active {
  font-weight: bold;
  color: var(--primary-color);
}
</style>