<template>
  <section class="account-list-section">
    <ErrorBlock v-if="errorBlock" :changeIncorrectPassword="chaneErrorBlock" />
    
    <!-- Десктопная таблица -->
    <div class="table-container desktop-view">
      <table class="table">
        <thead class="table-header">
          <tr>
            <th class="table-login">{{ t("mailingList.table.name") }}</th>
            <th class="table-step">{{ t("mailingList.table.data") }}</th>
            <th class="table-status">{{ t("mailingList.table.status") }}</th>
            <th class="table-action">{{ t("mailingList.table.action") }}</th>
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
              <span v-else>{{ t("mailingList.name") }}</span>
            </td>
            <td class="table-text">{{ item.dt_create }}</td>
            <td class="table-state-active" v-if="item.state === 1">
              {{ t("mailingList.status.active") }}
              <span v-if="item.state_text.length > 0" class="state-text"> {{ item.state_text }}</span>
            </td>
            <td class="table-state" v-if="item.state === 0">
              {{ t("mailingList.status.noActive") }}
              <span v-if="item.state_text.length > 0" class="state-text"> {{ item.state_text }}</span>
            </td>
            <td class="table-state-active" v-if="item.state === 2">
              {{ t("mailingList.status.completed") }}
              <span  v-if="item.state_text.length > 0" class="state-text"> {{ item.state_text }}</span>
            </td>
            <td
              class="table-state"
              v-if="item.state != 2 && item.state != 1 && item.state != 0"
            >
              -
            </td>
            <td class="table-action-text">
              <button
                class="action-table-button"
                @click="openModal($event, item)"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  class="bi bi-list"
                  viewBox="0 0 16 16"
                >
                  <path
                    fill-rule="evenodd"
                    d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5"
                  ></path>
                </svg>
                {{ t("mailingList.buttonActive") }}
              </button>
            </td>
          </tr>
          <tr v-else-if="dataStationNone">
            <td colspan="4">
              <div class="none-account-cont">
                <h2>{{ t("mailingList.noneMailing") }}</h2>
              </div>
            </td>
          </tr>
          <tr v-if="loadDataStation">
            <td class="accout-load-cont" colspan="4">
              <div class="load-cont">
                <LoadAccount />
              </div>
            </td>
          </tr>
          <tr v-if="errorMailing">
            <td class="accout-load-cont" colspan="4">
              <div class="load-cont">
                <ErrorAccount />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Мобильные карточки -->
    <div class="mobile-cards" v-if="dataStation && mailingLists.length > 0">
      <div 
        class="mailing-card"
        v-for="(item, index) in mailingLists"
        :key="'mobile-' + index"
      >
        <!-- Заголовок карточки -->
        <div class="card-header">
          <div class="mailing-info">
            <span class="mailing-name">
              <span v-if="item.name.length > 0">{{ item.name }}</span>
              <span v-else>{{ t("mailingList.name") }}</span>
            </span>
          </div>
          <button 
            class="action-gear"
            @click="openMobileModal($event, item)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          </button>
        </div>

        <!-- Контент карточки -->
        <div class="card-content">
          <!-- Дата создания -->
          <div class="card-row">
            <span class="label">Дата создания:</span>
            <span class="value">{{ formatDate(item.dt_create) }}</span>
          </div>

          <!-- Статус -->
          <div class="card-row">
            <span class="label">Статус:</span>
            <span class="value" :class="getStatusClass(item.state)">
              {{ getStatusText(item.state) }}
              <span class="state-text-mobile">{{ item.state_text }}</span>
            </span>
          </div>
        </div>

        <!-- Кнопка действия -->
        <!-- <div class="card-actions">
          <button 
            class="action-btn"
            @click="openMobileModal($event, item)"
          >
            Действия
          </button>
        </div> -->
      </div>
    </div>

    <!-- Состояния для мобильной версии -->
    <div class="mobile-states" v-if="!dataStation || dataStationNone || loadDataStation || errorMailing">
      <div class="none-account-cont" v-if="dataStationNone">
       <NoData type="campaigns"/>
      </div>
      
      <div class="load-cont" v-if="loadDataStation">
        <LoadAccount />
      </div>
      
      <div class="load-cont" v-if="errorMailing">
        <ErrorAccount />
      </div>
    </div>
  </section>

  <!-- Модальные окна (остаются без изменений) -->
  <Modal
    :changeStatusMailing="changeStatusMailing"
    :isModalOpen="station.isModalOpen"
    :closeModal="closeModal"
    :modalPosition="modalPosition"
    :changeInfoMailing="changeInfoMailing"
    :selectedItem="selectedItem"
    :changeDeleteMailing="changeDeleteMailing"
    :refreshMailingLists="getMailingLists"
    :changeisEditMailing="changeisEditMailing"
    :changeStationMessage="changeStationMessage"
  />
  <InfoMailing
    :changeInfoMailing="changeInfoMailing"
    :selectedItem="selectedItem"
    v-if="station.infoMailing"
    :changeisEditMailing="changeisEditMailingInfo"
  />
  <ConfirmDelete
    v-if="station.deleteMailing"
    :selectedItem="selectedItem"
    :changeDeleteMailing="changeDeleteMailing"
    :refreshMailingLists="getMailingLists"
    :changeResultModal="changeResultModal"
  />
  <EditMailing
    v-if="station.editMailing"
    :changeisEditMailing="changeisEditMailing"
    :selectedItem="selectedItem"
    :changeResultModal="changeResultModal"
  />
  <MessageLise
    v-if="stationMessage"
    :changeStationMessage="changeStationMessage"
    :selectedItem="selectedItem"
  />
