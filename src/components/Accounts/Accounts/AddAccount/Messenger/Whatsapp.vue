<template>
  <section>
    <div>
      <div @click="dropdownOpen" class="dropdown-select">
        <h2
          v-if="!accountData.type"
          class="selected"
          :class="{ active: isDropdownOpen }"
        >
          Тип
        </h2>
        <h2 :class="{ unactive: !isDropdownOpen }" v-else class="item-selected">
          {{ accountData.type }}
        </h2>
        <h2
          v-if="accountData.type && !isDropdownOpen"
          class="selected"
          :class="{ active: isDropdownOpen }"
        >
          Тип
        </h2>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="10"
          height="10"
          class="arrow"
          :class="{ up: isDropdownOpen }"
          viewBox="0 0 24 24"
        >
          <path
            d="M11.178 19.569a.998.998 0 0 0 1.644 0l9-13A.999.999 0 0 0 21 5H3a1.002 1.002 0 0 0-.822 1.569l9 13z"
            fill="currentColor"
          />
        </svg>
      </div>
      <nav v-if="isDropdownOpen" class="dropdown-options">
        <ul>
          <li @click="selectMessangerFunc('Touchapi')" class="dropdown-option">
            Touchapi
          </li>
        </ul>
        <ul>
          <li @click="selectMessangerFunc('Edna')" class="dropdown-option">
            Edna
          </li>
        </ul>
      </nav>
    </div>
    <div v-if="accountData.type === 'Touchapi'">
      <input
        v-model="formData.login"
        @input="updateLogin"
        :placeholder="t('addAccount.login')"
        type="text"
        class="input-data"
      />
    </div>
    <section v-if="accountData.type === 'Edna'">
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
          :placeholder="t('addAccount.login')"
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
import { useI18n } from "vue-i18n";
const { t } = useI18n();
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

watch(accountData.type, (newValue) => {
  if (newValue) {
    formData.login = "";
    formData.token = "";
    console.log("dsds");
  }
});
</script>
<style scoped>
.dropdown-select {
  position: relative;
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
  margin-top: 30px;
}

.selected {
  position: absolute;
  font-size: 14px;
  font-weight: 500;
  margin-left: 12px;
  background-color: white;
  padding: 0px 8px;
  top: -11px;
  transition: all 0.15s;
}

.selected.active {
  position: relative;
  font-size: 16px;
  padding: 0px 0px;
  transition: all 0.15s;
  top: 0;
}

.item-selected {
  font-size: 16px;
  font-weight: 500;
  margin-left: 12px;
}

.item-selected.unactive {
  font-size: 16px;
  font-weight: 500;
  margin-left: 12px;
  color: #696969;
  transition: all 0.05s;
}

.arrow {
  position: absolute;
  right: 10px;
  transition: transform 0.3s;
}

.arrow.up {
  transform: rotate(180deg);
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

.dropdown-option {
  font-size: 16px;
  padding: 4px;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.15s;
}
.dropdown-option:hover {
  background-color: #eeeeee;
  transition: all 0.15s;
}

.dropdown-options.fade-enter-active,
.dropdown-options.fade-leave-active {
  transition: opacity 0.5s ease;
}
.dropdown-options.fade-enter,
.action-list.fade-leave-to {
  opacity: 0;
}

.dropdown-options {
  animation: fadeIn 0.5s forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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

.dropdown-select.fade-enter-active,
.dropdown-select.fade-leave-active {
  transition: opacity 0.5s ease;
}
.dropdown-select.fade-enter,
.dropdown-select.fade-leave-to {
  opacity: 0;
}

.dropdown-select {
  animation: fadeIn 0.5s forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 600px) {
  .dropdown-select {
    width: 400px;
    height: 45px;
    font-size: 16px;
    margin-top: 30px;
  }

  .dropdown-options {
    border-top: 0px;
    padding: 10px;
    width: 380px;
    height: auto;
    gap: 1px;
  }

  .create-account-button {
    width: 400px;
    height: 44px;
    font-size: 14px;
    margin-top: 20px;
  }

  .input-data {
    width: 387px;
    height: 45px;
  }
}

@media (max-width: 500px) {
  .dropdown-select {
    width: 350px;
    height: 45px;
    font-size: 16px;
    margin-top: 30px;
  }

  .dropdown-options {
    border-top: 0px;
    padding: 10px;
    width: 330px;
    height: auto;
    gap: 1px;
  }

  .create-account-button {
    width: 350px;
    height: 44px;
    font-size: 14px;
    margin-top: 20px;
  }

  .input-data {
    width: 338px;
    height: 45px;
  }
}

@media (max-width: 400px) {
  .dropdown-select {
    width: 300px;
    height: 45px;
    font-size: 16px;
    margin-top: 30px;
  }

  .dropdown-options {
    border-top: 0px;
    padding: 10px;
    width: 280px;
    height: auto;
    gap: 1px;
  }

  .create-account-button {
    width: 300px;
    height: 44px;
    font-size: 14px;
    margin-top: 20px;
  }

  .input-data {
    width: 287px;
    height: 45px;
  }
}
</style>
