<template>
  <ModalFrame
    :text="modalText"
    :item="item"
    :action="saveCustomSources"
    :close="close"
    :is-loading="loading"
  >
    <div class="sources-modal">
      <div class="uon-warning">
        <div class="uon-warning__icon">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 8V12M12 16H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
              stroke="#856404"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
        <div class="uon-warning__content">
          <p class="uon-warning__text">
            <strong>Важное уточнение:</strong> Для корректного отображения
            данных необходимо активировать использование кастомных источников в
            личном кабинете U-ON.
          </p>
          <button @click="goToSettings" class="uon-warning__link">
            Перейти в настройки U-ON
          </button>
        </div>
      </div>

      <Accounts
        :accounts="accounts"
        :custom-sources="sources"
        @update:source="handleUpdateSource"
      />
    </div>
  </ModalFrame>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import ModalFrame from "@/components/GlobalModal/ModalFrame.vue";
import Accounts from "./Accounts.vue";
import axios from "axios";

import { useAccountStore } from "@/stores/accountStore";

const accountStore = useAccountStore();
const token = computed(() => accountStore.getAccountToken);
const FRONTEND_URL = import.meta.env.VITE_BASE_URL;

import { useStationLoading } from "@/composables/useStationLoading";
const { setLoadingStatus } = useStationLoading();

const sources = ref({});

const props = defineProps({
  close: {
    type: Function,
    required: true,
  },
  openUonSettingModal: {
    type: Function,
  },
  item: {
    type: Object,
    required: true,
  },
  accounts: {
    type: Array,
    required: true,
  },
});

const modalText = {
  title: "Источники аккаунта",
  close: "Отмена",
  action: "Сохранить",
};

const loading = ref(false);

const getCustomSources = async () => {
  loading.value = true;
  const { source, login, storage, uuid } = props.item;

  const params = {
    source,
    login,
    storage,
    uuid,
  };

  try {
    const response = await axios.post(
      `${FRONTEND_URL}uon-account/getCustomSources`,
      params,
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: `Bearer ${token.value}`,
        },
      },
    );

    if (response.data.ok === true) {
      const srcObj = {};
      response.data.data.sources.forEach((item) => {
        const uuid = Object.keys(item)[0];
        srcObj[uuid] = item[uuid];
      });
      sources.value = srcObj;
    }
  } catch (error) {
    console.error("getCustomSources error", error);
    setLoadingStatus(true, "error ");
    props.close();
    if (error.response) {
      console.error("error.response.data", error.response.data);
    }
  } finally {
    loading.value = false;
  }
};

const saveCustomSources = async () => {
  loading.value = true;
  const { uuid } = props.item;

  const sourcesArray = Object.entries(sources.value).map(([uuid, name]) => ({
    [uuid]: name,
  }));

  const params = {
    uuid,
    sources: sourcesArray,
  };

  try {
    const response = await axios.post(
      `${FRONTEND_URL}uon-account/saveCustomSources`,
      params,
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: `Bearer ${token.value}`,
        },
      },
    );

    if (response.data.ok === true) {
      setLoadingStatus(true, "success");
      props.close();
    }
  } catch (error) {
    console.error("saveCustomSources error", error);
    setLoadingStatus(true, "error");
    props.close();
    if (error.response) {
      console.error("error.response.data", error.response.data);
    }
  } finally {
    loading.value = false;
  }
};

const goToSettings = () => {
  props.close();
  props.openUonSettingModal();
};

const handleUpdateSource = (uuid, newName) => {
  // Используем spread или явное присваивание, чтобы Vue видел изменения
  sources.value = {
    ...sources.value,
    [uuid]: newName,
  };
};
onMounted(getCustomSources);
</script>

<style scoped>
.sources-modal {
  max-width: 560px;
  margin: 0 auto;
}

.uon-warning {
  display: flex;
  gap: 12px;
  background-color: #fff3cd; /* Светло-желтый фон */
  border: 1px solid #ffeeba;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
  align-items: flex-start;
}

.uon-warning__icon {
  flex-shrink: 0;
  margin-top: 2px;
}

.uon-warning__content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.uon-warning__text {
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
  color: #856404; /* Темно-коричневый текст */
}

.uon-warning__link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  padding: 0;
  color: #664d03;
  font-size: 14px;
  font-weight: 600;
  text-decoration: underline;
  cursor: pointer;
  width: fit-content;
  transition: opacity 0.2s;
}

.uon-warning__link:hover {
  opacity: 0.8;
  text-decoration: none;
}

.sources-modal__title {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 8px;
}

.sources-modal__desc {
  font-size: 14px;
  color: #555;
  margin-bottom: 20px;
}

.sources-modal__actions {
  margin-top: 24px;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn {
  padding: 9px 18px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn--primary {
  background-color: #007bff;
  color: white;
}

.btn--primary:hover {
  background-color: #0069d9;
}
.btn--secondary {
  background-color: #f8f9fa;
  color: #495057;
  border: 1px solid #ced4da;
}

.btn--secondary:hover {
  background-color: #e9ecef;
}
</style>
