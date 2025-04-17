<script setup>
import { useI18n } from "vue-i18n";

const { locale } = useI18n();

const switchLanguage = (lang) => {
  locale.value = lang;
  localStorage.setItem("lang", lang);
};
</script>

<template>
  <div class="cont">
    <div class="list-cont">
      <ul class="list">
        <li class="list-text">Русский</li>
        <li class="list-text">Англиский</li>
      </ul>
    </div>
    <!-- <button @click="switchLanguage('ru')" :class="{ active: locale === 'ru' }">
      RU
    </button>
    <button @click="switchLanguage('en')" :class="{ active: locale === 'en' }">
      EN
    </button> -->
    <h2 class="title">Русский</h2>
  </div>
</template>

<style scoped>
.active {
  font-weight: bold;
  color: var(--primary-color);
}

.cont {
  width: 230px;
  border-top: 1px solid var(--line);
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.list-cont {
  width: 120px;
  height: 70px;
  background-color: #2d3a4c;
  position: absolute;
  border-radius: 5px;
  bottom: 70px;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.list {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  flex-direction: column;
  /* gap: 2px; */
}

.list-text {
  font-size: 14px;
  padding: 6px;
  cursor: pointer;
  width: 90px;
  transition: all 0.25s;
}

.list-text:hover {
  background-color: #334053;
  border-radius: 5px;
  transition: all 0.25s;
}

.title {
  font-size: 16px;
  font-weight: 400;
  color: rgb(195, 195, 195);
  cursor: pointer;
  transition: all 0.15s;
}

.title:hover {
  background-color: #2d3a4c;
  color: white;
  padding: 8px;
  border-radius: 5px;
  transition: all 0.15s;
}

.lang {
}
</style>
