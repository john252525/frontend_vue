<template>
  <div>
    <div @click="props.changeStationGetByCode" class="black-fon"></div>
    <section class="get-by-code-section">
      <section class="number-section" v-if="!codeStation">
        <input
          class="num-input"
          v-model="userNumber"
          type="number"
          placeholder="Введите номер"
        />
        <button class="next-button" @click="enableByCode">Далее</button>
      </section>
      <section v-else>
        <h2 class="code-text">{{ userCode }}</h2>
        <button class="close-button" @click="props.changeStationGetByCode">
          Закрыть
        </button>
      </section>
    </section>
  </div>
</template>

<script setup>
import { ref, toRefs } from "vue";
import axios from "axios";

const props = defineProps({
  selectedItems: {
    type: Object,
  },
  changeStationGetByCode: {
    type: Function,
  },
});

const { selectedItems } = toRefs(props);

const userNumber = ref(null);
const userCode = ref(null);

const codeStation = ref(false);

const createRequest = async (request) => {
  const { source, login } = selectedItems.value;
  try {
    const response = await axios.post(
      `https://b2288.apitter.com/instances/${request}`,
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
      console.log(`${request} - Успешно`);
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

const enablePhoneAuth = async () => {
  const { source, login } = selectedItems.value;
  try {
    const response = await axios.post(
      "https://b2288.apitter.com/instances/enablePhoneAuth",
      {
        source: "whatsapp",
        login: "helly",
        token: "342b63fd-6017-446f-adf8-d1b8e0b7bfc6",
        phone: userNumber.value,
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
  const { source, login } = selectedItems.value;
  try {
    const response = await axios.post(
      "https://b2288.apitter.com/instances/setState",
      {
        source: "whatsapp",
        login: "helly",
        token: "342b63fd-6017-446f-adf8-d1b8e0b7bfc6",
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
  const { source, login } = selectedItems.value;
  try {
    const response = await axios.post(
      "https://b2288.apitter.com/instances/getAuthCode",
      {
        source: "whatsapp",
        login: "helly",
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
      console.log("Состояние установлено");
      console.log(response.data);
      userCode.value = response.data.data.authCode;
      codeStation.value = true;
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
  await createRequest("forceStop");
  await enablePhoneAuth();
  await setState();
  await getAuthCode();
};
</script>

<style scoped>
.black-fon {
  position: fixed;
  z-index: 5;
  width: 100%;
  height: 100vh;
  background: rgba(117, 117, 117, 0.3);
  top: 0;
  left: 0;
}

.code-text {
  font-size: 25px;
  padding: 10px 50px;
  border: 0.5px solid #c1c1c1;
  border-radius: 5px;
}

.number-section {
  display: flex;
  /* align-items: center; */
  flex-direction: column;
}

.get-by-code-section {
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
</style>
