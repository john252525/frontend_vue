<template>
  <section
    v-if="stationLoading.modalStation"
    :class="
      stationLoading.account.result === undefined
        ? 'loading-section'
        : stationLoading.account.result === true
        ? 'loading-section-true'
        : 'error'
    "
  >
    <h2 class="title">
      {{
        stationLoading.value === "deleteAccount"
          ? "Удаление аккаунта"
          : stationLoading.value === "getNewProxy"
          ? "Изменение прокси"
          : stationLoading.value === "resetAccount"
          ? "Cбрасывание аккаунты"
          : "хз"
      }}
    </h2>
  </section>
</template>
resetAccount
<script setup>
import { toRefs, ref, defineProps, reactive } from "vue";

const props = defineProps({
  stationLoading: {
    type: Object,
    required: true,
  },
});
const { stationLoading } = toRefs(props);
</script>

<style scoped>
.loading-section {
  border: 0.5px solid #c1c1c1;
  border-radius: 5px;
  padding: 9px 8px;
  width: 300px;
  height: 30px;
  background: #fcfcfc;
  position: absolute;
  top: 90px;
  right: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-section-true {
  border: 0.5px solid #79f8c1;
  border-radius: 5px;
  padding: 9px 8px;
  width: 300px;
  height: 30px;
  box-shadow: -4px 4px 8px 0 rgba(0, 0, 0, 0.06),
    0 0 4px 0 rgba(85, 255, 195, 0.04);
  background: #aef6b0;
  position: absolute;
  top: 90px;
  right: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.title {
  font-size: 16px;
  font-weight: 500;
}
</style>
