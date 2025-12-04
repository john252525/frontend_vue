<template>
  <div class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2 class="modal-title">Как начать зарабатывать?</h2>
        <button class="close-button" @click="closeModal">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div class="modal-body">
        <div class="instruction-step">
          <div class="step-number">
            <span class="step-number-text">1</span>
          </div>
          <div class="step-content">
            <h3>Скопируйте ссылку выше</h3>
            <p>Скопируйте вашу уникальную ссылку</p>
          </div>
        </div>

        <div class="instruction-step">
          <div class="step-number">
            <span class="step-number-text">2</span>
          </div>
          <div class="step-content">
            <h3>Рекомендуйте наш сервис</h3>
            <p>Рекомендуйте наш сервис, указывая эту ссылку</p>
          </div>
        </div>

        <div class="instruction-step">
          <div class="step-number">
            <span class="step-number-text">3</span>
          </div>
          <div class="step-content">
            <h3>Получайте вознаграждение</h3>
            <p>
              Получайте вознаграждение с каждой поступившей оплаты от
              привлеченных клиентов
            </p>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="got-it-button" @click="closeModal">Понятно!</button>
      </div>
    </div>
  </div>
</template>

<script setup>
const emit = defineEmits(["close"]);

const closeModal = () => {
  emit("close");
};

// Закрытие по ESC
const handleEscape = (event) => {
  if (event.key === "Escape") {
    closeModal();
  }
};

// Добавляем обработчик ESC при монтировании
import { onMounted, onUnmounted } from "vue";

onMounted(() => {
  document.addEventListener("keydown", handleEscape);
  document.body.style.overflow = "hidden";
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleEscape);
  document.body.style.overflow = "";
});
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  animation: fadeIn 0.3s ease;
}

.modal-content {
  background: white;
  border-radius: 12px;
  max-width: 480px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  animation: slideUp 0.3s ease;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e5e5;
}

.modal-title {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.close-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  color: #6b7280;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-button:hover {
  background: #f3f4f6;
  color: #374151;
}

.modal-body {
  padding: 24px;
}

.instruction-step {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 24px;
}

.instruction-step:last-child {
  margin-bottom: 0;
}

.step-number {
  background: #3b82f6;
  color: white;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;

  flex-shrink: 0;
}

.step-number-text {
  font-weight: 600;
  font-size: 14px;
}

.step-content h3 {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 6px 0;
}

.step-content p {
  font-size: 14px;
  color: #6b7280;
  line-height: 1.5;
  margin: 0;
}

.modal-footer {
  padding: 20px 24px;
  border-top: 1px solid #e5e5e5;
  display: flex;
  justify-content: center;
}

.got-it-button {
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 10px 24px;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.got-it-button:hover {
  background: #2563eb;
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
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .modal-overlay {
    padding: 10px;
  }

  .modal-content {
    max-height: 95vh;
  }

  .modal-header {
    padding: 16px 20px;
  }

  .modal-body {
    padding: 20px;
  }

  .modal-footer {
    padding: 16px 20px;
  }
}
</style>
