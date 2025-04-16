<template>
  <ErrorBlock v-if="errorBlock" :changeIncorrectPassword="chaneErrorBlock" />
  <section class="qr-telegram-section">
    <LoadingModal :stationLoading="stationLoading" />
    <article v-if="qrCodeData.station">
      <qrcode-vue :value="qrCodeData.link" :size="256" />
      <h2 @click="getCode" class="title">
        {{ t("enable.codeTitle") }}
      </h2>
    </article>
  </section>
</template>

<script setup>
import { inject, ref, reactive, onMounted, onBeforeUnmount } from "vue";
import axios from "axios";
import QrcodeVue from "qrcode.vue";
import LoadingModal from "../LoadingModal.vue";
import ErrorBlock from "@/components/ErrorBlock/ErrorBlock.vue";
import { useRouter } from "vue-router";
const router = useRouter();
const { startFunc, offQrCodeStation } = inject("accountItems");
const { changeEnableStation } = inject("changeEnableStation");
const { selectedItem } = inject("accountItems");
const { source, login } = selectedItem.value;
import { useI18n } from "vue-i18n";
const { t } = useI18n();
const errorBlock = ref(false);
const chaneErrorBlock = () => {
  errorBlock.value = errorBlock.value;
};

const stationLoading = ref(false);
const qrCodeData = reactive({
  link: "",
  station: false,
});

let intervalId = null; // Для хранения идентификатора интервала
let previousLink = ""; // Для хранения предыдущей ссылки

const getQr = async () => {
  try {
    const response = await axios.post(
      "https://b2288.apitter.com/instances/getQr",
      {
        source: source,
        login: login,
      },
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: `Bearer ${localStorage.getItem("accountToken")}`,
        },
      }
    );

    if (response.data.data.status === "ok") {
      previousLink = qrCodeData.link; // Сохраняем предыдущую ссылку
      qrCodeData.link = response.data.data.value;
      qrCodeData.station = true;
      stationLoading.value = false;
    } else if (response.data === 401) {
      errorBlock.value = true;
      setTimeout(() => {
        localStorage.removeItem("accountToken");
        router.push("/login");
      }, 2000);
    } else {
      // Если значение пустое, останавливаем запросы
      if (!response.data.data.value) {
        clearInterval(intervalId);
        qrCodeData.link = previousLink; // Отображаем предыдущую ссылку
        changeEnableStation();
      }
    }
  } catch (error) {
    console.error("Ошибка при создании аккаунта:", error);
    if (error.response) {
      console.error("Ошибка сервера:", error.response.data);
    }
  }
};

const enablePhoneAuth = async () => {
  stationLoading.value = true;
  try {
    const response = await axios.post(
      `https://b2288.apitter.com/instances/enablePhoneAuth`,
      {
        source: source,
        login: login,
      },
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: `Bearer ${localStorage.getItem("accountToken")}`,
        },
      }
    );
    if (response.data.ok === true) {
      console.log(response.data);
    } else if (response.data === 401) {
      errorBlock.value = true;
      setTimeout(() => {
        localStorage.removeItem("accountToken");
        router.push("/login");
      }, 2000);
    } else {
      console.log(response.data.ok);
    }
  } catch (error) {
    console.error(`${request} - Ошибка`, error);
    if (error.response) {
      console.error("Ошибка сервера:", error.response.data);
    }
  }
};

const EnablebyQR = async () => {
  await getQr();

  let count = 0;
  intervalId = setInterval(async () => {
    await getQr();
    count++;
    if (count >= 6) {
      clearInterval(intervalId);
      changeEnableStation();
    }
  }, 20000); // 20 секунд
};

const closeModal = () => {
  qrCodeData.station = false;
};

const getCode = async () => {
  await offQrCodeStation();
  await enablePhoneAuth();
  await startFunc();
};

onMounted(() => {
  EnablebyQR();
});

onBeforeUnmount(() => {
  clearInterval(intervalId);
});
</script>

<style scoped>
.title {
  margin-top: 16px;
  font-weight: 500;
  font-size: 18px;
  text-align: center;
  padding: 4px;
  background-color: rgb(243, 243, 243);
  border-radius: 5px;
  cursor: pointer;
}
</style>
