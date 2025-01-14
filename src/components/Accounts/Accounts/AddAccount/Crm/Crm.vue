<template>
  <section>
    <input
      class="input-data"
      v-model="searchQuery"
      @focus="showOptions = true"
      placeholder="Введите адрес вашей CRM или выберите из списка"
    />
    <ul class="dropdown-options" v-if="showOptions && filteredOptions.length">
      <li
        v-for="option in filteredOptions"
        :key="option"
        @click="selectOption(option)"
      >
        {{ option }}
      </li>
    </ul>
    <section v-if="accountData.type === 'MegaPlan'">
      <div>
        <input
          v-model="formData.token"
          @input="updateToken"
          placeholder="Токен"
          type="text"
          class="input-data"
        />
      </div>
      <div>
        <input
          v-model="formData.login"
          @input="updateLogin"
          placeholder="Введите URL-адрес вашего аккаунта Megaplan"
          type="text"
          class="input-data"
        />
      </div>
    </section>
  </section>
</template>

<script setup>
import { ref, inject, reactive, watch, defineEmits } from "vue";
const { accountData } = inject("accountData");

const props = defineProps({
  selectType: {
    type: Function,
  },
});
const emit = defineEmits();
const isDropdownOpen = ref(false);

const formData = reactive({
  token: "",
  login: "",
});

const updateLogin = () => {
  emit("update-login", formData.login);
};

const updateToken = () => {
  emit("update-token", formData.token);
};

const selectMessangerFunc = (value) => {
  props.selectType(value);
  dropdownOpen();
};

const dropdownOpen = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};
const searchQuery = ref("");
const options = ref(["MegaPlan", "Bitrix24", "AmoCRM"]);
const filteredOptions = ref([]);
const showOptions = ref(false);

const filterOptions = () => {
  filteredOptions.value = options.value.filter((option) => {
    return option.toLowerCase().includes(searchQuery.value.toLowerCase());
  });
};

const selectOption = (option) => {
  props.selectType(option);
  searchQuery.value = option;
  showOptions.value = false; // Скрыть список
};

watch(searchQuery, filterOptions);
</script>

<style scoped>
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

.input-data.fade-enter-active,
.input-data.fade-leave-active {
  transition: opacity 0.5s ease;
}
.input-data.fade-enter,
.input-data.fade-leave-to {
  opacity: 0;
}

.input-data {
  animation: fadeIn 0.5s forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.dropdown-options {
  position: absolute;
  border: 0.5px solid #c1c1c1;
  border-top: 0px;
  border-radius: 5px;
  padding: 10px;
  width: 470px;
  height: auto;
  background: #fcfcfc;
  display: flex;
  flex-direction: column;
  gap: 1px;
  z-index: 100;
}

.input-data.fade-enter-active,
.input-data.fade-leave-active {
  transition: opacity 0.5s ease;
}
.input-data.fade-enter,
.input-data.fade-leave-to {
  opacity: 0;
}

.input-data {
  animation: fadeIn 0.5s forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

li {
  cursor: pointer;
}

@media (max-width: 600px) {
  .input-data {
    width: 387px;
    height: 45px;
  }
}

@media (max-width: 500px) {
  .input-data {
    width: 338px;
    height: 45px;
  }
}

@media (max-width: 500px) {
  .input-data {
    width: 287px;
    height: 45px;
  }
}
</style>
