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
    <div>
      <input
      v-if="
        accountData.messenger === 'Telegram' &&
        accountData.category === 'Messenger'
      "
      @input="checkInputTelegram"
        v-model="accountData.tgLogin"
        placeholder="Логин"
        type="text"
        class="input-data"
      />
    </div>
    <Whatsapp
      v-if="
        accountData.messenger === 'WhatsApp' &&
        accountData.category === 'Messenger'
      "
      @update-login="updateLogin"
      @update-token="updateToken"
      :selectType="selectType"
    />
    <button v-if="accountData.button" @click="AddAccount" class="create-account-button">Добавить</button>
  </section>
</template>

<script setup>
import Whatsapp from "./Messenger/Whatsapp.vue";

import { ref, reactive, provide } from "vue";

const accountData = reactive({
  category: "",
  messenger: "",
  type: "",
  login: "",
  tgLogin: '',
  token: "",
  button: false
});

const isOpen = reactive({
  category: false,
  messenger: false,
});

const isDropdownOpen = ref(false);

const selectType = (value) => {
  accountData.type = value;
  if (value === 'Touchapi') {
    accountData.button = true 
  } else if ('Edna') {
    if(accountData.token) {
      return
    } else {
      accountData.button = false  
    }
  } else {
    accountData.button = false 
  }
};

const selectCategory = (value) => {
  accountData.category = value;
  dropdownOpen("category");
};

const selectMessenger = (value) => {
  accountData.messenger = value;
  if (value === 'Telegram') {
    if (accountData.tgLogin) {
      accountData.button = true
      return
    } else{
      accountData.button = false
    }
  } else if (accountData.messenger === 'WhatsApp') {
    accountData.button = false  
    accountData.type = ''
  } else {
    accountData.button = false

  } 
  dropdownOpen("messenger");
};

const checkInputTelegram = () => {
  accountData.button = accountData.tgLogin.trim() !== '';
};

const updateLogin = (newLogin) => {
  accountData.login = newLogin;
};

const updateToken = (newToken) => {
  accountData.token = newToken;
  if (newToken) {
    accountData.button = true
  } else {
    accountData.button = false
  }
};

const dropdownOpen = (value) => {
  if (value === "category") {
    isOpen.category = !isOpen.category;
  } else if (value === "messenger") {
    isOpen.messenger = !isOpen.messenger;
  }
};
 
const AddAccount = () => {
  if (!accountData.category) {
    console.log("Нет категории");
    return;
  } else {
    if (accountData.category === "Messenger") {
      console.log("category: Messenger");
    } else if (accountData.category === "CRM") {
      console.log("category: CRM");
    }
  }
  if (!accountData.messenger) {
    console.log("Нет messenger");
  } else {
    if (accountData.messenger === "WhatsApp") {
      console.log("messenger: WhatsApp");
      if (!accountData.type) {
        console.log("messenger: WhatsApp | type: NONE");
        return;
      } else {
        if (accountData.type === "Touchapi") {
          console.log("messenger: WhatsApp | type: Touchapi");
        } else if (accountData.type === "Edna") {
          console.log("messenger: WhatsApp | type: edna");
            if(!accountData.token) {
              console.log("messenger: WhatsApp | type: edna | token: NoNE")
            } else {
              accountData.button = true
            }
        }
      }
    } else if (accountData.messenger === "Telegram") {
      console.log("messenger: Telegram");
    } else if (accountData.messenger === "SMS") {
      console.log("messenger: SMS");
    }
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

.create-account-button {
  border-radius: 5px;
  width: 490px;
  height: 44px;
  background: #4950ca;
  font-weight: 600;
  font-size: 14px;
  color: #fff;
  margin-top: 20px;
}

.create-account-button.fade-enter-active,
.create-account-button.fade-leave-active {
  transition: opacity 0.5s ease;
}
.create-account-button.fade-enter,
.create-account-button.fade-leave-to {
  opacity: 0;
}

.create-account-button {
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
</style>
