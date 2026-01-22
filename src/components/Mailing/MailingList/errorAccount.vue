<template>
  <div class="cont">
    <h3>Ошибка при получении данных</h3>
  </div>
</template>

<script setup>
import { useI18n } from "vue-i18n";
const { t } = useI18n();
</script>

<style scoped>
.cont {
  background-color: rgb(255, 209, 209);
  width: 100%;
  height: 50px;
  border-radius: 5px;
  border: 1px solid #cea2a2;
  display: flex;
  align-items: center;
  justify-content: center;
}

h3 {
  color: rgb(128, 76, 76);
  font-size: 10px;
  font-weight: 500;
  background-color: rgb(246, 180, 180);
  padding: 4px 14px;
  border-radius: 20px;
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
