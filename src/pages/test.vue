<template>
  <section class="account-list-section">
    <div class="table-container">
      <table class="table">
        <thead class="table-header">
          <tr>
            <th class="table-login">Название</th>
            <th class="table-step">Дата</th>
            <th class="table-status">Статус</th>
            <th class="table-action">Действие</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in mailingLists" :key="index">
            <td>{{ item.name }}</td>
            <td>{{ item.date }}</td>
            <td>{{ item.status }}</td>
            <td>
              <button class="action-button" @click="handleAction(item)">
                Действие
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup>
import { ref } from "vue";

const mailingLists = ref([
  { name: "МегаРассылка", date: "2023-01-01 16:22:45", status: "Активен" },
  { name: "Рассылка 2", date: "2023-02-01", status: "Неактивен" },
  { name: "Рассылка 3", date: "2023-03-01", status: "Активен" },
]);

const handleAction = (item) => {
  console.log("Действие для:", item);
};
</script>

<style scoped>
.table-container {
  max-width: 100%;
  overflow-x: auto; /* Включаем горизонтальную прокрутку */
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table-header {
  background-color: #f3f4f6;
}

th,
td {
  padding: 1rem;
  border: 1px solid #ddd;
  text-align: left;
}

.action-button {
  background-color: #4caf50; /* Зеленый цвет */
  color: white;
  border: none;
  padding: 10px 15px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 14px;
  cursor: pointer;
  border-radius: 5px;
}

.action-button:hover {
  background-color: #45a049; /* Темно-зеленый цвет при наведении */
}

/* Адаптивные стили */
@media (max-width: 600px) {
  .table-container {
    overflow-x: auto; /* Обеспечиваем горизонтальную прокрутку */
    -webkit-overflow-scrolling: touch; /* Обеспечение плавного скролла на мобильных устройствах */
  }

  th,
  td {
    font-size: 12px; /* Уменьшение размера шрифта на маленьких экранах */
  }

  .action-button {
    padding: 8px 10px; /* Уменьшение размера кнопки */
  }
}
</style>