</template>

<script setup>
import MessageLise from "../ModalComponent/MessageLise.vue";
import { ref, reactive, onMounted, provide, computed } from "vue";
import ErrorBlock from "@/components/ErrorBlock/ErrorBlock.vue";
import axios from "axios";
const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL;
import Mailing from "@/components/Mailing/Mailing.vue";
import AddMailing from "../ModalComponent/AddMailing/AddMailing.vue";
import ConfirmDelete from "../ModalComponent/confirmModal/confirmDelete.vue";
import Modal from "../ModalComponent/Modal.vue";
import InfoMailing from "../ModalComponent/InfoMailing.vue";
import LoadAccount from "./LoadAccount.vue";
import EditMailing from "../ModalComponent/EditMailing/EditMailing.vue";
import ErrorAccount from "./errorAccount.vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useAccountStore } from "@/stores/accountStore";
const accountStore = useAccountStore();
const token = computed(() => accountStore.getAccountToken);
const { t } = useI18n();
const apiUrl = import.meta.env.VITE_WHATSAPI_URL;
const router = useRouter();
const station = reactive({
  isModalOpen: false,
  infoMailing: false,
  isAddMailing: false,
  deleteMailing: false,
  editMailing: false,
});
import NoData from "@/components/GlobalModal/StationList/NoData.vue";
const errorBlock = ref(false);
const chaneErrorBlock = () => {
  errorBlock.value = errorBlock.value;
};

import useFrontendLogger from "@/composables/useFrontendLogger";
const { sendLog } = useFrontendLogger();

const handleSendLog = async (location, method, params, results, answer) => {
  try {
    await sendLog(location, method, params, results, answer);
  } catch (err) {
    console.error("error", err);
    // Optionally, update the error message ref
  }
};

const props = defineProps({
  changeResultModal: {
    type: Function,
  },
});

const errorMailing = ref(false);
const dataStationNone = ref(false);
const dataStation = ref(false);
const loadDataStation = ref(false);

const selectedItem = ref(null);
const mailingLists = ref([]);
const modalPosition = ref({ top: 0, left: 0 });

const formatDate = (dateString) => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (e) {
    return dateString;
  }
};

const getStatusText = (state) => {
  switch (state) {
    case 1: return t("mailingList.status.active");
    case 0: return t("mailingList.status.noActive");
    case 2: return t("mailingList.status.completed");
    default: return '-';
  }
};

const getStatusClass = (state) => {
  switch (state) {
    case 1: return 'status-active';
    case 2: return 'status-completed';
    case 0: return 'status-inactive';
    default: return '';
  }
};

const openMobileModal = (event, item) => {
  openModal(event, item);
};

