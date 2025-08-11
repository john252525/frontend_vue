<template>
  <div @click="changeStationMessage" class="black-fon"></div>
  <ErrorBlock v-if="errorBlock" :changeIncorrectPassword="chaneErrorBlock" />
  <section class="cont">
    <h2 class="title">
      {{ t("messageList.title") }}
      <svg
        class="close"
        @click="changeStationMessage"
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 32 32"
      >
        <path
          fill="currentColor"
          d="M17.414 16L24 9.414L22.586 8L16 14.586L9.414 8L8 9.414L14.586 16L8 22.586L9.414 24L16 17.414L22.586 24L24 22.586z"
        />
      </svg>
    </h2>
    <div class="table-container">
      <table class="table">
        <thead class="table-header">
          <tr>
            <th class="table-login">ID</th>
            <th class="table-num">{{ t("messageList.table.number") }}</th>
            <th class="table-text">{{ t("messageList.table.text") }}</th>
            <th class="table-status">{{ t("messageList.table.status") }}</th>
          </tr>
        </thead>
        <tbody class="tbody">
          <tr
            v-if="countMessage"
            v-for="(item, index) in mailingLists"
            :key="index"
          >
            <td class="table-text-number">
              <span>{{ item.id }}</span>
            </td>
            <td class="table-text">{{ item.to }}</td>
            <td class="table-text">{{ item.text }}</td>
            <td v-if="item.state === 0" class="table-text state">
              {{ t("messageList.waitingSend") }}
            </td>
          </tr>
          <tr v-if="!errorMessage && mailingLists.length < 0">
            <td colspan="4">
              <div class="none-message-cont">
                <h2>{{ t("accountList.accountNone") }}</h2>
              </div>
            </td>
          </tr>
          <tr v-if="errorMessage">
            <td colspan="4">
              <div class="error-account-cont">
                <h3 class="error-account-title">
                  {{ t("referrals.errorAccount") }}
                </h3>
              </div>
            </td>
          </tr>
          <tr v-if="loadingMessge">
            <td colspan="4">
              <div class="load-account-cont">
                <h3 class="load-account-title">
                  {{ t("globalLoading.loading") }}
                </h3>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup>
import { ref, reactive, onMounted, computed, toRefs, provide } from "vue";
import axios from "axios";
import ErrorBlock from "@/components/ErrorBlock/ErrorBlock.vue";
import errorAccount from "../MailingList/errorAccount.vue";
import LoadAccount from "../MailingList/LoadAccount.vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import MessageContent from "@/components/Chats/MessageList/MessageContent/MessageContent.vue";
const { t } = useI18n();
const router = useRouter();
const errorBlock = ref(false);
const chaneErrorBlock = () => {
  errorBlock.value = errorBlock.value;
};

const props = defineProps({
  selectedItem: {
    type: Object,
  },
  changeInfoMailing: {
    type: Function,
  },
  changeStationMessage: {
    type: Function,
  },
});
const { selectedItem } = toRefs(props);

const mailingLists = ref([]);
const apiUrl = import.meta.env.VITE_WHATSAPI_URL;
const errorMessage = ref(false);
const loadingMessge = ref(true);
const countMessage = ref(false);

import { useAccountStore } from "@/stores/accountStore";
const accountStore = useAccountStore();
const token = computed(() => accountStore.getAccountToken);

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

