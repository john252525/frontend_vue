<template>
  <div class="table-container desktop-view">
    <table class="table">
      <thead class="table-header">
        <tr>
          <th class="table-account">АККАУНТ</th>
          <th class="table-status">ВКЛЮЧЕНИЕ</th>
          <th class="table-status">СТАТУС</th>
          <th class="table-subscription">ПОДПИСКА</th>
          <th class="table-chat">ЧАТ</th>
          <th class="table-screenshot">СКРИНШОТ</th>
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
          <!-- АККАУНТ -->
          <td v-if="item.name || item.login" class="table-account-data">
            <AccountIcon :item="item" />
            <span v-if="item.name">{{ item.name }}</span>
            <span v-else>{{ item.login }}</span>
          </td>
          <td v-else class="table-text">-</td>

          <!-- ВКЛЮЧЕНИЕ (переключатель с анимацией) -->
          <td class="table-switch">
            <label class="switch">
              <input
                type="checkbox"
                :checked="item.enabled"
                @change="$emit('toggle-account', item, $event.target.checked)"
              />
              <span class="slider round"></span>
            </label>
          </td>

          <!-- СТАТУС -->
          <td
            class="table-status-data"
            @mouseover="$emit('show-message', $event, item.step?.message)"
            @mouseleave="$emit('hide-message')"
            v-if="item.step && item.type != 'amocrm' && item.type != 'bitrix24'"
          >
            {{ item.step.value }}
          </td>
          <td
            class="table-status-data"
            v-else-if="
              item.loading && item.type != 'amocrm' && item.type != 'bitrix24'
            "
          >
            <LoadingAccount />
          </td>
          <td
            class="table-status-data"
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
            class="table-status-data"
            v-if="item.type === 'amocrm' || item.type === 'bitrix24'"
          >
            {{ item.enable }}
          </td>

          <!-- ПОДПИСКА -->
          <td
            v-if="item.subscription_dt_to === null"
            class="table-subscription-data"
          >
            <button
              v-if="item.type != 'amocrm' && item.type != 'bitrix24'"
              class="open-tariff-button"
              @click="$emit('change-tariff', item)"
            >
              Продлить
            </button>
            <span v-else>-</span>
          </td>
          <td
            v-if="item.subscription_dt_to !== null"
            class="table-subscription-data"
          >
            До {{ item.subscription_dt_to }}
          </td>

          <!-- ЧАТ (иконка) -->
          <td class="table-chat-data">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path
                d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
              />
            </svg>
          </td>

          <!-- СКРИНШОТ (иконка) -->
          <td class="table-screenshot-data">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
          </td>

          <!-- ДЕЙСТВИЯ -->
          <td class="table-action-data">
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
              @click="$emit('open-modal', $event, item)"
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
          <td colspan="7">
            <div class="none-account-cont">
              <h2>{{ t("accountList.accountNone") }}</h2>
            </div>
          </td>
        </tr>
        <tr v-if="loadDataStation">
          <td colspan="7">
            <div class="load-cont">
              <LoadAccount />
            </div>
          </td>
        </tr>
        <tr v-if="errorAccountBolean && !loadDataStation">
          <td colspan="7">
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
</template>

<script setup>
import AccountIcon from "../../AccountIcon.vue";
import LoadingAccount from "../LoadingMoadal/LoadingAccount.vue";
import LoadAccount from "../LoadAccount.vue";
import errorAccount from "@/components/Mailing/MailingList/errorAccount.vue";
import { useI18n } from "vue-i18n";
import { ref } from "vue";

const { t } = useI18n();

defineProps({
  dataStation: Boolean,
  instanceData: Array,
  dataStationNone: Boolean,
  loadDataStation: Boolean,
  errorAccountBolean: Boolean,
});

defineEmits([
  "show-message",
  "hide-message",
  "change-tariff",
  "open-modal",
  "toggle-account",
]);

const messageVisible = ref(false);
const tooltipMessage = ref("");
const tooltipStyle = ref({});
</script>

<style scoped>
/* ОСНОВНЫЕ СТИЛИ ТАБЛИЦЫ */
.table-container {
  overflow-x: auto;
  overflow-y: auto;
  max-width: 100%;
  height: 80vh;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.desktop-view {
  display: block;
}

.table-container::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.table-container::-webkit-scrollbar-track {
  background-color: #f1f1f1;
  border-radius: 4px;
}

.table-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.table-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.tooltip {
  position: absolute;
  background: rgba(0, 0, 0, 0.85);
  color: #fff;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.open-tariff-button {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, #6732ff, #8a63ff);
  color: white;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(103, 50, 255, 0.3);
}

.open-tariff-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(103, 50, 255, 0.4);
}

.table-header {
  position: sticky;
  top: 0;
  z-index: 2;
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  backdrop-filter: blur(10px);
}

