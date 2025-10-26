<template>
  <div class="modal-overlay" @click="closeModal">
    <div class="modal" @click.stop>
      <div class="modal-header">
        <h2 class="modal-title">Инструкция использования</h2>
        <button class="close-btn" @click="closeModal">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M18 6L6 18"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M6 6L18 18"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      </div>
      <div class="header-divider"></div>

      <div class="modal-content" v-if="section === 'start'">
        <button class="section-btn" @click="selectSection('interface')">
          Интерфейс
        </button>

        <button class="section-btn" @click="selectSection('control')">
          Кнопка "Действие"
        </button>

        <button class="section-btn" @click="selectSection('payment')">
          Оплата рассылки
        </button>

        <!-- <button class="section-btn" @click="selectSection('account')">
          Добавление аккаунта
        </button> -->
      </div>

      <div v-else-if="section === 'control'">
        <Control :back="backSection" />
      </div>

      <div v-else-if="section === 'payment'">
        <Tariff :back="backSection" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps } from "vue";

import Tariff from "./modal/Tariff.vue";
import Control from "./modal/Control.vue";

const props = defineProps({
  close: {
    type: Function,
  },
  startTour: {
    type: Function,
  },
});

const lastSection = ref("");
const section = ref("start");

const backSection = () => {
  section.value = lastSection.value;
};

const closeModal = () => {
  props.close();
};

const selectSection = (item) => {
  lastSection.value = section.value;
  section.value = item;

  console.log(item);

  if (item === "interface") {
    props.startTour();
    closeModal();
  }
};

// Закрытие по ESC
const handleEscape = (event) => {
  if (event.key === "Escape" && props.isOpen) {
    closeModal();
  }
};

// Добавляем обработчик клавиш
if (typeof window !== "undefined") {
  window.addEventListener("keydown", handleEscape);
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
}

.modal {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  max-width: 400px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 16px;
  position: relative;
}

.modal-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #000;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  color: #6b7280;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background-color: #f3f4f6;
  color: #374151;
  transform: scale(1.05);
}

.header-divider {
  height: 1px;
  background-color: #e5e7eb;
  margin: 0 24px;
}

.modal-content {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-btn {
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px 16px;
  font-size: 1.1rem;
  font-weight: 500;
  color: #000;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: left;
  width: 100%;
  position: relative;
  overflow: hidden;
}

.section-btn::before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(59, 130, 246, 0.1),
    transparent
  );
  transition: left 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.section-btn:hover::before {
  left: 100%;
}

.section-btn:hover {
  background: oklch(0.541 0.198 267);
  color: white;
  border-color: oklch(0.541 0.198 267);
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.25),
    0 4px 12px rgba(59, 130, 246, 0.15);
}

.section-btn:active {
  transform: translateY(-1px);
  transition: all 0.1s ease;
}

/* Анимации для модального окна */
.modal-overlay {
  animation: fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal {
  animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-leave-active .modal-overlay {
  animation: fadeOut 0.25s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.modal-leave-active .modal {
  animation: slideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

@keyframes slideDown {
  from {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  to {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
}
</style>
