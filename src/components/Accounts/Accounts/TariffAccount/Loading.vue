<template>
  <div class="loading-container">
    <div class="loader"></div>
  </div>
</template>

<script setup></script>

<style scoped>
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.loader {
  border: 4px solid rgba(101, 52, 255, 0.1);
  border-radius: 50%;
  border-top: 4px solid #6732ff;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
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
