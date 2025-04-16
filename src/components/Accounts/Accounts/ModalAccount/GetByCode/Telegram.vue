<template>
  <LoadModal :stationLoading="stationLoading" />
  <section class="telegram-code-section">
    <section v-if="station.challengeRequired" class="auth-code">
      <input
        :class="styleInput ? 'num-input-error' : 'num-input'"
        :placeholder="t('getByCode.place')"
        type="text"
        v-model="formData.code"
        required
      />
      <button class="next-button">{{ t("getByCode.nextButton") }}</button>
    </section>
  </section>
</template>

<script setup>
import { useI18n } from "vue-i18n";
const { t } = useI18n();
import { inject, reactive } from "vue";
import axios from "axios";
import LoadModal from "../../LoadingMoadal/LoadModal.vue";
const { getByCodeStation, selectedItems } = inject("Items");

const stationLoading = reactive({
  loading: true,
});

const station = reactive({
  challengeRequired: false,
});

const formData = reactive({
  code: null,
});

const changeStationLoading = async () => {
  stationLoading.loading = !stationLoading.loading;
};
const forceStop = async () => {
  const { source, login } = selectedItems.value;
  await changeStationLoading();
  try {
    const response = await axios.post(
      `https://b2288.apitter.com/instances/forceStop`,
      {
        source: source,
        login: login,
        token: "342b63fd-6017-446f-adf8-d1b8e0b7bfc6",
      },
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: "Bearer 342b63fd-6017-446f-adf8-d1b8e0b7bfc6",
        },
      }
    );
    if (response.data.ok === true) {
      console.log("stop", source);
      console.log(response.data);
    } else if (response.data === 401) {
      localStorage.removeItem("accountToken");
      router.push("/login");
    } else {
      console.log(response.data.ok);
    }
  } catch (error) {
    console.error(`Ошибка`, error);

    if (error.response) {
      console.error("Ошибка сервера:", error.response.data);
    }
  }
};

const setStateTelegram = async () => {
  const { source, login } = selectedItems.value;
  try {
    const response = await axios.post(
      "https://b2288.apitter.com/instances/setState",
      {
        source: source,
        login: login,
        setState: true,
        qrLogin: false,
      },
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: "Bearer 342b63fd-6017-446f-adf8-d1b8e0b7bfc6",
        },
      }
    );

    if (!response.data.data.error) {
      console.log("Состояние установлено", source, login);
      console.log(response.data);
    }
    if (response.data.data.error.message === "Challenge required") {
      await changeStationLoading();
      station.challengeRequired = true;
      console.log("Challenge required");
    } else {
      console.log(response.data);
      console.log(response.data.ok);
    }

    if (response.data === 401) {
      localStorage.removeItem("accountToken");
      router.push("/login");
    }
  } catch (error) {
    console.error("Ошибка при создании аккаунта:", error);
    if (error.response) {
      console.error("Ошибка сервера:", error.response.data);
    }
  }
};

const solveChallenge = async () => {
  const { source, login } = selectedItems.value;

  try {
    const response = await axios.post(
      `https://b2288.apitter.com/instances/solveChallenge`,
      {
        source: source,
        login: login,
        code: `{{ ${formData.code} }}`,
      },
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: "Bearer 342b63fd-6017-446f-adf8-d1b8e0b7bfc6",
        },
      }
    );
    if (response.data.ok === true) {
      console.log("stop", source);
      console.log(response.data);
    } else if (response.data === 401) {
      localStorage.removeItem("accountToken");
      router.push("/login");
    } else {
      console.log(response.data.ok);
    }
  } catch (error) {
    console.error(`Ошибка`, error);

    if (error.response) {
      console.error("Ошибка сервера:", error.response.data);
    }
  }
};

const sendCodeTelegram = async () => {
  await changeStationLoading();
  await forceStop();
  setStateTelegram();
};

if (getByCodeStation.value === true) {
  sendCodeTelegram();
  console.log("sds");
}
</script>

<style scoped>
.telegram-code-section {
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
</style>
