<template>
  <section>
    <Telegram v-if="source === 'telegram'" />
    <WhatsApp ref="childComponentRef" v-else />
  </section>
</template>

<script setup>
import { inject, ref } from "vue";
import Telegram from "./Telegram.vue";
import WhatsApp from "./WhatsApp.vue";
const { selectedItem } = inject("accountItems");
const { source, login } = selectedItem.value;
const childComponentRef = ref(null);

// Функция для получения дочернего компонента
const getChild = () => {
  return childComponentRef.value; // Возвращаем реф на дочерний компонент
};

// Экспортируем функцию getChild для доступа из родительского компонента
defineExpose({ getChild });
</script>
<style scoped></style>
