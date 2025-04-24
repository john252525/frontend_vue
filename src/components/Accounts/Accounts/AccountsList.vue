<template>
  <section class="account-list-section">
    <div class="table-container">
      <table class="table">
        <thead class="table-header">
          <tr>
            <th class="table-login">{{ t("accountList.login") }}</th>
            <th class="table-step">{{ t("accountList.step") }}</th>
            <th class="table-action">{{ t("accountList.action") }}</th>
          </tr>
        </thead>
        <tbody class="tbody">
          <tr
            v-if="dataStation"
            v-for="(item, index) in instanceData"
            :key="index"
          >
            <td class="table-text-number">
              <AccountIcon
                v-if="stationDomen.navigate.value === 'whatsapi'"
                :item="item"
              />
              {{ formatPhoneNumber(item.login) }}
            </td>
            <td
              class="table-text"
              @mouseover="showMessage($event, item.step.message)"
              @mouseleave="hideMessage"
              v-if="item.step"
            >
              {{ item.step.value }}
            </td>
            <td class="table-text" v-else-if="item.loading">
              <LoadingAccount />
            </td>
            <td class="table-text" v-else>-</td>
            <td class="table-action-text">
              <button
                v-if="
                  (item.storage === 'local' && item.type === 'undefined') ||
                  (item.storage === 'binder' && item.type === 'touchapi') ||
                  (item.storage === 'undefined' && item.type === 'whatsapi')
                "
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
                {{ t("accountList.actionButton") }}
              </button>
            </td>
          </tr>
          <tr v-else-if="dataStationNone">
            <td colspan="3">
              <div class="none-account-cont">
                <h2>{{ t("accountList.accountNone") }}</h2>
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
      <span v-if="messageVisible" class="tooltip" :style="tooltipStyle">{{
        tooltipMessage
      }}</span>
    </div>
    <Modal
      :isModalOpen="isModalOpen"
      :closeModal="closeModal"
      :modalPosition="modalPosition"
      :selectedItem="selectedItem"
      :qrCodeData="qrCodeData"
      @update:loadingStation="updateLoading"
      @update:selectedItems="updateSelectedItems"
      @update:qrCodeData="updateqrCodeData"
      :changeStationSettingsModal="changeStationSettingsModal"
      :changeStationQrModal="changeStationQrModal"
      :changeStationGetByCode="changeStationGetByCode"
      :changeEnableStation="changeEnableStation"
      :getScreenStation="getScreenStation"
      :changeGetScreenStation="changeGetScreenStation"
      :chatsStation="chatsStation"
    />
    <SettignsModal
      :closeModal="closeModal"
      :selectedItems="selectedItems"
      :settingsModalStation="settingsModalStation"
      :changeStationSettingsModal="changeStationSettingsModal"
    />
    <QrModal
      :qrModalStation="qrModalStation"
      :changeStationQrModal="changeStationQrModal"
      :qrCodeData="qrCodeData"
      :changeStationQrModalOn="changeStationQrModalOn"
    />
    <getByCode
      v-if="getByCodeStation"
      :changeStationGetByCode="changeStationGetByCode"
      :selectedItems="selectedItems"
      :getByCodeStation="getByCodeStation"
    />
    <getScreen
      v-if="getScreenStation"
      :changeGetScreenStation="changeGetScreenStation"
      :selectedItem="selectedItem"
    />
    <Enable
      v-if="enableStation"
      :enableStation="enableStation"
      :selectedItem="selectedItem"
      :changeEnableStation="changeEnableStation"
    />
    <ErrorBlock v-if="errorBlock" :changeIncorrectPassword="chaneErrorBlock" />
  </section>
</template>

