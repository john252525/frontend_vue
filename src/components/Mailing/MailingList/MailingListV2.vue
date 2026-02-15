<template>
  <div class="list-container">
    <div v-if="mailingLists && mailingLists.length > 0" class="accounts-list">
      <div
        class="account-row"
        v-for="(item, index) in mailingLists"
        :key="index"
      >
        <div class="row-section section-identity">
          <div class="identity-info">
            <span v-if="item.name" class="account-name">{{ item.name }}</span>
            <span v-else class="account-name"> Рассылка {{ item.id }}</span>
          </div>
        </div>

        <StatusSwitch :item="item" :changeStatusMailing="changeStatusMailing" />

        <div class="vertical-divider"></div>

        <div @click="openAccountModal(item)" class="row-section section-data">
          <span class="data-label">Состояние</span>
          <span class="status-badge" :class="getStatusClass(item.state)"
            >{{ getStatusText(item.state) }}
          </span>
        </div>

        <div @click="openAccountModal(item)" class="row-section section-data">
          <span class="data-label">Статус</span>
          <span v-if="item.state_text" class="status-text">{{
            item.state_text
          }}</span>
          <span v-else class="status-text">-</span>
        </div>

        <div class="row-section section-actions">
          <div class="icon-actions"></div>

          <button
            class="action-btn"
            @click="changeInfoMailing(item)"
            title="Информация"
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
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
          </button>

          <button
            class="action-btn"
            @click="changeStationMessage(item)"
            title="Сообщения"
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
              <path
                d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
              ></path>
            </svg>
          </button>

          <button
            class="action-btn edit-btn"
            @click="changeisEditMailing(item)"
            title="Редактировать"
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
              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
              <path d="M15 5l4 4" />
            </svg>
          </button>

          <button
            class="action-btn delete-btn"
            @click="changeDeleteMailing(item)"
            title="Удалить"
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
          </button>
        </div>
      </div>
    </div>

    <div v-else-if="dataStationNone" class="state-container">
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
        <h3>Рассылки отсутствуют</h3>
        <p>Нет доступных рассылок для отображения</p>
      </div>
    </div>

    <div v-if="loadDataStation" class="state-container">
      <div class="loading-state">
        <div class="loading-spinner"></div>
        <p>Загрузка рассылок...</p>
      </div>
    </div>

    <div v-if="errorMailing && !loadDataStation" class="state-container">
      <errorAccount />
    </div>
  </div>

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
    :changeStationMessage="changeStationMessage"
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
import { ref, reactive, onMounted, provide, watch, computed } from "vue";
import StatusSwitch from "./listComponents/StatusSwitch.vue";
import axios from "axios";
const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL;
import ConfirmDelete from "../ModalComponent/confirmModal/confirmDelete.vue";
import Modal from "../ModalComponent/Modal.vue";
import InfoMailing from "../ModalComponent/InfoMailing.vue";
import EditMailing from "../ModalComponent/EditMailing/EditMailing.vue";
import ErrorAccount from "./errorAccount.vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useAccountStore } from "@/stores/accountStore";
const accountStore = useAccountStore();
const token = computed(() => accountStore.getAccountToken);
import { useMailingVersion } from "@/stores/mailingVersion";
const mailingVersion = useMailingVersion();
const getVersion = computed(() => mailingVersion.getVersion);
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
      return "Активна";
    case 0:
      return "Неактивна";
    case 2:
      return "Завершена";
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
      params: {
        version: getVersion.value,
      },
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Bearer ${token.value}`,
      },
    });

    mailingLists.value = response.data.result.items.map((instance) => ({
      ...instance,
      loading: false,
    }));
    console.log("mailingLists", mailingLists.value);
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
    (mailing) => mailing.id === item.id,
  );
  if (index !== -1) {
    mailingLists.value[index].state = state;
    if (state === 1) {
      mailingLists.value[index].state_text = "В процессе";
    } else {
      mailingLists.value[index].state_text = "Приостановлена";
    }
  }
};

const openModal = (event, item) => {
  selectedItem.value = item;
  station.isModalOpen = true;

  const rect = event.currentTarget.getBoundingClientRect();
  const modalWidth = 150;
  const edgeMargin = 10;

  // Динамически рассчитываем высоту модалки на основе количества действий
  const actionCount = getMailingActionCount(item);
  const itemHeight = 32; // Высота одного пункта меню
  const padding = 16; // Внутренние отступы
  const estimatedModalHeight = actionCount * itemHeight + padding;

  if (window.innerWidth <= 768) {
    // Для мобильных - позиционируем снизу экрана
    modalPosition.value = {
      top: "auto",
      bottom: "10px",
      left: "50%",
      transform: "translateX(-50%)",
      width: "90%",
      maxWidth: "400px",
    };
  } else {
    // Для десктопа - умное позиционирование
    let left = rect.left + window.scrollX;
    let top = rect.bottom + window.scrollY + 5;

    // Проверяем правую границу
    if (left + modalWidth > window.innerWidth - edgeMargin) {
      left = window.innerWidth - modalWidth - edgeMargin;
    }

    // Проверяем левую границу
    if (left < edgeMargin) {
      left = edgeMargin;
    }

    // Проверяем, помещается ли модалка снизу
    const spaceBelow = window.innerHeight - rect.bottom - 15;
    const spaceAbove = rect.top - 15;

    // Для модалок с 1-2 элементами ВСЕГДА показываем снизу (если хватает места)
    if (actionCount <= 2) {
      // Для маленьких модалок всегда предпочитаем позицию снизу
      if (spaceBelow < estimatedModalHeight) {
        // Если снизу не хватает места, ограничиваем высоту или показываем сверху
        if (spaceAbove > spaceBelow) {
          top = rect.top + window.scrollY - estimatedModalHeight - 5;
        } else {
          // Если и сверху мало места, ограничиваем позицию снизу
          top = window.innerHeight - estimatedModalHeight - edgeMargin;
        }
      }
    } else {
      // Для больших модалок используем стандартную логику
      if (spaceBelow < estimatedModalHeight && spaceAbove > spaceBelow) {
        top = rect.top + window.scrollY - estimatedModalHeight - 5;
      }
    }

    // Финальная проверка границ
    if (top < edgeMargin) {
      top = edgeMargin;
    }

    if (top + estimatedModalHeight > window.innerHeight - edgeMargin) {
      top = window.innerHeight - estimatedModalHeight - edgeMargin;
    }

    modalPosition.value = {
      top: Math.max(edgeMargin, Math.round(top)),
      left: Math.max(edgeMargin, Math.round(left)),
    };
  }
};

// Функция для подсчета количества действий в модалке рассылки
const getMailingActionCount = (item) => {
  if (!item) return 4; // Значение по умолчанию

  let count = 0;

  // Базовые действия для всех рассылок
  count++; // Информация
  count++; // Сообщения

  // Действия в зависимости от статуса
  if (item.state === 1) {
    // Активная
    count++; // Остановить
  } else if (item.state === 0) {
    // Неактивная
    count++; // Запустить
  }

  count++; // Редактировать
  count++; // Удалить

  return Math.max(1, count); // Всегда минимум 1 действие
};

const stationMessage = ref(false);

const changeStationMessage = (item) => {
  if (item != null) {
    console.log("item");
    selectedItem.value = item;
  }

  if (station.infoMailing === true) {
    station.infoMailing = false;
  }

  console.log("message");
  stationMessage.value = !stationMessage.value;
};

const closeModal = () => {
  station.isModalOpen = false;
};

const changeisEditMailing = (item) => {
  selectedItem.value = item;

  station.editMailing = !station.editMailing;
};

const changeisEditMailingInfo = (item) => {
  if (!station.infoMailing) {
    selectedItem.value = item;
  }
  changeInfoMailing();
  station.editMailing = !station.editMailing;
};

const changeisAddMailing = (item) => {
  station.isAddMailing = !station.isAddMailing;
};

const changeDeleteMailing = (item) => {
  selectedItem.value = item;
  station.deleteMailing = !station.deleteMailing;
};

const changeInfoMailing = (item) => {
  selectedItem.value = item;
  station.infoMailing = !station.infoMailing;
};

watch(getVersion, async (newVersion) => {
  if (newVersion) {
    console.log("New", newVersion);
    await getMailingLists();
  }
});

onMounted(getMailingLists);
provide("selectedItem", { selectedItem });
</script>

<style scoped>
/* ОСНОВНОЙ КОНТЕЙНЕР */
.list-container {
  width: 100%;
  height: 80vh;
  overflow-y: auto;
  padding: 16px;
  box-sizing: border-box;
}

.accounts-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* СТРОКА-КАРТОЧКА */
.account-row {
  display: flex;
  align-items: center;
  background: #ffffff;
  border-radius: 10px;
  padding: 12px 20px;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  gap: 20px;
}

.account-row:hover {
  border-color: #cbd5e1;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transform: translateY(-1px);
}

.row-active {
  background: #ffffff;
}

.row-disabled {
  background: #f5f7fa;
  opacity: 0.9;
}

/* СЕКЦИИ СТРОКИ */
.row-section {
  display: flex;
  align-items: center;
}

/* 1. ИДЕНТИФИКАЦИЯ (Иконка, Имя) */
.section-identity {
  flex: 1.5; /* Широкая секция */
  gap: 12px;
}

.identity-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.account-name {
  font-weight: 600;
  color: #1e293b;
  font-size: 15px;
}

.account-login {
  font-weight: 500;
  color: #475569;
  font-size: 15px;
}

.account-type {
  font-size: 11px;
  color: #64748b;
  background: #f1f5f9;
  padding: 2px 8px;
  border-radius: 4px;
  margin-top: 4px;
  display: inline-block;
  align-self: flex-start;
}

.subscription-warning-desktop {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  padding: 4px;
  border-radius: 100%;

  color: #f59e0b;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-left: 8px;
  flex-shrink: 0;
}

.subscription-warning-desktop:hover {
  color: #d97706;
  transform: scale(1.1);
}

/* 2. ТУМБЛЕР (ПЕРЕКЛЮЧАТЕЛЬ) */
.section-toggle {
  flex: 0 0 auto;
}

/* Вертикальная линия разделитель (опционально) */
.vertical-divider {
  width: 1px;
  height: 32px;
  background: #e2e8f0;
}

/* 3. ДАННЫЕ (СТАТУС И ПОДПИСКА) - Вертикальный стек */
.section-data {
  flex: 1;
  flex-direction: column; /* Сверху вниз */
  align-items: flex-start;
  justify-content: center;
  gap: 4px;
}

.data-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  color: #94a3b8;
  letter-spacing: 0.05em;
}

.data-value {
  display: flex;
  align-items: center;
  min-height: 24px;
}

/* 4. ДЕЙСТВИЯ (Справа) */
.section-actions {
  flex: 0 0 auto;
  justify-content: flex-end;
  gap: 12px;
  margin-left: auto; /* Прижимаем вправо */
}

.action-btn {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 1px solid transparent;
  background-color: #f7fafc;
  color: #718096;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  background-color: #edf2f7;
  color: #4a5568;
  transform: translateY(-1px);
}

.action-btn.edit-btn:hover {
  background-color: #ebf8ff;
  color: #3182ce;
  border-color: #bee3f8;
}

.action-btn.delete-btn:hover {
  background-color: #fff5f5;
  color: #e53e3e;
  border-color: #fed7d7;
}

/* КОМПОНЕНТЫ УПРАВЛЕНИЯ */

/* Переключатель */
.switch {
  position: relative;
  display: inline-block;
  width: 36px;
  height: 20px;
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
  transform: translateX(16px);
}

.switch-loading .slider {
  background: rgba(59, 130, 246, 0.5);
}

.switch-loader {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 10px;
  height: 10px;
  margin: -5px 0 0 -5px;
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

/* Статус Бейджи */
.status-badge {
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  white-space: nowrap;
}

.status-active {
  background: #dcfce7;
  color: #166534;
  border: 1px solid #bbf7d0;
}

.status-completed {
  background: #f1f5f9;
  color: #64748b;
  border: 1px solid #e2e8f0;
}

.status-inactive {
  background: #fee2e2;
  color: #b91c1c;
  border: 1px solid #fecaca;
}

.status-text {
  font-size: 12px;
  font-weight: 500;
  color: #475569;
}

.status-empty {
  color: #94a3b8;
  font-style: italic;
}

.open-tariff-button {
  position: relative;
  z-index: 1;
  padding: 4px 8px;
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  overflow: hidden; /* Чтобы градиент не вылезал за скругление */
}

/* Создаем слой для нового градиента при наведении */
.open-tariff-button::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    #7c3aed 0%,
    #4f46e5 100%
  ); /* Цвета наоборот или другие */
  opacity: 0;
  z-index: -1;
  transition: opacity 0.25s ease-in-out;
}

.open-tariff-button:hover::before {
  opacity: 1;
}

.subscription-active {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #166534;
  font-weight: 500;
  font-size: 13px;
}

.subscription-expired {
  color: #dc2626;
  font-weight: 500;
  font-size: 13px;
}

/* Иконки действий */
.icon-actions {
  display: flex;
  gap: 8px;
}

.icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: #f1f5f9;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #64748b;
}

.icon-wrapper:hover {
  background: #e2e8f0;
  color: #334155;
}

.action-menu-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: transparent;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  cursor: pointer;
  color: #64748b;
  transition: all 0.2s ease;
}

.action-menu-button:hover {
  background: #f1f5f9;
  color: #334155;
}

/* СОСТОЯНИЯ (Empty, Loading, Error) */
.state-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
}

.empty-state,
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 32px;
  text-align: center;
}

.empty-state svg {
  color: #cbd5e0;
  margin-bottom: 16px;
}

.empty-state h3 {
  color: #475569;
  margin-bottom: 8px;
  font-weight: 600;
  font-size: 18px;
}

.empty-state p {
  color: #64748b;
  font-size: 14px;
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid #f1f5f9;
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

/* ТУЛТИП */
.tooltip {
  position: fixed;
  background: rgba(15, 23, 42, 0.95);
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  z-index: 1000;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-width: 250px;
  word-wrap: break-word;
  line-height: 1.4;
}

/* СКРОЛЛБАР */
.list-container::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.list-container::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.list-container::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.list-container::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* АДАПТИВНОСТЬ */
@media (max-width: 900px) {
  .account-row {
    flex-wrap: wrap;
    gap: 16px;
  }

  .section-identity {
    flex: 100%;
    min-width: 100%;
    border-bottom: 1px solid #f1f5f9;
    padding-bottom: 8px;
  }

  .vertical-divider {
    display: none;
  }

  .section-data {
    flex: 1;
    min-width: 120px;
  }

  .section-toggle {
    order: 2;
  }

  .section-actions {
    order: 10;
    margin-left: 0;
    width: 100%;
    justify-content: flex-end;
    border-top: 1px solid #f1f5f9;
    padding-top: 8px;
  }
}
</style>
