<template>
  <div class="modal-overlay" @click="close">
    <div class="modal-content" @click.stop>
      <div class="modal-icon">
        <svg
          v-if="error === 'tariff'"
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 2L2 7L12 12L22 7L12 2Z"
            stroke="#5A4FC1"
            stroke-width="2"
            stroke-linejoin="round"
          />
          <path
            d="M2 17L12 22L22 17"
            stroke="#5A4FC1"
            stroke-width="2"
            stroke-linejoin="round"
          />
          <path
            d="M2 12L12 17L22 12"
            stroke="#5A4FC1"
            stroke-width="2"
            stroke-linejoin="round"
          />
          <path
            d="M16 5.5L8 10.5"
            stroke="#5A4FC1"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>
        <svg
          v-else
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
            stroke="#5A4FC1"
            stroke-width="2"
          />
          <path
            d="M12 8V12"
            stroke="#5A4FC1"
            stroke-width="2"
            stroke-linecap="round"
          />
          <path
            d="M12 16H12.01"
            stroke="#5A4FC1"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>
      </div>

      <h3 class="modal-title">
        {{ error === "tariff" ? "Тариф не активирован" : "Аккаунт не включен" }}
      </h3>

      <p class="modal-message">
        {{
          error === "tariff"
            ? "Для использования чатов необходимо приобрести подходящий тариф"
            : "Для использования чатов необходимо включить ваш аккаунт"
        }}
      </p>

      <button class="continue-button" @click="close">Продолжить</button>
    </div>

    <div class="black-fon"></div>
  </div>
</template>

<script setup>
const props = defineProps({
  error: {
    type: String,
    required: true,
    validator: (value) => ["tariff", "noStarted"].includes(value),
  },
  close: {
    type: Function,
    required: true,
  },
});

const handleOverlayClick = (event) => {
  if (event.target.classList.contains("modal-overlay")) {
    props.close();
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.black-fon {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: -1;
}

.modal-content {
  background: white;
  border-radius: 16px;
  padding: 32px;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  width: 90%;
  animation: modalAppear 0.3s ease-out;
}

.modal-icon {
  margin-bottom: 20px;
}

.modal-title {
  font-size: 20px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 12px;
  line-height: 1.4;
}

.modal-message {
  font-size: 16px;
  color: #718096;
  line-height: 1.5;
  margin-bottom: 24px;
}

.continue-button {
  background: oklch(0.541 0.198 267);

  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 32px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
}

.continue-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(255, 107, 53, 0.4);
}

.continue-button:active {
  transform: translateY(0);
}

@keyframes modalAppear {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@media (max-width: 480px) {
  .modal-content {
    padding: 24px;
    margin: 16px;
  }

  .modal-title {
    font-size: 18px;
  }

  .modal-message {
    font-size: 14px;
  }
}
</style>
