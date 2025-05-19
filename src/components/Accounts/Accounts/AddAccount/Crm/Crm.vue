<template>
  <section class="dropdown-container">
    <input
      ref="inputRef"
      class="input-data"
      v-model="searchQuery"
      @focus="handleFocus"
      @input="handleInput"
      @blur="handleBlur"
      :placeholder="t('addAccount.crm.takeAdres')"
    />
    <ul class="dropdown-options" v-if="showOptions" @mousedown.prevent>
      <li
        v-for="option in options"
        :key="option"
        @mousedown="selectOption(option)"
      >
        {{ option }}
      </li>
    </ul>

    <section v-if="accountData.type === 'MegaPlan'">
      <div>
        <input
          v-model="formData.token"
          @input="updateToken"
          :placeholder="t('addAccount.token')"
          type="text"
          class="input-data"
        />
      </div>
      <div>
        <input
          v-model="formData.login"
          @input="updateLogin"
          :placeholder="t('addAccount.crm.takeUrl')"
          type="text"
          class="input-data"
        />
      </div>
    </section>
  </section>
</template>

<script setup>
import {
  ref,
  inject,
  reactive,
  defineEmits,
  onMounted,
  onUnmounted,
  watch,
} from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const { accountData } = inject("accountData");

const props = defineProps({
  selectType: Function,
  changeAcooundDataButton: Function,
  selectCrmType: Function,
});

const emit = defineEmits(["update-login", "update-token"]);

// Рефы
const inputRef = ref(null);
const searchQuery = ref("");
const showOptions = ref(false);
const formData = reactive({
  token: "",
  login: "",
});

// Опции для выпадающего списка
const options = ["MegaPlan", "Bitrix24", "AmoCRM"];

// Отслеживаем изменения ввода
watch(searchQuery, (newVal) => {
  if (newVal && newVal.trim() !== "" && newVal.length != 0) {
    props.changeAcooundDataButton();
  }
});

// Обработчики событий
const handleFocus = () => {
  showOptions.value = true;
};

const handleInput = () => {
  // Скрываем опции при любом вводе
  showOptions.value = false;

  // Если поле очистили, показываем опции
  if (searchQuery.value === "") {
    showOptions.value = true;
  }
};

const handleBlur = () => {
  // Задержка для обработки выбора опции
  setTimeout(() => {
    showOptions.value = false;
  }, 200);
};

const selectOption = (option) => {
  searchQuery.value = option;
  showOptions.value = false;
  props.selectType(option);

  if (option === "Bitrix24" || option === "AmoCRM") {
    props.changeAcooundDataButton();
  }
};

const updateLogin = () => {
  emit("update-login", formData.login);
};

const updateToken = () => {
  emit("update-token", formData.token);
};

const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

// Обработчик клика по документу
const handleClickOutside = (event) => {
  if (!event.target.closest(".dropdown-container")) {
    showOptions.value = false;
    inputRef.value?.blur();
  }
};

// Навешиваем обработчик при монтировании
onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

// Удаляем обработчик при размонтировании
onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>

<style scoped>
.dropdown-container {
  position: relative;
}

.input-data {
  border: 0.5px solid #c1c1c1;
  border-radius: 5px;
  width: 478px;
  height: 45px;
  background: #fcfcfc;
  font-weight: 500;
  font-size: 14px;
  color: #343434;
  margin-top: 30px;
  padding-left: 10px;
}

.dropdown-options {
  position: absolute;
  border: 0.5px solid #c1c1c1;
  border-top: 0;
  border-radius: 0 0 5px 5px;
  padding: 10px;
  width: 470px;
  max-height: 200px;
  overflow-y: auto;
  background: #fcfcfc;
  display: flex;
  flex-direction: column;
  gap: 5px;
  z-index: 100;
  margin-top: -5px;
}

.dropdown-options li {
  cursor: pointer;
}

@media (max-width: 600px) {
  .input-data,
  .dropdown-options {
    width: 387px;
  }
}

@media (max-width: 500px) {
  .input-data,
  .dropdown-options {
    width: 338px;
  }
}

@media (max-width: 400px) {
  .input-data,
  .dropdown-options {
    width: 287px;
  }
}
</style>
