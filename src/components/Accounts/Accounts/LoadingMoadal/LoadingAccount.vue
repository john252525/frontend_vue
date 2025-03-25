<template>
  <transition name="fade">
    <section>
      <section class="loading">
        <div class="spinner"></div>
      </section>
    </section>
  </transition>
</template>

<script setup></script>

<style scoped>
.spinner {
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid #989898; /* Цвет спиннера */
  border-radius: 50%;
  width: 14px; /* Ширина спиннера */
  height: 14px; /* Высота спиннера */
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
