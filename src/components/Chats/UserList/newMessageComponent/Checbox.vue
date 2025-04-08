<template>
  <div class="dropdown">
    <div @click="toggleDropdown" class="dropdown-select">
      <h2
        v-if="!selectedAccount"
        class="selected"
        :class="{ active: isOpen }"
      >
        Выберите аккаунт
      </h2>
      <h2
        v-else
        class="item-selected"
      >
      
       <img v-if="selectedAccount.source === 'whatsapp'"  src="/chats/whatsapp.svg" alt="">  <img v-else  src="/chats/telegram.svg" alt="">  {{ selectedAccount.login }} 
      </h2>
      <h2
        v-if="selectedAccount && !isOpen"
        class="selected"
        :class="{ active: isOpen }"
      >
        Выберите аккаунт
      </h2>
      <img
        class="arrow"
        :class="{ up: isOpen }"
        src="/account/arrow.svg"
        alt=""
      />
    </div>

    <ul v-if="isOpen" class="dropdown-list">
      <li
        v-for="account in accounts"
        :key="account.login"
        @click="selectAccount(account)"
        class="dropdown-item"
      >
      <img v-if="account.source === 'whatsapp'"  src="/chats/whatsapp.svg" alt="">  <img v-else  src="/chats/telegram.svg" alt="">  {{ account.login }} 
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue';

const props = defineProps({
  accounts: {
    type: Array,
    required: true,
  },
  selectedAccount: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['update:selectedAccount']);

const isOpen = ref(false);

const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
};

const selectAccount = (account) => {
  emit('update:selectedAccount', account);
  isOpen.value = false;
};
</script>

<style scoped>
.dropdown {
  position: relative;
  width: 298px;
  margin-bottom: 24px;
  font-family: sans-serif;
}

.dropdown-select {
  position: relative;
  border: 0.5px solid #c1c1c1;
  border-radius: 5px;
  width: 100%;
  height: 36px;
  background: #fcfcfc;
  display: flex;
  align-items: center;
  font-weight: 500;
  font-size: 16px;
  color: #343434;
  cursor: pointer; /* Добавляем курсор */
}

.selected {
  position: absolute;
  font-size: 12px;
  font-weight: 500;
  margin-left: 12px;
  background-color: white;
  padding: 0px 6px;
  top: -7px;
  transition: all 0.15s;
}

.selected.active {
  top: -20px;
}

.item-selected {
  font-size: 14px;
  font-weight: 500;
  margin-left: 12px;
}

.arrow {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 14px; /* Примерная ширина стрелки */
  height: auto;
  
  transition: transform 0.2s; /* Плавный поворот */
}

.arrow.up {
  transform: translateY(-50%) rotate(180deg); /* Поворачиваем стрелку */
}

.dropdown-list {
  position: absolute;
  top: 100%; /* Позиционируем под dropdown-select */
  left: 0;
  width: 100%;
  background-color: #fcfcfc;
  border: 0.5px solid #c1c1c1;
  border-radius: 5px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1); /* Тень */
  z-index: 10; /* Чтобы список был над другими элементами */
  list-style: none; /* Убираем точки у списка */
  padding: 0;
  margin: 0;
}

.dropdown-item {
  padding: 10px 12px;
  font-size: 14px;
  color: #343434;
  cursor: pointer;
  transition: background-color 0.2s; /* Плавное изменение фона */
}

.dropdown-item:hover {
  background-color: #f0f0f0;
}
</style>