<script setup>
import { ref, reactive, onMounted, provide, inject } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";
import LoadingAccount from "./LoadingMoadal/LoadingAccount.vue";
import ErrorBlock from "@/components/ErrorBlock/ErrorBlock.vue";
import Modal from "./Modal.vue";
import Enable from "./ModalAccount/Enable/Enable.vue";
import SettignsModal from "./ModalAccount/settingsModal.vue";
import getByCode from "./ModalAccount/GetByCode/GetByCode.vue";
import QrModal from "./ModalAccount/qrModal.vue";
import getScreen from "./ModalAccount/GetScreen.vue";
import LoadingMoadal from "./LoadingMoadal/LoadingMoadal.vue";
import LoadAccount from "./LoadAccount.vue";
import AccountIcon from "../AccountIcon.vue";
const dataAccount = reactive({
  token: "342b63fd-6017-446f-adf8-d1b8e0b7bfc6",
  source: "telegram",
  error: null,
});

import { useDomain } from "@/composables/getDomen";
const { stationDomen } = useDomain();

import { useI18n } from "vue-i18n";
const { t } = useI18n();

const router = useRouter();

const chatsLoadingChange = inject("chatsLoadingChange");
const dataStationNone = ref(false);
const dataStation = ref(false);
const loadDataStation = ref(false);
const qrCodeData = ref([]);
const enableStation = ref(false);
const getByCodeStation = ref(false);
const getScreenStation = ref(false);
const qrModalStation = ref(false);
const settingsModalStation = ref(false);
const instanceData = ref([]);
const accounts = ref([]);
const isModalOpen = ref(false);
const modalPosition = ref({ top: 0, left: 0 });
const selectedItem = ref(null);
const selectedItems = ref(null);
const loadingStation = ref(false);
const chatsStation = ref(false);

const changeEnableStation = () => {
  enableStation.value = !enableStation.value;
};

const changeGetScreenStation = () => {
  getScreenStation.value = !getScreenStation.value;
};

const errorBlock = ref(false);
const chaneErrorBlock = () => {
  errorBlock.value = errorBlock.value;
};

