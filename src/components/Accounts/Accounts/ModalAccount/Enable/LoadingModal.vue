<template>
  <section v-if="stationLoading">
    <section class="loading">
      <div class="spinner"></div>
    </section>
  </section>
</template>

<script setup>
import { defineProps, toRefs } from "vue";

const props = defineProps({
  stationLoading: {
    type: Boolean,
    required: true,
  },
});

const { stationLoading } = toRefs(props);
</script>

<style scoped>
.loading {
  border-radius: 20px;
  background: #ffffff;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 20;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  gap: 8px;
  padding: 15px;
}

.spinner {
  border: 8px solid rgba(255, 255, 255, 0.3);
  border-top: 8px solid #3498db; /* Цвет спиннера */
  border-radius: 50%;
  width: 50px; /* Ширина спиннера */
  height: 50px; /* Высота спиннера */
  animation: spin 1s linear infinite; /* Анимация вращения */
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
