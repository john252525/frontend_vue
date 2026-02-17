<template>
  <ModalFrame
    :text="modalText"
    :item="item"
    :action="saveCustomSources"
    :close="close"
    :is-loading="loading"
  >
    <div class="sources-modal">
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
  action: "Сохранить источники",
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

const handleUpdateSource = (uuid, newName) => {
  sources.value[uuid] = newName || "";
};

onMounted(getCustomSources);
</script>

<style scoped>
.sources-modal {
  max-width: 560px;
  margin: 0 auto;
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