const getMessages = async () => {
  const apiUrlMethod = `${apiUrl}/view/${selectedItem.value.id}/`;
  loadingMessge.value = true;
  try {
    const response = await axios.get(apiUrlMethod, {
      params: {
        limit: 10,
        offset: 0,
        sort: "asc",
      },
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.value}`,
      },
    });

    if (response.data) {
      await handleSendLog(
        "mailing",
        "view",
        { limit: 10, offset: 0, sort: "asc" },
        response.data.ok,
        response.data
      );
    }

    if (response.data.ok) {
      loadingMessge.value = false;
      countMessage.value = true;
      mailingLists.value = response.data.result.items;
    } else if (response.data === 401) {
      loadingMessge.value = false;
      errorMessage.value = true;
      errorBlock.value = true;
      setTimeout(() => {
        localStorage.removeItem("accountToken");
        router.push("/login");
      }, 2000);
    } else {
      console.error("error", response.data);
      loadingMessge.value = false;
      errorMessage.value = true;
    }
  } catch (error) {
    loadingMessge.value = false;
    errorMessage.value = true;
    console.error(
      "error",
      error.response ? error.response.data : error.message
    );
  }
};

onMounted(getMessages);
</script>

<style scoped>
.table-container {
  max-width: 100%;
  min-width: 1200px;
  overflow-x: auto;
  min-height: 50vh;
  height: auto;
}

.cont {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 10px;
  padding: 25px 40px;
  background: var(--modalBg);
  border: 0.5px solid rgb(144, 144, 144);
  z-index: 10;
}

.title {
  font-weight: 500;
  font-size: 24px;
  color: var(--modalColor);
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.load-account-cont {
  background-color: var(--tableAccountBg);
  width: 100%;
  height: 50px;
  border-radius: 5px;
  border: 1px solid #d8d8d8;
  display: flex;
  align-items: center;
  justify-content: center;
}

.load-account-title {
  color: #4966b1;
  font-size: 10px;
  font-weight: 500;
  background-color: #cee3fd;
  padding: 4px 14px;
  border-radius: 20px;
  animation: shimmer 1s infinite;
}

@keyframes shimmer {
  0% {
    opacity: 0.7;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.7;
  }
}

.error-account-cont {
  background-color: rgb(255, 209, 209);
  width: 100%;
  height: 50px;
  border-radius: 5px;
  border: 1px solid #cea2a2;
  display: flex;
  align-items: center;
  justify-content: center;
}

.error-account-title {
  color: rgb(128, 76, 76);
  font-size: 10px;
  font-weight: 500;
  background-color: rgb(246, 180, 180);
  padding: 4px 14px;
  border-radius: 20px;
}

@keyframes shimmer {
  0% {
    opacity: 0.7;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.7;
  }
}

.title img {
  margin-top: 5px;
  transition: all 0.15s;
  cursor: pointer;
}

.title img:hover {
  transition: all 0.15s;
  transform: translate(-5px);
}

.table-header {
  position: sticky;
  top: 0;
  z-index: 1;
  /* background: rgb(243 244 246); */
}

table {
  width: 100%;
  border-collapse: collapse;
}

.none-message-cont {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  flex-direction: column;
  /* margin-top: 0px; */
  height: 50px;
  width: 100%;
  padding: 0px 10px;
  box-sizing: border-box;
  background-color: var(--noAccountTableBg);
  border-radius: 5px;
}

.none-message-cont h2 {
  font-size: 14px;
  font-weight: 500;
  color: var(--noAccountTableText);
}

.bi-list {
  width: 16px; /* Ширина и высота иконки */
  height: 16px;
  fill: currentColor; /* Использует текущий цвет текста */
  margin-bottom: -4px;
  margin-right: 6px;
}

.loading-data-text {
  text-align: center;
  font-weight: 600;
  font-size: 14px;
  color: var(--modalColor);
  /* text-align: center; */
  /* padding: 10px; */
  border-radius: 6px;
  /* width: 100%; */
}

.table-login {
  text-align: left;
  padding: 1rem;
  width: 20px;
}

.table-num {
  text-align: left;
  padding: 1rem;
  width: 100px;
}

.table-text {
  text-align: left;
  padding: 1rem;
  width: 300px;
}

.state {
  text-align: right;
}

.table-status {
  text-align: right;
  padding: 1rem;
  width: 100px;
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
  background: var(--noAccountTableHover);
}

.close {
  position: absolute;
  right: 37px;
}

@media (max-width: 1300px) {
  .table-container {
    min-width: 1000px;
  }
}

@media (max-width: 1100px) {
  .table-container {
    min-width: 800px;
  }
}

@media (max-width: 900px) {
  .table-container {
    min-width: 600px;
  }
}

@media (max-width: 700px) {
  .table-container {
    min-width: 400px;
  }
}

@media (max-width: 500px) {
  .table-container {
    min-width: 300px;
  }
}

@media (max-width: 400px) {
  th,
  td {
    padding: 1rem;
    font-weight: 500;
    font-size: 11px;
    color: #6b7280;
  }

  td {
    font-weight: 500;
    font-size: 12px;
    color: #000;
    text-align: left;
  }
}
</style>
