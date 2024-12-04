<template>
  <div @click="openAddAccountStation" class="black-fon"></div>
  <section class="add-account">
    <form>
      <h2 class="title">Добавить аккаунты</h2>
      <div class="cont-input">
        <label for="category">Выберите категорию</label>
        <select
          @change="resetFormData"
          class="select-style"
          v-model="formData.select.selectCategry"
          id="itemSelect"
        >
          <option value="messenger">
            {{ values[1] }}
          </option>
          <option value="crm">
            {{ values[2] }}
          </option>
        </select>
      </div>

      <section v-if="formData.select.selectCategry === 'messenger'">
        <article class="cont-input">
          <label for="category">Выберите мессенджер</label>
          <select
            class="select-style"
            v-model="formData.select.selectMessenger"
            id="itemSelect"
            @change="handleSelectChange"
          >
            <option value="whatsapp">
              {{ values[3] }}
            </option>
            <option @change="changeButtonStatiom" value="telegram">
              {{ values[4] }}
            </option>
            <option value="sms">
              {{ values[5] }}
            </option>
          </select>
        </article>
        <article
          v-if="formData.select.selectMessenger === 'whatsapp'"
          class="cont-input"
        >
          <label for="category">Тип</label>
          <select
            class="select-style"
            v-model="formData.select.selectApi"
            id="itemSelect"
            @change="handleSelectChange"
          >
            <option value="touchapi">
              {{ values[6] }}
            </option>
            <option value="edna">
              {{ values[7] }}
            </option>
          </select>
        </article>
        <article
          v-if="
            formData.select.selectApi === 'edna' &&
            formData.select.selectMessenger === 'whatsapp'
          "
          class="cont-input"
        >
          <label for="category">Токен</label>
          <input
            :style="styleInput.token"
            class="input-style"
            placeholder="Токен"
            type="text"
            id="text"
            v-model="formData.formInput.token"
            required
          />
        </article>
        <article
          v-if="
            formData.select.selectApi === 'edna' &&
            formData.select.selectMessenger != 'sms'
          "
          class="cont-input"
        >
          <label for="category">Логин</label>
          <input
            :style="styleInput.login"
            class="input-style"
            placeholder="Логин"
            type="text"
            id="text"
            v-model="formData.formInput.login"
          />
        </article>

        <article
          v-if="
            formData.select.selectMessenger === 'telegram' &&
            formData.select.selectMessenger != 'sms'
          "
          class="cont-input"
        >
          <label for="category">Логин</label>
          <input
            :style="styleInput.login"
            class="input-style"
            placeholder="Логин"
            @input="formatPhone"
            type="text"
            id="phone"
            v-model="phone"
            required
          />
        </article>
      </section>

      <section v-if="formData.select.selectCategry === 'crm'">
        <article class="cont-input">
          <label for="search">Тип</label>
          <input
            @click="changeOptionsStation"
            id="search"
            type="text"
            class="input-style"
            v-model="searchTerm"
            placeholder="Введите текст для поиска..."
            :style="styleInput.token"
            @input="filterOptions"
          />
          <ul v-if="searchTerm && filteredOptions.length > 0">
            <li
              v-for="(option, index) in filteredOptions"
              :key="index"
              @click="selectOption(option)"
            >
              <p>{{ option }}</p>
            </li>
          </ul>
          <p v-else-if="searchTerm">Ничего не найдено</p>
        </article>
        <section v-if="formData.select.selectApi === 'megaplan'">
          <article class="cont-input">
            <label for="category">Токен</label>
            <input
              :style="styleInput.token"
              class="input-style"
              placeholder="Токен"
              type="text"
              id="text"
              v-model="formData.formInput.token"
              required
            />
          </article>
          <article class="cont-input">
            <label for="category">Логин</label>
            <input
              :style="styleInput.login"
              class="input-style"
              placeholder="Логин"
              type="text"
              id="text"
              v-model="formData.formInput.login"
              required
            />
          </article>
        </section>
      </section>
      <button
        v-if="formData.buttonStatiom"
        class="create-acciount-button"
        @click="addAccountCheck"
      >
        Добавить
      </button>
    </form>
  </section>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from "vue";
import axios from "axios";
const props = defineProps({
  openAddAccountStation: {
    type: Function,
  },
});

const formData = reactive({
  select: {
    selectCategry: "",
    selectMessenger: "",
    selectApi: "",
  },
  formInput: {
    login: "",
    tokenEdna: "",
  },
  requestData: {
    error: "",
    loading: "",
  },
  buttonStatiom: false,
});

