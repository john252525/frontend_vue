<template>
  <div @click="closeModal" v-if="isModalOpen" class="black-fon">
    <ErrorBlock v-if="errorBlock" :changeIncorrectPassword="chaneErrorBlock" />
    <transition name="fade">
      <!-- Десктопная версия -->
      <div
        class="action-list desktop-version"
        :style="{
          top: modalPosition.top + 'px',
          left: modalPosition.left + 'px',
        }"
      >
        <span
          @click="updateStatus(1)"
          v-if="selectedItem.state === 0"
          class="action action-on"
          >{{ t("modalMailing.on") }}</span
        >
        <span
          @click="updateStatus(0)"
          v-if="selectedItem.state === 1"
          class="action action-off"
          >{{ t("modalMailing.off") }}</span
        >
        <span @click="changeInfoMailing" class="action">{{
          t("modalMailing.info")
        }}</span>
        <span @click="changeStationMessage" class="action">Сообщения</span>
        <span @click="changeisEditMailing" class="action">{{
          t("modalMailing.edit")
        }}</span>
        <span class="action action-delete" @click="changeDeleteMailing">{{
          t("modalMailing.delete")
        }}</span>
      </div>

      <!-- Мобильная версия -->
      <div class="action-list mobile-version">
        <div class="mobile-header">
          <div class="mailing-info-mobile">
            <span class="mailing-name-mobile">{{
              selectedItem.name || "-"
            }}</span>
          </div>
          <button class="close-button" @click="closeModal">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <span
          @click="updateStatus(1)"
          v-if="selectedItem.state === 0"
          class="action action-on"
          >{{ t("modalMailing.on") }}</span
        >
        <span
          @click="updateStatus(0)"
          v-if="selectedItem.state === 1"
          class="action action-off"
          >{{ t("modalMailing.off") }}</span
        >
        <span @click="changeInfoMailing" class="action">{{
          t("modalMailing.info")
        }}</span>
        <span @click="changeStationMessage" class="action">Сообщения</span>
        <span @click="changeisEditMailing" class="action">{{
          t("modalMailing.edit")
        }}</span>
        <span class="action action-delete" @click="changeDeleteMailing">{{
          t("modalMailing.delete")
        }}</span>
      </div>
    </transition>
  </div>
  <LoadingMoadal
    :stationLoading="stationLoading"
    :changeStationLoadingModal="offModalSuc"
  />
  <LoadMoadal :stationLoading="stationLoading" />
</template>

<script setup>
import {
  toRefs,
  ref,
  computed,
  defineProps,
  reactive,
  watch,
  onMounted,
  onUnmounted,
} from "vue";
import LoadingMoadal from "@/components/Accounts/Accounts/LoadingMoadal/LoadingMoadal.vue";
import LoadMoadal from "@/components/Accounts/Accounts/LoadingMoadal/LoadModal.vue";
import axios from "axios";
import { useI18n } from "vue-i18n";
import { useAccountStore } from "@/stores/accountStore";
const accountStore = useAccountStore();
const token = computed(() => accountStore.getAccountToken);
const { t } = useI18n();
import { useStationLoading } from "@/composables/useStationLoading";
const { setLoadingStatus } = useStationLoading();
import ErrorBlock from "@/components/ErrorBlock/ErrorBlock.vue";
import { useRouter } from "vue-router";
const router = useRouter();

const props = defineProps({
  modalPosition: {
    type: Object,
  },
  closeModal: {
    type: Function,
  },
  changeInfoMailing: {
    type: Function,
  },
  selectedItem: {
    type: Object,
  },
  isModalOpen: {
    type: Boolean,
  },
  changeDeleteMailing: {
    type: Function,
  },
  refreshMailingLists: {
    type: Function,
  },
  changeisEditMailing: {
    type: Function,
  },
  changeStatusMailing: {
    type: Function,
  },
  changeStationMessage: {
    type: Function,
  },
});

// Убрали вычисление isMobile через JavaScript

import useFrontendLogger from "@/composables/useFrontendLogger";
const { sendLog } = useFrontendLogger();

const handleSendLog = async (location, method, params, results, answer) => {
  try {
    await sendLog(location, method, params, results, answer);
  } catch (err) {
    console.error("error", err);
  }
};

const stationLoading = reactive({
  modalStation: false,
  account: {
    station: false,
    result: undefined,
    error: false,
  },
  loading: false,
});

const textLoadin = ref("");

const { selectedItem } = toRefs(props);

const errorBlock = ref(false);
const chaneErrorBlock = () => {
  errorBlock.value = errorBlock.value;
};

const apiUrl = import.meta.env.VITE_WHATSAPI_URL;

