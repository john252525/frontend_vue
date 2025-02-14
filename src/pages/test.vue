<template>
  <section class="account-list-section">
    <div class="table-container">
      <table class="table">
        <thead class="table-header">
          <tr>
            <th class="table-name">uniq</th>
            <th class="table-name">timestamp</th>
            <th class="table-data">data</th>
          </tr>
        </thead>
        <tbody class="tbody">
          <tr v-for="(item, index) in instanceData" :key="index">
            <td class="table-text-name">{{ item.uniq }}</td>
            <td class="table-text-phone">{{ item.timestamp }}</td>
            <td class="table-action-text">
              <div class="data-scroll-container">
                {{ item.data }}
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios"; // Импортируем axios

// Данные для таблицы
const instanceData = ref([]); // Изначально пустой массив

// Функция для получения данных из API
const fetchChats = async () => {
  try {
    const response = await axios.get("http://localhost:4000/api/getAllChats"); // Запрос к вашему API
    instanceData.value = response.data.data; // Записываем данные в instanceData
    console.log("Данные чатов получены:", instanceData.value); // Логирование полученных данных
  } catch (error) {
    console.error("Ошибка при получении данных:", error.message); // Логирование ошибок
  }
};

// Функция для обработки клика по кнопке
const openModal = (event, item) => {
  console.log("Открыть модальное окно для:", item);
  // Здесь можно добавить логику для открытия модального окна с информацией о чате
};

// Используем onMounted для получения данных при монтировании компонента
onMounted(() => {
  fetchChats(); // Вызываем функцию для получения данных
});
</script>

<style scoped>
.table-container {
  overflow-x: auto;
  overflow-y: auto;
  max-width: 100%;
  height: 83vh;
}

.data-scroll-container {
  max-height: 100px; /* Установите максимальную высоту для контейнера */
  overflow-y: auto; /* Включаем вертикальную прокрутку */
  border: 1px solid #ddd; /* Добавляем границу для отделения */
  border-radius: 5px; /* Закругленные углы */
  padding: 5px; /* Отступы внутри контейнера */
  width: 700px;
}

.table-name {
  text-align: left;
}

.table-data {
  text-align: left;
}

.table-header {
  position: sticky;
  top: 0;
  z-index: 1;
  background: rgb(243, 244, 246);
}

.table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 1rem;
  font-weight: 500;
  font-size: 11px;
  color: #6b7280;
}

td {
  font-weight: 500;
  font-size: 14px;
  color: #000;
  text-align: left;
}

tr:hover {
  background: rgb(243 244 246);
}
</style>
