<template>
  <div @click="handleBackdropClick" class="black-fon">
    <ErrorBlock
      v-if="showError"
      :errorMessage="errorMessage"
      @close="closeError"
    />
    <LoadingModal :text="loadingText" :isLoading="isLoading" />
    <section v-if="showScreen" class="screen-section">
      <img class="screen-img" :src="screenImage" alt="screenshot" />
      <button @click="closeScreen" class="close">
        {{ t("GetScreen.close") }}
      </button>
    </section>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import axios from "axios";
import ErrorBlock from "@/components/ErrorBlock/ErrorBlock.vue";
import LoadingModal from "./Enable/LoadingModal.vue";

const { t } = useI18n();
const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL;

import { useAccountStore } from "@/stores/accountStore";
const accountStore = useAccountStore();
const token = computed(() => accountStore.getAccountToken);

// Реактивные состояния
const screenImage = ref("");
const errorMessage = ref("");
const showError = ref(false);
const isLoading = ref(false);
const showScreen = ref(false);
const loadingText = ref(t("GetScreen.text"));

const props = defineProps({
  selectedItem: Object,
  getScreenStation: Boolean,
  changeGetScreenStation: Function,
});

const decodeBase64Response = (base64String) => {
  try {
    const decodedString = atob(base64String);
    return JSON.parse(decodedString);
  } catch (error) {
    console.error("Error decoding base64 response:", error);
    return null;
  }
};

const getScreen = async () => {
  isLoading.value = true;
  showError.value = false;
  showScreen.value = false;

  try {
    const params = {
      source: props.selectedItem.source,
      login: props.selectedItem.login,
      ...(props.selectedItem.storage && {
        storage: props.selectedItem.storage,
      }),
      ...(props.selectedItem.type && { type: props.selectedItem.type }),
    };

    const response = await axios.post(`${FRONTEND_URL}screenshot`, params, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.value}`, // Замените на ваш токен
      },
    });

    if (response.data.ok && response.data.data?.value) {
      const decodedData = decodeBase64Response(response.data.data.value);

      if (decodedData?.status === "error") {
        // Обработка ошибки от сервера
        errorMessage.value = decodedData.error?.message || t("errors.unknown");
        showError.value = true;
      } else {
        // Предполагаем, что это изображение
        screenImage.value = `data:image/png;base64,${response.data.data.value}`;
        showScreen.value = true;
      }
    } else {
      errorMessage.value = t("errors.noScreenshotData");
      showError.value = true;
    }
  } catch (error) {
    console.error("Screenshot error:", error);
    errorMessage.value =
      error.response?.data?.message || t("errors.connectionFailed");
    showError.value = true;
  } finally {
    isLoading.value = false;
  }
};

const handleBackdropClick = (e) => {
  if (e.target === e.currentTarget) {
    closeScreen();
  }
};

const closeScreen = () => {
  showScreen.value = false;
  props.changeGetScreenStation();
};

const closeError = () => {
  showError.value = false;
  props.changeGetScreenStation();
};

onMounted(() => {
  getScreen();
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

.screen-section {
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

.screen-img {
  width: 600px;
  max-height: 80vh;
  object-fit: contain;
}

.close {
  border-radius: 5px;
  width: 100%;
  height: 35px;
  margin-top: 24px;
  background: #4950ca;
  font-weight: 600;
  font-size: 14px;
  color: #fff;
  transition: all 0.25s;
  cursor: pointer;
}

@media (max-width: 700px) {
  .screen-img {
    width: 500px;
  }
}

@media (max-width: 600px) {
  .screen-img {
    width: 400px;
  }
}

@media (max-width: 500px) {
  .screen-img {
    width: 300px;
  }
}
</style>
