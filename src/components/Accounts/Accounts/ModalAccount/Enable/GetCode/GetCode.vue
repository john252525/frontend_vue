<template>
  <section>
    <Telegram v-if="source === 'telegram'" />
    <WhatsApp v-else />
  </section>
</template>

<script setup>
import { inject } from "vue";
import Telegram from "./Telegram.vue";
import WhatsApp from "./WhatsApp.vue";
const { selectedItem } = inject("accountItems");
const { source, login } = selectedItem.value;
</script>

<style scoped></style>
