<template>
  <LoadingMoadal
    :changeStationLoadingModal="closeResultModal"
    :stationLoading="stationLoading"
  />
  <AlertManager
    v-if="showSubscriptionAlert"
    :subscription-status="subscriptionStatus"
  />
  <header>
    <section class="account-section">
      <h2 class="title">{{ t("mailing.title") }}</h2>
      <button @click="changeMailingTourModal" class="help-button">
        <svg
          class="help-icon"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
            clip-rule="evenodd"
          />
        </svg>
        Как пользоваться
      </button>
    </section>

    <section class="account-section">
      <ToggleVersion />
      <button @click="handleAddMailing" class="add-account-button">
        <svg
          class="svg-icon"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill-rule="evenodd"
            d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
            clip-rule="evenodd"
          ></path>
        </svg>
        {{ getWidht > 500 ? "Добавить рассылку" : "Добавить " }}
      </button>
    </section>
  </header>
  <MailingList :changeResultModal="changeResultModal" />
  <AddMailing :changeAddMailing="changeAddMailing" v-if="addMailing" />
  <MailingTour ref="mailingTour" />
  <MailingsTourModal
    :startTour="startMailingTour"
    v-if="mailingTourModal"
    :close="changeMailingTourModal"
  />
</template>

<script setup>
import AddMailing from "./ModalComponent/AddMailing/AddMailing.vue";
import MailingList from "./MailingList/MailingList.vue";
import AlertManager from "./ModalComponent/SubscriptionWarning/AlertManager.vue";
import LoadingMoadal from "../Accounts/Accounts/LoadingMoadal/LoadingMoadal.vue";
import MailingTour from "../../components/tours/MailingsTour.vue";
import MailingsTourModal from "../GlobalModal/TourModal/Mailings/MailingsTourModal.vue";
import ToggleVersion from "./toggleVersion.vue";
import axios from "axios";

const apiUrl = import.meta.env.VITE_WHATSAPI_URL;
import { computed, ref, reactive, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAccountStore } from "@/stores/accountStore";
import { useI18n } from "vue-i18n";

const accountStore = useAccountStore();
const token = computed(() => accountStore.getAccountToken);

const router = useRouter();
const route = useRoute();

const { t } = useI18n();

const mailingTour = ref(null);
const mailingTourModal = ref(null);
const showSubscriptionAlert = ref(false);

const subscriptionCheck = reactive({
  loading: false,
  error: false,
  message: "",
  status: "",
});

const subscriptionStatus = reactive({
  active: false,
  message: "",
});

const startMailingTour = () => {
  if (mailingTour.value) {
    mailingTour.value.startTour();
  }
};

const changeMailingTourModal = () => {
  mailingTourModal.value = !mailingTourModal.value;
};

async function checkSubscription() {
  subscriptionCheck.loading = true;
  subscriptionCheck.error = false;
  showSubscriptionAlert.value = false;

  if (route.query.tour === "true") {
    return;
  }

  try {
    const response = await axios.get(`${apiUrl}/check`, {
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
    });

    if (response.data.ok === true && response.data.data.status === "active") {
      // Подписка активна
      subscriptionCheck.loading = false;
      subscriptionStatus.active = true;
      subscriptionStatus.message = "";
      showSubscriptionAlert.value = false;
    } else {
      // Подписка не активна
      subscriptionCheck.loading = false;
      subscriptionCheck.error = true;
      subscriptionCheck.message =
        response.data.message ||
        "Для создания рассылки требуется активная подписка";
      subscriptionCheck.status = response.data.errors?.status || "inactive";

      subscriptionStatus.active = false;
      subscriptionStatus.message = subscriptionCheck.message;
      showSubscriptionAlert.value = true;
    }
  } catch (error) {
    console.error("Ошибка при проверке подписки:", error);
    subscriptionCheck.loading = false;
    subscriptionCheck.error = true;
    subscriptionCheck.message =
      "Ошибка при проверке подписки. Пожалуйста, попробуйте позже.";

    subscriptionStatus.active = false;
    subscriptionStatus.message = subscriptionCheck.message;
    showSubscriptionAlert.value = true;

    // Логируем ошибку
    await sendLog(
      "subscription_check",
      "error",
      { error: error.response?.data || error.message },
      false,
      error.response?.data,
    );
  }
}

// Функция для отправки логов (заглушка)
async function sendLog(type, level, data, success, response) {
  console.log("Log:", { type, level, data, success, response });
  // Реализуйте отправку логов по необходимости
}

// Обработчик кнопки добавления рассылки
const handleAddMailing = () => {
  changeAddMailing();
};

const stationLoading = reactive({
  modalStation: false,
  account: {
    error: false,
  },
});

const navigateTo = (page) => {
  router.push(page);
};

const getWidht = computed(() => window.innerWidth);

const closeResultModal = () => {
  stationLoading.modalStation = false;
};

const changeResultModal = (change, value) => {
  if (change === "true") {
    stationLoading.modalStation = !stationLoading.modalStation;
  } else {
    stationLoading.modalStation = true;
    if (value === "error") {
      stationLoading.account.error = true;
      setTimeout(() => {
        stationLoading.modalStation = false;
      }, 5000);
    } else {
      stationLoading.account.error = false;
      setTimeout(() => {
        stationLoading.modalStation = false;
      }, 5000);
    }
  }
};