const getMailingLists = async () => {
  mailingLists.value = false;
  errorMailing.value = false;
  dataStationNone.value = false;
  loadDataStation.value = true;
  const apiUrlMethod = `${apiUrl}/list/`;
  try {
    const response = await axios.get(apiUrlMethod, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Bearer ${token.value}`,
      },
    });

    if (response.data) {
      await handleSendLog(
        "mailingList",
        "list",
        {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Bearer ${token.value}`,
        },
        response.data.ok,
        response.data
      );
    }

    mailingLists.value = response.data.result.items;
    if (mailingLists.value.length === 0) {
      loadDataStation.value = false;
      dataStationNone.value = true;
    } else if (response.data === 401) {
      errorBlock.value = true;
      setTimeout(() => {
        localStorage.removeItem("accountToken");
        router.push("/login");
      }, 2000);
    } else {
      loadDataStation.value = false;
      dataStation.value = true;
    }
  } catch (error) {
    console.error("error", error.message);
    errorMailing.value = true;
    loadDataStation.value = false;
    dataStationNone.value = false;
  }
};

const changeStatusMailing = (item, state) => {
  const index = mailingLists.value.findIndex(
    (mailing) => mailing.id === item.id
  );
  if (index !== -1) {
    mailingLists.value[index].state = state;
    // Если нужно также обновить другие поля, например state_text
  }
};

const openModal = (event, item) => {
  selectedItem.value = item;
  station.isModalOpen = true;
  const rect = event.currentTarget.getBoundingClientRect();
  const modalWidth = 150;
  const modalHeight = 200;
  const offset = 4; // Минимальный отступ

  let left = rect.right + window.scrollX + offset;
  let top = rect.bottom + window.scrollY + offset;

  if (left + modalWidth > window.innerWidth) {
    left = rect.left + window.scrollX - modalWidth - offset;
  }

  // Гарантируем минимальный отступ 4px
  left = Math.max(offset, left);
  top = Math.max(offset, top);

  // Гарантируем невыход за правый и нижний края
  left = Math.min(left, window.innerWidth - modalWidth - offset);
  top = Math.min(top, window.innerHeight - modalHeight - offset + window.scrollY);

  modalPosition.value = {
    top: top,
    left: left
  };
};

const stationMessage = ref(false);

const changeStationMessage = () => {
  stationMessage.value = !stationMessage.value;
};

const closeModal = () => {
  station.isModalOpen = false;
};

const changeisEditMailing = () => {
  station.editMailing = !station.editMailing;
};

const changeisEditMailingInfo = () => {
  changeInfoMailing();
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
  overflow-x: auto;
  overflow-y: auto;
  height: 82vh;
  -webkit-overflow-scrolling: touch;
}

.desktop-view {
  display: block;
}

.mobile-cards,
.mobile-states {
  display: none;
}

.table-container::-webkit-scrollbar {
  height: 6px;
  width: 6px;
}

.table-container::-webkit-scrollbar-track {
  background-color: var(--scrolBg);
}

.table-container::-webkit-scrollbar-thumb {
  background: var(--scrolColor);
  border-radius: 5px;
}

.table-header {
  position: sticky;
  top: 0;
  z-index: 1;
}

.table {
  width: 100%;
  min-width: 600px; /* Минимальная ширина для горизонтального скролла */
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
  align-items: center;
  justify-content: center;
  flex-direction: column;
}


.table-login {
  text-align: left;
  padding: 1rem;
}

.load-cont {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: -10px;
}

.accout-load-cont {
  width: 100%;
}

.table-step {
  text-align: left;
  padding: 1rem;
}

.table-status {
  text-align: left;
  padding: 1rem;
}

.table-action {
  text-align: right;
  padding: 1rem;
  padding-right: 15px;
}

.table-login {
  width: 30%;
}

.table-step {
  width: 25%;
}

.table-status {
  width: 20%;
}

.state-text {
  color: black;
  
  font-weight: 400;
}

.table-action {
  width: 25%;
}

.table-text-number {
  padding: 1rem;
}

.table-text {
  padding: 1rem;
}

.table-state {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 1rem;
  text-align: left;
  color: rgb(211, 59, 59);
}

.table-state-active {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 1rem;
  text-align: left;
  color: rgb(32, 179, 40);
}

.table-action-text {
  padding: 1rem;
  text-align: right;
}

.action-table-button {
  background: var(--tableActiveButton);
  font-weight: 600;
  font-size: 12px;
  padding: 10px 12px;
  color: var(--tableActiveButtonColor);
  margin-right: 10px;
  gap: 6px;
  transition: all 0.25s;
  border-radius: 5px;
  margin-right: -3px;
}

.action-table-button-phone {
  display: none;
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
  color: var(--tabletextcolor);
  text-align: left;
  position: static;
  z-index: 0;
  background-color: var(--bg);
}

