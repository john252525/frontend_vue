<template>
  <transition name="fade">
    <div v-if="stationLoading" class="loading-overlay">
      <div class="loading-content">
        <div class="spinner"></div>
        <p v-if="textLoadin" class="loading-text">
          {{ textLoadin }}
        </p>

        <!-- Кнопка отмены -->
        <button v-if="showCancelButton" @click="close" class="cancel-button">
          {{ cancelButtonText }}
        </button>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { defineProps, defineEmits } from "vue";

const props = defineProps({
  stationLoading: {
    type: Boolean,
    default: false,
  },
  textLoadin: {
    type: String,
    default: "Загрузка...",
  },
  close: {
    type: Function,
  },
  closeBoolean: {
    type: Boolean,
    default: false, // по умолчанию можно закрывать кликом по оверлею
  },
  showCancelButton: {
    type: Boolean,
    default: false, // показывать ли кнопку отмены
  },
  cancelButtonText: {
    type: String,
    default: "Отмена",
  },
});

const emit = defineEmits(["update:stationLoading", "cancel"]);

// Обработка клика по оверлею
const handleOverlayClick = () => {
  console.log("closeBoolean:", props.closeBoolean);
  if (!props.closeBoolean) {
    props.close?.();
  }
};

// Обработка клика по кнопке отмены
const handleCancel = () => {
  emit("update:stationLoading", false);
  emit("cancel");
};
</script>

<style scoped>
/* Ваши стили остаются без изменений */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  cursor: pointer;
}

.loading-content {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  min-width: 200px;
  cursor: default;
}

.cancel-button {
  padding: 0.5rem 1rem;
  background: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s ease;
}

.cancel-button:hover {
  background: #d32f2f;
}

.cancel-button:active {
  background: #c62828;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-text {
  margin: 0;
  color: #333;
  font-size: 1.1rem;
  text-align: center;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
