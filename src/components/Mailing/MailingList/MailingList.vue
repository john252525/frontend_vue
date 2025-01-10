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
            v-if="dataStation"
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
          <tr v-else-if="dataStationNone">
            <td colspan="3">
              <div class="none-account-cont">
                <h2>Аккаунтов не найдено</h2>
              </div>
            </td>
          </tr>
          <tr v-if="loadDataStation">
            <td colspan="3">
              <div class="load-cont">
                <LoadAccount />
              </div>
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
    :selectedItem="selectedItem"
    :changeDeleteMailing="changeDeleteMailing"
    :refreshMailingLists="getMailingLists"
    :changeisEditMailing="changeisEditMailing"
  />
  <InfoMailing
    :changeInfoMailing="changeInfoMailing"
    :selectedItem="selectedItem"
    v-if="station.infoMailing"
  />
  <ConfirmDelete
    v-if="station.deleteMailing"
    :selectedItem="selectedItem"
    :changeDeleteMailing="changeDeleteMailing"
    :refreshMailingLists="getMailingLists"
  />
  <EditMailing
    v-if="station.editMailing"
    :changeisEditMailing="changeisEditMailing"
    :selectedItem="selectedItem"
  />
</template>

<script setup>
import { ref, reactive, onMounted, provide } from "vue";
import axios from "axios";
import Mailing from "@/components/Mailing/Mailing.vue";
import AddMailing from "../ModalComponent/AddMailing/AddMailing.vue";
import ConfirmDelete from "../ModalComponent/confirmModal/confirmDelete.vue";
import Modal from "../ModalComponent/Modal.vue";
import InfoMailing from "../ModalComponent/InfoMailing.vue";
import LoadAccount from "./LoadAccount.vue";
import EditMailing from "../ModalComponent/EditMailing/EditMailing.vue";
const station = reactive({
  isModalOpen: false,
  infoMailing: false,
  isAddMailing: false,
  deleteMailing: false,
  editMailing: false,
});

const dataStationNone = ref(false);
const dataStation = ref(false);
const loadDataStation = ref(false);

const selectedItem = ref(null);
const mailingLists = ref([]);
const modalPosition = ref({ top: 0, left: 0 });

const getMailingLists = async () => {
  loadDataStation.value = true;
  const token = "d7039fe337873da68d28945cd6e5c61d";
  const apiUrl = "https://whatsapi.ru/ru/api/autosend/whatsapp/list/";
  try {
    const response = await axios.get(apiUrl, {
      params: {
        token,
      },
    });
    mailingLists.value = response.data.result.items;
    if (mailingLists.value.length === 0) {
      console.log("данных нет");
      loadDataStation.value = false;
      dataStationNone.value = true;
    } else {
      loadDataStation.value = false;
      dataStation.value = true;
    }
    console.log(response.data);
  } catch (error) {
    console.error("Ошибка при получении данных:", error.message);
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

const changeisEditMailing = () => {
  station.editMailing = !station.editMailing;
};

const changeisAddMailing = () => {
  station.isAddMailing = !station.isAddMailing;
};

const changeDeleteMailing = () => {
  station.deleteMailing = !station.deleteMailing;
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
  margin-top: 20px;
  text-align: center;
  padding: 10px;
  background-color: #efefef;
  border-radius: 6px;
}

.none-account-cont {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  flex-direction: column;
  margin-top: 0px;
  height: 50px;
  width: 100%;
  background-color: #ebf5ff;
  border-radius: 5px;
}

.none-account-cont h2 {
  font-size: 14px;
  font-weight: 500;
  color: #17388d;
  margin-left: 10px;
}

.table-login {
  text-align: left;
  padding: 1rem;
  width: 200px;
}

.load-cont {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: -10px;
}

.table-step {
  text-align: left;
  padding: 1rem;
  width: 220px;
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
</style>
