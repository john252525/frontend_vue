<template>
  <section class="account-list-section">
    <!-- Десктопная таблица -->
    <div class="table-container desktop-view">
      <table class="table">
        <thead class="table-header">
          <tr>
            <th class="table-login">АККАУНТ</th>
            <th class="table-step">СТАТУС</th>
            <th class="table-sub">ПОДПИСКА</th>
            <th class="table-action">
              {{ t("accountList.action") }}
            </th>
          </tr>
        </thead>
        <tbody class="tbody">
          <tr
            class="table-row"
            :class="{
              active: item.isPay,
            }"
            v-if="dataStation"
            v-for="(item, index) in instanceData"
            :key="index"
          >
            <td v-if="item.name || item.login" class="table-text-number">
              <AccountIcon :item="item" />
              <span v-if="item.name">{{ item.name }}</span>
              <span v-else>{{ item.login }}</span>
            </td>
            <td v-else class="table-text">-</td>
            <td
              class="table-text"
              @mouseover="showMessage($event, item.step.message)"
              @mouseleave="hideMessage"
              v-if="
                item.step && item.type != 'amocrm' && item.type != 'bitrix24'
              "
            >
              {{ item.step.value }}
            </td>

            <td
              class="table-text"
              v-else-if="
                item.loading && item.type != 'amocrm' && item.type != 'bitrix24'
              "
            >
              <LoadingAccount />
            </td>
            <td
              class="table-text"
              v-if="
                item.type != 'amocrm' &&
                item.type != 'bitrix24' &&
                !item.loading &&
                !item.step
              "
            >
              -
            </td>
            <td
              class="table-text"
              v-if="item.type === 'amocrm' || item.type === 'bitrix24'"
            >
              {{ item.enable }}
            </td>
            <td v-if="accountStation === 'crm'">{{ item.type }}</td>
            <td v-if="item.subscription_dt_to === null">
              <button
                v-if="item.type != 'amocrm' && item.type != 'bitrix24'"
                class="open-tariff-button"
                @click="changeTariffStation(item)"
              >
                Продлить
              </button>
              <span v-else>-</span>
            </td>
            <td v-if="item.subscription_dt_to !== null">
              До {{ item.subscription_dt_to }}
            </td>
            <td class="table-action-text">
              <button
                v-if="
                  (item.storage === 'local' && item.type === 'undefined') ||
                  (item.storage === 'binder' && item.type === 'touchapi') ||
                  (item.storage === 'undefined' && item.type === 'whatsapi') ||
                  (item.storage === 'whatsapi' && item.type === 'undefined') ||
                  item.type === 'bulk' ||
                  item.type === 'amocrm' ||
                  item.type === 'bitrix24'
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
              <button
                v-if="
                  (item.storage === 'local' && item.type === 'undefined') ||
                  (item.storage === 'binder' && item.type === 'touchapi') ||
                  (item.storage === 'undefined' && item.type === 'whatsapi') ||
                  (item.storage === 'whatsapi' && item.type === 'undefined') ||
                  item.type === 'bulk' ||
                  item.type === 'amocrm' ||
                  item.type === 'bitrix24'
                "
                class="action-table-button-phone"
                @click="openModal($event, item)"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="#5a4fc1"
                    d="M13.82 22h-3.64a1 1 0 0 1-.977-.786l-.407-1.884a8.002 8.002 0 0 1-1.535-.887l-1.837.585a1 1 0 0 1-1.17-.453L2.43 15.424a1.006 1.006 0 0 1 .193-1.239l1.425-1.3a8.1 8.1 0 0 1 0-1.772L2.623 9.816a1.006 1.006 0 0 1-.193-1.24l1.82-3.153a1 1 0 0 1 1.17-.453l1.837.585c.244-.18.498-.348.76-.5c.253-.142.513-.271.779-.386l.408-1.882A1 1 0 0 1 10.18 2h3.64a1 1 0 0 1 .976.787l.412 1.883a8.192 8.192 0 0 1 1.535.887l1.838-.585a1 1 0 0 1 1.169.453l1.82 3.153c.232.407.152.922-.193 1.239l-1.425 1.3a8.1 8.1 0 0 1 0 1.772l1.425 1.3c.345.318.425.832.193 1.239l-1.82 3.153a1 1 0 0 1-1.17.453l-1.837-.585a7.98 7.98 0 0 1-1.534.886l-.413 1.879a1 1 0 0 1-.976.786ZM11.996 8a4 4 0 1 0 0 8a4 4 0 0 0 0-8Z"
                  />
                </svg>
              </button>
            </td>
          </tr>
          <tr v-else-if="dataStationNone">
            <td colspan="4">
              <div class="none-account-cont">
                <NoData type="accounts" />
              </div>
            </td>
          </tr>
          <tr v-if="loadDataStation">
            <td colspan="4">
              <div class="load-cont">
                <LoadAccount />
              </div>
            </td>
          </tr>
          <tr v-if="errorAccountBolean && !loadDataStation">
            <td colspan="4">
              <div class="load-cont">
                <errorAccount />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <span v-if="messageVisible" class="tooltip" :style="tooltipStyle">{{
        tooltipMessage
      }}</span>
    </div>

    <!-- Мобильные карточки -->
    <div class="mobile-cards" v-if="dataStation && instanceData.length > 0">
      <div
        class="account-card"
        :class="{ active: item.isPay }"
        v-for="(item, index) in instanceData"
        :key="'mobile-' + index"
      >
        <!-- Заголовок карточки -->
        <div class="card-header">
          <div class="account-info">
            <AccountIcon :item="item" />
            <span class="account-login">{{ item.login || "-" }}</span>
          </div>
          <button
            class="action-gear"
            @click="openMobileModal($event, item)"
            v-if="isActionAvailable(item)"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="12" cy="12" r="3"></circle>
              <path
                d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"
              ></path>
            </svg>
          </button>
        </div>

        <!-- Контент карточки -->
        <div class="card-content">
          <!-- Статус -->
          <div class="card-row">
            <span class="label">Статус:</span>
            <span class="value">
              <span v-if="item.loading && accountStation != 'crm'">
                <LoadingAccount />
              </span>
              <span
                v-else-if="
                  item.step && item.type != 'amocrm' && item.source != 'bitrix'
                "
              >
                {{ item.step.value }}
              </span>
              <span
                v-else-if="item.type === 'amocrm' || item.type === 'bitrix24'"
              >
                {{ item.enable }}
              </span>
              <span v-else-if="accountStation === 'crm'">
                {{ item.type }}
              </span>
              <span v-else>-</span>
            </span>
          </div>

          <!-- Подписка -->
          <div class="card-row">
            <span class="label">Подписка:</span>
            <span class="value">
              <span v-if="item.subscription_dt_to === null"> - </span>
              <span v-else class="subscription-date">
                До {{ formatSubscriptionDate(item.subscription_dt_to) }}
              </span>
            </span>
          </div>
        </div>

        <!-- Кнопка оплаты на всю ширину -->
        <div
          class="card-payment"
          v-if="item.type != 'amocrm' && item.type != 'bitrix24'"
        >
          <button class="payment-btn" @click="changeTariffStation(item)">
            Оплатить
          </button>
        </div>
      </div>
    </div>

    <!-- Состояния загрузки и ошибок для мобильной версии -->
    <div class="mobile-states">
      <div class="none-account-cont" v-if="dataStationNone">
        <NoData type="accounts" />
      </div>

      <div class="load-cont" v-if="loadDataStation">
        <LoadAccount />
      </div>

      <div class="load-cont" v-if="errorAccountBolean && !loadDataStation">
        <errorAccount />
      </div>
    </div>

    <Tariff
      v-if="tariffStation"
      :selectedItem="selectedItem"
      :changeTariffStation="changeTariffStation"
      :getAccounts="getAccounts"
      :changePayDataForAccounts="changePayDataForAccounts"
    />

    <Modal
      :changeTariffStation="changeTariffStation"
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
      :changeForceStopItemData="changeForceStopItemData"
      :getAccounts="getAccounts"
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
      :closeScreen="closeScreen"
      :changeGetScreenStation="changeGetScreenStation"
      :selectedItem="selectedItem"
    />

    <Enable
      v-if="enableStation"
      :changeForceStopItemData="changeForceStopItemData"
      :enableStation="enableStation"
      :selectedItem="selectedItem"
      :changeEnableStation="changeEnableStation"
    />

    <ErrorBlock v-if="errorBlock" :changeIncorrectPassword="chaneErrorBlock" />
  </section>
