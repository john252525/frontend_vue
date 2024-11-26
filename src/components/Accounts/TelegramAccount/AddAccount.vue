<template>
  <div @click="openAddAccountStation" class="black-fon"></div>
  <section class="add-account">
    <header>
      <h2 class="title">Добавление аккаунта</h2>
      <img
        @click="openAddAccountStation"
        src="/telegramAccount/close.svg"
        alt=""
      />
    </header>
    <form>
      <div class="input-cont">
        <label for="name">Платформа</label>
        <button
          :style="inputStyle.list"
          @click="openList"
          class="open-list-platform-button"
        >
          {{ formData.sourceList }}
          <img class="img-input" src="/telegramAccount/arrow-down.svg" alt="" />
        </button>
        <ul v-if="listStation" class="list-platform">
          <li @click="addSource('Выберите платформу')" class="platform">
            Выберите платформу
          </li>
          <li @click="addSource('telegram')" class="platform">Telegram</li>
          <li @click="addSource('whatsapp')" class="platform">WhatsApp</li>
        </ul>
      </div>
      <div class="input-cont">
        <label for="login">Логин</label>
        <input
          :style="inputStyle.login"
          placeholder="Ваш логин или номер телефона"
          class="login-input"
          type="email"
          id="login"
          v-model="formData.login"
          required
        />
      </div>
    </form>
    <button @click="addAccount" class="add-account-button">Добавить</button>
  </section>
</template>

<script setup>
import { ref, reactive } from "vue";
import axios from "axios";
const props = defineProps({
  openAddAccountStation: {
    type: Function,
  },
});

const listStation = ref(false);

const inputStyle = reactive({
  list: {
    border: "0.5px solid #c1c1c1",
    background: "fcfcfc",
  },
  login: {
    border: "0.5px solid #c1c1c1",
    background: "fcfcfc",
  },
});

const formData = reactive({
  token: "342b63fd-6017-446f-adf8-d1b8e0b7bfc6",
  login: "",
  proxyString: "",
  webhookUrls: [],
  source: "",
  sourceList: "Выберите платформу",
  success: null,
  error: null,
});

function errorStyleStation(input, station) {
  if (input === "list") {
    if (station === "on") {
      inputStyle.list.border = "0.5px solid #be2424";
      inputStyle.list.background = "#ffeaea";
    } else if (station === "off") {
      inputStyle.list.border = "0.5px solid #c1c1c1";
      inputStyle.list.background = "#fcfcfc";
    }
  } else if (input === "login") {
    if (station === "on") {
      inputStyle.login.border = "0.5px solid #be2424";
      inputStyle.login.background = "#ffeaea";
    } else if (station === "off") {
      inputStyle.login.border = "0.5px solid #c1c1c1";
      inputStyle.login.background = "#fcfcfc";
    }
  }
}

function addSource(source) {
  formData.source = source;
  listStation.value = false;
  if (source === "telegram") {
    formData.sourceList = "Telegram";
  } else if (source === "whatsapp") {
    formData.sourceList = "WhatsApp";
  } else {
    formData.sourceList = "Выберите платформу";
  }
}

function openList() {
  listStation.value = !listStation.value;
}

const addAccount = async () => {
  formData.error = null;
  if (formData.sourceList === "Выберите платформу") {
    errorStyleStation("list", "on");
  } else {
    errorStyleStation("list", "off");
  }

  if (formData.login.length === 0) {
    errorStyleStation("login", "on");
  } else {
    errorStyleStation("login", "off");
  }

  if (
    formData.sourceList != "Выберите платформу" &&
    formData.login.length > 0
  ) {
    try {
      const response = await axios.post(
        "https://b2288.apitter.com/instances/addAccount",
        {
          token: formData.token,
          login: formData.login,
          proxyString: formData.proxyString,
          webhookUrls: formData.proxyString,
          source: formData.source,
        },
        {
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            Authorization: "Bearer 342b63fd-6017-446f-adf8-d1b8e0b7bfc6",
          },
        }
      );

      console.log("Аккаунт успешно создан:", response.data);
      location.reload();
    } catch (error) {
      error.value = error.message || "Произошла ошибка.";
      console.error("Ошибка при создании аккаунта:", error);
      if (error.response) {
        console.error("Ошибка сервера:", error.response.data);
      }
    }
  }
};
</script>

<style scoped>
.black-fon {
  position: absolute;
  z-index: 5;
  width: 100%;
  height: 100vh;
  background: rgba(117, 117, 117, 0.3);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.add-account {
  position: fixed;
  z-index: 10;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 15px;
  width: 604px;
  height: 290px;
  background: #ffffff;
}

header {
  display: flex;
  align-items: center;
  margin-top: 34px;
  margin-left: 54px;
  gap: 225px;
}

.title {
  font-weight: 600;
  font-size: 22px;
  color: #000;
}

form {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 70px;
  margin-top: 44px;
}

.input-cont {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

label {
  font-weight: 500;
  font-size: 18px;
  color: #000;
}

.login-input {
  border-radius: 5px;
  width: 200px;
  height: 36px;
  font-weight: 400;
  font-size: 13px;
  color: #000;
  padding-left: 10px;
}

.open-list-platform-button {
  border-radius: 5px;
  width: 213px;
  height: 40px;
  text-align: left;
  position: relative;
}

.img-input {
  position: absolute;
  right: 6px;
  top: 16px;
}

.list-platform {
  border: 0.5px solid #c1c1c1;
  border-radius: 5px;
  width: 170px;
  height: 80px;
  background: #fcfcfc;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  flex-direction: column;
  margin-top: -5px;
  margin-left: 1px;
  gap: 6px;
  padding-left: 10px;
}

.platform {
  font-weight: 400;
  font-size: 14px;
  color: #000;
  cursor: pointer;
}

.add-account-button {
  border-radius: 5px;
  position: absolute;
  right: 54px;
  bottom: 25px;
  width: 130px;
  height: 40px;
  background: #4950ca;
  font-weight: 600;
  font-size: 14px;
  color: #fff;
}

@media (max-width: 650px) {
  .add-account {
    width: 470px;
    height: 360px;
  }

  .add-account-button {
    right: 29px;
    bottom: 18px;
    width: 130px;
    height: 40px;
  }

  header {
    display: flex;
    align-items: center;
    margin-top: 34px;
    gap: 140px;
    margin-left: 30px;
  }

  form {
    align-items: center;
    flex-direction: column;
    gap: 10px;
    margin-top: 40px;
  }

  .login-input {
    width: 400px;
    height: 36px;
  }

  .open-list-platform-button {
    width: 415px;
    height: 40px;
    gap: 320px;
  }
}

@media (max-width: 470px) {
  .add-account {
    width: 350px;
    height: 380px;
  }

  .add-account-button {
    right: 29px;
    bottom: 18px;
    width: 130px;
    height: 40px;
  }

  header {
    display: flex;
    align-items: center;
    margin-top: 34px;
    gap: 45px;
    margin-left: 40px;
  }

  .title {
    font-size: 18px;
  }

  form {
    align-items: center;
    flex-direction: column;
    gap: 20px;
    margin-top: 40px;
  }

  .login-input {
    width: 250px;
    height: 36px;
  }

  .open-list-platform-button {
    width: 268px;
    height: 40px;
    gap: 175px;
  }
}
</style>
