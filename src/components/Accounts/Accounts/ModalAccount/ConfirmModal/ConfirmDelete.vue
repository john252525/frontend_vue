<template>
  <ModalFrame
    :close="close"
    :action="confirm"
    :text="modalText"
    :item="selectedItem"
    :is-loading="loading"
  >
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
      <div class="modal-content">
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
      </div>
    </div>
  </ModalFrame>
</template>

<script setup>
import { toRefs, ref, computed } from "vue";
import ModalFrame from "@/components/GlobalModal/ModalFrame.vue";
import axios from "axios";

import { useAccountStore } from "@/stores/accountStore";
const accountStore = useAccountStore();
const token = computed(() => accountStore.getAccountToken);

import { useStationLoading } from "@/composables/useStationLoading";
const { setLoadingStatus } = useStationLoading();

const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL;

const props = defineProps({
  close: {
    type: Function,
  },
  selectedItem: {
    type: Object,
  },
});

const { selectedItem } = toRefs(props);

const modalText = {
  title: "Подтверждение",
  close: "Отмена",
  action: "Продолжить",
};

const loading = ref(false);

const hasSubscription = computed(() => {
  return (
    selectedItem.value?.subscription_dt_to !== undefined &&
    selectedItem.value?.subscription_dt_to !== null &&
    selectedItem.value?.trial != true
  );
});

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const createRequest = async (request) => {
  const { source, login, storage, type } = selectedItem.value;
  let params = {
    source: source,
    login: login,
    storage: storage,
    type: type,
  };

  try {
    const response = await axios.post(`${FRONTEND_URL}${request}`, params, {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Authorization: `Bearer ${token.value}`,
      },
    });

    if (response.data.status === "ok") {
      if (request === "deleteAccount") {
        setLoadingStatus(true, "success");
        location.reload();
      }
    } else {
      setLoadingStatus(true, "error");
    }
  } catch (error) {
    console.error(`error`, error);

    if (error.response) {
      console.error("error", error.response.data);
    }
  } finally {
    if (request === "deleteAccount") {
      loading.value = false;
    }
  }
};

const confirm = async () => {
  loading.value = true;
  await createRequest("forceStop");
  await createRequest("deleteAccount");
};
</script>

<style scoped>
.modal-header {
  text-align: center;
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

.subscription-alert {
  margin-top: 20px;
  background: linear-gradient(135deg, #fffbeb 0%, #fefce8 100%);
  border: 1px solid #fcd34d;
  border-radius: 12px;
  padding: 16px;
  text-align: left;
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
