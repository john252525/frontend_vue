<template>
  <div @click="openAddAccountStation" class="black-fon"></div>
  <section class="add-account">
    <form>
      <h2 class="title">Добавить аккаунты</h2>
      <div class="cont-input">
        <label for="category">Выберите категорию</label>
        <select class="select-style" v-model="selectCategry" id="itemSelect">
          <option value="messenger">
            {{ values[1] }}
          </option>
          <option value="">
            {{ values[2] }}
          </option>
        </select>
      </div>
      <section v-if="selectCategry === 'messenger'">
        <article class="cont-input">
          <label for="category">Выберите мессенджер</label>
          <select
            class="select-style"
            v-model="selectMessenger"
            id="itemSelect"
          >
            <option value="whatsapp">
              {{ values[3] }}
            </option>
            <option value="telegram">
              {{ values[4] }}
            </option>
            <option value="cms">
              {{ values[5] }}
            </option>
          </select>
        </article>

        <article v-if="selectMessenger === 'whatsapp'" class="cont-input">
          <label for="category">Тип</label>
          <select class="select-style" v-model="selectApi" id="itemSelect">
            <option value="api">
              {{ values[11] }}
            </option>
            <option value="api">
              {{ values[12] }}
            </option>
            <option value="api">
              {{ values[13] }}
            </option>
          </select>
        </article>

        <article v-if="selectMessenger === 'telegram'" class="cont-input">
          <label for="category">Тип</label>
          <select class="select-style" v-model="selectApi" id="itemSelect">
            <option>Тип</option>
            <option value="api">
              {{ values[6] }}
            </option>
            <option value="api">
              {{ values[7] }}
            </option>
          </select>
        </article>

        <article v-if="selectMessenger === 'cms'" class="cont-input">
          <label for="category">Тип</label>
          <select class="select-style" v-model="selectApi" id="itemSelect">
            <option>Тип</option>
            <option value="api">
              {{ values[6] }}
            </option>
            <option value="api">
              {{ values[7] }}
            </option>
          </select>
        </article>

        <article v-if="selectApi === 'api'" class="cont-input">
          <label for="category">Токен</label>
          <input
            placeholder="Логин"
            class="input-style"
            type="text"
            id="password"
            v-model="formData.token"
            required
          />
        </article>

        <article class="cont-input">
          <label for="category">Логин</label>
          <input
            placeholder="Логин"
            class="input-style"
            type="text"
            id="password"
            v-model="formData.login"
            required
          />
        </article>
      </section>
      <button
        v-if="selectApi === 'api'"
        class="create-acciount-button"
        @click="addAccount"
      >
        Добавить
      </button>
    </form>
  </section>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import axios from "axios";
const props = defineProps({
  openAddAccountStation: {
    type: Function,
  },
});

const selectCategry = ref("");
const selectMessenger = ref("");
const selectApi = ref("");

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

const ids = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
  "13",
];
const values = ref({});
const loading = ref({});
const error = ref({});

const changeStation = (categoryOne, value) => {
  station.category.messenger = true;
  console.log();
};

const getItemById = async (id, returnValue = "name") => {
  loading.value[id] = true;
  error.value[id] = null;

  try {
    const response = await axios.post(
      "https://b2288.apitter.com/getAddInstanceForm",
      {},
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const flatData = response.data;
    const item = flatData.find((item) => item.id === id);

    if (item) {
      values.value[id] = item[returnValue];
    } else {
      error.value[id] = `Элемент с id ${id} не найден.`;
    }
  } catch (err) {
    error.value[id] =
      "Ошибка: " + (err.message || "Произошла ошибка при загрузке данных.");
  } finally {
    loading.value[id] = false;
  }
};

const addAccount = async () => {
  try {
    const response = await axios.post(
      "https://b2288.apitter.com/instances/addAccount",
      {
        token: formData.token,
        login: formData.login,
        proxyString: formData.proxyString,
        webhookUrls: formData.proxyString,
        source: selectMessenger.value,
      },
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: "Bearer 342b63fd-6017-446f-adf8-d1b8e0b7bfc6",
        },
      }
    );

    console.log("Аккаунт успешно создан:", response.data);
    // location.reload();
  } catch (error) {
    error.value = error.message || "Произошла ошибка.";
    console.error("Ошибка при создании аккаунта:", error);
    if (error.response) {
      console.error("Ошибка сервера:", error.response.data);
    }
  }
};
onMounted(() => {
  ids.forEach((id) => {
    getItemById(id, "value");
  });
});
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
  border-radius: 10px;
  width: 593px;
  height: 625px;
  background: #fff;
  display: flex;
  justify-content: center;
}

form {
  margin-top: 30px;
}

.cont-input {
  margin-top: 20px;
}

.title {
  font-weight: 600;
  font-size: 20px;
  color: #000;
  margin-bottom: 24px;
}

.input-style {
  border: 0.5px solid #c1c1c1;
  border-radius: 5px;
  width: 481px;
  height: 43px;
  padding-left: 5px;
  background: #fcfcfc;
  display: flex;
  align-items: center;
  font-weight: 400;
  font-size: 14px;
  color: #343434;
  margin-top: 10px;
  outline: none;
}

.select-style {
  border: 0.5px solid #c1c1c1;
  border-radius: 5px;
  width: 490px;
  height: 45px;
  background: #fcfcfc;
  display: flex;
  align-items: center;
  font-weight: 400;
  font-size: 16px;
  color: #343434;
  margin-top: 10px;
  outline: none;
}

label {
  font-weight: 500;
  font-size: 16px;
  color: #000;
}

.category-list {
  margin-top: 5px;
  background: #fcfcfc;
  border: 0.5px solid #c1c1c1;
  border-radius: 5px;
  width: 465px;
  padding: 10px;
  display: flex;
  padding-left: 10px;
  align-items: flex-start;
  justify-content: center;
  flex-direction: column;
  gap: 6px;
}

.select-container {
  width: 300px;
  margin: 20px auto;
  text-align: center;
}

.create-acciount-button {
  border-radius: 5px;
  width: 490px;
  height: 44px;
  background: #4950ca;
  font-weight: 600;
  font-size: 14px;
  color: #fff;
  margin-top: 20px;
}
</style>