</template>

<script setup>
import { ref, reactive, onMounted, provide, inject, computed } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";
import LoadingAccount from "./LoadingMoadal/LoadingAccount.vue";
import ErrorBlock from "@/components/ErrorBlock/ErrorBlock.vue";
import Modal from "./Modal.vue";
import Enable from "./ModalAccount/Enable/Enable.vue";
import SettignsModal from "./ModalAccount/settingsModal.vue";
import getByCode from "./ModalAccount/GetByCode/GetByCode.vue";
import QrModal from "./ModalAccount/qrModal.vue";
import errorAccount from "@/components/Mailing/MailingList/errorAccount.vue";
import getScreen from "./ModalAccount/GetScreen.vue";
import LoadAccount from "./LoadAccount.vue";
import AccountIcon from "../AccountIcon.vue";
import Tariff from "./TariffAccount/Tariff.vue";
import { useAccountStore } from "@/stores/accountStore";
import NoData from "@/components/GlobalModal/StationList/NoData.vue";

const accountStore = useAccountStore();
const token = computed(() => accountStore.getAccountToken);
const accountStation = computed(() => accountStore.getAccountStation);
const sourceGroup = computed(() => accountStore.getSource);
const typeGroup = computed(() => accountStore.getType);
const allGroup = computed(() => accountStore.getGroup);
const crmPlatform = computed(() => accountStore.getCrmPlatform);
const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL;

