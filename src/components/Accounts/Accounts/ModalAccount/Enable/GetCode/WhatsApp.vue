<template>
  <section v-if="station.phone" class="number-section">
    <input
      :class="station.inpPhone ? 'num-input-error' : 'num-input'"
      placeholder="Логин"
      @input="formatPhone"
      class="num-input"
      type="text"
      id="phone"
      v-model="phone"
      required
    />
    <button class="next-button" @click="nextButton">Далее</button>
    <h2 @click="getQr" class="title">Связать через сканирование QR</h2>
  </section>
  <LoadingModal :stationLoading="station.stationLoading" />
  <section v-if="station.code">
    <h2 class="code-text">{{ userCode }}</h2>
  </section>
  <ResultModal v-if="station.error" />
</template>
<script setup>
import { ref, toRefs, reactive, inject } from "vue";
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
});
let authCodeInterval = null; // Переменная для хранения интервала
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
          Authorization: "Bearer 342b63fd-6017-446f-adf8-d1b8e0b7bfc6",
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
  try {
    const response = await axios.post(
      "https://b2288.apitter.com/instances/enablePhoneAuth",
      {
        source: source,
        login: login,
        phone: "79228556998",
      },
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: "Bearer 342b63fd-6017-446f-adf8-d1b8e0b7bfc6",
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
        phone: "79228556998",
      },
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: "Bearer 342b63fd-6017-446f-adf8-d1b8e0b7bfc6",
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
          Authorization: "Bearer 342b63fd-6017-446f-adf8-d1b8e0b7bfc6",
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
          Authorization: "Bearer 342b63fd-6017-446f-adf8-d1b8e0b7bfc6",
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
    if (error.response) {
      console.error("Ошибка сервера:", error.response.data);
    }
  }
};

const nextButton = () => {
  if (phone.value.length != 16) {
    station.inpPhone = true;
    return;
  } else {
    station.phone = false;
    station.stationLoading = true;

    authCodeInterval = setInterval(() => {
      getAuthCode();
    }, 20000);

    setTimeout(() => {
      clearInterval(authCodeInterval);
      authCodeInterval = null; // Сбрасываем переменную интервала
    }, 60000); // 60000 мс = 1 минута

    sendCode();
  }
};

const sendCode = async () => {
  await forceStop();
  await enablePhoneAuth();
  await setState();
  await getAuthCode();
};

const getQr = async () => {
  await disablePhoneAuth();
  await offQrQrStation();
  await startFunc();
};
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
