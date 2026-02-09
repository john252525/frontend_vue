<template>
  <button @click="isLoginVisible = true">Войти</button>

  <ModalFrame
    :isOpen="isLoginVisible"
    :text="textModal"
    :close="closeModal"
    :item="item"
  >
    <form @submit.prevent="handleLogin">
      <input type="email" placeholder="Email" />
      <button type="submit">Отправить</button>
    </form>

    <template #footer>
      <button @click="isLoginVisible = false">Отмена</button>
    </template>
  </ModalFrame>
</template>

<script setup>
import { ref } from "vue";
import ModalFrame from "@/components/GlobalModal/ModalFrame.vue";

const textModal = ref({
  title: "Настройки",
  action: "Сохранить",
  close: "Отмена",
});

const item = ref({
  name: "hellyxxl",
  source: "telegram",
});

const isLoginVisible = ref(true);

const closeModal = () => {
  isLoginVisible.value = false;
};
</script>
