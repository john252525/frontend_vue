<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="guide-modal">
      <div class="modal-header">
        <div class="guide-icon">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
        <h2 class="modal-title">Как приобрести подписку</h2>
        <button class="close-btn" @click="$emit('close')">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M18 6L6 18M6 6L18 18"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      </div>

      <div class="modal-content">
        <div class="steps-container">
          <div class="step" v-for="(step, index) in steps" :key="index">
            <div class="step-indicator">
              <div class="step-number">{{ index + 1 }}</div>
              <div class="step-line" v-if="index < steps.length - 1"></div>
            </div>
            <div class="step-content">
              <h3 class="step-title">{{ step.title }}</h3>
              <p class="step-description">{{ step.description }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-actions">
        <button class="btn btn-primary" @click="$emit('close')">
          Понятно, спасибо!
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineEmits(["close"]);

const steps = [
  {
    title: 'Перейти в "Аккаунты"',
    description: 'В главном меню выберите раздел "Аккаунты"',
  },
  {
    title: 'Нажать "Продлить"',
    description: 'Найдите и нажмите кнопку "Продлить подписку"',
  },
  {
    title: "Выбрать тариф",
    description: "Выберите подходящий тарифный план",
  },
  {
    title: "Оплатить",
    description: "Завершите процесс оплаты",
  },
];
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
  z-index: 1001;
  padding: 20px;
  backdrop-filter: blur(4px);
}

.guide-modal {
  background: white;
  border-radius: 16px;
  padding: 32px;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid #e8eaed;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
  position: relative;
}

.guide-icon {
  width: 48px;
  height: 48px;
  background: #f0f9ff;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3b82f6;
  flex-shrink: 0;
}

.modal-title {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
  text-align: center;
  flex: 1;
  line-height: 1.2;
}

.close-btn {
  background: #f3f4f6;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s ease;
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: #e5e7eb;
  color: #374151;
}

.modal-content {
  margin-bottom: 32px;
}

.steps-container {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.step {
  display: flex;
  gap: 16px;
  padding: 16px;
  border-radius: 12px;
  transition: background-color 0.2s ease;
}

.step:hover {
  background: #f8fafc;
}

.step-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
}

.step-number {
  width: 32px;
  height: 32px;
  background: #3b82f6;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  position: relative;
  z-index: 2;
}

.step-line {
  width: 2px;
  background: #e5e7eb;
  flex: 1;
  margin: 4px 0;
}

.step-content {
  flex: 1;
  padding-top: 4px;
}

.step-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 4px 0;
  line-height: 1.3;
}

.step-description {
  font-size: 14px;
  color: #6b7280;
  line-height: 1.4;
  margin: 0;
}

.modal-actions {
  display: flex;
  gap: 12px;
}

.btn {
  flex: 1;
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 44px;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
}

@media (max-width: 480px) {
  .guide-modal {
    padding: 24px;
    margin: 0;
  }

  .modal-header {
    margin-bottom: 24px;
  }

  .modal-title {
    font-size: 20px;
  }

  .step {
    padding: 12px 8px;
  }

  .step-content {
    padding-top: 2px;
  }
}
</style>
