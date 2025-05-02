<template>
  <ErrorBlock v-if="errorBlock" :changeIncorrectPassword="chaneErrorBlock" />
  <section v-if="!station.phone" class="qr-whatsapp-section">
    <LoadingModal
      :textLoadin="station.text"
      :stationLoading="station.loading"
    />
    <ResultModal v-if="station.error" />
    <article v-if="qrCodeData.station">
      <qrcode-vue :value="qrCodeData.link" :size="256" />
      <h2 @click="stopEnableByQR" class="title">{{ t("enable.codeTitle") }}</h2>
    </article>
  </section>
  <section v-if="station.phone" class="number-section">
    <input
      :class="station.errorPhone ? 'num-input-error' : 'num-input'"
      placeholder="7 (900) 000-000"
      @input="formatPhone"
      class="num-input"
      type="text"
      id="phone"
      v-model="phone"
      required
    />
    <button @click="getCode" class="next-button">{{ t("enable.next") }}</button>
  </section>
</template>

<script setup>
import { useI18n } from "vue-i18n";
const { t } = useI18n();
import { inject, ref, reactive, onMounted, onBeforeUnmount } from "vue";
import axios from "axios";
import QrcodeVue from "qrcode.vue";
import LoadingModal from "../LoadingModal.vue";
import ResultModal from "../ResultModal.vue";
import ErrorBlock from "@/components/ErrorBlock/ErrorBlock.vue";
import { useRouter } from "vue-router";
const router = useRouter();
const { changeEnableStation } = inject("changeEnableStation");
const { selectedItem, startFunc, offQrCodeStation } = inject("accountItems");
const { source, login, storage } = selectedItem.value;
import { useDomain } from "@/composables/getDomen";
const { stationDomen } = useDomain();
const station = reactive({
  phone: false,
  error: false,
  errorPhone: false,
  qrSend: false,
  text: "",
  loading: false,
});

const qrCodeData = reactive({
  link: "",
  station: false,
});

const errorBlock = ref(false);
const chaneErrorBlock = () => {
  errorBlock.value = errorBlock.value;
};

const stationLoading = ref(true);
const intervalId = ref(null);
const isRunning = ref(false);
let previousLink = "";

const phone = ref("7 ");

const formatPhone = () => {
  const cleaned = phone.value.replace(/\D/g, "");

  if (cleaned.length === 0) {
    phone.value = "7 ";
    return;
  }

  const match = cleaned.match(/^(7)?(\d{0,3})(\d{0,3})(\d{0,4})$/);

  if (match) {
    phone.value = `7 (${match[2]}) ${match[3]}${
      match[4] ? "-" + match[4] : ""
    }`;
  }
};

const getInternationalFormat = () => {
  return phone.value.replace(/\D/g, "");
};

const enablePhoneAuth = async () => {
  const internationalPhone = getInternationalFormat();
  station.loading = true;
  let params = {
    source: source,
    login: login,
  };
  if (stationDomen.navigate.value != "whatsapi") {
    params = {
      source: source,
      login: login,
      phone: internationalPhone,
    };
  } else {
    params = {
      source: source,
      login: login,
      storage: storage,
      phone: internationalPhone,
    };
  }
  try {
    const response = await axios.post(
      `https://b2288.apitter.com/instances/enablePhoneAuth`,
      params,
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

const getQr = async () => {
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
  try {
    const response = await axios.post(
      "https://b2288.apitter.com/instances/getQr",
      params,
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
      station.loading = false;
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
    station.error = true;
    return;
  }
};

// const EnablebyQR = async () => {
//   station.loading = true;
//   station.text = "Генерируем QR-код...";
//   await getQr();

//   let count = 0;
//   intervalId = setInterval(async () => {
//     await getQr();
//     count++;
//     if (count >= 6) {
//       clearInterval(intervalId);
//       changeEnableStation();
//     }
//   }, 20000); // 20 секунд
// };

const startEnableByQR = async () => {
  stationLoading.value = true;
  station.loading = true;
  station.text = "Генерируем QR-код...";
  await getQr();

  let count = 0;
  isRunning.value = true; // Устанавливаем состояние в "работает"

  intervalId.value = setInterval(async () => {
    await getQr();
    count++;
    if (count >= 6) {
      clearInterval(intervalId.value);
      isRunning.value = false; // Устанавливаем состояние в "не работает"
      changeEnableStation();
    }
  }, 20000); // 20 секунд
};

const stopEnableByQR = () => {
  clearInterval(intervalId.value); // Останавливаем интервал
  isRunning.value = false; // Устанавливаем состояние в "не работает"
  station.phone = true;
};

const closeModal = () => {
  qrCodeData.station = false;
};

const getPhone = async () => {
  station.phone = true;
  clearInterval(intervalId);
};

const getCode = async () => {
  const phone = getInternationalFormat();
  if (phone.length != 11) {
    console.log("error");
    station.errorPhone = true;
    return;
  }
  await enablePhoneAuth();
  await offQrCodeStation();
  await startFunc();
};

onMounted(() => {
  startEnableByQR();
});

// onBeforeUnmount(() => {
//   clearInterval(intervalId);
// });
defineExpose({ stopEnableByQR });
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

.blak-fon {
  position: fixed;
  z-index: 10;
  width: 100%;
  height: 100vh;
  background: rgba(117, 117, 117, 0.3);
  top: 0;
  left: 0;
}

.number-section {
  display: flex;
  flex-direction: column;
}

.num-input {
  border-radius: 5px;
  padding-left: 10px;
  width: 350px;
  height: 45px;
  font-weight: 400;
  font-size: 14px;
  color: #000;
  border: 0.5px solid #c1c1c1;
  background: #fcfcfc;
}

.num-input-error {
  border-radius: 5px;
  padding-left: 10px;
  width: 350px;
  height: 45px;
  font-weight: 400;
  font-size: 14px;
  color: #000;
  border: 0.5px solid #be2424;
  background: #ffeaea;
}

.next-button {
  width: 365px;
  height: 35px;
  border-radius: 5px;
  background-color: #4950ca;
  font-size: 14px;
  color: rgb(255, 255, 255);
  font-weight: 600;
  margin-top: 20px;
}

@media (max-width: 500px) {
  .number-section {
    width: 300px;
  }

  .num-input {
    width: 285px;
    height: 45px;
  }

  .next-button {
    width: 300px;
    height: 35px;
  }
}

@media (max-width: 400px) {
  .number-section {
    width: 250px;
  }

  .num-input {
    width: 235px;
    height: 45px;
  }

  .next-button {
    width: 250px;
    height: 35px;
  }
}
</style>
