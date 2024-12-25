<template>
  <section class="account-list-section">
    <div class="table-container">
      <table class="table">
        <thead class="table-header">
          <tr>
            <th class="table-login">НАЗВАНИЕ</th>
            <th class="table-step">ДАТА СОЗДАНИЯ</th>
            <th class="table-action">ДЕЙСТВИЕ</th>
          </tr>
        </thead>
        <tbody class="tbody">
          <tr
            v-if="mailingLists.length > 0"
            v-for="(item, index) in mailingLists"
            :key="index"
          >
            <td class="table-text-number">
              <span v-if="item.name.length > 0">{{ item.name }}</span>
              <span v-else>Рассылка</span>
            </td>
            <td class="table-text">{{ item.dt_create }}</td>
            <td class="table-action-text">
              <button
                class="action-table-button"
                @click="openModal($event, item)"
              >
                <img
                  src="/telegramAccount/menu_table_button.svg"
                  alt="Меню действий"
                />
                Действие
              </button>
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
  <Modal
    v-if="station.isModalOpen"
    :closeModal="closeModal"
    :modalPosition="modalPosition"
    :changeInfoMailing="changeInfoMailing"
  />
  <InfoMailing
    :changeInfoMailing="changeInfoMailing"
    :selectedItem="selectedItem"
    v-if="station.infoMailing"
  />
</template>

<script setup>
import { ref, reactive, onMounted, provide } from "vue";
import axios from "axios";
import Mailing from "@/components/Mailing/Mailing.vue";
import AddMailing from "../ModalComponent/AddMailing/AddMailing.vue";
import Modal from "../ModalComponent/Modal.vue";
import InfoMailing from "../ModalComponent/InfoMailing.vue";
const station = reactive({
  isModalOpen: false,
  infoMailing: false,
  isAddMailing: false,
});

const selectedItem = ref(null);
const mailingLists = ref([]);
const modalPosition = ref({ top: 0, left: 0 });

const getMailingLists = async () => {
  const token = "d7039fe337873da68d28945cd6e5c61d";
  const apiUrl = "https://whatsapi.ru/ru/api/autosend/whatsapp/list/";
  try {
    const response = await axios.get(apiUrl, {
      params: {
        token,
      },
    });
    mailingLists.value = response.data.result.items;
    if (response.data.ok === true) {
      console.log(response.data.result.items);
    } else {
      console.log("er");
    }
    console.log(response.data);
  } catch (error) {
    errorMessage.value = "Ошибка при получении данных: " + error.message;
  }
};

const openModal = (event, item) => {
  selectedItem.value = item;
  station.isModalOpen = true;
  const rect = event.currentTarget.getBoundingClientRect();
  modalPosition.value = {
    top: rect.bottom + window.scrollY,
    left: rect.left + window.scrollX,
  };
};

const closeModal = () => {
  station.isModalOpen = false;
};

const changeisAddMailing = () => {
  station.isAddMailing = !station.isAddMailing;
};

const changeInfoMailing = () => {
  station.infoMailing = !station.infoMailing;
};

onMounted(getMailingLists);
provide("selectedItem", { selectedItem });
</script>

<style scoped>
.table-container {
  max-width: 100%;
  overflow-x: auto;
  height: 83vh;
}

.table-header {
  position: sticky;
  top: 0;
  z-index: 1;
  height: 50px;
  background: #efefef;
}

table {
  width: 100%;
  border-collapse: collapse;
}

.loading-data-text {
  font-weight: 600;
  font-size: 14px;
  color: #000000;
  margin-top: 20px;
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
  padding-right: 15px;
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
  margin-right: 5px;
  transition: all 0.15s;
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
</style>
