<template>
  <section class="code-station">
    <div @click="changeStationGetByCode" class="black-fon"></div>
    <Telegram v-if="selectedItems.source === 'telegram'" />
    <WhatsApp :changeStationGetByCode="changeStationGetByCode" v-else />
  </section>
</template>

<script setup>
import Telegram from "./Telegram.vue";
import WhatsApp from "./WhatsApp.vue";
import { toRefs, provide } from "vue";

const props = defineProps({
  selectedItems: {
    type: Object,
  },
  changeStationGetByCode: {
    type: Function,
  },
  getByCodeStation: {
    type: Boolean,
  },
});
const { selectedItems, getByCodeStation } = toRefs(props);
provide("Items", {
  getByCodeStation,
  selectedItems,
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
</style>
