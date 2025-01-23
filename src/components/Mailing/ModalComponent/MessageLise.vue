<template>
  <ErrorBlock v-if="errorBlock" :changeIncorrectPassword="chaneErrorBlock" />
  <section class="account-list-section">
    <h2 class="title">
      <img @click="changeStationMessage" src="/millingInfo/out.svg" alt="" />
      Список Сообщений
    </h2>
    <div class="table-container">
      <table class="table">
        <thead class="table-header">
          <tr>
            <th class="table-login">ID</th>
            <th class="table-num">Телефон</th>
            <th class="table-text">Текст</th>
            <th class="table-status">Статус</th>
          </tr>
        </thead>
        <tbody class="tbody">
          <tr
            v-if="mailingLists.length > 0"
            v-for="(item, index) in mailingLists"
            :key="index"
          >
            <td class="table-text-number">
              <span>{{ item.id }}</span>
            </td>
            <td class="table-text">{{ item.to }}</td>
            <td class="table-text">{{ item.text }}</td>
            <td v-if="item.state === 0" class="table-text state">
              Ожидание отправки
            </td>
          </tr>
          <tr v-else>
            <td colspan="3">
              <h2 class="loading-data-text">Загрузка данных...</h2>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup>
import { ref, reactive, onMounted, toRefs, provide } from "vue";
import axios from "axios";
import ErrorBlock from "@/components/ErrorBlock/ErrorBlock.vue";

const errorBlock = ref(false);
const chaneErrorBlock = () => {
  errorBlock.value = errorBlock.value;
};

const props = defineProps({
  selectedItem: {
    type: Object,
  },
  changeInfoMailing: {
    type: Function,
  },
  changeStationMessage: {
    type: Function,
  },
});
const { selectedItem } = toRefs(props);

const mailingLists = ref([]);

const getMessages = async () => {
  const apiUrl = `https://whatsapi.ru/ru/api/autosend/whatsapp/view/${selectedItem.value.id}/`;

  try {
    const response = await axios.get(apiUrl, {
      params: {
        token: "d7039fe337873da68d28945cd6e5c61d",
        limit: 10,
        offset: 0,
        sort: "asc",
      },
    });

    if (response.data.ok) {
      mailingLists.value = response.data.result.items;
      console.log(response.data);
    } else if (response.data === 401) {
      localStorage.removeItem("accountToken");
      router.push("/login");
    } else if (response.data === 401) {
      errorBlock.value = true;
      setTimeout(() => {
        localStorage.removeItem("accountToken");
        router.push("/login");
      }, 2000);
    } else {
      console.error("Ошибка при получении данных:", response.data);
    }
  } catch (error) {
    console.error(
      "Ошибка при отправке запроса:",
      error.response ? error.response.data : error.message
    );
  }
};

onMounted(getMessages);
</script>

<style scoped>
.table-container {
  max-width: 100%;
  overflow-x: auto;
  height: auto;
}

.title {
  font-weight: 500;
  font-size: 24px;
  color: #000;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.title img {
  margin-top: 5px;
  transition: all 0.15s;
  cursor: pointer;
}

.title img:hover {
  transition: all 0.15s;
  transform: translate(-5px);
}

.table-header {
  position: sticky;
  top: 0;
  z-index: 1;
  background: rgb(243 244 246);
}

table {
  width: 100%;
  border-collapse: collapse;
}

.bi-list {
  width: 16px; /* Ширина и высота иконки */
  height: 16px;
  fill: currentColor; /* Использует текущий цвет текста */
  margin-bottom: -4px;
  margin-right: 6px;
}

.loading-data-text {
  font-weight: 600;
  font-size: 14px;
  color: #000000;
  /* text-align: center; */
  /* padding: 10px; */
  border-radius: 6px;
  /* width: 100%; */
}

.table-login {
  text-align: left;
  padding: 1rem;
  width: 20px;
}

.table-num {
  text-align: left;
  padding: 1rem;
  width: 100px;
}

.table-text {
  text-align: left;
  padding: 1rem;
  width: 300px;
}

.state {
  text-align: right;
}

.table-status {
  text-align: right;
  padding: 1rem;
  width: 100px;
}

.table-action {
  text-align: right;
  padding: 1rem;
  padding-right: 15px;
}

.table-text-number {
  padding: 1rem;
}

.table-text {
  padding: 1rem;
}

.table-action-text {
  padding: 1rem;
  text-align: right;
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

tr {
  position: relative; /* Позволяет псевдоэлементу позиционироваться относительно строки */
}

tr:not(:last-child):after {
  content: ""; /* Создает пустой контент для псевдоэлемента */
  position: absolute; /* Абсолютное позиционирование относительно строки */
  left: 0;
  right: 0;
  bottom: 0; /* Позиционируем линию внизу строки */
  height: 1px; /* Высота линии */
  background-color: #ebebeb;
}

tr:hover {
  background: rgb(243 244 246);
}

@media (max-width: 400px) {
  th,
  td {
    padding: 1rem;
    font-weight: 500;
    font-size: 11px;
    color: #6b7280;
  }

  td {
    font-weight: 500;
    font-size: 12px;
    color: #000;
    text-align: left;
  }
}
</style>
