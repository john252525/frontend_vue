<template>
  <transition name="fade-overlay">
    <div 
      v-if="stationLoading.loading" 
      class="loading-container"
    >
      <div 
        class="loading-backdrop" 
        @click="handleBackdropClick"
      ></div>
      
      <transition name="scale-content">
        <div class="loading-wrapper">
          <div class="loading-content">
            <div class="spinner"></div>
            <h2 v-if="textLoadin" class="loading-title">{{ textLoadin }}</h2>
          </div>
        </div>
      </transition>
    </div>
  </transition>
</template>

<script setup>
import { defineProps, toRefs } from "vue";

const props = defineProps({
  stationLoading: {
    type: Object,
    required: true,
  },
  textLoadin: {
    type: String,
    required: true,
  },
  changeStationLoading: {
    type: Function,
  },
});

const { stationLoading, textLoadin, changeStationLoading } = toRefs(props);

const handleBackdropClick = () => {
  if (changeStationLoading.value) {
    changeStationLoading.value();
  }
};
</script>

<style scoped>
.loading-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
}

.loading-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(117, 117, 117, 0.3);
  backdrop-filter: blur(2px);
  cursor: pointer;
}

.loading-wrapper {
  position: relative;
  z-index: 10;
}

.loading-content {
  background: #ffffff;
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  min-width: 200px;
  min-height: 150px;
  justify-content: center;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(52, 152, 219, 0.2);
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-title {
  font-weight: 500;
  font-size: 18px;
  color: #333;
  text-align: center;
  margin: 0;
  line-height: 1.4;
  max-width: 250px;
}

/* Анимации */
.fade-overlay-enter-active,
.fade-overlay-leave-active {
  transition: opacity 0.3s ease;
}

.fade-overlay-enter-from,
.fade-overlay-leave-to {
  opacity: 0;
}

.scale-content-enter-active {
  transition: all 0.3s ease;
  animation: fadeInScale 0.3s ease;
}

.scale-content-leave-active {
  transition: all 0.2s ease;
  animation: fadeOutScale 0.2s ease;
}

.scale-content-enter-from,
.scale-content-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes fadeInScale {
  0% {
    opacity: 0;
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes fadeOutScale {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(0.9);
  }
}

/* Адаптивность */
@media (max-width: 480px) {
  .loading-content {
    padding: 24px;
    margin: 0 16px;
    min-width: auto;
    max-width: 280px;
  }
  
  .spinner {
    width: 40px;
    height: 40px;
  }
  
  .loading-title {
    font-size: 16px;
    max-width: 200px;
  }
}
</style>