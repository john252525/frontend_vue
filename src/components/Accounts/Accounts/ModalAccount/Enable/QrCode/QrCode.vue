<template>
  <section>
    <Telegram
      :changeMax="changeMax"
      :changeForceStopItemData="changeForceStopItemData"
      :openEnableMenuTrue="openEnableMenuTrue"
      :changeEnableStation="changeEnableStation"
      :updateLoadingStatus="updateLoadingStatus"
      v-if="source === 'telegram'"
    />
    <Max
      :changeForceStopItemData="changeForceStopItemData"
      :updateLoadingStatus="updateLoadingStatus"
      :openEnableMenuTrue="openEnableMenuTrue"
      :changeEnableStation="changeEnableStation"
      ref="childComponentRef"
      v-else-if="source === 'max'"
    />
    <WhatsApp
      :changeForceStopItemData="changeForceStopItemData"
      :updateLoadingStatus="updateLoadingStatus"
      :openEnableMenuTrue="openEnableMenuTrue"
      :changeEnableStation="changeEnableStation"
      ref="childComponentRef"
      v-else
    />
  </section>
</template>

<script setup>
import { inject, ref } from "vue";
import Telegram from "./Telegram.vue";
import WhatsApp from "./WhatsApp.vue";
import Max from "./Max.vue";
const { selectedItem } = inject("accountItems");
const { source, login } = selectedItem.value;
const childComponentRef = ref(null);

const props = defineProps({
  changeForceStopItemData: {
    type: Function,
  },
  updateLoadingStatus: {
    type: Function,
  },
  changeMax: {
    type: Function,
  },
  openEnableMenuTrue: {
    type: Function,
  },
  changeEnableStation: {
    type: Function,
  },
});

const getChild = () => {
  return childComponentRef.value;
};

defineExpose({ getChild });
</script>
<style scoped></style>
