<template>
  <section>
    <Telegram
      :openEnableMenuTrue="openEnableMenuTrue"
      v-if="source === 'telegram'"
    />
    <WhatsApp :openEnableMenuTrue="openEnableMenuTrue" ref="child" v-else />
  </section>
</template>

<script setup>
import { inject, ref, provide } from "vue";
import Telegram from "./Telegram.vue";
import WhatsApp from "./WhatsApp.vue";
const { selectedItem } = inject("accountItems");
const { source, login } = selectedItem.value;
const qrStateBolean = ref(false);

const props = defineProps({
  changeForceStopItemData: {
    type: Function,
  },
  openEnableMenuTrue: {
    type: Function,
  },
  changeEnableStation: {
    type: Function,
  },
});

const child = ref(null);

const getChild = () => {
  return child.value; // Возвращаем реф на дочерний компонент
};

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
defineExpose({ getChild });
</script>

<style scoped></style>
