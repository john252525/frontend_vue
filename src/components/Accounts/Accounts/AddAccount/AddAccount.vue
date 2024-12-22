<template>
  <div class="black-fon"></div>
  <section class="add-account-section">
    <!-- <div>
      <div @click="dropdownOpen" class="dropdown-select">
        <h2
          v-if="!accountData.category"
          class="selected"
          :class="{ active: isDropdownOpen }"
        >
          Выберите категорию
        </h2>
        <h2 :class="{ unactive: !isDropdownOpen }" v-else class="item-selected">
          {{ accountData.category }}
        </h2>
        <h2
          v-if="accountData.category && !isDropdownOpen"
          class="selected"
          :class="{ active: isDropdownOpen }"
        >
          Выберите категорию
        </h2>
        <img
          class="arrow"
          :class="{ up: isDropdownOpen }"
          src="/account/arrow.svg"
          alt=""
        />
      </div>
      <nav v-if="isDropdownOpen" class="dropdown-options">
        <ul>
          <li @click="selectCategory('Messenger')" class="dropdown-option">
            Messenger
          </li>
        </ul>
        <ul>
          <li @click="selectCategory('CRM')" class="dropdown-option">CRM</li>
        </ul>
      </nav>
    </div> -->
    <Whatsapp :selectMessanger="selectMessanger" />
  </section>
</template>

<script setup>
import Whatsapp from "./Messenger/Whatsapp.vue";

import { ref, reactive, provide } from "vue";

const accountData = reactive({
  category: "",
  messenger: "",
  type: "",
});

const isDropdownOpen = ref(false);

const selectMessanger = (value) => {
  accountData.messenger = value;
  console.log(accountData.messenger);
};

const selectCategory = (value) => {
  accountData.category = value;
  dropdownOpen();
};

const dropdownOpen = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

provide("accountData", { accountData });
</script>

<style scoped>
.add-account-section {
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
  margin-top: 50px;
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
</style>