const getAccounts = async () => {
  let params = {
    source: localStorage.getItem("accountStation"),
    skipDetails: true,
  };

  if (stationDomen.navigate.value != "whatsapi") {
    params = {
      source: localStorage.getItem("accountStation"),
      skipDetails: true,
    };
  } else {
    params = {
      skipDetails: true,
    };
  }
  loadDataStation.value = true; // Устанавливаем флаг загрузки
  try {
    const response = await axios.post(
      "https://b2288.apitter.com/instances/getInfoByToken",
      params,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accountToken")}`,
          // Authorization: `Bearer ${localStorage.getItem("accountToken")}`,
        },
      }
    );
    // 9bddaafd-2c8d-4840-96d5-1c19c0bb4bd5
    console.log(localStorage.getItem("accountToken"));
    if (response.data.ok === true) {
      // Инициализируем accounts с loading: true
      accounts.value = response.data;
      instanceData.value = accounts.value.data.instances.map((instance) => ({
        ...instance,
        step: instance.step === null ? "Н/Д" : instance.step,
        loading: true, // Добавляем поле loading
      }));
      console.log(instanceData.value);

      if (instanceData.value.length === 0) {
        console.log("Данных нет");
        loadDataStation.value = false;
        dataStationNone.value = true;
      } else {
        loadDataStation.value = false;
        dataStation.value = true;

        // Проверяем, если source равен "whatsapp"
        if (
          localStorage.getItem("accountStation") === "whatsapp" ||
          localStorage.getItem("accountStation") === "telegram"
        ) {
          // Создаем массив промисов для обработки каждого экземпляра
          const promises = instanceData.value.map(async (instance) => {
            const login = instance.login; // Извлекаем логин

            try {
              // Запрос для получения информации о каждом логине
              const infoResponse = await getInfoWhats(instance.source, login);
              if (
                infoResponse &&
                infoResponse.data &&
                infoResponse.data.data.step
              ) {
                // Обновляем step
                instance.step = infoResponse.data.data.step;
              }
            } catch (error) {
              console.error(
                `Ошибка при получении информации для логина ${login}:`,
                error
              );
            } finally {
              // Устанавливаем loading в false в любом случае
              instance.loading = false;
            }

            // Проверяем, если step равен 5
            if (instance.step[0].value === 5) {
              console.log(instance);
              let existingLogins;

              const storedData = localStorage.getItem("loginWhatsAppChatsStep");

              if (storedData) {
                try {
                  existingLogins = JSON.parse(storedData) || []; // Получаем существующий массив объектов
                } catch (error) {
                  console.error(
                    "Ошибка при парсинге JSON из localStorage:",
                    error
                  );
                  existingLogins = []; // Если парсинг не удался, создаем пустой массив
                }
              } else {
                existingLogins = []; // Инициализируем пустой массив объектов
              }

              // Создаем объект для нового логина
              const newLoginObject = {
                login: login,
                source: localStorage.getItem("accountStation"),
              };

              // Проверяем, есть ли уже логин в массиве объектов (сравниваем объекты)
              const loginExists = existingLogins.some(
                (item) => item.login === login
              );

              if (!loginExists) {
                existingLogins.push(newLoginObject); // Добавляем новый объект в массив
                localStorage.setItem(
                  "loginWhatsAppChatsStep",
                  JSON.stringify(existingLogins) // Сохраняем массив объектов
                );
                console.log(
                  "Логины в localStorage:",
                  localStorage.getItem("loginWhatsAppChatsStep")
                );
              } else {
                console.log(`Логин "${login}" уже существует в localStorage.`);
                console.log(
                  JSON.parse(localStorage.getItem("loginWhatsAppChatsStep"))
                );
              }
            }
          });

          // Ждем завершения всех запросов
          await Promise.all(promises);
          // Выводим сообщение о завершении проверки всех аккаунтов
          chatsLoadingChange();
          console.log(accounts.value);
        }
      }
    } else if (response.data === 401) {
      errorBlock.value = true;
      // setTimeout(() => {
      //   localStorage.removeItem("accountToken");
      //   router.push("/login");
      // }, 2000);
    }
  } catch (error) {
    loadDataStation.value = false; // Устанавливаем значение false в случае ошибки
    dataStationNone.value = true; // Показываем, что данные отсутствуют
    if (error.response) {
      if (error.response.status === 401) {
        console.log("Нет доступа");
      } else {
        console.error("Ошибка при получении списка аккаунтов:", error);
        console.error("Ответ сервера:", error.response.data);
      }
    } else {
      error.value = error.message || "Произошла ошибка.";
      console.error("Ошибка при получении списка аккаунтов:", error);
    }
  }
};

// Функция getInfo
const getInfoWhats = async (source, login) => {
  try {
    const response = await axios.post(
      "https://b2288.apitter.com/instances/getInfo",
      {
        source: source,
        login: login,
      },
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: `Bearer ${localStorage.getItem("accountToken")}`,
        },
      }
    );
    console.log(response.data);
    return response;
  } catch (error) {
    console.error("Ошибка при получении информации:", error);
    return null; // Возвращаем null в случае ошибки
  }
};

const openModal = (event, item) => {
  localStorage.setItem("accauntSourse", item.source);
  console.log(localStorage.getItem("accauntSourse"));
  selectedItem.value = item;
  isModalOpen.value = true;
  localStorage.setItem("userInfo", JSON.stringify(selectedItem.value));
  console.log(localStorage.getItem("userInfo"));
  getInfo();
  const rect = event.currentTarget.getBoundingClientRect();
  modalPosition.value = {
    top: rect.bottom + window.scrollY,
    left: rect.left + window.scrollX,
  };
};

function formatPhoneNumber(phoneNumber) {
  const regex = /^8(\d{3})(\d{3})(\d{2})(\d{2})$/;
  const match = phoneNumber.match(regex);

  if (!match) {
    return phoneNumber;
  }

  return `+7 (${match[1]}) ${match[2]}-${match[3]}-${match[4]}`;
}

const changeStationSettingsModal = () => {
  settingsModalStation.value = !settingsModalStation.value;
};

const changeStationQrModal = () => {
  qrModalStation.value = !qrModalStation.value;
};

