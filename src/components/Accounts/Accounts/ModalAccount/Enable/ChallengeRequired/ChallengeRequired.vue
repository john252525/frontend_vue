<template>
  <ErrorBlock v-if="errorBlock" :changeIncorrectPassword="chaneErrorBlock" />
  <section v-if="station.code" class="auth-code">
    <div class="input-cont">
      <label for="code">{{ t("enable.code") }}</label>
      <input class="num-input" type="number" v-model="code" required />
    </div>

    <button @click="solveChallenge" class="next-button">Далее</button>
    <h2 @click="getQr" class="title">
      {{ t("enable.ChallengeRequired.title") }}
    </h2>
  </section>
  <ResultModal v-if="station.station === false" />
  <LoadingModal :station-loading="station.loading" />
  <ResultModalTrue v-if="station.resultTrue" />
</template>

<script setup>
import { useI18n } from "vue-i18n";
const { t } = useI18n();
import axios from "axios";
import ErrorBlock from "@/components/ErrorBlock/ErrorBlock.vue";
import ResultModal from "../ResultModal.vue";
import ResultModalTrue from "../ResultModalTrue.vue";
import LoadingModal from "../LoadingModal.vue";
import { ref, inject, reactive } from "vue";
import { useRouter } from "vue-router";
const router = useRouter();
const code = ref("");
const { selectedItem, offQrQrStation, startFunc } = inject("accountItems");
const { source, login, storage } = selectedItem.value;
const { changeEnableStation } = inject("changeEnableStation");
const station = reactive({
  station: undefined,
  loading: false,
  code: true,
  resultTrue: false,
});
import { useDomain } from "@/composables/getDomen";
const { stationDomen } = useDomain();
const errorBlock = ref(false);
const chaneErrorBlock = () => {
  errorBlock.value = errorBlock.value;
};

const solveChallenge = async () => {
  console.log(code.value);
  station.loading = true;
  station.code = false;
  let params = {
    source: source,
    login: login,
  };
  if (stationDomen.navigate.value != "whatsapi") {
    params = {
      source: source,
      login: login,
      code: `{{ ${code.value} }}`,
    };
  } else {
    params = {
      source: source,
      login: login,
      storage: storage,
      code: `{{ ${code.value} }}`,
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
    if (response.data.data.status === "ok") {
      station.resultTrue = true;
      station.loading = false;
    } else if (response.data === 401) {
      errorBlock.value = true;
      setTimeout(() => {
        localStorage.removeItem("accountToken");
        router.push("/login");
      }, 2000);
    } else {
      console.log(response.data);
      station.station = false;
      station.loading = false;
    }
  } catch (error) {
    console.error(`Ошибка`, error);

    if (error.response) {
      console.error("Ошибка сервера:", error.response.data);
    }
  }
};

const disablePhoneAuth = async () => {
  try {
    const response = await axios.post(
      `https://b2288.apitter.com/instances/disablePhoneAuth`,
      {
        source: source,
        login: login,
        phone: "89228556998",
      },
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: `Bearer ${localStorage.getItem("accountToken")}`,
        },
      }
    );
    if (response.data.data.status === "ok") {
      console.log("Ok", source);
      console.log(response.data);
      station.loading = false;
    } else {
      console.log(response.data);
      station.station = false;
      station.loading = false;
    }
  } catch (error) {
    console.error(`Ошибка`, error);

    if (error.response) {
      console.error("Ошибка сервера:", error.response.data);
    }
  }
};

const getQr = async () => {
  station.loading = true;
  await disablePhoneAuth();
  await changeEnableStation();
  await startFunc();
};
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
  width: 100%;
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
  width: 100%;
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

.title {
  margin-top: 16px;
  font-weight: 500;
  font-size: 14px;
  width: 95%;
  text-align: center;
  padding: 4px;
  background-color: rgb(243, 243, 243);
  border-radius: 5px;
}

@media (max-width: 600px) {
  .auth-code {
    width: 300px;
  }
}

@media (max-width: 400px) {
  .auth-code {
    width: 250px;
  }
}
</style>
