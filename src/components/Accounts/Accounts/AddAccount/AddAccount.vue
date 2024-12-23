<template>
  <div class="black-fon"></div>
  <section class="add-account-section">
    <div>
      <h2 class="title">Добавить аккаунты</h2>
      <div @click="dropdownOpen('category')" class="dropdown-select">
        <h2
          v-if="!accountData.category"
          class="selected"
          :class="{ active: isOpen.category }"
        >
          Выберите категорию
        </h2>
        <h2
          :class="{ unactive: !isOpen.category }"
          v-else
          class="item-selected"
        >
          {{ accountData.category }}
        </h2>
        <h2
          v-if="accountData.category && !isOpen.category"
          class="selected"
          :class="{ active: isOpen.category }"
        >
          Выберите категорию
        </h2>
        <img
          class="arrow"
          :class="{ up: isOpen.category }"
          src="/account/arrow.svg"
          alt=""
        />
      </div>
      <nav v-if="isOpen.category" class="dropdown-options">
        <ul>
          <li @click="selectCategory('Messenger')" class="dropdown-option">
            Messenger
          </li>
        </ul>
        <ul>
          <li @click="selectCategory('CRM')" class="dropdown-option">CRM</li>
        </ul>
      </nav>
    </div>
    <div>
      <div
        v-if="accountData.category === 'Messenger'"
        @click="dropdownOpen('messenger')"
        class="dropdown-select"
      >
        <h2
          v-if="!accountData.messenger"
          class="selected"
          :class="{ active: isOpen.messenger }"
        >
          Выберите мессенджер
        </h2>
        <h2
          :class="{ unactive: !isOpen.messenger }"
          v-else
          class="item-selected"
        >
          {{ accountData.messenger }}
        </h2>
        <h2
          v-if="accountData.messenger && !isOpen.messenger"
          class="selected"
          :class="{ active: isOpen.messenger }"
        >
          Выберите мессенджер
        </h2>
        <img
          class="arrow"
          :class="{ up: isOpen.messenger }"
          src="/account/arrow.svg"
          alt=""
        />
      </div>
      <nav v-if="isOpen.messenger" class="dropdown-options">
        <ul>
          <li @click="selectMessenger('WhatsApp')" class="dropdown-option">
            WhatsApp
          </li>
        </ul>
        <ul>
          <li @click="selectMessenger('Telegram')" class="dropdown-option">
            Telegram
          </li>
        </ul>
        <ul>
          <li @click="selectMessenger('SMS')" class="dropdown-option">SMS</li>
        </ul>
      </nav>
    </div>
    <Whatsapp
      v-if="
        accountData.messenger === 'WhatsApp' &&
        accountData.category === 'Messenger'
      "
      :selectType="selectType"
    />
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

const isOpen = reactive({
  category: false,
  messenger: false,
});

const isDropdownOpen = ref(false);

const selectType = (value) => {
  accountData.type = value;
  console.log(accountData.type);
};

const selectCategory = (value) => {
  accountData.category = value;
  dropdownOpen("category");
};

const selectMessenger = (value) => {
  accountData.messenger = value;
  dropdownOpen("messenger");
};

const dropdownOpen = (value) => {
  if (value === "category") {
    isOpen.category = !isOpen.category;
  } else if (value === "messenger") {
    isOpen.messenger = !isOpen.messenger;
  }
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
  /* justify-content: center; */
  align-items: center;
  flex-direction: column;
}

.title {
  font-weight: 600;
  font-size: 18px;
  color: #000;
  margin-top: 24px;
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
</style>