const addMailing = ref(false);

const changeAddMailing = () => {
  addMailing.value = !addMailing.value;
};

// Проверяем подписку при загрузке компонента
onMounted(() => {
  checkSubscription();

  if (route.query.tour === "true") {
    if (mailingTour.value) {
      mailingTour.value.startTour();
    }
  }
});

defineExpose({
  startMailingTour,
});
</script>

<style scoped>
header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 18px 12px 18px 18px;
  box-sizing: border-box;
}

.account-section {
  display: flex;
  align-items: center;
  gap: 10px;
}

.title {
  font-weight: 500;
  font-size: 22px;
  color: var(--text);
  flex: 1;
  margin-right: 8px;
}

.help-button {
  background: oklch(0.65 0.22 267 / 0.16);
  border: none;
  border-radius: 5px;
  padding: 10px 12px;
  font-weight: 600;
  font-size: 12px;
  color: var(--headerAccountButtonColor);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.25s;
  flex-shrink: 0;
}

.help-button:hover {
  background: rgba(0, 13, 255, 0.2);
  transition: all 0.25s;
}

.help-button:active {
  background: rgba(17, 21, 93, 0.2);
  transition: all 0.25s;
}

.help-icon {
  width: 0.875rem;
  height: 0.875rem;
  fill: currentColor;
  opacity: 0.8;
  filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.05));
  transition: all 0.25s ease;
}

.help-button:hover .help-icon {
  opacity: 1;
  transform: scale(1.05);
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
}

.account {
  font-weight: 700;
  font-size: 18px;
  color: #6b7280;
  background: #f9f9f9;
  border-radius: 5px;
  padding: 5px 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
}

.account-list-button,
.add-account-button {
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex: 0 0 auto;
}

.bi-view-list {
  width: 1rem;
  height: 1rem;
  fill: currentColor;
}

.account-list-button {
  background: oklch(0.65 0.22 267 / 0.16);
  font-weight: 600;
  font-size: 12px;
  padding: 10px 12px;
  color: oklch(0.4 0.18 267 / 0.86);
  margin-right: 10px;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.25s;
}

.account-list-button:hover {
  background: rgba(0, 13, 255, 0.2);
  transition: all 0.25s;
}

.account-list-button:active {
  background: rgba(17, 21, 93, 0.2);
  transition: all 0.25s;
}

.svg-icon {
  width: 1.25rem;
  height: 1.25rem;
  margin-right: 0.25rem;
  margin-left: -0.25rem;
  fill: currentColor;
}

.add-account-button {
  background: oklch(0.541 0.198 267);
  font-weight: 600;
  font-size: 12px;
  color: #fff;
  transition: all 0.25s;
  padding: 8px 12px;
  border: none;
}

.add-account-button:hover:not(:disabled) {
  background: #565cc8;
  transition: all 0.25s;
}

.add-account-button:active:not(:disabled) {
  background: #3e43ae;
  transition: all 0.25s;
}

.add-account-button:disabled {
  background: #9ca3af;
  cursor: not-allowed;
  opacity: 0.7;
}

.black-fon {
  position: absolute;
  z-index: 5;
  width: 100%;
  height: 100vh;
  background: rgba(117, 117, 117, 0.3);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.platform-list-telegram {
  position: absolute;
  z-index: 10;
  right: 122px;
  top: 120px;
  border-radius: 10px;
  width: 100px;
  height: 70px;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 2px;
}

.platform-list-whatsapp {
  position: absolute;
  z-index: 10;
  right: 122px;
  top: 120px;
  border-radius: 10px;
  width: 108px;
  height: 70px;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 2px;
}

.platform-list-telegram .fade-enter-active,
.platform-list-telegram .fade-leave-active {
  transition: opacity 0.5s ease;
}
.platform-list-telegram .fade-enter,
.platform-list-telegram .fade-leave-to {
  opacity: 0;
}

.platform-list-telegram {
  animation: fadeIn 0.5s forwards;
}

.platform-list-whatsapp.fade-enter-active,
.platform-list-whatsapp.fade-leave-active {
  transition: opacity 0.5s ease;
}
.platform-list-whatsapp.fade-enter,
.platform-list-whatsapp.fade-leave-to {
  opacity: 0;
}

.platform-list-whatsapp {
  animation: fadeIn 0.5s forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.platform {
  padding: 4px;
  transition: all 0.1s;
  cursor: pointer;
  font-size: 14px;
}

.platform:hover {
  text-align: center;
  width: 80px;
  background-color: #eeeeee;
  border-radius: 5px;
  transition: all 0.2s;
}

@media (max-width: 1000px) {
  .account {
    display: none;
  }

  header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .account-section {
    width: 100%;
    justify-content: space-between;
  }
}

@media (max-width: 768px) {
  .account {
    display: none;
  }

  header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .account-section {
    width: 100%;
    justify-content: space-between;
  }

  .platform-list {
    left: 20px;
    top: 180px;
  }

  .help-button {
    margin-right: 0;
  }
}
</style>
