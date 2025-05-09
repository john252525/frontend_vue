<template>
  <section v-if="stationLoading.isOpen">
    <section v-if="stationLoading.successfully" class="loading-section-true">
      <h2 class="title-true">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
        >
          <g fill="none" stroke="currentColor" stroke-width="2">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="m8 12.5l3 3l5-6"
            />
            <circle cx="12" cy="12" r="10" />
          </g>
        </svg>

        {{ t("resultModal.messageTrue") }}
        <svg
          @click="changeStationLoadingModal"
          xmlns="http://www.w3.org/2000/svg"
          width="26"
          height="26"
          viewBox="0 0 32 32"
        >
          <path
            fill="currentColor"
            d="M17.414 16L24 9.414L22.586 8L16 14.586L9.414 8L8 9.414L14.586 16L8 22.586L9.414 24L16 17.414L22.586 24L24 22.586z"
          />
        </svg>
      </h2>
    </section>
    <section v-else class="loading-section-error">
      <h2 class="title-error">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
        >
          <path
            fill="currentColor"
            d="M11.953 2C6.465 2 2 6.486 2 12s4.486 10 10 10s10-4.486 10-10S17.493 2 11.953 2M13 17h-2v-2h2zm0-4h-2V7h2z"
          />
        </svg>
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
  background: #fafdf7;
  position: fixed;
  z-index: 100;
  top: 5px;
  right: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(1px); /* Добавляем размытие */
  -webkit-backdrop-filter: blur(1px); /* Для поддержки в Safari */
}

.title-true {
  font-weight: 600;
  font-size: 14px;
  color: #1b632b;
  display: flex;
  align-items: center;
  gap: 0px;
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
