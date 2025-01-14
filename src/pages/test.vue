<template>
  <div class="table-container">
    <table>
      <thead>
        <tr>
          <th v-for="(header, index) in headers" :key="index">{{ header }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, rowIndex) in items" :key="rowIndex">
          <td v-for="(cell, cellIndex) in row" :key="cellIndex">
            {{ cell }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref } from "vue";

const headers = ref([
  "Имя",
  "Возраст",
  "Город",
  "Профессия",
  "Email",
  "Дополнительные Данные", // Пример добавления длинного столбца
]);

const items = ref([
  [
    "Иван Иванов",
    30,
    "Москва",
    "Инженер",
    "ivan.ivanov@example.com",
    "Очень длинная строка с дополнительной информацией для теста",
  ],
  [
    "Мария Петрова",
    25,
    "Санкт-Петербург",
    "Дизайнер",
    "maria.petrova@example.com",
    "Ещё одна длинная строка данных",
  ],
  [
    "Петр Сидоров",
    40,
    "Новосибирск",
    "Менеджер",
    "petr.sidorov@example.com",
    "Дополнительные данные и еще немного информации",
  ],
  // ... more rows ...
  [
    "Alice Green",
    28,
    "London",
    "Architect",
    "alice.green@example.com",
    "Some very long details here, a string that should cause horizontal overflow for testing purposes",
  ],
  [
    "Bob Blue",
    35,
    "New York",
    "Doctor",
    "bob.blue@example.com",
    "Additional data with some more details to test the responsiveness of this table",
  ],
]);
</script>

<style scoped>
.table-container {
  overflow-x: auto; /* Enables horizontal scroll */
  width: 100%; /* Takes full width on desktop */
  margin-bottom: 20px; /* Adds bottom margin for spacing */
}

table {
  border-collapse: collapse;
  border-spacing: 0;
  width: 100%; /* Takes full width for larger screens */
}

th,
td {
  padding: 10px;
  border-bottom: 1px solid #ddd;
  text-align: left;
  white-space: nowrap; /* предотвращаем перенос текста на новую строку*/
}

th {
  background-color: #f2f2f2;
  font-weight: bold;
}

/* Стиль для мобильных экранов  */
@media (max-width: 600px) {
  table {
    min-width: 100%; /* Ensure a minimum width to force horizontal scroll */
    width: auto;
  }
  th,
  td {
    font-size: 14px; /* Уменьшим шрифт на мобильных устройствах */
    padding: 8px 5px; /* Уменьшим отступ для большего количества контента */
  }
}
</style>
