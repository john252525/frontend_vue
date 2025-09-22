<template>
  <div class="loader-container">
    <div class="double-ring-loader">
      <div class="ring outer-ring"></div>
      <div class="ring inner-ring"></div>
    </div>
    <!-- <p class="large-loading-text">{{ loadingText }}</p> -->
  </div>
</template>

<script setup>
defineProps({
  loadingText: {
    type: String,
    default: "Обрабатываем ваш запрос...",
  },
});
</script>

<style scoped>
.loader-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
}

.double-ring-loader {
  position: relative;
  width: 100px;
  height: 100px;
  /* margin-bottom: 2.5rem; */
}

.ring {
  position: absolute;
  border: 4px solid transparent;
  border-top: 4px solid #6b7280;
  border-radius: 50%;
  animation: rotate 1.5s linear infinite;
}

.outer-ring {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-top: 4px solid #9ca3af;
}

.inner-ring {
  top: 15px;
  left: 15px;
  right: 15px;
  bottom: 15px;
  border-top: 4px solid #6b7280;
  animation-duration: 1.2s;
  animation-direction: reverse;
}

.large-loading-text {
  font-size: 1.3rem;
  font-weight: 500;
  color: #4b5563;
  text-align: center;
  margin: 0;
  letter-spacing: 0.3px;
}

@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
