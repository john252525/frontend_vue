<template>
  <div v-if="isModalOpen" class="black-fon" @click="closeModal">
    <div
      class="action-list"
      :style="{
        top: modalPosition.top + 'px',
        left: modalPosition.left + 'px',
      }"
    >
      <span class="action" @click="performAction('Настройки')">Настройки</span>
      <span class="action" @click="performAction('Скриншот')">Скриншот</span>
      <span class="action action-on" @click="performAction('Включить')"
        >Включить</span
      >
      <span class="action" @click="performAction('Выключить')">Выключить</span>
      <span class="action action-throw" @click="performAction('Сбросить')"
        >Сбросить</span
      >
      <span class="action" @click="performAction('Сменить прокси')"
        >Сменить прокси</span
      >
      <span class="action" @click="performAction('Связать через QR')"
        >Связать через QR</span
      >
      <span class="action" @click="performAction('Связать через код')"
        >Связать через код</span
      >
      <span class="action" @click="performAction('Проверить код')"
        >Проверить код</span
      >
      <span
        class="action action-delete"
        @click="performAction('Удалить аккаунт')"
        >Удалить аккаунт</span
      >
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  closeModal: {
    type: Function,
  },
  modalPosition: {
    type: Object,
  },
  isModalOpen: {
    type: Boolean,
  },
  performAction: {
    type: Function,
  },
});
</script>

<style scoped>
.black-fon {
  position: fixed;
  z-index: 5;
  width: 100%;
  height: 100vh;
  background: rgba(117, 117, 117, 0.3);
  top: 0;
  left: 0;
}
.action-list {
  border-radius: 10px;
  width: 170px;
  height: auto;
  background: #ffffff;
  position: absolute;
  z-index: 20;
  display: flex;
  justify-content: center;
  flex-direction: column;
  margin-left: -63px;
  margin-top: 10px;
  padding: 10px 0px 10px 10px;
}

.action {
  font-weight: 500;
  font-size: 15px;
  color: #000;
  cursor: pointer;
  padding: 6px;
}

.action:hover {
  background-color: #eeeeee;
  border-radius: 5px 0px 0px 5px;
}

.action-on:hover {
  color: green;
}

.action-throw:hover,
.action-delete:hover {
  color: rgb(255, 0, 0);
}
</style>
