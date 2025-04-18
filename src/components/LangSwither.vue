<script setup>
import { useI18n } from "vue-i18n";
import { onMounted, ref, onUnmounted } from "vue";

const { locale } = useI18n();
const listOpen = ref(false);
const lang = ref("");
const dropdownRef = ref(null);

const changeListOpen = () => {
  listOpen.value = !listOpen.value;
};

const switchLanguage = (language) => {
  locale.value = language;
  localStorage.setItem("lang", language);
  lang.value = language === "ru" ? "Русский" : "English";
  listOpen.value = false;
};

const selectLeng = () => {
  const savedLang = localStorage.getItem("lang");
  lang.value = savedLang === "ru" ? "Русский" : "English";
};

const handleClickOutside = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    listOpen.value = false;
  }
};

onMounted(() => {
  selectLeng();
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>

<template>
  <div class="cont" ref="dropdownRef">
    <div v-if="listOpen" class="list-cont">
      <ul class="list">
        <li
          :class="{ active: locale === 'ru' }"
          @click="switchLanguage('ru')"
          class="list-text"
        >
          <img class="svg-icon" src="/flag/russia.svg" alt="" />
          Русский
        </li>
        <li
          :class="{ active: locale === 'en' }"
          @click="switchLanguage('en')"
          class="list-text"
        >
          <img class="svg-icon" src="/flag/america.svg" alt="" /> English
        </li>
      </ul>
    </div>
    <h2 @click.stop="changeListOpen" class="title">{{ lang }}</h2>
  </div>
</template>

<style scoped>
.active {
  font-weight: bold;
  color: var(--primary-color);
}

.svg-icon {
  width: 14px;
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
  background-color: var(--changeLantBg);
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
  display: flex;
  align-items: center;
  gap: 4px;
}

.list-text:hover {
  background-color: var(--changeLantTextActive);
  border-radius: 5px;
  transition: all 0.25s;
}

.title {
  font-size: 16px;
  font-weight: 400;
  color: var(--changeLantText);
  cursor: pointer;
  transition: all 0.15s;
}

.title:hover {
  background-color: var(--changeLantTextHoverBg);
  color: var(--changeLantTextHover);
  padding: 8px;
  border-radius: 5px;
  transition: all 0.15s;
}

.list-text.active {
  background-color: var(--changeLantTextActive);
  border-radius: 5px;
  font-weight: 500;
  transition: all 0.25s;
}

.list-cont,
.fade-leave-active {
  transition: opacity 0.5s ease;
}
.list-cont,
.fade-leave-to {
  opacity: 0;
}

.list-cont {
  animation: fadeIn 0.5s forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
