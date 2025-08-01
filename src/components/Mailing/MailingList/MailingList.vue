<template>
  <section class="account-list-section">
    <ErrorBlock v-if="errorBlock" :changeIncorrectPassword="chaneErrorBlock" />
    <div class="table-container">
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
            </td>
            <td class="table-state" v-if="item.state === 0">
              {{ t("mailingList.status.noActive") }}
            </td>
            <td class="table-state-active" v-if="item.state === 2">
              {{ t("mailingList.status.completed") }}
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
              <button
                class="action-table-button-phone"
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
  </section>
  <Modal
    :isModalOpen="station.isModalOpen"
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
</template>

<script setup>
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

const getMailingLists = async () => {
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
  padding: 1rem;
  text-align: left;
  color: rgb(211, 59, 59);
}

.table-state-active {
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
  .table-container {
    width: 100vw;
    margin-left: -1rem; /* Компенсируем padding родительского элемента */
    padding: 0 1rem;
  }

  .action-table-button {
    display: none; /* Скрываем обычную кнопку на мобильных */
  }

  .action-table-button-phone {
    display: inline-block; /* Показываем кнопку для мобильных */
    background: var(--tableActiveButton);
    font-weight: 600;
    font-size: 12px;
    padding: 10px;
    color: var(--tableActiveButtonColor);
    transition: all 0.25s;
    border-radius: 5px;
    border: none;
  }
}

@media (max-height: 660px) {
  .table-container {
    height: 78vh;
  }
}

@media (max-height: 600px) {
  .table-container {
    height: 76vh;
  }
}

@media (max-height: 550px) {
  .table-container {
    height: 74vh;
  }
}

@media (max-height: 500px) {
  .table-container {
    height: 70vh;
  }
}

@media (max-height: 450px) {
  .table-container {
    height: 66vh;
  }
}
</style>
