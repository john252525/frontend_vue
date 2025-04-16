<template>
  <section v-if="stationLoading.modalStation">
    <section v-if="!stationLoading.account.error" class="loading-section-true">
      <h2 class="title-true">
        <img src="/account/gal.svg" alt="" />
        {{ t("resultModal.messageTrue") }}
        <img
          @click="changeStationLoadingModal"
          src="/account/close-true.svg"
          alt=""
        />
      </h2>
    </section>
    <section v-else class="loading-section-error">
      <h2 class="title-error">
        <img src="/account/error.svg" alt="" />
        {{ t("resultModal.messageFalse") }}
        <img
          @click="changeStationLoadingModal"
          src="/account/close-error.svg"
          alt=""
        />
      </h2>
    </section>
  </section>
</template>

<script setup>
import { toRefs, ref, defineProps, onMounted, watch, onUnmounted } from "vue";
import { useI18n } from "vue-i18n";
const { t } = useI18n();

const props = defineProps({
  stationLoading: {
    type: Object,
    required: true,
  },
  changeStationLoadingModal: {
    type: Function,
  },
});

const { stationLoading } = toRefs(props);
</script>

<style scoped>
.loading-section-true {
  border: 0.5px solid #79f8c1;
  border-radius: 5px;
  width: 314px;
  height: 60px;
  box-shadow: -4px 4px 8px 0 rgba(0, 0, 0, 0.06),
    0 0 4px 0 rgba(85, 255, 195, 0.04);
  background: #deecd2;
  position: fixed;
  z-index: 100;
  top: 5px;
  right: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.title-true {
  font-weight: 600;
  font-size: 14px;
  color: #1b632b;
  display: flex;
  align-items: center;
  gap: 6px;
}

.loading-section-error {
  border: 0.5px solid #bb4747;
  border-radius: 5px;
  width: 337px;
  height: 60px;
  box-shadow: -4px 4px 8px 0 rgba(0, 0, 0, 0.06),
    0 0 4px 0 rgba(85, 255, 195, 0.04);
  background: #eea6a6;
  position: fixed;
  z-index: 100;
  top: 5px;
  right: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.title-error {
  font-weight: 600;
  font-size: 16px;
  color: #b73131;
  display: flex;
  align-items: center;
  gap: 6px;
}

.loading-section-true,
.fade-leave-active {
  transition: opacity 0.5s ease;
}
.loading-section-true,
.fade-leave-to {
  opacity: 0;
}

.loading-section-true {
  animation: fadeIn 0.5s forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.loading-section-error,
.fade-leave-active {
  transition: opacity 0.5s ease;
}
.loading-section-error,
.fade-leave-to {
  opacity: 0;
}

.loading-section-error {
  animation: fadeIn 0.5s forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>
