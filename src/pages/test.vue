<template>
  <div>
    <label for="search">Поиск:</label>
    <input
      id="search"
      type="text"
      v-model="searchTerm"
      placeholder="Введите текст для поиска..."
      @input="filterOptions"
    />
    <ul v-if="searchTerm && filteredOptions.length > 0">
      <li
        v-for="(option, index) in filteredOptions"
        :key="index"
        @click="selectOption(option)"
      >
        {{ option }}
      </li>
    </ul>
    <p v-else-if="searchTerm">Ничего не найдено</p>

    <!-- Отображение выбранного значения -->
    <p v-if="selectedOption">Выбранная опция: {{ selectedOption }}</p>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

// Пример массива данных для поиска
const options = ref(["Опция 1", "Опция 2", "Амок", "Тест", "Пример", "Амок 2"]);
const searchTerm = ref("");
const selectedOption = ref(null); // Переменная для хранения выбранной опции

const filteredOptions = computed(() => {
  return options.value.filter((option) =>
    option.toLowerCase().includes(searchTerm.value.toLowerCase())
  );
});

// Функция для выбора опции
const selectOption = (option) => {
  selectedOption.value = option; // Записываем выбранное значение в переменную
  searchTerm.value = ""; // Очищаем поле ввода после выбора
};
</script>

<style>
/* Добавьте стили по мере необходимости */
ul {
  list-style-type: none;
  padding: 0;
}

li {
  padding: 5px;
  cursor: pointer;
}

li:hover {
  background-color: #f0f0f0;
}
</style>
