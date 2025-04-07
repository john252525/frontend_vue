<template>
  <div class="checkbox-container">
    <label @click="updateSource('whatsapp')" class="checkbox-label">
      <input type="radio" value="whatsapp" :checked="source === 'whatsapp'" />
      <span class="checkbox-text">WhatsApp</span>
      <span class="checkbox-custom"></span>
    </label>

    <label @click="updateSource('telegram')" class="checkbox-label">
      <input type="radio" value="telegram" :checked="source === 'telegram'" />
      <span class="checkbox-text">Telegram</span>
      <span class="checkbox-custom"></span>
    </label>
  </div>
</template>

<script setup>
import { ref } from "vue";

const props = defineProps({
  source: {
    type: String,
    default: "whatsapp", // Добавляем default, чтобы работал первый выбор
  },
  updateSource: {
    type: Function,
  },
});
</script>

<style scoped>
/* Общий контейнер */
.checkbox-container {
  display: flex;
  gap: 16px;
}

/* Label */
.checkbox-label {
  display: flex;
  align-items: center;
  position: relative;
  padding-left: 24px;
  margin-top: 12px;
  cursor: pointer;
  font-size: 16px;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

/* Скрываем стандартный радио */
.checkbox-label input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

/* Текст */
.checkbox-text {
  position: relative;
  z-index: 1;
}

/* Круг */
.checkbox-custom {
  position: absolute;
  top: 50%;
  left: 0;
  transform: translateY(-50%);
  height: 16px;
  width: 16px;
  background-color: #eee;
  border-radius: 50%;
  transition: background-color 0.2s ease;
}

/* Hover */
.checkbox-label:hover input ~ .checkbox-custom {
  background-color: #ccc;
}

/* Выбран */
.checkbox-label input:checked ~ .checkbox-custom {
  background-color: #4950ca;
}

/* Внутренний кружок */
.checkbox-custom:after {
  content: "";
  position: absolute;
  display: none;
}

/* Показываем внутренний */
.checkbox-label input:checked ~ .checkbox-custom:after {
  display: block;
}

/* Стили внутреннего кружка */
.checkbox-label .checkbox-custom:after {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: white;
}
</style>
