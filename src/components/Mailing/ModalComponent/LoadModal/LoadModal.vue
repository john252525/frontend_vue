<template>
  <div class="container">
    <div class="lds-ring">
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
    <div class="text">{{ text }}</div>
  </div>
</template>

<script setup>
const props = defineProps({
  text: {
    type: String,
  },
});
</script>

<style scoped>
.container {
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  white-space: nowrap;
}

.text {
  font-size: 20px;
  font-weight: 400;
  display: inline-block;
  animation: shimmer 2s infinite;
  color: rgb(0, 0, 0); /* Серый цвет текста */
}

.lds-ring,
.lds-ring div {
  box-sizing: border-box;
}
.lds-ring {
  display: inline-block;
  position: relative;
  width: 80px;
  height: 80px;
}
.lds-ring div {
  box-sizing: border-box;
  display: block;
  position: absolute;
  width: 64px;
  height: 64px;
  margin: 8px;
  border: 7px solid currentColor;
  border-radius: 50%;
  animation: lds-ring 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
  border-color: oklch(0.541 0.198 267) transparent transparent transparent;
}
.lds-ring div:nth-child(1) {
  animation-delay: -0.45s;
}
.lds-ring div:nth-child(2) {
  animation-delay: -0.3s;
}
.lds-ring div:nth-child(3) {
  animation-delay: -0.15s;
}
@keyframes lds-ring {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
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
