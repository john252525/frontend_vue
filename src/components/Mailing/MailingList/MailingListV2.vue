<template>
  <section class="account-list-section">
    <ErrorBlock v-if="errorBlock" :changeIncorrectPassword="chaneErrorBlock" />

    <!-- Десктопная таблица -->
    <div class="table-container desktop-view">
      <table class="table">
        <thead class="table-header">
          <tr>
            <th class="table-name">
              <span class="column-header"> НАЗВАНИЕ </span>
            </th>
            <th class="table-date">
              <span class="column-header"> ДАТА </span>
            </th>
            <th class="table-switch">
              <span class="column-header"> ВКЛЮЧЕНИЕ </span>
            </th>
            <th class="table-status">
              <span class="column-header"> СТАТУС </span>
            </th>
            <th class="table-info">
              <span class="column-center"> ИНФО </span>
            </th>
            <th class="table-messages">
              <span class="column-center"> СООБЩЕНИЯ </span>
            </th>
            <th class="table-edit">
              <span class="column-center"> РЕДАКТИРОВАТЬ </span>
            </th>
            <th class="table-delete">
              <span class="column-center"> УДАЛИТЬ </span>
            </th>
          </tr>
        </thead>
        <tbody class="tbody">
          <tr
            class="table-row"
            v-if="dataStation"
            v-for="(item, index) in mailingLists"
            :key="index"
          >
            <!-- НАЗВАНИЕ -->
            <td class="table-name-data">
              <div class="mailing-content">
                <div class="mailing-info">
                  <span v-if="item.name.length > 0" class="mailing-name">{{
                    item.name
                  }}</span>
                  <span v-else class="mailing-placeholder">{{
                    t("mailingList.name")
                  }}</span>
                  <span class="mailing-id">ID: {{ item.id }}</span>
                </div>
              </div>
            </td>

            <!-- ДАТА -->
            <td class="table-date-data">
              <div class="date-content">
                <span class="date-value">{{ formatDate(item.dt_create) }}</span>
              </div>
            </td>

            <!-- ВКЛЮЧЕНИЕ -->
            <td class="table-switch-data">
              <label class="switch" :class="{ 'switch-loading': item.loading }">
                <input
                  type="checkbox"
                  :checked="item.state === 1"
                  :disabled="item.loading"
                  @change="toggleMailing(item, $event.target.checked)"
                />
                <span class="slider round">
                  <span class="switch-handle"></span>
                </span>
                <span v-if="item.loading" class="switch-loader"></span>
              </label>
            </td>

            <!-- СТАТУС -->
            <td class="table-status-data">
              <div class="status-content">
                <span class="status-badge" :class="getStatusClass(item.state)">
                  {{ getStatusText(item.state) }}
                </span>
              </div>
            </td>

            <!-- ИНФОРМАЦИЯ -->
            <td class="table-info-data">
              <div class="icon-wrapper" @click="showInfo(item)">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
              </div>
            </td>

            <!-- СООБЩЕНИЯ -->
            <td class="table-messages-data">
              <div class="icon-wrapper" @click="editMessages(item)">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path
                    d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                  ></path>
                </svg>
              </div>
            </td>

            <!-- РЕДАКТИРОВАТЬ -->
            <td class="table-edit-data">
              <div class="icon-wrapper" @click="editMailing(item)">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                  <path d="M15 5l4 4" />
                </svg>
              </div>
            </td>

            <!-- УДАЛИТЬ -->
            <td class="table-delete-data">
              <div
                class="icon-wrapper delete-icon"
                @click="deleteMailing(item)"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M3 6h18"></path>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
                  <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </div>
            </td>
          </tr>

          <!-- Состояния загрузки и ошибок -->
          <tr v-else-if="dataStationNone">
            <td colspan="8">
              <div class="none-account-cont">
                <div class="empty-state">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.5"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  <h3>{{ t("mailingList.noneMailing") }}</h3>
                  <p>Нет доступных рассылок для отображения</p>
                </div>
              </div>
            </td>
          </tr>

          <tr v-if="loadDataStation">
            <td colspan="8">
              <div class="load-cont">
                <div class="loading-state">
                  <div class="loading-spinner"></div>
                  <p>Загрузка рассылок...</p>
                </div>
              </div>
            </td>
          </tr>

          <tr v-if="errorMailing && !loadDataStation">
            <td colspan="8">
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
        <div class="card-header">
          <div class="mailing-info">
            <span class="mailing-name">
              <span v-if="item.name.length > 0">{{ item.name }}</span>
              <span v-else>{{ t("mailingList.name") }}</span>
            </span>
            <span class="mailing-id">ID: {{ item.id }}</span>
          </div>
          <div class="status-badge-mobile" :class="getStatusClass(item.state)">
            {{ getStatusText(item.state) }}
          </div>
        </div>

        <div class="card-content">
          <div class="card-row">
            <span class="label">Дата:</span>
            <span class="value">{{ formatDate(item.dt_create) }}</span>
          </div>

          <div class="card-row">
            <span class="label">Включение:</span>
            <label
              class="switch switch-mobile"
              :class="{ 'switch-loading': item.loading }"
            >
              <input
                type="checkbox"
                :checked="item.state === 1"
                :disabled="item.loading"
                @change="toggleMailing(item, $event.target.checked)"
              />
              <span class="slider round">
                <span class="switch-handle"></span>
              </span>
              <span v-if="item.loading" class="switch-loader"></span>
            </label>
          </div>

          <div class="card-row" v-if="item.state_text">
            <span class="label">Статус:</span>
            <span class="value state-text-mobile">{{ item.state_text }}</span>
          </div>
        </div>

        <div class="card-actions">
          <button class="action-btn info-btn" @click="showInfo(item)">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            Инфо
          </button>

          <button class="action-btn messages-btn" @click="editMessages(item)">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
              ></path>
            </svg>
            Сообщения
          </button>

          <button class="action-btn edit-btn" @click="editMailing(item)">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
              <path d="M15 5l4 4" />
            </svg>
            Редакт.
          </button>

          <button class="action-btn delete-btn" @click="deleteMailing(item)">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M3 6h18"></path>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
              <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
            Удалить
          </button>
        </div>
      </div>
    </div>

    <!-- Состояния для мобильной версии -->
    <div
      class="mobile-states"
      v-if="!dataStation || dataStationNone || loadDataStation || errorMailing"
    >
      <div class="none-account-cont" v-if="dataStationNone">
        <NoData type="campaigns" />
      </div>

      <div class="load-cont" v-if="loadDataStation">
        <LoadAccount />
      </div>

      <div class="load-cont" v-if="errorMailing">
        <ErrorAccount />
      </div>
    </div>

    <!-- Модальные окна -->
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
  </section>
