<template>
  <div v-if="settingsModalStation">
    <div @click="props.changeStationSettingsModal()" class="black-fon"></div>
    <LoadModal
      :changeStationLoadingModal="changeStationLoadingModal"
      :stationLoading="stationLoading"
    />
    <form @submit.prevent="submitForm">
      <h2 @click="changeStationSettingsModal" class="title">
        Webhook URLs (указывать с новой строки)
      </h2>
      <textarea id="messageTextarea" v-model="webhookUrlsText"></textarea>
      <button
        class="submit-button"
        @click="addNewUrl"
        :disabled="loadingStatiom"
      >
        {{ loadingStatiom ? "Загрузка..." : "Сохранить" }}
      </button>
    </form>
  </div>
</template>

<script setup>
import LoadModal from "../LoadingMoadal/LoadingMoadal.vue";
import { ref, toRefs, watch, reactive } from "vue";
import axios from "axios";

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

const getInfoAccount = async () => {
  try {
    loadingStatiom.value = true; // Устанавливаем состояние загрузки
    if (!selectedItems.value) {
      console.error("selectedItems не определен");
      return;
    }
    const { source, login } = selectedItems.value;

    const response = await axios.post(
      "https://b2288.apitter.com/instances/getInfo",
      {
        source: source,
        login: login,
      },
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: "Bearer 342b63fd-6017-446f-adf8-d1b8e0b7bfc6",
        },
      }
    );

    console.log("Информация о аккаунте", response.data);
    const { webhookUrls } = response.data.data;
    if (Array.isArray(webhookUrls)) {
      webhookUrlsText.value = webhookUrls.join("\n"); // Объединяем значения с новой строки
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
      {
        source: source,
        login: login,
        webhookUrls: webhookUrlsArray, // Передаем массив URL
      },
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: "Bearer 342b63fd-6017-446f-adf8-d1b8e0b7bfc6",
        },
      }
    );

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