const styleInput = reactive({
  token: {
    border: "0.5px solid #c1c1c1",
    background: "fcfcfc",
  },
  login: {
    border: "0.5px solid #c1c1c1",
    background: "fcfcfc",
  },
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

const formatStyle = (category, input, station) => {
  if (category === "telegram") {
    console.log("sdsdsd");
    if (input === "login") {
      if (station === "true") {
        styleInput.login.border = "0.5px solid #be2424";
        styleInput.login.background = "#ffeaea";
      } else if (station === "false") {
        styleInput.login.border = "0.5px solid #c1c1c1";
        styleInput.login.background = "#fcfcfc";
      }
    }
  } else if (category === "edna") {
    if (input === "token") {
      if (station === "true") {
        styleInput.token.border = "0.5px solid #be2424";
        styleInput.token.background = "#ffeaea";
      } else if (station === "false") {
        styleInput.token.border = "0.5px solid #c1c1c1";
        styleInput.token.background = "#fcfcfc";
      }
    }
  } else if (category === "megaplan") {
    if (input === "token") {
      if (station === "true") {
        styleInput.token.border = "0.5px solid #be2424";
        styleInput.token.background = "#ffeaea";
      } else if (station === "false") {
        styleInput.token.border = "0.5px solid #c1c1c1";
        styleInput.token.background = "#fcfcfc";
      }
    }
    if (input === "login") {
      if (station === "true") {
        styleInput.login.border = "0.5px solid #be2424";
        styleInput.login.background = "#ffeaea";
      } else if (station === "false") {
        styleInput.login.border = "0.5px solid #c1c1c1";
        styleInput.login.background = "#fcfcfc";
      }
    }
  }
};

const resetFormData = () => {
  formData.select.selectApi = "";
  formData.select.selectMessenger = "";
  formData.formInput.login = "";
  formData.formInput.token = "";
  formData.formInput.login = "";
  formData.formInput.token = "";
};

const addAccount = async () => {
  try {
    const response = await axios.post(
      "https://b2288.apitter.com/instances/addAccount",
      {
        token: formData.formInput.token,
        login: formData.formInput.login,
        type: formData.select.selectApi,
        group: formData.select.selectCategry,
        proxyString: "",
        webhookUrls: "",
        source: formData.select.selectMessenger,
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
};

const addAccountCheck = async () => {
  if (formData.select.selectMessenger === "telegram") {
    if (phone.value === "") {
      formatStyle("telegram", "login", "true");
    } else {
      formatStyle("telegram", "login", "false");
      formData.formInput.login = phone.value;
      addAccount();
    }
  }
  if (formData.select.selectApi === "edna") {
    if (formData.formInput.token === "") {
      formatStyle("edna", "token", "true");
    } else {
      formatStyle("edna", "token", "false");
      addAccount();
    }
  }
  if (formData.select.selectApi === "touchapi") {
    addAccount();
  }
  if (formData.select.selectCategry === "crm") {
    formData.select.selectApi = options;
  }
  if (formData.select.selectApi === "megaplan") {
    if (formData.formInput.login === "") {
      formatStyle("megaplan", "login", "true");
    } else {
      formatStyle("megaplan", "login", "false");
    }
    if (formData.formInput.token === "") {
      formatStyle("megaplan", "token", "true");
    } else {
      formatStyle("megaplan", "token", "false");
    }
    if (formData.formInput.token != "" && formData.formInput.login != "") {
      addAccount();
    }
  }
};

const handleSelectChange = (event) => {
  const selectedValue = event.target.value;

  // Проверяем, выбрана ли определенная опция
  if (selectedValue === "telegram") {
    // Выполняем вашу функцию только для опции 'amocrm'
    changeButtonStatiomOn();
  } else if (selectedValue === "touchapi" || selectedValue === "edna") {
    changeButtonStatiomOn();
  } else {
    changeButtonStatiomOff();
  }
};

const changeButtonStatiomOn = () => {
  formData.buttonStatiom = true;
};

const changeButtonStatiomOff = () => {
  formData.buttonStatiom = false;
};

const options = ref(["amocrm", "bitrix24", "Амок", "Тест", "Пример", "Амок 2"]);
const searchTerm = ref("");

const filteredOptions = computed(() => {
  return options.value.filter((option) =>
    option.toLowerCase().includes(searchTerm.value.toLowerCase())
  );
});

// Функция для выбора опции
const selectOption = (option) => {
  searchTerm.value = option;
  changeButtonStatiomOn();
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
  border-radius: 5px;
  width: 481px;
  height: 43px;
  padding-left: 5px;
  display: flex;
  align-items: center;
  font-weight: 500;
  font-size: 16px;
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
  font-weight: 500;
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

@media (max-width: 600px) {
  .add-account {
    width: 400px;
    height: 625px;
  }

  .input-style {
    width: 290px;
    height: 43px;
    font-size: 16px;
    margin-top: 10px;
  }

  .select-style {
    width: 300px;
    height: 45px;
    font-size: 16px;
    margin-top: 10px;
  }

  .create-acciount-button {
    width: 300px;
    height: 44px;
    font-size: 14px;
    margin-top: 20px;
  }
}

@media (max-width: 400px) {
  .add-account {
    width: 300px;
    height: 625px;
  }

  .input-style {
    width: 250px;
    height: 43px;
    font-size: 16px;
    margin-top: 10px;
  }

  .select-style {
    width: 260px;
    height: 45px;
    font-size: 16px;
    margin-top: 10px;
  }

  .create-acciount-button {
    width: 260px;
    height: 44px;
    font-size: 14px;
    margin-top: 20px;
  }
}
</style>