</template>

<script setup>
// ... остальной скрипт без изменений ...

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
  if (!dateString) return "-";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch (e) {
    return dateString;
  }
};

const getStatusText = (state) => {
  switch (state) {
    case 1:
      return t("mailingList.status.active");
    case 0:
      return t("mailingList.status.noActive");
    case 2:
      return t("mailingList.status.completed");
    default:
      return "-";
  }
};

const getStatusClass = (state) => {
  switch (state) {
    case 1:
      return "status-active";
    case 2:
      return "status-completed";
    case 0:
      return "status-inactive";
    default:
      return "";
  }
};

const toggleMailing = (item, isEnabled) => {
  console.log("Toggle mailing:", item.id, "to:", isEnabled);
  // Здесь будет логика включения/выключения рассылки
  // Пока просто меняем состояние локально для демонстрации
  const newState = isEnabled ? 1 : 0;
  changeStatusMailing(item, newState);

  // Можно добавить вызов API здесь:
  // await axios.post('/api/mailing/toggle', { id: item.id, enabled: isEnabled });
};

const openMobileModal = (event, item) => {
  openModal(event, item);
};

// const getMailingLists = async () => {
//   mailingLists.value = false;
//   errorMailing.value = false;
//   dataStationNone.value = false;
//   loadDataStation.value = true;
//   const apiUrlMethod = `${apiUrl}/list/`;
//   try {
//     const response = await axios.get(apiUrlMethod, {
//       headers: {
//         "Content-Type": "application/x-www-form-urlencoded",
//         Authorization: `Bearer ${token.value}`,
//       },
//     });

