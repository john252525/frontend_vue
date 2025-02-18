<template>
  <section class="account-list-section">
    <header>
      <h2 class="title">Список чатов</h2>
    </header>
    <div class="table-container">
      <table class="table">
        <thead class="table-header">
          <tr>
            <th class="table-name">uniq</th>
            <th class="table-name">timestamp</th>
            <th class="table-name">w</th>
            <th class="table-name">u</th>
            <th class="table-data">data</th>
          </tr>
        </thead>
        <tbody class="tbody">
          <tr v-for="(item, index) in instanceData" :key="index">
            <td class="table-text-name">{{ item.uniq }}</td>
            <td class="table-text-phone">{{ item.timestamp }}</td>
            <td class="table-text-phone">{{ item.w }}</td>
            <td class="table-text-phone">{{ item.u }}</td>
            <td class="table-action-button">
              <button class="action-table-button" @click="openModal(item.data)">
                <img
                  src="/telegramAccount/menu_table_button.svg"
                  alt="Меню действий"
                />
                Действие
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <ChatsModal v-if="station.chatsModal" :close="openModal" :data="data" />
  </section>
</template>

<script setup>
import { ref, onMounted, reactive } from "vue";
import axios from "axios"; // Импортируем axios
import ChatsModal from "./Modal/DataModal.vue";
const station = reactive({
  chatsModal: false,
});
// Данные для таблицы
const apiUrl = import.meta.env.VITE_API_URL;
const instanceData = ref([]); // Изначально пустой массив
const data = ref(null);
// Функция для получения данных из API
const fetchChats = async () => {
  try {
    const response = await axios.get(`${apiUrl}/getAllChats`); // Запрос к вашему API
    instanceData.value = response.data.data; // Записываем данные в instanceData
    console.log("Данные чатов получены:", instanceData.value); // Логирование полученных данных
  } catch (error) {
    console.error("Ошибка при получении данных:", error.message); // Логирование ошибок
  }
};

const openModal = (item) => {
  station.chatsModal = !station.chatsModal;
  data.value = item;
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

header {
  margin-top: 14px;
  margin-bottom: 14px;
}

.title {
  font-weight: 500;
  font-size: 22px;
  color: #000;
  margin-left: 18px;
}

.data-scroll-container {
  max-height: 100px; /* Установите максимальную высоту для контейнера */
  overflow-y: auto; /* Включаем вертикальную прокрутку */
  border: 1px solid #ddd; /* Добавляем границу для отделения */
  border-radius: 5px; /* Закругленные углы */
  padding: 5px; /* Отступы внутри контейнера */
  width: 700px;
}

.table-action-button,
.table-data {
  text-align: right;
}

.table-name {
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

.action-table-button {
  background: oklch(0.65 0.22 267 / 0.16);
  font-weight: 600;
  font-size: 12px;
  padding: 10px 12px;
  color: oklch(0.4 0.18 267 / 0.86);
  margin-right: 10px;
  gap: 6px;
  transition: all 0.25s;
  border-radius: 5px;
  margin-right: -3px;
}

.action-table-button:hover {
  background: rgba(23, 30, 162, 0.2);
  transition: all 0.15s;
}

.action-table-button:active {
  background: rgba(0, 4, 78, 0.2);
  transition: all 0.15s;
}

.action-table-button img {
  margin-right: 10px;
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