tr {
  position: relative;
}

tr:not(:last-child):after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 1px;
  background-color: var(--line);
}

.tbody tr:hover td {
  background-color: var(--tableHover);
}

@media (max-width: 700px) {
  .table-login {
    width: 20%;
  }

  .table-step {
    width: 45%;
  }

  .table-status {
    width: 10%;
  }

  .table-action {
    width: 25%;
  }
}

@media (max-height: 920px) {
  .table-container {
    height: 74vh;
  }
}


@media (max-width: 768px) {
  .desktop-view {
    display: none;
  }
  
  .mobile-cards,
  .mobile-states {
    display: block;
  }
  
  .mobile-cards {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
    padding: 16px;
  }
  
  .mailing-card {
    background: white;
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    border: 1px solid #e5e7eb;
    display: flex;
    flex-direction: column;
    min-height: 180px;
    min-width: 0;
  }
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 12px;
    padding-bottom: 10px;
    border-bottom: 1px solid #f3f4f6;
    min-width: 0;
    gap: 8px;
  }
  
  .mailing-info {
    display: flex;
    align-items: center;
    min-width: 0;
    flex: 1;
  }
  
  .mailing-name {
    font-weight: 600;
    font-size: 16px;
    color: #1f2937;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    min-width: 0;
  }
  
  .action-gear {
    background: oklch(0.65 0.22 267 / 0.1);
    border: none;
    border-radius: 8px;
    padding: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: all 0.2s ease;
  }
  
  .action-gear:hover {
    background: oklch(0.65 0.22 267 / 0.2);
  }
  
  .action-gear svg {
    width: 16px;
    height: 16px;
    color: #5a4fc1;
  }
  
  .card-content {
    flex: 1;
    margin-bottom: 12px;
    min-width: 0;
  }
  
  .card-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    min-width: 0;
    gap: 8px;
  }
  
  .label {
    font-size: 14px;
    color: #6b7280;
    font-weight: 500;
    white-space: nowrap;
    flex-shrink: 0;
  }
  
  .value {
    font-size: 14px;
    color: #374151;
    font-weight: 500;
    text-align: right;
    min-width: 0;
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .status-active {
    color: rgb(32, 179, 40);
  }
  
  .status-completed {
    color: rgb(32, 179, 40);
  }
  
  .status-inactive {
    color: rgb(211, 59, 59);
  }
  
  .state-text-mobile {
    display: block;
    font-size: 12px;
    color: #6b7280;
    background-color: transparent;
    margin-top: 2px;
  }
  
  .card-actions {
    margin-top: auto;
  }
  
  .action-btn {
    width: 100%;
    background: oklch(0.65 0.22 267 / 0.16);
    border: none;
    padding: 12px;
    border-radius: 8px;
    color: #5a4fc1;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .action-btn:hover {
    background: oklch(0.65 0.22 267 / 0.25);
  }
}

@media (max-width: 640px) {
  .mobile-cards {
    grid-template-columns: 1fr;
    gap: 12px;
    padding: 12px;
  }
  
  .mailing-card {
    min-height: 170px;
    padding: 14px;
  }
  
  .mailing-name {
    font-size: 15px;
  }
  
  .label {
    font-size: 13px;
  }
  
  .value {
    font-size: 13px;
  }
  
  .action-btn {
    padding: 10px;
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .mobile-cards {
    padding: 10px;
    gap: 10px;
  }
  
  .mailing-card {
    padding: 12px;
    min-height: 160px;
  }
  
  .mailing-name {
    font-size: 14px;
  }
  
  .label {
    font-size: 12px;
  }
  
  .value {
    font-size: 12px;
  }
  
  .action-btn {
    padding: 9px;
    font-size: 12px;
  }
}

/* Состояния для мобильной версии */
.mobile-states {
  padding: 20px;
}

.mobile-states .none-account-cont,
.mobile-states .load-cont {
  background: white;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  margin: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.mobile-states .none-account-cont h2 {
  font-size: 16px;
  color: #6b7280;
  margin: 0;
}

/* Остальные стили десктопной версии остаются без изменений */
.table-container {
  overflow-x: auto;
  overflow-y: auto;
  height: 82vh;
  -webkit-overflow-scrolling: touch;
}

.table-container::-webkit-scrollbar {
  height: 6px;
  width: 6px;
}
</style>
