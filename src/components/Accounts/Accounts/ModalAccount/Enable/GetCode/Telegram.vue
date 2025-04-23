<template>
  <ErrorBlock v-if="errorBlock" :changeIncorrectPassword="chaneErrorBlock" />
  <section class="telegram-code-section">
    <LoadingModal :stationLoading="station.loading" />
    <ResultModalTrue v-if="station.resultTrue" />
    <section v-if="station.code" class="auth-code">
      <div class="input-cont">
        <label for="code"> {{ t("enable.ChallengeRequired.code") }}</label>
        <input
          class="num-input"
          type="number"
          v-model="formData.code"
          required
        />
      </div>
      <button
        @click="solveChallenge"
        v-if="station.error.challengeRequired"
        class="next-button"
      >
        {{ t("enable.ChallengeRequired.next") }}
      </button>
      <button
        @click="twoFactorAuth"
        v-if="station.error.twoFactor"
        class="next-button"
      >
        {{ t("enable.ChallengeRequired.next") }}
      </button>
    </section>
  </section>
</template>
<!--   {{ t("personalAccount.out") }} -->
<script setup>
import { inject, reactive, ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";
const { t } = useI18n();
import ErrorBlock from "@/components/ErrorBlock/ErrorBlock.vue";
import axios from "axios";
import ResultModalTrue from "../ResultModalTrue.vue";
import LoadingModal from "../LoadingModal.vue";
import { useRouter } from "vue-router";
const router = useRouter();
const { selectedItem } = inject("accountItems");
const { source, login, storage } = selectedItem.value;
const stationLoading = ref(false);
import { useDomain } from "@/composables/getDomen";
const { stationDomen } = useDomain();
const errorBlock = ref(false);
const chaneErrorBlock = () => {
  errorBlock.value = errorBlock.value;
};

const station = reactive({
  code: false,
  loading: false,
  error: {
    twoFactor: false,
    challengeRequired: false,
  },
  resultTrue: false,
});

const formData = reactive({
  code: null,
});

const forceStop = async () => {
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
      `https://b2288.apitter.com/instances/forceStop`,
      params,
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: `Bearer ${localStorage.getItem("accountToken")}`,
        },
      }
    );
    if (response.data.ok === true) {
      console.log("stop", source);
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
    console.error(`Ошибка`, error);

    if (error.response) {
      console.error("Ошибка сервера:", error.response.data);
    }
  }
};

const setStateTelegram = async () => {
  let params = {
    source: source,
    login: login,
  };
  if (stationDomen.navigate.value != "whatsapi") {
    params = {
      source: source,
      login: login,
      setState: true,
    };
  } else {
    params = {
      source: source,
      login: login,
      storage: storage,
      setState: true,
    };
  }
  try {
    const response = await axios.post(
      "https://b2288.apitter.com/instances/setState",
      params,
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: `Bearer ${localStorage.getItem("accountToken")}`,
        },
      }
    );

    if (!response.data.data.error) {
      console.log("Состояние установлено", source, login);
      console.log(response.data);
    }
    if (response.data.data.error.message === "Challenge required") {
      console.log("Challenge required");
      station.loading = false;
      station.code = true;
      station.error.challengeRequired = true;
    } else if (
      response.data.data.error.message === "Two factor auth required"
    ) {
      console.log("Two factor auth required");
      station.loading = false;
      station.code = true;
      console.log(response.data);
      station.error.twoFactor = true;
    } else if (response.data === 401) {
      errorBlock.value = true;
      setTimeout(() => {
        localStorage.removeItem("accountToken");
        router.push("/login");
      }, 2000);
    } else {
      console.log("другое");
    }
  } catch (error) {
    console.error("Ошибка при создании аккаунта:", error);
    if (error.response) {
      console.error("Ошибка сервера:", error.response.data);
    }
  }
};

const solveChallenge = async () => {
  let params = {
    source: source,
    login: login,
  };
  if (stationDomen.navigate.value != "whatsapi") {
    params = {
      source: source,
      login: login,
      code: `{{ ${formData.code} }}`,
    };
  } else {
    params = {
      source: source,
      login: login,
      storage: storage,
      code: `{{ ${formData.code} }}`,
    };
  }
  try {
    const response = await axios.post(
      `https://b2288.apitter.com/instances/solveChallenge`,
      params,
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: `Bearer ${localStorage.getItem("accountToken")}`,
        },
      }
    );
    if (response.data.ok === true) {
      station.resultTrue = true;
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
    console.error(`Ошибка`, error);

    if (error.response) {
      console.error("Ошибка сервера:", error.response.data);
    }
  }
};

const twoFactorAuth = async () => {
  let params = {
    source: source,
    login: login,
  };
  if (stationDomen.navigate.value != "whatsapi") {
    params = {
      source: source,
      login: login,
      code: `{{ ${formData.code} }}`,
    };
  } else {
    params = {
      source: source,
      login: login,
      storage: storage,
      code: `{{ ${formData.code} }}`,
    };
  }
  try {
    const response = await axios.post(
      `https://b2288.apitter.com/instances/twoFactorAuth`,
      params,
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: `Bearer ${localStorage.getItem("accountToken")}`,
        },
      }
    );
    if (response.data.ok === true) {
      station.resultTrue = true;
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
    console.error(`Ошибка`, error);

    if (error.response) {
      console.error("Ошибка сервера:", error.response.data);
    }
  }
};

const sendCodeTelegram = async () => {
  station.loading = true;
  await forceStop();
  setStateTelegram();
};

onMounted(() => {
  sendCodeTelegram();
});
</script>

<style scoped>
.auth-code {
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
}

.num-input {
  border-radius: 5px;
  width: 200px;
  height: 70px;
  font-weight: 400;
  font-size: 26px;
  color: #000;
  border: 0.5px solid #c1c1c1;
  background: #fcfcfc;
  text-align: center;
}

.num-input-error {
  border-radius: 5px;
  padding-left: 10px;
  width: 300px;
  height: 45px;
  font-weight: 400;
  font-size: 14px;
  color: #000;
  border: 0.5px solid #be2424;
  background: #ffeaea;
}

.input-cont {
  display: flex;
  align-self: flex-start;
  flex-direction: column;
}

label {
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 16px;
  color: rgb(78, 78, 78);
}

.next-button {
  width: 100%;
  height: 40px;
  border-radius: 5px;
  background-color: #4950ca;
  font-size: 14px;
  color: rgb(255, 255, 255);
  font-weight: 600;
  margin-top: 20px;
}
</style>
