<template>
  <div class="modal-overlay">
    <div class="modal-backdrop"></div>

    <div class="modal-content">
      <div class="modal-header">
        <h2 class="modal-title">Включение аккаунта</h2>
        <button class="close-button" @click="closeModal">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
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

      <div class="modal-body">
        <div class="connection-options">
          <AccoutnEnableLoadingOptions v-if="enableStation.loading" />
          <div v-if="enableStation.start">
            <h3 class="section-title">Способы подключения</h3>
            <p class="section-description">
              Выберите способ для активации аккаунта
            </p>

            <div class="options-list">
              <button class="option-button" @click="changeUserPhone">
                <div class="option-content">
                  <svg
                    class="option-icon"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M17 7l-10 10"></path>
                    <path d="M8 7l9 0l0 9"></path>
                  </svg>
                  <div class="option-text">
                    <span class="option-title">Связать через код</span>
                    <span class="option-description"
                      >Введите код подтверждения из приложения</span
                    >
                  </div>
                </div>
                <svg
                  class="arrow-icon"
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M5 12h14"></path>
                  <path d="m12 5l7 7-7 7"></path>
                </svg>
              </button>

              <button class="option-button" @click="connectViaQRcode">
                <div class="option-content">
                  <svg
                    class="option-icon"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <rect x="3" y="3" width="6" height="6"></rect>
                    <rect x="15" y="3" width="6" height="6"></rect>
                    <rect x="3" y="15" width="6" height="6"></rect>
                    <rect x="15" y="15" width="6" height="6"></rect>
                  </svg>
                  <div class="option-text">
                    <span class="option-title">Связать через QR-код</span>
                    <span class="option-description"
                      >Отсканируйте QR-код в приложении</span
                    >
                  </div>
                </div>
                <svg
                  class="arrow-icon"
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M5 12h14"></path>
                  <path d="m12 5l7 7-7 7"></path>
                </svg>
              </button>
            </div>
          </div>
          <ViaQRcode
            :startFunction="startFunction"
            :selectedItem="item"
            v-if="enableStation.QRcode"
          />
          <ViaCode
            :startFunction="startFunction"
            :selectedItem="item"
            v-if="enableStation.code"
          />
          <Modals
            :typeError="enableStation.typeError"
            :success="enableStation.success"
            :error="enableStation.error"
          />
          <PhoneInputComponent
            v-if="enableStation.userPhone"
            :startFunction="startFunction"
            :selectedItem="item"
          />
        </div>
      </div>

      <div class="modal-footer">
        <button class="cancel-button" @click="closeModal">Отмена</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import axios from "axios";
import { computed, reactive, ref, toRefs } from "vue";
import AccountIcon from "@/components/Accounts/AccountIcon.vue";
import ViaQRcode from "./Start/ViaQRcode.vue";
import ViaCode from "./Start/ViaCode.vue";
import Modals from "./ServerResponsesModal/Modals.vue";
import PhoneInputComponent from "./Components/PhoneInputComponent.vue";
import AccoutnEnableLoadingOptions from "@/components/GlobalModal/DownloadOptions/AccoutnEnableLoadingOptions.vue";
const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL;

import { useAccountStore } from "@/stores/accountStore";
const accountStore = useAccountStore();
const token = computed(() => accountStore.getAccountToken);

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
  closeModal: {
    type: Function,
    required: true,
  },
  connectWithCode: {
    type: Function,
    required: true,
  },
  connectWithQR: {
    type: Function,
    required: true,
  },
});
const { item } = toRefs(props);

const enableStation = reactive({
  start: true,
  QRcode: false,
  code: false,
  loading: false,
  userPhone: false,
  success: false,
  error: false,
  typeError: "qrCode",
});

const changeUserPhone = () => {
  enableStation.userPhone = !enableStation.userPhone;
  enableStation.start = false;
};

const startLoading = () => {
  enableStation.start = false;
  enableStation.loading = !enableStation.loading;
};

const changeLoading = () => (enableStation.loading = !enableStation.loading);
const changeQRcode = () => (enableStation.qrCode = !enableStation.qrCode);
const changeCode = () => (enableStation.code = !enableStation.code);
const changeError = () => (enableStation.error = !enableStation.error);
const changeSuccess = () => {
  enableStation.success = !enableStation.success;
  enableStation.start = false;
  enableStation.QRcode = false;
  enableStation.code = false;
};

const { source, login, storage, type } = item.value;

const forceStop = async () => {
  const paramsStop = {
    source: source,
    login: login,
    storage: storage,
    setState: true,
  };

  try {
    const response = await axios.post(
      `${FRONTEND_URL}forceStop?referer=https://app.chatserv.ru/`,
      paramsStop,
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: `Bearer ${token.value}`,
        },
      },
    );

    if (response.data.ok === true) {
    } else {
    }
  } catch (error) {
    startLoading();
    enableStation.error = true;
    console.error(`error`, error);
    if (error.response) {
      console.error("error", error.response.data);
    }
  }
};

