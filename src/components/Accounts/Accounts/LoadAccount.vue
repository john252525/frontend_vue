<template>
  <div class="cont">
    <h3>{{ t("globalLoading.loading") }}</h3>
  </div>
</template>

<script setup>
import { useI18n } from "vue-i18n";
const { t } = useI18n();
</script>

<style scoped>
.cont {
  background-color: var(--tableAccountBg);
  width: 100%;
  height: 50px;
  border-radius: 5px;
  border: 1px solid #d8d8d8;
  display: flex;
  align-items: center;
  justify-content: center;
}

h3 {
  color: #4966b1;
  font-size: 10px;
  font-weight: 500;
  background-color: #cee3fd;
  padding: 4px 14px;
  border-radius: 20px;
  animation: shimmer 1s infinite;
}

@keyframes shimmer {
  0% {
    opacity: 0.7;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.7;
  }
}
</style>