.table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background: #fff;
}

.bi-list {
  width: 16px;
  height: 16px;
  fill: currentColor;
  margin-right: 8px;
  vertical-align: middle;
}

.load-cont {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
}

.none-account-cont {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 40px 0;
}

.none-account-cont h2 {
  color: #6c757d;
  font-size: 18px;
  font-weight: 500;
}

/* СТИЛИ ДЛЯ ЗАГОЛОВКОВ */
.table-account {
  text-align: left;
  padding: 1.2rem;
  min-width: 180px;
  font-weight: 600;
  color: #2d3748;
  border-bottom: 2px solid #e2e8f0;
}

.table-status {
  text-align: center;
  padding: 1.2rem;
  min-width: 120px;
  font-weight: 600;
  color: #2d3748;
  border-bottom: 2px solid #e2e8f0;
}

.table-subscription {
  text-align: left;
  padding: 1.2rem;
  min-width: 150px;
  font-weight: 600;
  color: #2d3748;
  border-bottom: 2px solid #e2e8f0;
}

.table-chat,
.table-screenshot {
  text-align: center;
  padding: 1.2rem;
  min-width: 80px;
  font-weight: 600;
  color: #2d3748;
  border-bottom: 2px solid #e2e8f0;
}

.table-action {
  text-align: center;
  padding: 1.2rem;
  min-width: 120px;
  font-weight: 600;
  color: #2d3748;
  border-bottom: 2px solid #e2e8f0;
}

/* СТИЛИ ДЛЯ ДАННЫХ */
.table-account-data {
  padding: 1rem 1.2rem;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  color: #2d3748;
}

.table-switch {
  padding: 1rem 1.2rem;
  text-align: center;
}

.table-status-data {
  padding: 1rem 1.2rem;
  font-weight: 500;
  color: #4a5568;
}

.table-subscription-data {
  padding: 1rem 1.2rem;
  font-weight: 500;
  color: #4a5568;
}

.table-chat-data,
.table-screenshot-data {
  padding: 1rem 1.2rem;
  text-align: center;
  color: #718096;
}

.table-chat-data svg,
.table-screenshot-data svg {
  transition: all 0.3s ease;
}

.table-chat-data:hover svg,
.table-screenshot-data:hover svg {
  color: #6732ff;
  transform: scale(1.1);
}

.table-action-data {
  padding: 1rem 1.2rem;
  text-align: center;
}

.table-text {
  padding: 1rem 1.2rem;
  color: #a0aec0;
}

/* СТИЛИ ПЕРЕКЛЮЧАТЕЛЯ */
.switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 26px;
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
  background-color: #ccc;
  transition: 0.4s;
  border-radius: 34px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
}

input:checked + .slider {
  background: linear-gradient(135deg, #6732ff, #8a63ff);
}

input:checked + .slider:before {
  transform: translateX(24px);
}

input:focus + .slider {
  box-shadow: 0 0 1px #6732ff;
}

/* АНИМАЦИИ ДЛЯ ПЕРЕКЛЮЧАТЕЛЯ */
.slider:before {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(103, 50, 255, 0.4);
  }
  70% {
    box-shadow: 0 0 0 6px rgba(103, 50, 255, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(103, 50, 255, 0);
  }
}

/* СТИЛИ КНОПОК ДЕЙСТВИЙ */
.action-table-button {
  background: linear-gradient(135deg, #f7fafc, #edf2f7);
  font-weight: 600;
  font-size: 12px;
  padding: 10px 16px;
  color: #4a5568;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.action-table-button:hover {
  background: linear-gradient(135deg, #edf2f7, #e2e8f0);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  color: #6732ff;
}

.action-table-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

/* СТИЛИ СТРОК ТАБЛИЦЫ */
.table-row {
  position: relative;
  transition: all 0.3s ease;
  border-bottom: 1px solid #f1f3f4;
}

.table-row:hover {
  background: linear-gradient(135deg, #f8f9ff, #f0f3ff);
  transform: translateX(4px);
}

.table-row.active {
  position: relative;
  animation: pulse-green 2s ease-in-out;
}

@keyframes pulse-green {
  0% {
    box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.7);
  }
  70% {
    box-shadow: 0 0 0 6px rgba(76, 175, 80, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(76, 175, 80, 0);
  }
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
    rgba(76, 175, 80, 0.2) 50%,
    rgba(76, 175, 80, 0.1) 100%
  );
  animation: highlight 2s ease-in-out forwards;
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

/* АДАПТИВНЫЕ ВЫСОТЫ */
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

/* СКРЫТИЕ НА МОБИЛЬНЫХ */
@media (max-width: 768px) {
  .desktop-view {
    display: none !important;
  }
}
</style>
