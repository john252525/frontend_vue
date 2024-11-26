<template>
  <div>
    <table>
      <thead>
        <tr>
          <th class="table-login">ЛОГИН</th>
          <th class="table-step">ШАГ</th>
          <th class="table-action">ДЕЙСТВИЕ</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-if="instanceData.length > 0"
          v-for="(item, index) in instanceData"
          :key="index"
        >
          <td class="table-text-number">{{ item.login }}</td>
          <td class="table-text">{{ item.step }}</td>
          <td class="table-action-text">
            <button
              class="action-table-button"
              @click="openModal($event, item)"
            >
              <img
                src="/telegramAccount/menu_table_button.svg"
                alt="Меню действий"
              />Действия
            </button>
          </td>
        </tr>
        <div v-else>
          <h2 class="loading-data-text">Загрузка данных...</h2>
        </div>
      </tbody>
    </table>
    <Modal
      :isModalOpen="isModalOpen"
      :closeModal="closeModal"
      :modalPosition="modalPosition"
      :performAction="performAction"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import axios from "axios";
import Modal from "./Modal.vue";

const dataAccount = reactive({
  token: "342b63fd-6017-446f-adf8-d1b8e0b7bfc6",
  source: "whatsapp",
  error: null,
});

const instanceData = ref([]);
const accounts = ref([]);
const isModalOpen = ref(false);
const modalPosition = ref({ top: 0, left: 0 });
const selectedItem = ref(null);

const getAccounts = async () => {
  try {
    const response = await axios.post(
      "https://b2288.apitter.com/instances/getInfoByToken",
      {
        source: dataAccount.source,
        token: dataAccount.token,
        skipDetails: true,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${dataAccount.token}`,
        },
      }
    );
    accounts.value = response.data;
    instanceData.value = accounts.value.data.instances.map((instance) => ({
      ...instance,
      step: instance.step === null ? "Н/Д" : instance.step,
    }));
  } catch (error) {
    error.value = error.message || "Произошла ошибка.";
    console.error("Ошибка при получении списка аккаунтов:", error);
    if (error.response) {
      console.error("Ответ сервера:", error.response.data);
    }
  }
};

const openModal = (event, item) => {
  selectedItem.value = item;
  isModalOpen.value = true;
  const rect = event.currentTarget.getBoundingClientRect();
  modalPosition.value = {
    top: rect.bottom + window.scrollY,
    left: rect.left + window.scrollX,
  };
};

const closeModal = () => {
  isModalOpen.value = false;
};

const performAction = (action) => {
  alert(`Вы выбрали ${action} для ${selectedItem.value.login}`);
  closeModal();
};

onMounted(getAccounts);
</script>

<style scoped>
table {
  width: 100%;
  border-collapse: collapse;
}

.loading-data-text {
  font-weight: 600;
  font-size: 14px;
  color: #000000;
  margin-top: 20px;
  margin-left: 20px;
  text-align: center;
  padding: 10px;
  background-color: #efefef;
  border-radius: 6px;
}

.table-login {
  text-align: left;
  padding: 8px 8px 8px 20px;
  width: 200px;
}

.table-step {
  text-align: left;
  padding: 8px;
  width: 200px;
}

.table-action {
  text-align: right;
  padding: 8px;
}

.table-text-number {
  padding: 20px;
}

.table-text {
  padding: 8px;
}

.table-action-text {
  padding: 8px;
  text-align: right;
}

.action-table-button {
  border-radius: 5px;
  padding: 9px 11px;
  background: rgba(73, 80, 202, 0.2);
  font-weight: 600;
  font-size: 14px;
  color: #4047ca;
}

.action-table-button img {
  margin-right: 10px;
}

th,
td {
  padding: 8px;
  font-weight: 500;
  font-size: 14px;
  color: #989898;
}

td {
  font-weight: 600;
  font-size: 14px;
  color: #000;
  text-align: left;
}

tbody {
  width: 300px;
  overflow-x: auto;
  white-space: nowrap;
}

thead {
  border: 1px solid #d9d9d9;
  height: 50px;
  background: #efefef;
}
</style>

Найти еще