import { storeToRefs } from "pinia";
import { useLoginWhatsAppChatsStepStore } from "@/stores/loginWhatsAppChatsStepStore";
const chatStore = useLoginWhatsAppChatsStepStore();
const allAcoount = computed(() => chatStore.getLoginWhatsAppChatsStep);

import { useUserInfoStore } from "@/stores/userInfoStore";
const userInfoStore = useUserInfoStore();
const { userInfo } = storeToRefs(userInfoStore);

import { fetchChats } from "@/utils/getChats";
import { useDomain } from "@/composables/getDomain";
const { stationDomain } = useDomain();

import { useI18n } from "vue-i18n";
const { t } = useI18n();

const router = useRouter();

const tariffStation = ref(false);
const forceStopItemData = ref({});
const chatsLoadingChange = inject("chatsLoadingChange");
const dataStationNone = ref(false);
const dataStation = ref(false);
const loadDataStation = ref(false);
const errorAccountBolean = ref(false);
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
const chatsStation = ref(null);

import useFrontendLogger from "@/composables/useFrontendLogger";
import False from "@/components/Chats/UserList/ResultModal/False.vue";
const { sendLog } = useFrontendLogger();

const changeForceStopItemData = async (item) => {
  try {
    forceStopItemData.value = { ...item, loading: true };
    const accountIndex = instanceData.value.findIndex(
      (acc) => acc.login === item.login && acc.source === item.source
    );

    if (accountIndex === -1) {
      console.warn("Account not found in instanceData");
      return;
    }

    instanceData.value[accountIndex].loading = true;

    const infoResponse = await getInfoWhats(
      item.source,
      item.login,
      item.type,
      item.storage
    );

    if (!infoResponse?.data) {
      throw new Error("Invalid response structure");
    }

    const currentStep = infoResponse.data.step || { value: "-", message: "" };

    instanceData.value[accountIndex] = {
      ...instanceData.value[accountIndex],
      step: currentStep,
      loading: false,
    };

    forceStopItemData.value = {
      ...instanceData.value[accountIndex],
      loading: false,
    };

    // Обновляем localStorage только если аккаунт подключен (значение 5)
    if (currentStep.value === 5) {
      updateLocalStorage(item.login, item.source, item.storage, item.type);
    }
  } catch (error) {
    console.error("Error in changeForceStopItemData:", error);
    if (forceStopItemData.value) {
      forceStopItemData.value.loading = false;
    }
    const accountIndex = instanceData.value.findIndex(
      (acc) => acc.login === item.login && acc.source === item.source
    );
    if (accountIndex !== -1) {
      instanceData.value[accountIndex].loading = false;
    }
  }
};

