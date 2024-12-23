<template>
  <LoadingModal
    :textLoadin="station.text"
    :stationLoading="station.stationLoading"
  />
  <section v-if="userCode != null">
    <h2 class="code-text">{{ userCode }}</h2>
  </section>
  <h2 @click="getQr" class="title">Связать через сканирование QR</h2>
  <ResultModal v-if="station.error" />
</template>
<script setup>
import { ref, toRefs, reactive, onMounted, inject } from "vue";
import axios from "axios";
import ResultModal from "../ResultModal.vue";
import LoadingModal from "../LoadingModal.vue";
const { changeEnableStation } = inject("changeEnableStation");
const phone = ref("7 ");
const station = reactive({
  stationLoading: false,
  phone: true,
  code: false,
  inpPhone: false,
  error: false,
  text: "",
});
let authCodeInterval = null;
const isRunning = ref(false);
const { selectedItem, startFunc, offQrQrStation } = inject("accountItems");
const { source, login } = selectedItem.value;
const userCode = ref(null);
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

const forceStop = async () => {
  try {
    const response = await axios.post(
      `https://b2288.apitter.com/instances/forceStop`,
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
    } else {
      console.log(response.data.ok);
    }
  } catch (error) {
    console.error(` - Ошибка`, error);
    if (error.response) {
      console.error("Ошибка сервера:", error.response.data);
    }
  }
};

const enablePhoneAuth = async () => {
  const phone = getInternationalFormat();
  try {
    const response = await axios.post(
      "https://b2288.apitter.com/instances/enablePhoneAuth",
      {
        source: source,
        login: login,
        phone: phone,
      },
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: `Bearer ${localStorage.getItem("accountToken")}`,
        },
      }
    );
    if (response.data.ok === true) {
      console.log("Состояние установлено");
    } else {
      console.log(response.data.ok);
    }
  } catch (error) {
    console.error("Ошибка при создании аккаунта:", error);
    if (error.response) {
      console.error("Ошибка сервера:", error.response.data);
    }
  }
};

const disablePhoneAuth = async () => {
  try {
    const response = await axios.post(
      "https://b2288.apitter.com/instances/disablePhoneAuth",
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
      console.log("Состояние установлено");
    } else {
      console.log(response.data.ok);
    }
  } catch (error) {
    console.error("Ошибка при создании аккаунта:", error);
    if (error.response) {
      console.error("Ошибка сервера:", error.response.data);
    }
  }
};

const setState = async () => {
  try {
    const response = await axios.post(
      "https://b2288.apitter.com/instances/setState",
      {
        source: source,
        login: login,
        setState: true,
      },
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: `Bearer ${localStorage.getItem("accountToken")}`,
        },
      }
    );
    if (response.data.ok === true) {
      console.log("Состояние установлено");
    } else {
      console.log(response.data.ok);
    }
  } catch (error) {
    console.error("Ошибка при создании аккаунта:", error);
    if (error.response) {
      console.error("Ошибка сервера:", error.response.data);
    }
  }
};

const getAuthCode = async () => {
  try {
    const response = await axios.post(
      "https://b2288.apitter.com/instances/getAuthCode",
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
      console.log("Состояние установлено");
      console.log(response.data);

      // Проверяем, пустое ли значение authCode
      if (!response.data.data.authCode) {
        station.error = true;
        clearInterval(authCodeInterval);
        station.stationLoading = false;

        return;
      }

      station.stationLoading = false;
      station.code = true;
      userCode.value = response.data.data.authCode;
    } else {
      console.log(response.data.ok);
    }
  } catch (error) {
    console.error("Ошибка при создании аккаунта:", error);
    return;
  }
};

const nextButton = () => {
  station.phone = false;
  station.stationLoading = true;

  isRunning.value = true; // Устанавливаем состояние в "работает"

  authCodeInterval = setInterval(() => {
    getAuthCode();
  }, 20000);

  setTimeout(() => {
    clearInterval(authCodeInterval);
    authCodeInterval = null; // Сбрасываем переменную интервала
    isRunning.value = false; // Устанавливаем состояние в "не работает"
    changeEnableStation();
  }, 60000); // 60000 мс = 1 минута

  sendCode();
};

const sendCode = async () => {
  station.text = "Генерируем код...";
  await getAuthCode();
};

const getQr = async () => {
  clearInterval(authCodeInterval); // Останавливаем интервал
  authCodeInterval = null; // Сбрасываем переменную интервала
  isRunning.value = false; // Устанавливаем состояние в "не работает"
  await disablePhoneAuth();
  await offQrQrStation();
  await startFunc();
};

const stopAuthCode = () => {
  clearInterval(authCodeInterval); // Останавливаем интервал
  authCodeInterval = null; // Сбрасываем переменную интервала
  isRunning.value = false; // Устанавливаем состояние в "не работает"
};

onMounted(() => {
  nextButton();
});

defineExpose({ stopAuthCode });
</script>

<style scoped>
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

.code-text {
  font-size: 25px;
  padding: 10px 50px;
  border: 0.5px solid #c1c1c1;
  border-radius: 5px;
}

.close-button {
  width: 100%;
  height: 35px;
  border-radius: 5px;
  background-color: #4950ca;
  font-size: 14px;
  color: rgb(255, 255, 255);
  font-weight: 600;
  margin-top: 20px;
}

.title {
  margin-top: 16px;
  font-weight: 500;
  font-size: 14px;
  width: 95%;
  text-align: center;
  padding: 4px;
  background-color: rgb(243, 243, 243);
  border-radius: 5px;
  cursor: pointer;
}
</style>
