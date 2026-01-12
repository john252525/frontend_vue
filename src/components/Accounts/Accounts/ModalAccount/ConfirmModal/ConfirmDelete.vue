<template>
  <div @click="ChangeconfirmStation" class="overlay"></div>
  <ErrorBlock v-if="errorBlock" :changeIncorrectPassword="chaneErrorBlock" />
  <transition name="modal">
    <section class="confirm-modal">
      <div class="modal-header">
        <div class="icon-wrapper">
          <svg
            class="danger-icon"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 9V11M12 15H12.01M5.07183 19H18.9282C20.4678 19 21.4301 17.3333 20.6603 16L13.7321 4C12.9623 2.66667 11.0377 2.66667 10.2679 4L3.33975 16C2.56995 17.3333 3.53223 19 5.07183 19Z"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
        <h2 class="modal-title">Удаление аккаунта</h2>
        <p class="modal-subtitle">Это действие нельзя будет отменить</p>
      </div>

      <div class="modal-content">
        <!-- Блок предупреждения о подписке -->
        <article v-if="hasSubscription" class="subscription-alert">
          <div class="alert-header">
            <svg
              class="alert-icon"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10 6V10M10 14H10.01M19 10C19 14.4183 15.4183 18 11 18C6.58172 18 3 14.4183 3 10C3 5.58172 6.58172 2 11 2C15.4183 2 19 5.58172 19 10Z"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <span class="alert-title">Активная подписка</span>
          </div>
          <p class="alert-description">
            При удалении аккаунта ваша подписка будет
            <strong>безвозвратно утеряна</strong>. Для переноса подписки на
            другой аккаунт обратитесь в службу поддержки.
          </p>
        </article>

        <div class="account-info">
          <div class="info-item">
            <span class="info-label">Аккаунт:</span>
            <span class="info-value">{{ selectedItem.name }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Логин:</span>
            <span class="info-value">{{ selectedItem.login }}</span>
          </div>
          <div v-if="hasSubscription" class="info-item">
            <span class="info-label">Подписка до:</span>
            <span class="info-value highlight">{{
              formatDate(selectedItem.subscription_dt_to)
            }}</span>
          </div>
        </div>
      </div>

      <div class="modal-actions">
        <button class="btn-secondary" @click="ChangeconfirmStation">
          Отменить
        </button>
        <button
          class="btn-danger"
          @click="confirm"
          :class="{ 'with-subscription': hasSubscription }"
        >
          <svg
            class="btn-icon"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6 2H10M2 4H14M12.6667 4L12.1991 11.0129C12.129 12.065 12.0939 12.5911 11.8667 12.99C11.6666 13.3412 11.3648 13.6235 11.0011 13.7998C10.588 14 10.0607 14 9.00623 14H6.99377C5.93927 14 5.41202 14 4.99889 13.7998C4.63517 13.6235 4.33339 13.3412 4.13332 12.99C3.90607 12.5911 3.87098 12.065 3.80086 11.0129L3.33333 4M6.66667 7V11.3333M9.33333 7V11.3333"
              stroke="currentColor"
              stroke-width="1.2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          Удалить аккаунт
        </button>
      </div>
    </section>
  </transition>
</template>

<script setup>
import { toRefs, ref, computed } from "vue";
import ErrorBlock from "@/components/ErrorBlock/ErrorBlock.vue";
import { useRouter } from "vue-router";
import { useAccountStore } from "@/stores/accountStore";
const accountStore = useAccountStore();
const token = computed(() => accountStore.getAccountToken);

import { useStationLoading } from "@/composables/useStationLoading";
const { setLoadingStatus } = useStationLoading();

import useFrontendLogger from "@/composables/useFrontendLogger";
const { sendLog } = useFrontendLogger();

const handleSendLog = async (location, method, params, results, answer) => {
  try {
    await sendLog(location, method, params, results, answer);
  } catch (err) {
    console.error("error", err);
  }
};

import { useI18n } from "vue-i18n";
const router = useRouter();
import axios from "axios";
const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL;
const props = defineProps({
  loadingStart: {
    type: Function,
  },
  changeStationLoadingModal: {
    type: Function,
  },
  ChangeconfirmStation: {
    type: Function,
  },
  selectedItem: {
    type: Object,
  },
  errorStationOn: {
    type: Function,
  },
  errorStationOff: {
    type: Function,
  },
  loadingStop: {
    type: Function,
  },
});

const { selectedItem } = toRefs(props);

const hasSubscription = computed(() => {
  return (
    selectedItem.value?.subscription_dt_to !== undefined &&
    selectedItem.value?.subscription_dt_to !== null &&
    selectedItem.value?.trial != true
  );
});

// Форматирование даты
const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const errorBlock = ref(false);
const chaneErrorBlock = () => {
  errorBlock.value = !errorBlock.value;
};

import { useDomain } from "@/composables/getDomain";
const { stationDomain } = useDomain();

const createRequest = async (request) => {
  const { source, login, storage, type } = selectedItem.value;
  let params = {
    source: source,
    login: login,
    storage: storage,
    type: type,
  };
  if (stationDomain.navigate.value != "whatsapi") {
    params = {
      source: source,
      login: login,
    };
  } else {
    params = {
      source: source,
      login: login,
      storage: storage,
    };
  }
  try {
    const response = await axios.post(`${FRONTEND_URL}${request}`, params, {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Authorization: `Bearer ${token.value}`,
      },
    });
    if (response.data) {
      await handleSendLog(
        "deleteAccount",
        request,
        params,
        response.data.ok,
        response.data
      );
    }

    if (response.data.status === "ok") {
      if (request === "deleteAccount") {
        props.loadingStop();
        setLoadingStatus(true, "success");
        location.reload();
      }
    } else if (response.data === 401) {
      errorBlock.value = true;
      setTimeout(() => {
        localStorage.removeItem("accountToken");
        router.push("/login");
      }, 2000);
    } else {
      props.loadingStop();
      setLoadingStatus(true, "error");
    }
  } catch (error) {
    props.loadingStop();
    console.error(`error`, error);
    props.errorStationOn();
    props.changeStationLoadingModal(true);
    setTimeout(() => {
      props.changeStationLoadingModal(false);
      props.errorStationOff();
    }, 5000);
    if (error.response) {
      console.error("error", error.response.data);
    }
  }
};

