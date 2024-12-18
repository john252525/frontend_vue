<template>
  <section class="telegram-code-section">
    <LoadingModal :stationLoading="station.loading" />
    <ResultModalTrue v-if="station.resultTrue" />
    <section v-if="station.code" class="auth-code">
      <div class="input-cont">
        <label for="code">Код Telegram</label>
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
        Далее
      </button>
      <button
        @click="twoFactorAuth"
        v-if="station.error.twoFactor"
        class="next-button"
      >
        Далее
      </button>
    </section>
  </section>
</template>
<!-- :class="styleInput ? 'num-input-error' : 'num-input'" -->
<script setup>
import { inject, reactive, ref, onMounted } from "vue";
import axios from "axios";
import ResultModalTrue from "../ResultModalTrue.vue";
import LoadingModal from "../LoadingModal.vue";
const { selectedItem } = inject("accountItems");
const { source, login } = selectedItem.value;
const stationLoading = ref(false);

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
      console.log("stop", source);
      console.log(response.data);
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
      station.resultTrue = true;
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
  try {
    const response = await axios.post(
      `https://b2288.apitter.com/instances/twoFactorAuth`,
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
      station.resultTrue = true;
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