const changeStationQrModalOn = () => {
  qrModalStation.value = true;
};

const changeStationGetByCode = () => {
  getByCodeStation.value = !getByCodeStation.value;
};

const closeModal = () => {
  isModalOpen.value = false;
  chatsStation.value = false;
};

const updateSelectedItems = (newValue) => {
  selectedItems.value = newValue;
};

const updateqrCodeData = (newValue) => {
  qrCodeData.value = newValue;
};

const updateLoading = (newValue) => {
  loadingStation.value = newValue;
};

const messageVisible = ref(false);
const tooltipMessage = ref("");
const tooltipStyle = ref({});

const showMessage = (event, step) => {
  tooltipMessage.value = `Текущий шаг: ${step}`; // Замените на нужное сообщение
  messageVisible.value = true;

  // Позиционирование всплывающего сообщения
  const tooltipWidth = 100; // Ширина всплывающего сообщения
  const tooltipHeight = 30; // Высота всплывающего сообщения
  const rect = event.currentTarget.getBoundingClientRect(); // Получаем размеры ячейки

  tooltipStyle.value = {
    top: `${rect.bottom + window.scrollY}px`, // Позиция сверху
    left: `${rect.left + window.scrollX + rect.width / 2 - tooltipWidth / 2}px`, // Центруем по горизонтали
    width: `${tooltipWidth}px`,
    height: `${tooltipHeight}px`,
  };
};

const hideMessage = () => {
  messageVisible.value = false;
};

const getInfo = async () => {
  try {
    const response = await axios.post(
      "https://b2288.apitter.com/instances/getInfo",
      {
        source: selectedItem.value.source,
        login: selectedItem.value.login,
      },
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: `Bearer ${localStorage.getItem("accountToken")}`,
        },
      }
    );
    if (response.data.data.step) {
      if (response.data.data.step.value === 5) {
        chatsStation.value = true;
      }
    } else if (response.data === 401) {
      errorBlock.value = true;
      setTimeout(() => {
        localStorage.removeItem("accountToken");
        router.push("/login");
      }, 2000);
    } else {
      console.log(response.data.ok);
    }
  } catch (error) {
    console.error("Ошибка при создании аккаунта:", error);
    if (error.response) {
      console.error("Ошибка сервера:", error.response.data);
    }
  }
};
onMounted(getAccounts);
provide("selectedItems", { selectedItems });
provide("changeEnableStation", { changeEnableStation });
</script>

<style scoped>
.table-container {
  overflow-x: auto;
  overflow-y: auto;
  max-width: 100%;
  height: 83vh;
}

.tooltip {
  position: absolute;
  background: rgba(0, 0, 0, 0.75);
  color: #fff;
  padding: 5px 10px;
  border-radius: 5px;
  font-size: 12px;
  z-index: 10;
  /* Можно добавить дополнительные стили */
}

.table-header {
  /* position: sticky; */
  top: 0;
  z-index: 1;
}

.table {
  width: 100%;
  /* min-width: 600px; */
  border-collapse: collapse;
}

/* .table-login {
  width: 30%;
}

.table-step {
  width: 50%;
}

.table-action {
  width: 20%;
} */

.bi-list {
  width: 16px; /* Ширина и высота иконки */
  height: 16px;
  fill: currentColor;
  margin-bottom: -4px;
  margin-right: 6px;
}

.load-cont {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: -10px;
}

.none-account-cont {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  flex-direction: column;
  margin-top: 0px;
  height: 50px;
  width: 100%;
  background-color: var(--noAccountTableBg);
  border-radius: 5px;
}

.none-account-cont h2 {
  font-size: 14px;
  font-weight: 500;
  color: var(--noAccountTableText);
  margin-left: 10px;
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
  padding: 1rem;
  width: 200px;
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
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
  box-sizing: border-box;
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
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0; /* Позиционируем линию внизу строки */
  height: 1px; /* Высота линии */
  background-color: #ebebeb;
}

tr:hover {
  position: static;
}
</style>
