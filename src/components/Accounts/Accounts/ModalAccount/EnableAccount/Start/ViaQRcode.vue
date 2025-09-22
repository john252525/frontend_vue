<template>
  <div class="qr-container">
    <div v-if="qrCodeData.link" class="qr-content">
      <qrcode-vue :value="qrCodeData.link" :size="260" class="qr-code" />
      <p class="instruction">Отсканируйте QR-код</p>
    </div>

    <div v-else class="loading">
      <p>Генерируем QR-код...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, toRefs, computed } from "vue";
import QrcodeVue from "qrcode.vue";
import axios from "axios";

const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL;

// Props
const props = defineProps({
  selectedItem: {
    type: Object,
    required: true,
  },
  startFunction: {
    type: Function,
    required: true,
  },
});

const { selectedItem } = toRefs(props);
const { source, login, storage } = selectedItem.value;

import { useAccountStore } from "@/stores/accountStore";
const accountStore = useAccountStore();
const token = computed(() => accountStore.getAccountToken);

const qrCodeData = reactive({
  link: "",
  station: false,
});

const intervalId = ref(null);
const isRunning = ref(false);
let previousLink = "";

// Функции для управления аккаунтом
const disablePhoneAuth = async () => {
  try {
    const params = {
      source: source,
      login: login,
      ...(storage && { storage: storage }),
    };

    const response = await axios.post(
      `${FRONTEND_URL}disablePhoneAuth`,
      params,
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: `Bearer ${token.value}`,
        },
      }
    );

    if (response.data.ok === true) {
      console.log("Phone auth disabled successfully");
    }
  } catch (error) {
    console.error("Error disabling phone auth:", error);
    if (error.response) {
      console.error("Error response:", error.response.data);
    }
  }
};

const forceStop = async () => {
  try {
    const params = {
      source: source,
      login: login,
      ...(storage && { storage: storage }),
    };

    const response = await axios.post(`${FRONTEND_URL}forceStop`, params, {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Authorization: `Bearer ${token.value}`,
      },
    });

    if (response.data.ok === true) {
      console.log("Force stop executed successfully");
    }
  } catch (error) {
    console.error("Error in force stop:", error);
    if (error.response) {
      console.error("Error response:", error.response.data);
    }
  }
};

// Запрос для получения QR-кода
const getQr = async () => {
  try {
    const params = {
      source: source,
      login: login,
      ...(storage && { storage: storage }),
    };

    const response = await axios.post(`${FRONTEND_URL}getQr`, params, {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Authorization: `Bearer ${token.value}`,
      },
    });

    if (response.data.status === "ok") {
      previousLink = qrCodeData.link;
      qrCodeData.link = response.data.value;
      qrCodeData.station = true;
    } else if (
      response.data.error?.message === "False step" ||
      response.data.error?.message === "QR is undefined"
    ) {
      stopEnableByQR();
    }
  } catch (error) {
    console.error("Ошибка при получении QR-кода:", error);
    stopEnableByQR();
  }
};

// Запрос для получения информации (параллельный)
const getInfo = async () => {
  try {
    const params = {
      source: source,
      login: login,
      ...(storage && { storage: storage }),
    };

    const response = await axios.post(`${FRONTEND_URL}getInfo`, params, {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Authorization: `Bearer ${token.value}`,
      },
    });

    // Обработка ответа getInfo
    if (response.data.status === "ok") {
      console.log("Info received:", response.data);
    }
  } catch (error) {
    console.error("Ошибка при получении информации:", error);
  }
};

// Запуск процесса получения QR-кода
const startEnableByQR = async () => {
  if (isRunning.value) return;

  await getQr(); // Первый запрос

  let count = 0;
  isRunning.value = true;

  // Интервал для getQr каждые 20 секунд
  intervalId.value = setInterval(async () => {
    if (!isRunning.value) {
      clearInterval(intervalId.value);
      return;
    }

    await getQr();
    count++;

    // Останавливаем через минуту (3 запроса)
    if (count >= 3) {
      stopEnableByQR();
    }
  }, 20000);

  // Параллельный интервал для getInfo
  const infoIntervalId = setInterval(async () => {
    if (!isRunning.value) {
      clearInterval(infoIntervalId);
      return;
    }
    await getInfo();
  }, 15000);

  // Сохраняем ID для очистки
  intervalId.value.infoInterval = infoIntervalId;
};

// Остановка процесса
const stopEnableByQR = () => {
  if (intervalId.value) {
    clearInterval(intervalId.value);
    if (intervalId.value.infoInterval) {
      clearInterval(intervalId.value.infoInterval);
    }
  }
  isRunning.value = false;
};

// Основная функция инициализации
const init = async () => {
  try {
    // Сначала отключаем phone auth
    await disablePhoneAuth();

    // Затем запускаем процесс получения QR
    await startEnableByQR();

    // Вызываем стартовую функцию из props
    await props.startFunction();
  } catch (error) {
    console.error("Error in initialization:", error);
  }
};

// Запуск при монтировании
onMounted(() => {
  init();
});

// Очистка при размонтировании
onUnmounted(() => {
  stopEnableByQR();
});

// Экспортируем функции для управления из родительского компонента
defineExpose({
  stopEnableByQR,
  forceStop,
  disablePhoneAuth,
});
</script>

<style scoped>
.qr-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 20px;
}

.qr-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.qr-code {
  border-radius: 8px;
  background: white;
  padding: 12px;
}

.instruction {
  font-size: 14px;
  color: #666;
  text-align: center;
  margin: 0;
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

.loading p {
  color: #666;
  font-size: 16px;
}
</style>
