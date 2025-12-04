<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h2 class="modal-title">⚠️ Нет доступных аккаунтов</h2>
        <button @click="$emit('close')" class="close-button">
          <svg viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clip-rule="evenodd"
            ></path>
          </svg>
        </button>
      </div>

      <div class="modal-body">
        <p class="modal-description">
          Перед просмотром групп создайте хотя бы один аккаунт
          <strong>WhatsApp</strong> или <strong>Telegram</strong>.
        </p>
      </div>

      <div class="modal-footer">
        <button @click="$emit('close')" class="cancel-button">Хорошо</button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineEmits(["close"]);
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
}

.modal-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  width: 90%;
  animation: slideUp 0.3s ease;
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

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid #f3f4f6;
}

.modal-title {
  font-weight: 600;
  font-size: 18px;
  color: var(--text);
  margin: 0;
}

.close-button {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: #f3f4f6;
  color: #6b7280;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.25s;
}

.close-button:hover {
  background: #e5e7eb;
}

.close-button svg {
  width: 18px;
  height: 18px;
  fill: currentColor;
}

.modal-body {
  padding: 20px;
}

.modal-description {
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 16px 0;
  line-height: 1.6;
}

.info-box {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: #fef3c7;
  border-left: 4px solid #f59e0b;
  border-radius: 6px;
}

.info-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  fill: #d97706;
}

.info-title {
  font-weight: 600;
  font-size: 13px;
  color: #92400e;
  margin: 0 0 4px 0;
}

.info-text {
  font-size: 13px;
  color: #b45309;
  margin: 0;
  line-height: 1.5;
}

.modal-footer {
  display: flex;
  gap: 8px;
  padding: 16px 20px;
  border-top: 1px solid #f3f4f6;
}

.cancel-button {
  width: 100%;
  padding: 10px 16px;
  background: oklch(0.541 0.198 267);
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.25s;
}

.cancel-button:hover {
  background: #565cc8;
}

.cancel-button:active {
  background: #3e43ae;
}
</style>
