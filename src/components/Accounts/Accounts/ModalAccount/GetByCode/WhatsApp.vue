<template>
  <section class="whatsapp-code-section">
    <section class="get-by-code-section">
      <section class="number-section" v-if="!codeStation">
        <input
          :class="styleInput ? 'num-input-error' : 'num-input'"
          :placeholder="t('getByCode.login')"
          @input="formatPhone"
          type="text"
          id="phone"
          v-model="phone"
          required
        />
        <button
          v-if="stationLoading.stationLoading === true"
          class="next-button"
          @click="enableByCode"
        >
          {{ t("getByCode.loading") }}
        </button>
        <button v-else class="next-button" @click="enableByCode">
          {{ t("getByCode.nextButton") }}
        </button>
      </section>
      <section v-else>
        <h2 class="code-text">{{ userCode }}</h2>
        <button class="close-button" @click="props.changeStationGetByCode">
          {{ t("getByCode.close") }}
        </button>
      </section>
    </section>
  </section>
</template>

<script setup>
import { ref, toRefs, reactive, inject } from "vue";
import axios from "axios";
import { useI18n } from "vue-i18n";
const { t } = useI18n();
import LoadingMoadal from "../../LoadingMoadal/LoadingMoadal.vue";
const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL;
const props = defineProps({
  changeStationGetByCode: {
    type: Function,
  },
});

const stationLoading = reactive({
  modalStation: false,
  account: {
    error: false,
  },
  stationLoading: false,
});

const styleInput = ref(false);

const { getByCodeStation, selectedItems } = inject("Items");

const userCode = ref(null);

const codeStation = ref(false);

const phone = ref("+7 ");

const formatPhone = () => {
  const cleaned = phone.value.replace(/\D/g, "");

  if (cleaned.length === 0) {
    phone.value = "+7 ";
    return;
  }

  const match = cleaned.match(/^(7)?(\d{0,3})(\d{0,3})(\d{0,4})$/);

  if (match) {
    phone.value = `+7 (${match[2]}) ${match[3]}${
      match[4] ? "-" + match[4] : ""
    }`;
  }
};

const getInternationalFormat = () => {
  return phone.value.replace(/\D/g, "");
};

const changeStationLoadingModal = () => {
  stationLoading.modalStation = !stationLoading.modalStation;
};

const createRequest = async (request) => {
  const { source, login } = selectedItems.value;

  try {
    const response = await axios.post(
      `${FRONTEND_URL}${request}`,
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
    } else if (response.data === 401) {
      localStorage.removeItem("accountToken");
      router.push("/login");
    } else {
      console.log(response.data.ok);
    }
  } catch (error) {
    console.error(`${request} - Ошибка`, error);
    stationLoading.account.error = true;
    changeStationLoadingModal();
    setTimeout(() => {
      changeStationLoadingModal();
    }, 5000);
    if (error.response) {
      console.error("Ошибка сервера:", error.response.data);
    }
  }
};

const enablePhoneAuth = async () => {
  const { source, login } = selectedItems.value;
  const internationalPhone = getInternationalFormat();
  try {
    const response = await axios.post(
      `${FRONTEND_URL}enablePhoneAuth`,
      {
        source: source,
        login: login,
        phone: internationalPhone,
      },
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: "Bearer 342b63fd-6017-446f-adf8-d1b8e0b7bfc6",
        },
      }
    );

    if (response.data.ok === true) {
      console.log("Аунтефикация 0ff");
    } else if (response.data === 401) {
      localStorage.removeItem("accountToken");
      router.push("/login");
    } else {
      console.log(response.data.ok);
    }
  } catch (error) {
    console.error("Ошибка при создании аккаунта:", error);
    stationLoading.account.error = true;
    changeStationLoadingModal();
    setTimeout(() => {
      changeStationLoadingModal();
    }, 5000);
    if (error.response) {
      console.error("Ошибка сервера:", error.response.data);
    }
  }
};

const setState = async () => {
  const { source, login } = selectedItems.value;
  try {
    const response = await axios.post(
      `${FRONTEND_URL}setState`,
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
    } else if (response.data === 401) {
      localStorage.removeItem("accountToken");
      router.push("/login");
    } else {
      console.log(response.data.ok);
    }
  } catch (error) {
    console.error("Ошибка при создании аккаунта:", error);
    stationLoading.account.error = true;
    changeStationLoadingModal();
    setTimeout(() => {
      changeStationLoadingModal();
    }, 5000);
    if (error.response) {
      console.error("Ошибка сервера:", error.response.data);
    }
  }
};

const getAuthCode = async () => {
  const { source, login } = selectedItems.value;
  try {
    const response = await axios.post(
      `${FRONTEND_URL}getAuthCode`,
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
      if (response.data.data.status === "error") {
        console.log("sds");
        stationLoading.account.error = true;
        stationLoading.stationLoading = false;
        changeStationLoadingModal();
        setTimeout(() => {
          changeStationLoadingModal();
        }, 5000);
      } else {
        console.log("Состояние установлено");
        console.log(response.data);
        userCode.value = response.data.data.authCode;
        codeStation.value = true;
        stationLoading.stationLoading = false;
        stationLoading.account.error = false;
        changeStationLoadingModal();
        setTimeout(() => {
          changeStationLoadingModal();
        }, 5000);
      }
    } else if (response.data === 401) {
      localStorage.removeItem("accountToken");
      router.push("/login");
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

const enableByCode = async () => {
  if (phone.value.length != 17) {
    styleInput.value = true;
    return;
  } else {
    styleInput.value = false;
    stationLoading.stationLoading = true;
    await createRequest("forceStop");
    await enablePhoneAuth();
    await setState();
    await getAuthCode();
  }
};
</script>

<style scoped>
.whatsapp-code-section {
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

.code-text {
  font-size: 25px;
  padding: 10px 50px;
  border: 0.5px solid #c1c1c1;
  border-radius: 5px;
}

.number-section {
  display: flex;
  flex-direction: column;
}

.whatsapp-code-section .fade-enter-active,
.whatsapp-code-section .fade-leave-active {
  transition: opacity 0.5s ease;
}
.whatsapp-code-section .fade-enter,
.whatsapp-code-section .fade-leave-to {
  opacity: 0;
}

.whatsapp-code-section {
  animation: fadeIn 0.5s forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translate(-50%, -48%);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%);
  }
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

@media (max-width: 450px) {
  .num-input {
    padding-left: 10px;
    width: 300px;
    height: 45px;
    font-size: 14px;
  }

  .num-input-error {
    padding-left: 10px;
    width: 300px;
    height: 45px;
    font-size: 14px;
  }

  .next-button {
    width: 315px;
    height: 35px;
  }
}

@media (max-width: 400px) {
  .num-input {
    padding-left: 10px;
    width: 250px;
    height: 45px;
    font-size: 14px;
  }

  .num-input-error {
    padding-left: 10px;
    width: 250px;
    height: 45px;
    font-size: 14px;
  }

  .next-button {
    width: 265px;
    height: 35px;
  }
}
</style>
