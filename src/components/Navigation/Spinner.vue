<template>
  <transition name="fade">
    <section>
      <section class="loading">
        <div class="spinner"></div>
      </section>
    </section>
  </transition>
</template>

<script setup>
import { defineProps, toRefs } from "vue";
</script>

<style scoped>
.loading {
  border-radius: 20px;
  z-index: 20;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

.spinner {
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top: 3px solid #606060;
  border-radius: 50%;
  width: 10px; /* Ширина спиннера */
  height: 10px; /* Высота спиннера */
  animation: spin 1s linear infinite; /* Анимация вращения */
}

.title {
  font-weight: 400;
  font-size: 20px;
  margin-top: 20px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading.fade-enter-active,
.loading.fade-leave-active {
  transition: opacity 0.5s ease;
}
.loading.fade-enter,
.loading.fade-leave-to {
  opacity: 0;
}

.loading {
  animation: fadeIn 0.5s forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    /* transform: translate(-50%, -48%); */
  }
  to {
    opacity: 1;
  }
}
</style>