const confirm = async () => {
  await props.ChangeconfirmStation();
  await props.loadingStart("Удаление аккаунта...");
  await createRequest("forceStop");
  await createRequest("deleteAccount");
};
</script>

<style scoped>
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 999;
}

.confirm-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
  border-radius: 20px;
  width: 440px;
  background: #fff;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.16);
  border: 1px solid #e8e8e8;
  overflow: hidden;
}

.modal-header {
  padding: 32px 32px 24px;
  text-align: center;
  background: linear-gradient(135deg, #fef2f2 0%, #fef7f7 100%);
  border-bottom: 1px solid #fee2e2;
}

.icon-wrapper {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: #fee2e2;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  border: 2px solid #fecaca;
}

.danger-icon {
  color: #dc2626;
  width: 32px;
  height: 32px;
}

.modal-title {
  font-weight: 700;
  font-size: 20px;
  color: #1a1a1a;
  margin-bottom: 8px;
  line-height: 1.3;
}

.modal-subtitle {
  font-weight: 400;
  font-size: 14px;
  color: #666;
  margin: 0;
  line-height: 1.4;
}

.modal-content {
  padding: 24px 32px;
}

.subscription-alert {
  background: linear-gradient(135deg, #fffbeb 0%, #fefce8 100%);
  border: 1px solid #fcd34d;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
}

.alert-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.alert-icon {
  color: #d97706;
}

.alert-title {
  font-weight: 600;
  font-size: 14px;
  color: #92400e;
}

.alert-description {
  font-weight: 400;
  font-size: 13px;
  color: #b45309;
  line-height: 1.5;
  margin: 0;
}

.alert-description strong {
  color: #92400e;
}

.account-info {
  background: #f8fafc;
  border-radius: 12px;
  padding: 16px;
  border: 1px solid #e2e8f0;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.info-item:not(:last-child) {
  border-bottom: 1px solid #e2e8f0;
}

.info-label {
  font-weight: 500;
  font-size: 13px;
  color: #64748b;
}

.info-value {
  font-weight: 600;
  font-size: 13px;
  color: #1e293b;
}

.info-value.highlight {
  color: #dc2626;
  background: #fef2f2;
  padding: 4px 8px;
  border-radius: 6px;
  font-weight: 700;
}

.modal-actions {
  display: flex;
  gap: 12px;
  padding: 24px 32px 32px;
  background: #fafafa;
  border-top: 1px solid #e8e8e8;
}

.btn-secondary {
  flex: 1;
  height: 44px;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  background: #fff;
  font-weight: 600;
  font-size: 14px;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-secondary:hover {
  background: #f9fafb;
  border-color: #9ca3af;
  transform: translateY(-1px);
}

.btn-danger {
  flex: 1;
  height: 44px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  font-weight: 600;
  font-size: 14px;
  color: #fff;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 2px 8px rgba(220, 38, 38, 0.3);
}

.btn-danger:hover {
  background: linear-gradient(135deg, #b91c1c 0%, #991b1b 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4);
}

.btn-danger.with-subscription {
  background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
  box-shadow: 0 2px 8px rgba(220, 38, 38, 0.4), 0 0 0 2px #fecaca;
}

.btn-danger.with-subscription:hover {
  background: linear-gradient(135deg, #b91c1c 0%, #7f1d1d 100%);
  box-shadow: 0 4px 16px rgba(220, 38, 38, 0.5), 0 0 0 2px #fecaca;
}

.btn-icon {
  width: 16px;
  height: 16px;
}

/* Анимации */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: translate(-50%, -48%) scale(0.95);
}

.modal-enter-to,
.modal-leave-from {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1);
}

@media (max-width: 480px) {
  .confirm-modal {
    width: 90%;
    max-width: 380px;
    margin: 0 16px;
    border-radius: 16px;
  }

  .modal-header {
    padding: 24px 24px 20px;
  }

  .modal-content {
    padding: 20px 24px;
  }

  .modal-actions {
    padding: 20px 24px 24px;
    flex-direction: column-reverse;
  }

  .icon-wrapper {
    width: 64px;
    height: 64px;
  }

  .modal-title {
    font-size: 18px;
  }
}
</style>
