<template>
  <section>
    <Telegram v-if="source === 'telegram'" />
    <WhatsApp v-else />
  </section>
</template>

<script setup>
import { inject, ref, provide } from "vue";
import Telegram from "./Telegram.vue";
import WhatsApp from "./WhatsApp.vue";
const { selectedItem } = inject("accountItems");
const { source, login } = selectedItem.value;
const qrStateBolean = ref(false);

const changeQrStateBoleanOn = () => {
  qrStateBolean.value = true;
};

const changeQrStateBoleanOff = () => {
  qrStateBolean.value = false;
};

provide("qrStateBolean", {
  qrStateBolean,
  changeQrStateBoleanOn,
  changeQrStateBoleanOff,
});
</script>

<style scoped></style>
