<template>
  <div v-if="settingsModalStation">
    <div @click="props.changeStationSettingsModal()" class="black-fon"></div>
    <ErrorBlock v-if="errorBlock" :changeIncorrectPassword="chaneErrorBlock" />
    <form @submit.prevent="submitForm">
      <h2 class="title">{{ t("settings.title") }}</h2>
      <h2 @click="changeStationSettingsModal" class="subtitle">
        {{ t("settings.subtitle") }}
      </h2>
      <textarea
        v-if="!loadingStatiom"
        id="messageTextarea"
        v-model="webhookUrlsText"
      ></textarea>
      <div v-if="loadingStatiom" class="loading-cont">
        <SettingsLoad />
      </div>
      <button
        class="submit-button"
        @click="addNewUrl"
        :disabled="loadingStatiom"
      >
        {{
          loadingStatiom
            ? t("settings.button.loading")
            : t("settings.button.save")
        }}
      </button>
    </form>
  </div>
</template>

<script setup>
import ErrorBlock from "@/components/ErrorBlock/ErrorBlock.vue";
import LoadModal from "../LoadingMoadal/LoadingMoadal.vue";
import SettingsLoad from "../LoadingMoadal/SettingsLoad.vue";
import { useRouter } from "vue-router";
import { useAccountStore } from "@/stores/accountStore";
const accountStore = useAccountStore();

const router = useRouter();
import { ref, toRefs, watch, reactive, computed } from "vue";
import axios from "axios";
import { useI18n } from "vue-i18n";
import { useStationLoading } from "@/composables/useStationLoading";
const { setLoadingStatus } = useStationLoading();
const { t } = useI18n();
const token = computed(() => accountStore.getAccountToken);
const props = defineProps({
  closeModal: {
    type: Function,
  },
  selectedItems: {
    type: Object,
  },
  changeStationSettingsModal: {
    type: Function,
  },
  settingsModalStation: {
    type: Boolean,
  },
});

const { selectedItems, settingsModalStation } = toRefs(props);
const webhookUrlsText = ref(""); // Создаем реактивную переменную для текстового поля
const loadingStatiom = ref(false);

const errorBlock = ref(false);
const chaneErrorBlock = () => {
  errorBlock.value = errorBlock.value;
};

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

import { useDomain } from "@/composables/getDomain";
const { stationDomain } = useDomain();
const getInfoAccount = async () => {
  try {
    loadingStatiom.value = true; // Устанавливаем состояние загрузки
    if (!selectedItems.value) {
      return;
    }
    const { source, login, storage, type } = selectedItems.value;
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
    const response = await axios.post(
      "https://b2288.apitter.com/instances/getInfo",
      params,
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: `Bearer ${token.value}`,
        },
      }
    );

    const { webhookUrls } = response.data.data;
    if (Array.isArray(webhookUrls)) {
      webhookUrlsText.value = webhookUrls.join("\n"); // Объединяем значения с новой строки
    }

    if (response.data) {
      await handleSendLog(
        "settingsAccount",
        "getInfo",
        params,
        response.data.ok,
        response.data
      );
    }
    if (response.data === 401) {
      errorBlock.value = true;
      setTimeout(() => {
        localStorage.removeItem("accountToken");
        router.push("/login");
      }, 2000);
    }
  } catch (error) {
    console.error("error", error);
    if (error.response) {
      console.error("error", error.response.data);
    }
  } finally {
    loadingStatiom.value = false; // Сбрасываем состояние загрузки в любом случае
  }
};

const addNewUrl = async () => {
  const webhookUrlsArray = webhookUrlsText.value
    .split("\n")
    .map((url) => url.trim())
    .filter((url) => url);
  const { source, login, storage } = selectedItems.value;
  let params = {
    source: source,
    login: login,
  };
  if (stationDomain.navigate.value != "whatsapi") {
    params = {
      source: source,
      login: login,
      webhookUrls: webhookUrlsArray,
    };
  } else {
    params = {
      source: source,
      login: login,
      storage: storage,
      webhookUrls: webhookUrlsArray,
    };
  }
  try {
    loadingStatiom.value = true; // Устанавливаем состояние загрузки
    if (!selectedItems.value) {
      return;
    }
    const { source, login } = selectedItems.value;

    // Разделяем строки в textarea на массив

    const response = await axios.post(
      "https://b2288.apitter.com/instances/updateAccount",
      params,
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: `Bearer ${token.value}`,
        },
      }
    );

    if (response.data) {
      await handleSendLog(
        "settingsAccount",
        "updateAccount",
        params,
        response.data.ok,
        response.data
      );
    }

    if (response.data === 401) {
      errorBlock.value = true;
      setTimeout(() => {
        localStorage.removeItem("accountToken");
        router.push("/login");
      }, 2000);
    }
  } catch (error) {
    console.error("error", error);
    if (error.response) {
      console.error("error", error.response.data);
    }
  } finally {
    loadingStatiom.value = false;
    setLoadingStatus(true, "success");
    // location.reload();
  }
};

watch(settingsModalStation, (newValue) => {
  if (newValue === true) {
    getInfoAccount();
  }
});
</script>

<style scoped>
.black-fon {
  position: fixed;
  z-index: 5;
  width: 100%;
  height: 100vh;
  background: rgba(117, 117, 117, 0.3);
  top: 0;
  left: 0;
}

form {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
  background-color: white;
  padding: 25px 30px;
  border-radius: 10px;
  display: flex;
  align-items: flex-start;
  flex-direction: column;
}

.title {
  font-size: 22px;
  color: rgb(0, 0, 0);
  font-weight: 600;
  margin-bottom: 20px;
}

.subtitle {
  font-size: 14px;
  color: rgb(78, 78, 78);
  font-weight: 600;
  margin-bottom: 14px;
}

textarea {
  max-width: 350px;
  max-height: 700px;
  min-width: 350px;
  min-height: 400px;
  padding: 10px;
  outline: none;
  border: 0.5px solid rgb(207, 207, 207);
  border-radius: 5px;
  font-family: "Montserrat", serif;
  font-size: 14px;
  color: rgb(78, 78, 78);
  font-weight: 500;
  margin-bottom: 8px;
}

.loading-cont {
  max-width: 350px;
  max-height: 700px;
  min-width: 350px;
  min-height: 400px;
  padding: 10px;
  border: 0.5px solid rgb(207, 207, 207);
  border-radius: 5px;
  margin-bottom: 8px;
}

.submit-button {
  width: 100%;
  height: 35px;
  border-radius: 5px;
  background-color: #4950ca;
  font-size: 14px;
  color: rgb(255, 255, 255);
  font-weight: 600;
  margin-top: 12px;
}

@media (max-width: 450px) {
  textarea {
    max-width: 300px;
    max-height: 500px;
    min-width: 300px;
    min-height: 400px;
  }

  form {
    padding: 20px 25px;
  }
}

@media (max-width: 400px) {
  textarea {
    max-width: 250px;
    max-height: 450px;
    min-width: 250px;
    min-height: 400px;
  }

  form {
    padding: 20px 25px;
  }
}
</style>
