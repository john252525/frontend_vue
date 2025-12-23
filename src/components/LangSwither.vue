<script setup>
import { useI18n } from "vue-i18n";
import { onMounted, ref, onUnmounted } from "vue";

const { locale } = useI18n();
const listOpen = ref(false);
const lang = ref("");
const dropdownRef = ref(null);

const props = defineProps({
  isWidgetMode: Boolean,
});

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
  const savedLang = localStorage.getItem("lang") || "ru";
  locale.value = savedLang; // ← Добавлено
  lang.value = savedLang === "ru" ? "Русский" : "English";
};

const handleClickOutside = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    listOpen.value = false;
  }
};

onMounted(() => {
  selectLeng(); // Теперь функция корректно синхронизирует оба значения
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>

<template>
  <div v-if="!isWidgetMode" class="cont" ref="dropdownRef">
    <div v-if="listOpen" class="list-cont">
      <ul class="list">
        <li
          :class="{ active: locale === 'ru' }"
          @click="switchLanguage('ru')"
          class="list-text"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 301 201"
          >
            <g fill="none">
              <path fill="#FFF" d="M.5.5h300v100H.5z" />
              <path fill="#D52B1E" d="M.5 100.5h300v100H.5z" />
              <path fill="#0039A6" d="M.5 67.166h300v66.667H.5z" />
            </g>
          </svg>
          Русский
        </li>
        <li
          :class="{ active: locale === 'en' }"
          @click="switchLanguage('en')"
          class="list-text"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 301 159"
          >
            <defs>
              <linearGradient id="cifLr0" x1="0%" x2="100%" y1="50%" y2="50%">
                <stop offset="0%" stop-color="#FFF" />
                <stop offset="100%" />
              </linearGradient>
            </defs>
            <g fill="none">
              <path fill="#BF0A30" d="M.5.552h300v157.895H.5z" />
              <path
                fill="url(#cifLr0)"
                stroke="#FFF"
                stroke-width="13.158"
                d="M.5 22.084h300M.5 50.792h300M.5 79.5h300M.5 108.208h300M.5 136.916h300"
              />
              <path fill="#002868" d="M.5.552h71.77v71.77H.5z" />
              <path
                fill="#FFF"
                d="m15.908 29.784l12.656 9.195l-4.834 14.878l12.655-9.195l12.656 9.195l-4.834-14.878l12.656-9.195H41.219l-4.834-14.877l-4.834 14.877z"
              />
            </g>
          </svg>
          English
        </li>
      </ul>
    </div>
    <h2 @click.stop="changeListOpen" class="title">{{ lang }}</h2>
  </div>
  <div v-else class="cont-chat" ref="dropdownRef">
    <div v-if="listOpen" class="list-chat-cont">
      <ul class="list">
        <li
          :class="{ active: locale === 'ru' }"
          @click="switchLanguage('ru')"
          class="list-text"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 301 201"
          >
            <g fill="none">
              <path fill="#FFF" d="M.5.5h300v100H.5z" />
              <path fill="#D52B1E" d="M.5 100.5h300v100H.5z" />
              <path fill="#0039A6" d="M.5 67.166h300v66.667H.5z" />
            </g>
          </svg>
          Русский
        </li>
        <li
          :class="{ active: locale === 'en' }"
          @click="switchLanguage('en')"
          class="list-text"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 301 159"
          >
            <defs>
              <linearGradient id="cifLr0" x1="0%" x2="100%" y1="50%" y2="50%">
                <stop offset="0%" stop-color="#FFF" />
                <stop offset="100%" />
              </linearGradient>
            </defs>
            <g fill="none">
              <path fill="#BF0A30" d="M.5.552h300v157.895H.5z" />
              <path
                fill="url(#cifLr0)"
                stroke="#FFF"
                stroke-width="13.158"
                d="M.5 22.084h300M.5 50.792h300M.5 79.5h300M.5 108.208h300M.5 136.916h300"
              />
              <path fill="#002868" d="M.5.552h71.77v71.77H.5z" />
              <path
                fill="#FFF"
                d="m15.908 29.784l12.656 9.195l-4.834 14.878l12.655-9.195l12.656 9.195l-4.834-14.878l12.656-9.195H41.219l-4.834-14.877l-4.834 14.877z"
              />
            </g>
          </svg>
          English
        </li>
      </ul>
    </div>
    <svg
      @click.stop="changeListOpen"
      v-if="lang === 'Русский'"
      xmlns="http://www.w3.org/2000/svg"
      width="30"
      height="30"
      viewBox="0 0 301 201"
      class="pointer"
    >
      <g fill="none">
        <path fill="#FFF" d="M.5.5h300v100H.5z" />
        <path fill="#D52B1E" d="M.5 100.5h300v100H.5z" />
        <path fill="#0039A6" d="M.5 67.166h300v66.667H.5z" />
      </g>
    </svg>
    <svg
      @click.stop="changeListOpen"
      v-else
      xmlns="http://www.w3.org/2000/svg"
      width="30"
      height="30"
      viewBox="0 0 301 159"
      class="pointer"
    >
      <defs>
        <linearGradient id="cifLr0" x1="0%" x2="100%" y1="50%" y2="50%">
          <stop offset="0%" stop-color="#FFF" />
          <stop offset="100%" />
        </linearGradient>
      </defs>
      <g fill="none">
        <path fill="#BF0A30" d="M.5.552h300v157.895H.5z" />
        <path
          fill="url(#cifLr0)"
          stroke="#FFF"
          stroke-width="13.158"
          d="M.5 22.084h300M.5 50.792h300M.5 79.5h300M.5 108.208h300M.5 136.916h300"
        />
        <path fill="#002868" d="M.5.552h71.77v71.77H.5z" />
        <path
          fill="#FFF"
          d="m15.908 29.784l12.656 9.195l-4.834 14.878l12.655-9.195l12.656 9.195l-4.834-14.878l12.656-9.195H41.219l-4.834-14.877l-4.834 14.877z"
        />
      </g>
    </svg>
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
  /* border-top: 1px solid var(--line); */
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.cont-chat {
  width: 60px;
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

.list-chat-cont {
  width: 120px;
  height: 70px;
  background-color: var(--changeLantBg);
  position: absolute;
  border-radius: 5px;
  bottom: 70px;
  left: 70px;
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
