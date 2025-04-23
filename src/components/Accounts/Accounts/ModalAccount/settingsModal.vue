<template>
  <div v-if="settingsModalStation">
    <div @click="props.changeStationSettingsModal()" class="black-fon"></div>
    <ErrorBlock v-if="errorBlock" :changeIncorrectPassword="chaneErrorBlock" />
    <LoadModal
      :changeStationLoadingModal="changeStationLoadingModal"
      :stationLoading="stationLoading"
    />
    <form @submit.prevent="submitForm">
      <h2 class="title">{{ t("settings.title") }}</h2>
      <h2 @click="changeStationSettingsModal" class="subtitle">
        {{ t("settings.subtitle") }}
      </h2>
      <textarea id="messageTextarea" v-model="webhookUrlsText"></textarea>
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
import { useRouter } from "vue-router";
const router = useRouter();
import { ref, toRefs, watch, reactive } from "vue";
import axios from "axios";
import { useI18n } from "vue-i18n";
const { t } = useI18n();
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

const stationLoading = reactive({
  loading: false,
  value: "",
  modalStation: false,
  deleteAccount: {
    station: false,
    result: undefined,
  },
  account: {
    station: false,
    result: undefined,
    error: false,
  },
});

const changeStationLoadingModal = () => {
  stationLoading.modalStation = !stationLoading.modalStation;
};
import { useDomain } from "@/composables/getDomen";
const { stationDomen } = useDomain();
const getInfoAccount = async () => {
  try {
    loadingStatiom.value = true; // Устанавливаем состояние загрузки
    if (!selectedItems.value) {
      console.error("selectedItems не определен");
      return;
    }
    const { source, login, storage } = selectedItem.value;
    let params = {
      source: source,
      login: login,
    };
    if (stationDomen.navigate.value != "whatsapi") {
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
          Authorization: `Bearer ${localStorage.getItem("accountToken")}`,
        },
      }
    );

    console.log("Информация о аккаунте", response.data);
    const { webhookUrls } = response.data.data;
    if (Array.isArray(webhookUrls)) {
      webhookUrlsText.value = webhookUrls.join("\n"); // Объединяем значения с новой строки
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
      console.error("Ошибка сервера:", error.response.data);
    }
  } finally {
    loadingStatiom.value = false; // Сбрасываем состояние загрузки в любом случае
  }
};

const addNewUrl = async () => {
  const { source, login, storage } = selectedItem.value;
  let params = {
    source: source,
    login: login,
  };
  if (stationDomen.navigate.value != "whatsapi") {
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
      console.error("selectedItems не определен");
      return;
    }
    const { source, login } = selectedItems.value;

    // Разделяем строки в textarea на массив
    const webhookUrlsArray = webhookUrlsText.value
      .split("\n")
      .map((url) => url.trim())
      .filter((url) => url);

    const response = await axios.post(
      "https://b2288.apitter.com/instances/updateAccount",
      params,
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: `Bearer ${localStorage.getItem("accountToken")}`,
        },
      }
    );
    if (response.data === 401) {
      errorBlock.value = true;
      setTimeout(() => {
        localStorage.removeItem("accountToken");
        router.push("/login");
      }, 2000);
    }
    console.log("Информация о аккаунте", response.data);
  } catch (error) {
    console.error("error", error);
    if (error.response) {
      console.error("Ошибка сервера:", error.response.data);
    }
  } finally {
    loadingStatiom.value = false;
    changeStationLoadingModal();
    location.reload();
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