//     if (response.data) {
//       await handleSendLog(
//         "mailingList",
//         "list",
//         {
//           "Content-Type": "application/x-www-form-urlencoded",
//           Authorization: `Bearer ${token.value}`,
//         },
//         response.data.ok,
//         response.data
//       );
//     }

//     mailingLists.value = response.data.result.items;
//     if (mailingLists.value.length === 0) {
//       loadDataStation.value = false;
//       dataStationNone.value = true;
//     } else if (response.data === 401) {
//       errorBlock.value = true;
//       setTimeout(() => {
//         localStorage.removeItem("accountToken");
//         router.push("/login");
//       }, 2000);
//     } else {
//       loadDataStation.value = false;
//       dataStation.value = true;
//     }
//   } catch (error) {
//     console.error("error", error.message);
//     errorMailing.value = true;
//     loadDataStation.value = false;
//     dataStationNone.value = false;
//   }
// };

const getMailingLists = async () => {
  mailingLists.value = false;
  errorMailing.value = false;
  dataStationNone.value = false;
  loadDataStation.value = true;

  // Имитация загрузки в 2 секунды
  await new Promise((resolve) => setTimeout(resolve, 2000));

  try {
    // Используем ваши данные вместо API запроса
    const mockData = {
      count: 2,
      items: [
        {
          id: 1,
          state: 2,
          state_text: "",
          next_ts: 0,
          name: "",
          text: "еуые",
          options: {
            uniq: true,
            exist: true,
            random: false,
            cascade: ["whatsapp"],
            days: {
              1: 1,
              2: 2,
              3: 3,
              4: 4,
              5: 5,
            },
            hours: {
              min: "10:00",
              max: "17:00",
              timezone: 3,
            },
            delay: {
              min: 9,
              max: 19,
            },
          },
          recipients: 1,
          dt_create: "2025-09-18 21:16:13",
        },
        {
          id: 2,
          state: 1,
          state_text: "Отправка приостановлена из-за дня недели",
          next_ts: 0,
          name: "",
          text: "test",
          options: {
            uniq: true,
            exist: true,
            random: false,
            cascade: ["whatsapp"],
            days: {
              1: 1,
              2: 2,
              3: 3,
              4: 4,
              5: 5,
            },
            hours: {
              min: "10:00",
              max: "17:00",
              timezone: 3,
            },
            delay: {
              min: 10,
              max: 30,
            },
          },
          recipients: 1,
          dt_create: "2025-09-20 20:20:50",
        },
      ],
    };

    mailingLists.value = mockData.items;

    if (mailingLists.value.length === 0) {
      loadDataStation.value = false;
      dataStationNone.value = true;
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
  top = Math.min(
    top,
    window.innerHeight - modalHeight - offset + window.scrollY
  );

  modalPosition.value = {
    top: top,
    left: left,
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

const showInfo = (item) => {
  selectedItem.value = item;
  changeInfoMailing();
};

const editMailing = (item) => {
  selectedItem.value = item;
  changeisEditMailing();
};

const deleteMailing = (item) => {
  selectedItem.value = item;
  changeDeleteMailing();
};

const editMessages = (item) => {
  console.log("Edit messages for:", item);
  // Здесь можно открыть модальное окно редактирования сообщений
};
</script>

<style scoped>
/* ОСНОВНЫЕ СТИЛИ */
.account-list-section {
  padding: 0;
}

.table-container {
  overflow-x: auto;
  overflow-y: auto;
  max-width: 100%;
  height: 80vh;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
}

.desktop-view {
  display: block;
}

.mobile-cards,
.mobile-states {
  display: none;
}

/* СКРОЛЛБАРЫ */
.table-container::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.table-container::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.table-container::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.table-container::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* ТАБЛИЦА */
.table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background: transparent;
  font-size: 14px;
}

/* ЗАГОЛОВКИ */
.table-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background: #f8fafc;
  border-bottom: 2px solid #e2e8f0;
}

.table-header th {
  padding: 14px 10px;
  font-weight: 600;
  font-size: 12px;
  color: #334155;
  text-align: center;
  border-bottom: 1px solid #e2e8f0;
}

.table-name {
  text-align: left;
  width: 25%;
}

.table-date {
  text-align: center;
  width: 12%;
}

.table-switch {
  text-align: center;
  width: 12%;
}

.table-status {
  text-align: center;
  width: 12%;
}

.table-info,
.table-messages,
.table-edit,
.table-delete {
  text-align: center;
  width: 9%;
}

.column-center {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  color: #475569;
  font-size: 12px;
}

.column-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  color: #475569;
  font-size: 12px;
  justify-content: center;
}

/* СТРОКИ ДАННЫХ */
.table-row {
  position: relative;
  transition: background-color 0.2s ease;
  border-bottom: 1px solid #f1f5f9;
  background: transparent;
}

.table-row:hover {
  background: #f8fafc;
}

.table-row:last-child {
  border-bottom: none;
}

/* ЯЧЕЙКИ ДАННЫХ */
.table-row td {
  padding: 12px 10px;
  font-size: 13px;
  color: #334155;
  border-bottom: 1px solid #f1f5f9;
  transition: background-color 0.2s ease;
  text-align: center;
  vertical-align: middle;
}

.table-name-data {
  text-align: left;
}

/* НАЗВАНИЕ */
.mailing-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.mailing-info {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.mailing-name {
  font-weight: 600;
  color: #1e293b;
  font-size: 13px;
}

.mailing-placeholder {
  font-weight: 500;
  color: #475569;
  font-style: italic;
  font-size: 13px;
}

.mailing-id {
  font-size: 11px;
  color: #64748b;
}

/* ДАТА */
.date-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.date-value {
  font-weight: 500;
  color: #374151;
  font-size: 13px;
}

/* ПЕРЕКЛЮЧАТЕЛЬ */
.switch {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 20px;
  margin: 0 auto;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #cbd5e1;
  transition: all 0.3s ease;
  border-radius: 20px;
}

.switch-handle {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 2px;
  bottom: 2px;
  background: white;
  transition: all 0.3s ease;
  border-radius: 50%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

input:checked + .slider {
  background: #3b82f6;
}

input:checked + .slider .switch-handle {
  transform: translateX(20px);
}

input:focus + .slider {
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.switch-loading .slider {
  background: rgba(59, 130, 246, 0.5);
}

.switch-loader {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 12px;
  height: 12px;
  margin: -6px 0 0 -6px;
  border: 2px solid transparent;
  border-top: 2px solid #fff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* СТАТУС */
.status-content {
  display: flex;
  justify-content: center;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.status-active {
  background: #dcfce7;
  color: #166534;
  border: 1px solid #bbf7d0;
}

.status-completed {
  background: #dbeafe;
  color: #1d4ed8;
  border: 1px solid #bfdbfe;
}

.status-inactive {
  background: #f1f5f9;
  color: #64748b;
  border: 1px solid #e2e8f0;
}

/* ИКОНКИ */
.icon-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 5px;
  background: #f1f5f9;
  cursor: pointer;
  transition: all 0.2s ease;
  margin: 0 auto;
}

.icon-wrapper:hover {
  background: #e2e8f0;
  transform: scale(1.05);
}

.icon-wrapper svg {
  color: #64748b;
  width: 16px;
  height: 16px;
}

.delete-icon:hover {
  background: #fee2e2;
}

.delete-icon:hover svg {
  color: #dc2626;
}

/* СОСТОЯНИЯ */
.empty-state,
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
  text-align: center;
}

.empty-state svg {
  color: #cbd5e0;
  margin-bottom: 12px;
}

.empty-state h3 {
  color: #475569;
  margin-bottom: 6px;
  font-weight: 600;
  font-size: 16px;
}

.empty-state p {
  color: #64748b;
  font-size: 13px;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #f1f5f9;
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 12px;
}

/* МОБИЛЬНАЯ ВЕРСИЯ */
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
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 12px;
    padding: 12px;
  }

  .mailing-card {
    background: white;
    border-radius: 10px;
    padding: 14px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    border: 1px solid #e5e7eb;
    display: flex;
    flex-direction: column;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 10px;
    padding-bottom: 8px;
    border-bottom: 1px solid #f3f4f6;
  }

  .mailing-info {
    display: flex;
    flex-direction: column;
    gap: 3px;
    flex: 1;
  }

  .mailing-name {
    font-weight: 600;
    font-size: 14px;
    color: #1f2937;
  }

  .mailing-id {
    font-size: 11px;
    color: #6b7280;
  }

  .status-badge-mobile {
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
  }

  .status-active {
    background: #dcfce7;
    color: #166534;
  }

  .status-completed {
    background: #dbeafe;
    color: #1d4ed8;
  }

  .status-inactive {
    background: #f3f4f6;
    color: #4b5563;
  }

  .card-content {
    flex: 1;
    margin-bottom: 10px;
  }

  .card-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    padding: 6px 0;
  }

  .label {
    font-size: 12px;
    color: #6b7280;
    font-weight: 500;
  }

  .value {
    font-size: 12px;
    color: #374151;
    font-weight: 500;
  }

  .switch-mobile {
    margin: 0;
  }

  .state-text-mobile {
    color: #6b7280;
    font-size: 11px;
  }

  .card-actions {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 6px;
    margin-top: auto;
  }

  .action-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 6px 8px;
    border: none;
    border-radius: 5px;
    font-weight: 600;
    font-size: 11px;
    cursor: pointer;
    transition: all 0.2s ease;
    justify-content: center;
  }

  .info-btn {
    background: #f1f5f9;
    color: #475569;
    border: 1px solid #e2e8f0;
  }

  .info-btn:hover {
    background: #e2e8f0;
  }

  .messages-btn {
    background: #f1f5f9;
    color: #475569;
    border: 1px solid #e2e8f0;
  }

  .messages-btn:hover {
    background: #e2e8f0;
  }

  .edit-btn {
    background: #f1f5f9;
    color: #475569;
    border: 1px solid #e2e8f0;
  }

  .edit-btn:hover {
    background: #e2e8f0;
  }

  .delete-btn {
    background: #fef2f2;
    color: #dc2626;
    border: 1px solid #fecaca;
  }

  .delete-btn:hover {
    background: #fee2e2;
  }
}

/* АДАПТИВНОСТЬ */
@media (max-height: 900px) {
  .table-container {
    height: 74vh;
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

@media (max-width: 640px) {
  .mobile-cards {
    grid-template-columns: 1fr;
    gap: 10px;
    padding: 10px;
  }

  .mailing-card {
    padding: 12px;
  }

  .mailing-name {
    font-size: 13px;
  }

  .label {
    font-size: 11px;
  }

  .value {
    font-size: 11px;
  }

  .action-btn {
    padding: 5px 6px;
    font-size: 10px;
  }
}

@media (max-width: 480px) {
  .mobile-cards {
    padding: 8px;
    gap: 8px;
  }

  .mailing-card {
    padding: 10px;
  }

  .mailing-name {
    font-size: 12px;
  }

  .action-btn {
    padding: 4px 5px;
    font-size: 9px;
  }
}
</style>