const setState = async () => {
  const paramsState = {
    source: source,
    login: login,
    storage: storage,
    setState: true,
  };
  startLoading();
  try {
    const response = await axios.post(
      `${FRONTEND_URL}setState?referer=https://app.chatserv.ru/`,
      paramsState,
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: `Bearer ${token.value}`,
        },
      },
    );

    // props.changeForceStopItemData(selectedItem.value);
    // console.log(response.data.data);

    if (response.data.status === "ok") {
      startLoading();
      enableStation.success = true;
    } else if (response.data.error) {
      startLoading();
      setTimeout(() => {
        station.stationLoading = false;
      }, 1000);
      if (response.data.error.message === "QR received") {
        enableStation.QRcode = true;
      } else if (response.data.error.message === "Challenge required") {
        station.stationLoading = false;
        station.ChallengeRequired = true;
      } else if (response.data.error.message === "QR code received") {
        enableStation.start = false;
        enableStation.QRcode = true;
      } else if (response.data.error.message === "Auth code received") {
        enableStation.start = false;
        enableStation.userPhone = false;
        enableStation.code = true;
      } else {
        setTimeout(() => {
          station.result = true;
        }, 1000);
      }
    } else {
      enableStation.success = true;
      startLoading();
    }
  } catch (error) {
    console.error(`error`, error);
    startLoading();
    enableStation.error = true;
    station.result = true;
    station.stationLoading = false;
    if (error.response) {
      console.error("error", error.response.data);
    }
  }
};

const disablePhoneAuth = async () => {
  try {
    const params = {
      source: source,
      login: login,
      ...(storage && { storage: storage }),
    };

    const response = await axios.post(
      `${FRONTEND_URL}disablePhoneAuth`,
      params,
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: `Bearer ${token.value}`,
        },
      },
    );

    if (response.data.ok === true) {
      startLoading();
      console.log("Phone auth disabled successfully");
    }
  } catch (error) {
    startLoading();
    enableStation.error = true;
    console.error("Error disabling phone auth:", error);
    if (error.response) {
      console.error("Error response:", error.response.data);
    }
  }
};

const startFunction = async () => {
  await forceStop();
  await setState();
};

const connectViaQRcode = async () => {
  startLoading();
  await disablePhoneAuth();
  await startFunction();
};

const displayName = computed(() => {
  console.log(item);
  return item.value.name || item.value.login || "Неизвестный аккаунт";
});
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.modal-content {
  position: relative;
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
  background: #f8fafc;
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.close-button {
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  border-radius: 6px;
  color: #6b7280;
  transition: all 0.2s ease;
}

.close-button:hover {
  background: #f3f4f6;
  color: #374151;
}

.modal-body {
  padding: 24px;
  flex: 1;
  overflow-y: auto;
}

.account-info {
  margin-bottom: 24px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-label {
  font-weight: 600;
  color: #374151;
  min-width: 80px;
}

.account-name-box {
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-value {
  color: #6b7280;
  font-weight: 500;
}

.connection-options {
  /* margin-bottom: 20px; */
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 8px;
}

.section-description {
  color: #6b7280;
  font-size: 14px;
  margin-bottom: 20px;
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.option-button {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  width: 100%;
}

.option-button:hover {
  border-color: #3b82f6;
  background: #f8fafc;
}

.option-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.option-icon {
  color: #3b82f6;
  flex-shrink: 0;
}

.option-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.option-title {
  font-weight: 600;
  color: #1f2937;
  font-size: 14px;
}

.option-description {
  color: #6b7280;
  font-size: 12px;
}

.arrow-icon {
  color: #9ca3af;
  flex-shrink: 0;
}

.modal-footer {
  display: flex;
  padding: 20px 24px;
  border-top: 1px solid #e5e7eb;
  background: #f8fafc;
}

.cancel-button {
  flex: 1;
  padding: 10px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: white;
  color: #374151;
}

.cancel-button:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
}

/* Адаптивность */
@media (max-width: 600px) {
  .modal-content {
    width: 95%;
    margin: 10px;
  }

  .modal-header {
    padding: 16px 20px;
  }

  .modal-body {
    padding: 20px;
  }

  .modal-footer {
    padding: 16px 20px;
  }

  .info-item {
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }

  .info-label {
    min-width: auto;
  }
}

@media (max-width: 400px) {
  .modal-header {
    padding: 12px 16px;
  }

  .modal-body {
    padding: 16px;
  }

  .option-content {
    gap: 8px;
  }

  .option-button {
    padding: 12px;
  }
}
</style>