const updateStatus = async (state) => {
  console.log(selectedItem.value);
  stationLoading.loading = true;
  const apiUrlMethod = `${apiUrl}/state/${selectedItem.value.id}/${state}/`;

  try {
    const response = await axios.post(
      apiUrlMethod,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.value}`,
        },
      }
    );

    if (response.data) {
      await handleSendLog(
        "mailing",
        "state",
        apiUrlMethod,
        response.data.ok,
        response.data
      );
    }

    if (response.data.ok === true) {
      setLoadingStatus(true, "success");
      stationLoading.loading = false;
      props.changeStatusMailing(selectedItem.value, state);
    } else if (response.data === 401) {
      errorBlock.value = true;
      setTimeout(() => {
        localStorage.removeItem("accountToken");
        router.push("/login");
      }, 2000);
    } else {
      stationLoading.loading = false;
      setLoadingStatus(true, "error");
    }
  } catch (error) {
    console.error(
      "error",
      error.response ? error.response.data : error.message
    );
  }
};

const offModalSuc = () => {
  stationLoading.modalStation = false;
};

const getMessages = async () => {
  const apiUrlMethod = `${apiUrl}/view/${1}/`;

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
    } else if (response.data === 401) {
      errorBlock.value = true;
      setTimeout(() => {
        localStorage.removeItem("accountToken");
        router.push("/login");
      }, 2000);
    } else {
      console.error("error", response.data);
    }
  } catch (error) {
    console.error(
      "error",
      error.response ? error.response.data : error.message
    );
  }
};
</script>

<style scoped>
.black-fon {
  position: fixed;
  z-index: 1000;
  width: 100%;
  height: 100vh;
  background: rgba(117, 117, 117, 0.3);
  top: 0;
  left: 0;
}

/* Базовые стили для обеих версий */
.action-list {
  border-radius: 10px;
  background: #ffffff;
  position: absolute;
  z-index: 1010;
  display: flex;
  justify-content: center;
  flex-direction: column;
  max-height: 80vh;
  overflow-y: auto;
}

/* Стили для десктопной версии */
.action-list.desktop-version {
  width: 150px;
  height: auto;
  margin: 12px;
  padding: 10px 0px 10px 10px;
}

/* Стили для мобильной версии */
.action-list.mobile-version {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90%;
  max-width: 400px;
  margin: 0;
  padding: 0;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.action-list.fade-enter-active,
.action-list.fade-leave-active {
  transition: opacity 0.5s ease;
}

.action-list.fade-enter,
.action-list.fade-leave-to {
  opacity: 0;
}

.action-list.desktop-version {
  animation: fadeIn 0.5s forwards;
}

.action-list.mobile-version {
  animation: mobileFadeIn 0.3s forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes mobileFadeIn {
  from {
    opacity: 0;
    transform: translate(-50%, -40%);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%);
  }
}

/* Мобильный заголовок */
.mobile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
  border-radius: 16px 16px 0 0;
}

.mailing-info-mobile {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mailing-name-mobile {
  font-weight: 600;
  font-size: 16px;
  color: #1f2937;
}

.close-button {
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-button:hover {
  background: #e5e7eb;
}

.close-button svg {
  width: 20px;
  height: 20px;
  color: #6b7280;
}

/* Стили для действий в десктопной версии */
.action-list.desktop-version .action {
  font-weight: 400;
  font-size: 14px;
  color: #000;
  cursor: pointer;
  padding: 4px;
}

.action-list.desktop-version .action:hover {
  background-color: #eeeeee;
  border-radius: 5px 0px 0px 5px;
}

/* Стили для действий в мобильной версии */
.action-list.mobile-version .action {
  padding: 16px;
  font-size: 16px;
  border-bottom: 1px solid #f3f4f6;
  margin: 0;
  cursor: pointer;
  color: #000;
}

.action-list.mobile-version .action:last-child {
  border-bottom: none;
  border-radius: 0 0 16px 16px;
}

.action-list.mobile-version .action:hover {
  background-color: #f3f4f6;
  border-radius: 0;
}

/* Общие стили для действий */
.action-on:hover {
  color: green;
}

.action-off:hover {
  color: orange;
}

.action-delete:hover {
  color: rgb(255, 0, 0);
}

/* Медиа-запросы для переключения между версиями */
@media (max-width: 768px) {
  .action-list.desktop-version {
    display: none !important;
  }

  .action-list.mobile-version {
    display: flex;
  }
}

@media (min-width: 769px) {
  .action-list.mobile-version {
    display: none !important;
  }

  .action-list.desktop-version {
    display: flex;
  }
}
</style>