const formatSubscriptionDate = (dateString) => {
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

const changePayDataForAccounts = (item) => {
  const index = instanceData.value.findIndex(
    (account) => account.uuid === item.uuid
  );

  if (index !== -1) {
    instanceData.value[index] = {
      ...instanceData.value[index],
      isPay: true,
    };

    setTimeout(() => {
      instanceData.value[index] = {
        ...instanceData.value[index],
        isPay: false,
      };
    }, 3000);

    console.log("Данные обновлены для аккаунта с uuid:", item.uuid);
  } else {
    console.warn("Аккаунт с таким uuid не найден:", item.uuid);
  }
};

const updateLocalStorage = (login, source, storage, type) => {
  try {
    const newLoginData = {
      login,
      source,
      storage: storage || "undefined",
      type: type || "undefined",
    };
    chatStore.addOrUpdateChat(newLoginData);
    console.log("Account saved to store:", newLoginData);
  } catch (e) {
    console.error("Error updating store:", e);
  }
};

const changeEnableStation = () => {
  enableStation.value = !enableStation.value;
};

const changeGetScreenStation = () => {
  getScreenStation.value = !getScreenStation.value;
};

const closeScreen = () => {
  getScreenStation.value = false;
};

const errorBlock = ref(false);
const chaneErrorBlock = () => {
  errorBlock.value = !errorBlock.value;
};

const handleSendLog = async (location, method, params, results, answer) => {
  try {
    await sendLog(location, method, params, results, answer);
  } catch (err) {
    console.error("error", err);
  }
};

const changeTariffStation = (item) => {
  selectedItem.value = item;
  tariffStation.value = !tariffStation.value;
};

const getAccounts = async () => {
  dataStationNone.value = false;
  errorAccountBolean.value = false;
  console.log(sourceGroup.value);
  instanceData.value = [];
  let params = {
    source: accountStation.value,
    skipDetails: true,
    group: "messenger",
  };

  if (stationDomain.navigate.value === "touchapi") {
    console.log("touch");
    params = {
      source: sourceGroup.value,
      type: typeGroup.value,
      group: allGroup.value,
    };
  }

  if (stationDomain.navigate.value === "whatsapi") {
    params = {
      skipDetails: true,
    };
  }

  loadDataStation.value = true;
  try {
    const response = await axios.post(`${FRONTEND_URL}getInfoByToken`, params, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.value}`,
      },
    });

    if (response.data.ok === true) {
      await handleSendLog(
        "accountList",
        "getInfoByToken",
        params,
        response.data.ok,
        response.data
      );

      accounts.value = response.data;
      instanceData.value = accounts.value.data.instances.map((instance) => ({
        ...instance,
        step: instance.step === null ? "Н/Д" : instance.step,
        loading: true,
        storage: instance.storage || "undefined",
        type: instance.type || "undefined",
      }));

      if (instanceData.value.length === 0) {
        loadDataStation.value = false;
        dataStationNone.value = true;
      } else {
        loadDataStation.value = false;
        dataStation.value = true;

        if (
          accountStation.value === "whatsapp" ||
          accountStation.value === "telegram"
        ) {
          const accountsToFetch = instanceData.value.filter(
            (instance) =>
              instance.step?.value === 5 &&
              ((instance.storage === "binder" &&
                instance.type !== "touchapi") ||
                (instance.storage === "whatsapi" &&
                  instance.type === "whatsapi"))
          );

          if (accountsToFetch.length > 0) {
            try {
              await new Promise((resolve) =>
                setTimeout(resolve, 200 * accountsToFetch.length)
              );
              const result = await fetchChats({
                token: token.value,
                accounts: accountsToFetch,
              });
              if (result.error) {
                console.error("Ошибка пакетного запроса чатов:", result.error);
              }
            } catch (e) {
              console.error("Ошибка при сохранении аккаунтов:", e);
            } finally {
              accountsToFetch.forEach((instance) => {
                instance.loading = false;
              });
            }
          }

          const promises = instanceData.value.map(async (instance) => {
            const login = instance.login;
            if (
              (instance.storage === "binder" && instance.type !== "touchapi") ||
              (instance.storage === "whatsapi" && instance.type === "whatsapi")
            ) {
              instance.loading = false;
              return;
            }

            try {
              const infoResponse = await getInfoWhats(
                instance.source,
                login,
                instance.type,
                instance.storage
              );

              if (infoResponse?.data?.step) {
                instance.step = infoResponse.data.step;
              }
            } catch (error) {
              console.error(`Error for ${login}:`, error);
            } finally {
              instance.loading = false;
            }
          });

          await Promise.all(promises);
          chatsLoadingChange();
        }
      }
    } else if (response.data === 401) {
      errorBlock.value = true;
      loadDataStation.value = false;
      errorAccountBolean.value = true;
    }
  } catch (error) {
    loadDataStation.value = false;
    errorAccountBolean.value = true;
    console.error("Error:", error);
  }
};

const checkStatusBulkAccount = () => {};

const getInfoWhats = async (source, login, type, storage) => {
  try {
    const response = await axios.post(
      `${FRONTEND_URL}getInfo`,
      {
        source: source,
        login: login,
        type: type,
        storage: storage,
      },
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: `Bearer ${token.value}`,
        },
      }
    );
    return response;
  } catch (error) {
    console.error("Error in getInfoWhats:", error);
    return null;
  }
};

const updateUserInfo = (event) => {
  userInfoStore.setUserInfo(event);
};

const openModal = (event, item) => {
  selectedItem.value = item;
  isModalOpen.value = true;
  updateUserInfo(JSON.stringify(selectedItem.value));
  getInfo();

  const rect = event.currentTarget.getBoundingClientRect();
  const modalWidth = 160;
  const edgeMargin = 10; // Минимальный отступ от краев

  // Базовая позиция - сразу под кнопкой с небольшим отступом
  let left = rect.left + window.scrollX;
  let top = rect.bottom + window.scrollY + 2; // Всего 2px от кнопки

  // Проверяем правую границу (только если действительно выходит)
  if (left + modalWidth > window.innerWidth + window.scrollX - edgeMargin) {
    left = window.innerWidth + window.scrollX - modalWidth - edgeMargin;
  }

  // Проверяем левую границу (только если действительно выходит)
  if (left < window.scrollX + edgeMargin) {
    left = window.scrollX + edgeMargin;
  }

  // Проверяем нижнюю границу только если модалка сильно выходит
  const modalHeight = 300;
  const bottomEdge = window.innerHeight + window.scrollY;

  if (top + modalHeight > bottomEdge - edgeMargin) {
    // Показываем над кнопкой, но тоже близко
    top = rect.top + window.scrollY - modalHeight - 2; // Всего 2px от кнопки

    // Если не помещается и сверху, немного сдвигаем вниз
    if (top < window.scrollY + edgeMargin) {
      top = window.scrollY + edgeMargin;
    }
  }

  modalPosition.value = {
    top: Math.round(top),
    left: Math.round(left),
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

const isActionAvailable = (item) => {
  return (
    (item.storage === "local" && item.type === "undefined") ||
    (item.storage === "binder" && item.type === "touchapi") ||
    (item.storage === "undefined" && item.type === "whatsapi") ||
    (item.storage === "whatsapi" && item.type === "undefined") ||
    item.type === "bulk" ||
    item.type === "amocrm" ||
    item.type === "bitrix24"
  );
};

const openMobileModal = (event, item) => {
  openModal(event, item);
};

const showMessage = (event, step) => {
  tooltipMessage.value = `Текущий шаг: ${step}`;
  messageVisible.value = true;
  const tooltipWidth = 100;
  const tooltipHeight = 30;
  const rect = event.currentTarget.getBoundingClientRect();
  tooltipStyle.value = {
    top: `${rect.bottom + window.scrollY}px`,
    left: `${rect.left + window.scrollX + rect.width / 2 - tooltipWidth / 2}px`,
    width: `${tooltipWidth}px`,
    height: `${tooltipHeight}px`,
  };
};

const hideMessage = () => {
  messageVisible.value = false;
};

const getInfo = async () => {
  chatsStation.value = "loading";
  try {
    const response = await axios.post(
      `${FRONTEND_URL}getInfo`,
      {
        source: selectedItem.value.source,
        login: selectedItem.value.login,
        type: selectedItem.value.type,
        storage: selectedItem.value.storage,
      },
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: `Bearer ${token.value}`,
        },
      }
    );
    if (response.data) {
      await handleSendLog(
        "accountList",
        "getInfo",
        {
          source: selectedItem.value.source,
          login: selectedItem.value.login,
        },
        response.data.ok,
        response.data
      );
    }
    console.log(response.data);
    if (response.data) {
      if (response.data.step != null) {
        if (response.data.step.value === 5) {
          chatsStation.value = true;
        }
      } else {
        chatsStation.value = false;
      }
    } else if (response.data === 401) {
      errorBlock.value = true;
      setTimeout(() => {
        localStorage.removeItem("accountToken");
        router.push("/login");
      }, 2000);
    }
  } catch (error) {
    console.error("error:", error);
    if (error.response) {
      console.error("error", error.response.data);
    }
  }
};

onMounted(async () => {
  await chatStore.init();
  await getAccounts();
});

defineExpose({
  getAccounts,
});

provide("selectedItems", { selectedItems });
provide("changeEnableStation", { changeEnableStation });
</script>

<style scoped>
.table-container {
  overflow-x: auto;
  overflow-y: auto;
  max-width: 100%;
  height: 80vh;
}

.desktop-view {
  display: block;
}

.mobile-cards,
.mobile-states {
  display: none;
}

.table-container::-webkit-scrollbar {
  width: 6px;
}

.table-container::-webkit-scrollbar-track {
  background-color: var(--scrolBg);
}

.table-container::-webkit-scrollbar-thumb {
  background: var(--scrolColor);
  border-radius: 5px;
}

.tooltip {
  position: absolute;
  background: rgba(0, 0, 0, 0.75);
  color: #fff;
  padding: 5px 10px;
  border-radius: 5px;
  font-size: 12px;
  z-index: 10;
}

.settings-cont {
  display: flex;
  align-items: center;
  gap: 6px;
}

.open-tariff-button {
  width: 80px;
  padding: 8px;
  border: none;
  border-radius: 8px;
  background: #6732ff;
  color: white;
  font-size: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: auto;
}

.table-header {
  top: 0;
  z-index: 1;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.bi-list {
  width: 16px;
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

.settings-svg {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: 100%;
  background: #7a4aff;
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
  width: 200px;
}

.table-sub {
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

.action-table-button-phone {
  display: none;
}

.action-table-button-phone:active {
  background: rgba(0, 4, 78, 0.2);
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

.table-row.active {
  position: relative;
  animation: pulse-green 2s ease-in-out;
  box-shadow: 0 0 0 rgba(76, 175, 80, 0.7);
}

@keyframes pulse-green {
  0% {
    box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(76, 175, 80, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(76, 175, 80, 0);
  }
}

/* Альтернативный вариант с градиентной подсветкой */
.table-row.active {
  position: relative;
  overflow: hidden;
}

.table-row.active::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    90deg,
    rgba(76, 175, 80, 0.1) 0%,
    rgba(76, 175, 80, 0.3) 50%,
    rgba(76, 175, 80, 0.1) 100%
  );
  animation: highlight 3s ease-in-out forwards;
  z-index: -1;
}

@keyframes highlight {
  0% {
    opacity: 0;
    transform: translateX(-100%);
  }
  20% {
    opacity: 1;
    transform: translateX(0);
  }
  80% {
    opacity: 1;
    transform: translateX(0);
  }
  100% {
    opacity: 0;
    transform: translateX(100%);
  }
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

tr:not(:last-child):after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 1px;
  background-color: #ebebeb;
}

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

/* .table-container {
  overflow-x: auto;
  overflow-y: auto;
  height: 80vh;
  -webkit-overflow-scrolling: touch;
  max-width: 100%;
} */

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

/* Остальные существующие стили остаются без изменений */

/* @media (max-width: 768px) {

  .table-action {
    width: 50px;
}

  .action-table-button  {
    display: none;
  }

  .action-table-button-phone {
    display: block;
  background: oklch(0.65 0.22 267 / 0.16);
  font-weight: 600; 
  font-size: 12px;
  padding: 6px;
  color: oklch(0.4 0.18 267 / 0.86);
  margin-right: 10px;
  gap: 6px;
  transition: all 0.25s;
  border-radius: 5px;
  margin-right: -3px;
}

  .table-step {
  width: 50px;
}

.table-sub {
  width: 80px;
}

.table-login {
  width: 150px;
}
} */

/* Адаптивные высоты для разных размеров экрана */
@media (max-height: 920px) {
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

  .account-card {
    background: white;
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    border: 1px solid #e5e7eb;
    display: flex;
    flex-direction: column;
    min-height: 200px;
    min-width: 0;
    position: relative;
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

  .account-info {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
    flex: 1;
  }

  .account-login {
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

  .subscription-date {
    font-size: 14px;
    color: #059669;
    word-break: break-word;
    line-height: 1.3;
    min-width: 0;
    text-align: right;
  }

  .card-payment {
    margin-top: auto;
  }

  .payment-btn {
    width: 100%;
    background: #6732ff;
    color: white;
    border: none;
    padding: 12px;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .payment-btn:hover {
    background: #5a2ae0;
  }

  .payment-btn:active {
    background: #4d24c0;
  }
}

@media (max-width: 640px) {
  .account-card {
    min-height: 180px;
    padding: 14px;
  }

  .account-login {
    font-size: 15px;
  }

  .label {
    font-size: 13px;
  }

  .value {
    font-size: 13px;
  }

  .subscription-date {
    font-size: 13px;
  }

  .payment-btn {
    padding: 10px;
    font-size: 15px;
  }
}

@media (max-width: 480px) {
  .mobile-cards {
    grid-template-columns: 1fr;
    gap: 10px;
    padding: 10px;
  }

  .account-card {
    padding: 12px;
    min-height: 170px;
  }

  .account-login {
    font-size: 14px;
  }

  .label {
    font-size: 12px;
  }

  .value {
    font-size: 12px;
  }

  .payment-btn {
    padding: 9px;
    font-size: 14px;
  }
}

/* Анимация для активных карточек */
.account-card.active {
  animation: pulse-card 2s ease-in-out;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
}

@keyframes pulse-card {
  0% {
    box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.3);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(76, 175, 80, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(76, 175, 80, 0);
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
</style>
